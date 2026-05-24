import { Injectable, inject } from "@angular/core";
import { GameRecord } from "../models/record.model";
import { VersionService } from "./version.service";
import { DataService } from "./data.service";

@Injectable({
    providedIn: 'root'
})
export class ClipboardService {
    private versionService = inject(VersionService);
    private dataService = inject(DataService);

    async generateAndCopyCardToClipboard(record: GameRecord, totalScore: number): Promise<void> {
        try {
            if (!navigator.clipboard || !ClipboardItem) {
                throw new Error('Clipboard API not supported');
            }

            const countInYear = this.getCountInYear(record);
            const canvas = await this.createCard(record, totalScore, countInYear);
            const blob = await this.canvasToBlob(canvas);

            if (!blob || blob.size === 0) {
                throw new Error('Failed to generate card image');
            }

            const clipboardItem = new ClipboardItem({
                'image/png': blob
            });

            await navigator.clipboard.write([clipboardItem]);
        } catch (error) {
            console.error('Failed to copy card to clipboard:', error);
            this.downloadCard(record, totalScore);
            throw new Error('Clipboard not supported. Image will be downloaded instead.');
        }
    }

    private async downloadCard(record: GameRecord, totalScore: number): Promise<void> {
        const countInYear = this.getCountInYear(record);
        const canvas = await this.createCard(record, totalScore, countInYear);
        const link = document.createElement('a');

        const safeName = (record.name || 'game-card')
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase()
            .substring(0, 50);

        link.download = `${safeName}_stats_${totalScore}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    private async createCard(record: GameRecord, totalScore: number, countInYear: number): Promise<HTMLCanvasElement> {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const width = 650;
        const height = 280;

        const devicePixelRatio = window.devicePixelRatio || 1;

        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.scale(devicePixelRatio, devicePixelRatio);

        const primaryColor = this.getPrimaryColor();
        const surfaceColors = this.getSurfaceColors();

        // Background
        ctx.fillStyle = surfaceColors.dark;
        this.drawRoundedRect(ctx, 0, 0, width, height, 12, surfaceColors.dark);

        let contentStartX = 20;

        // Draw Cover Image if available
        if (record.cover) {
            try {
                const img = await this.loadImage(record.cover);
                const coverWidth = 180;
                const coverHeight = height;

                ctx.save();
                this.drawRoundedRect(ctx, 0, 0, coverWidth, coverHeight, 12);
                ctx.clip();
                ctx.drawImage(img, 0, 0, coverWidth, coverHeight);

                // Add a subtle overlay like in the UI
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(0, 0, coverWidth, coverHeight);
                ctx.restore();

                contentStartX = coverWidth + 20;
            } catch (e) {
                console.error('Failed to load cover image for canvas:', e);
            }
        }

        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        const title = record.name || 'Unknown Game';

        const maxTitleWidth = width - contentStartX - 100; // Leave space for score
        let displayTitle = title;
        const titleMetrics = ctx.measureText(title);
        if (titleMetrics.width > maxTitleWidth) {
            while (ctx.measureText(displayTitle + '...').width > maxTitleWidth && displayTitle.length > 0) {
                displayTitle = displayTitle.slice(0, -1);
            }
            displayTitle += '...';
        }

        ctx.fillText(displayTitle, contentStartX, 40);

        // Score Badge (top right)
        const scoreStr = totalScore.toString();
        ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
        const scoreWidth = ctx.measureText(scoreStr).width + 20;

        ctx.save();
        if (totalScore >= 85) {
            let gradient: CanvasGradient;
            if (totalScore >= 95) {
                gradient = ctx.createLinearGradient(width - scoreWidth - 10, 10, width - 10, 40);
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(0.5, '#FFA500');
                gradient.addColorStop(1, '#FF8C00');
            } else if (totalScore >= 90) {
                gradient = ctx.createLinearGradient(width - scoreWidth - 10, 10, width - 10, 40);
                gradient.addColorStop(0, '#E8E8E8');
                gradient.addColorStop(0.5, '#C0C0C0');
                gradient.addColorStop(1, '#A8A8A8');
            } else {
                gradient = ctx.createRadialGradient(width - scoreWidth/2 - 10, 25, 5, width - scoreWidth/2 - 10, 25, 30);
                gradient.addColorStop(0, '#e49a6e');
                gradient.addColorStop(1, '#b4693e');
            }
            this.drawRoundedRect(ctx, width - scoreWidth - 10, 10, scoreWidth, 32, 6, null, false);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.fillStyle = '#000000';
        } else {
            ctx.fillStyle = '#ffffff';
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(scoreStr, width - scoreWidth / 2 - 10, 27);
        ctx.restore();

        // Reset text baseline for other drawings
        ctx.textBaseline = 'alphabetic';

        const allScoreFields = [
            { key: 'scoreGameplay', label: 'Gameplay' },
            { key: 'scorePresentation', label: 'Presentation' },
            { key: 'scoreNarrative', label: 'Narrative' },
            { key: 'scoreQuality', label: 'Quality' },
            { key: 'scoreSound', label: 'Sound' },
            { key: 'scoreContent', label: 'Content' },
            { key: 'scorePacing', label: 'Pacing' },
            { key: 'scoreBalance', label: 'Balance' },
            { key: 'scoreUIUX', label: 'UI/UX' },
            { key: 'scoreImpression', label: 'Impression' }
        ];

        const col1X = contentStartX;
        const col2X = contentStartX + 160;
        let startY = 80;
        const rowHeight = 22;

        allScoreFields.forEach((field, index) => {
            const score = record[field.key as keyof GameRecord] as number || 0;

            const x = index % 2 === 0 ? col1X : col2X;
            const currentY = startY + Math.floor(index / 2) * rowHeight;

            ctx.fillStyle = '#9ca3af';
            ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
            ctx.fillText(`${field.label}:`, x, currentY);

            if (score === 0) {
                ctx.fillStyle = '#6b7280';
                ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
                ctx.fillText('-', x + 110, currentY);
            } else {
                ctx.fillStyle = primaryColor;
                ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
                ctx.fillText(score.toString(), x + 110, currentY);
            }
        });

        const replayValueLabels = ['No replay value', 'Maybe someday', 'Would replay', 'Definitely again', "Can't stop playing!"];
        const replayValue = record.replayValue || 1;
        const replayLabel = replayValueLabels[replayValue - 1] || 'Unknown';

        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'left';

        const footerStartY = height - 55;

        ctx.fillText(`Total score:`, contentStartX, footerStartY);
        ctx.fillStyle = primaryColor;
        ctx.fillText(`${totalScore}`, contentStartX + ctx.measureText('Total score: ').width, footerStartY);

        ctx.fillStyle = '#9ca3af';
        ctx.fillText(`Replay value:`, contentStartX, footerStartY + 18);
        ctx.fillStyle = primaryColor;
        ctx.fillText(`${replayLabel}`, contentStartX + ctx.measureText('Replay value: ').width, footerStartY + 18);

        if (record.finishDate) {
            const finishDate = new Date(record.finishDate);
            const dateString = finishDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const year = finishDate.getFullYear();
            let footerText = `#${countInYear} of ${year} | ${dateString}`;

            if (record.canceled === 1) {
                footerText += ' | CANCELED';
            } else if (record.mainQuestDone === 1) {
                footerText += ' | Main Quest finished';
            }

            if (record.backlogItem === 1) {
                footerText += ' | Backlog';
            }

            if (record.replay === 1) {
                footerText += ' | Replay';
            }

            if (record.playtime) {
                const h = Math.floor(record.playtime / 60);
                const m = record.playtime % 60;
                const playtimeStr = h === 0 ? `${m}m` : (m === 0 ? `${h}h` : `${h}h ${m}m`);
                footerText += ` | Playtime: ${playtimeStr}`;
            }

            ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.textAlign = 'left';
            ctx.fillText(footerText, contentStartX, height - 15);
        }

        const version = this.versionService.getVersion();
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#4b5563';
        ctx.textAlign = 'right';
        ctx.fillText(`GG.DB ${version}`, width - 20, height - 15);

        return canvas;
    }

    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = url;
        });
    }

    private getCountInYear(record: GameRecord): number {
        const allRecords: GameRecord[] = this.dataService.getRecords() as GameRecord[];
        if (!record.finishDate || !allRecords.length) return 0;

        const targetDate = new Date(record.finishDate);
        const targetYear = targetDate.getFullYear();

        const yearRecords = allRecords
            .filter((r: GameRecord) => r.finishDate && new Date(r.finishDate).getFullYear() === targetYear)
            .sort((a: GameRecord, b: GameRecord) => new Date(a.finishDate).getTime() - new Date(b.finishDate).getTime());

        const index = yearRecords.findIndex((r: GameRecord) => r.id === record.id);
        return index !== -1 ? index + 1 : 0;
    }

    private getPrimaryColor(): string {
        const savedPrimary = localStorage.getItem('primaryColor') || 'emerald';

        const primaryPalettes: { [key: string]: string } = {
            'emerald': '#10b981',
            'green': '#22c55e',
            'lime': '#84cc16',
            'orange': '#f97316',
            'amber': '#f59e0b',
            'yellow': '#eab308',
            'teal': '#14b8a6',
            'cyan': '#06b6d4',
            'sky': '#0ea5e9',
            'blue': '#3b82f6',
            'indigo': '#6366f1',
            'violet': '#8b5cf6',
            'purple': '#a855f7',
            'fuchsia': '#d946ef',
            'pink': '#ec4899',
            'rose': '#f43f5e',
            'noir': '#6b7280'
        };

        return primaryPalettes[savedPrimary] || '#10b981';
    }

    private getSurfaceColors(): { dark: string; darker: string } {
        const savedSurface = localStorage.getItem('surfaceColor') || 'slate';

        const surfacePalettes: { [key: string]: { dark: string; darker: string } } = {
            'slate': { dark: '#1e293b', darker: '#0f172a' },
            'gray': { dark: '#1f2937', darker: '#111827' },
            'zinc': { dark: '#27272a', darker: '#18181b' },
            'neutral': { dark: '#262626', darker: '#171717' },
            'stone': { dark: '#292524', darker: '#1c1917' }
        };

        return surfacePalettes[savedSurface] || { dark: '#1e293b', darker: '#0f172a' };
    }

    private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob from canvas'));
                }
        }, 'image/png');
    });
    }

    private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fillColor: string | null = null, strokeOnly: boolean = false): void {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();

        if (!strokeOnly && fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        if (strokeOnly) {
            ctx.stroke();
        }
    }
}
