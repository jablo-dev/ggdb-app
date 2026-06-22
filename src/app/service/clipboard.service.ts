import { Injectable, inject } from "@angular/core";
import { GameRecord } from "../models/record.model";
import { VersionService } from "./version.service";
import { DataService } from "./data.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
    providedIn: 'root'
})
export class ClipboardService {
    private versionService = inject(VersionService);
    private dataService = inject(DataService);
    private translateService = inject(TranslateService);

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
        const height = 300; // Slightly taller to accommodate more subscores

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
                const coverWidth = 200; // Increased width to match design
                const coverHeight = height;

                ctx.save();
                this.drawRoundedRect(ctx, 0, 0, coverWidth, coverHeight, 12);
                ctx.clip();

                // Cover image scaling (object-cover equivalent)
                const imgRatio = img.width / img.height;
                const canvasRatio = coverWidth / coverHeight;
                let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

                if (imgRatio > canvasRatio) {
                    drawHeight = coverHeight;
                    drawWidth = img.width * (coverHeight / img.height);
                    offsetX = (coverWidth - drawWidth) / 2;
                } else {
                    drawWidth = coverWidth;
                    drawHeight = img.height * (coverWidth / img.width);
                    offsetY = (coverHeight - drawHeight) / 2;
                }

                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

                // Add a subtle overlay like in the UI
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(0, 0, coverWidth, coverHeight);
                ctx.restore();

                contentStartX = coverWidth + 0; // The content starts right after cover
            } catch (e) {
                console.error('Failed to load cover image for canvas:', e);
            }
        }

        const contentWidth = width - contentStartX;

        // Title (Top Left of content area)
        const titlePadding = 12;
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        const title = record.name || 'Unknown Game';
        const titleMetrics = ctx.measureText(title);
        const titleMaxWidth = contentWidth - 100;

        ctx.fillStyle = primaryColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        let displayTitle = title;
        if (titleMetrics.width > titleMaxWidth) {
            while (ctx.measureText(displayTitle + '...').width > titleMaxWidth && displayTitle.length > 0) {
                displayTitle = displayTitle.slice(0, -1);
            }
            displayTitle += '...';
        }
        ctx.fillText(displayTitle, contentStartX + titlePadding, 32);

        // Score Badge (Top Right)
        const scoreStr = totalScore.toString();
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        const scoreWidth = ctx.measureText(scoreStr).width + 30;
        const scoreHeight = 40;
        const scoreRadius = 12;
        const scoreMargin = 12;
        const scoreX = width - scoreWidth - scoreMargin;
        const scoreY = scoreMargin;

        ctx.save();
        if (totalScore >= 85) {
            let gradient: CanvasGradient;
            const rpgRarity = localStorage.getItem('rpgRarityEnabled') === 'true';
            if (rpgRarity) {
                if (totalScore >= 95) {
                    gradient = ctx.createLinearGradient(scoreX, scoreY, scoreX + scoreWidth, scoreY + scoreHeight);
                    gradient.addColorStop(0, '#FFD700');
                    gradient.addColorStop(0.5, '#FFC200');
                    gradient.addColorStop(1, '#B8860B');
                } else if (totalScore >= 90) {
                    gradient = ctx.createLinearGradient(scoreX, scoreY, scoreX + scoreWidth, scoreY + scoreHeight);
                    gradient.addColorStop(0, '#BF5FFF');
                    gradient.addColorStop(0.5, '#9B30FF');
                    gradient.addColorStop(1, '#7B00FF');
                } else {
                    gradient = ctx.createLinearGradient(scoreX, scoreY, scoreX + scoreWidth, scoreY + scoreHeight);
                    gradient.addColorStop(0, '#4FC3F7');
                    gradient.addColorStop(0.5, '#1E88E5');
                    gradient.addColorStop(1, '#1565C0');
                }
            } else {
                if (totalScore >= 95) {
                    gradient = ctx.createLinearGradient(scoreX, scoreY, scoreX + scoreWidth, scoreY + scoreHeight);
                    gradient.addColorStop(0, '#FFD700');
                    gradient.addColorStop(0.5, '#FFA500');
                    gradient.addColorStop(1, '#FF8C00');
                } else if (totalScore >= 90) {
                    gradient = ctx.createLinearGradient(scoreX, scoreY, scoreX + scoreWidth, scoreY + scoreHeight);
                    gradient.addColorStop(0, '#E8E8E8');
                    gradient.addColorStop(0.5, '#C0C0C0');
                    gradient.addColorStop(1, '#A8A8A8');
                } else {
                    gradient = ctx.createRadialGradient(scoreX + scoreWidth/2, scoreY + scoreHeight/2, 5, scoreX + scoreWidth/2, scoreY + scoreHeight/2, 20);
                    gradient.addColorStop(0, '#e49a6e');
                    gradient.addColorStop(1, '#b4693e');
                }
            }
            ctx.fillStyle = gradient;
            this.drawRoundedRect(ctx, scoreX, scoreY, scoreWidth, scoreHeight, scoreRadius);
            ctx.fill();
            ctx.fillStyle = '#000000';
        } else {
            ctx.fillStyle = surfaceColors.darker || 'rgba(0, 0, 0, 0.3)';
            this.drawRoundedRect(ctx, scoreX, scoreY, scoreWidth, scoreHeight, scoreRadius);
            ctx.fill();
            ctx.fillStyle = primaryColor;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(scoreStr, scoreX + scoreWidth / 2, scoreY + scoreHeight / 2);
        ctx.restore();

        // Subscores Grid (Matching the Backside design)
        const subScoreFields = [
            { key: 'scoreGameplay', label: 'Gameplay' },
            { key: 'scorePresentation', label: 'Presentation' },
            { key: 'scoreNarrative', label: 'Narrative' },
            { key: 'scoreSound', label: 'Sound' },
            { key: 'scoreContent', label: 'Content' },
            { key: 'scorePacing', label: 'Pacing' },
            { key: 'scoreBalance', label: 'Balance' },
            { key: 'scoreQuality', label: 'Quality' },
            { key: 'scoreUIUX', label: 'UI/UX' },
            { key: 'scoreImpression', label: 'Impression' }
        ];

        // Filter out 0 scores as in EntryCardComponent.buildSubScores
        const activeSubScores = subScoreFields
            .map(f => ({ label: f.label, value: (record[f.key as keyof GameRecord] as number) || 0 }))
            .filter(s => s.value > 0);

        const gridX = contentStartX + 20;
        const gridY = 60;
        const gridWidth = contentWidth - 40;
        const rowHeight = 28;
        const colWidth = gridWidth / 2;

        ctx.textBaseline = 'alphabetic';
        activeSubScores.forEach((s, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = gridX + (col * colWidth);
            const y = gridY + (row * rowHeight);

            // Label
            ctx.fillStyle = '#9ca3af';
            ctx.font = '14px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(s.label, x, y + 18);

            // Value
            ctx.fillStyle = primaryColor;
            ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${s.value}`, x + colWidth - 30, y + 18);

            // Dotted border
            ctx.save();
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.moveTo(x, y + rowHeight - 2);
            ctx.lineTo(x + colWidth - 20, y + rowHeight - 2);
            ctx.stroke();
            ctx.restore();
        });

        if (activeSubScores.length === 0) {
            ctx.fillStyle = '#9ca3af';
            ctx.font = 'italic 14px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No scores available', contentStartX + contentWidth / 2, height / 2);
        } else {
            // Add Replay and Playtime below the categories if space allows
            const lastRow = Math.ceil(activeSubScores.length / 2);
            const extraStatsY = gridY + (lastRow * rowHeight) + 10;

            ctx.textAlign = 'left';
            ctx.fillStyle = '#9ca3af';
            ctx.font = '14px system-ui, -apple-system, sans-serif';

            if (record.replayValue !== undefined && record.replayValue !== null && record.replayValue > 0) {
                const label = this.translateService.instant(`detail.replay_values.${record.replayValue}`);
                ctx.fillText(label, gridX, extraStatsY + 14);
            }
            if (record.playtime) {
                const h = (record.playtime / 60).toFixed(1);
                const playtimeY = (record.replayValue !== undefined && record.replayValue !== null && record.replayValue > 0) ? extraStatsY + 32 : extraStatsY + 14;
                ctx.fillText(`Playtime: ${h} hours`, gridX, playtimeY);
            }
        }

        // Footer Metadata
        const footerY = height - 20;
        ctx.textAlign = 'left';
        ctx.font = '14px system-ui, -apple-system, sans-serif'; // Matching subscore label font
        ctx.fillStyle = '#9ca3af'; // Matching subscore label color

        let footerParts = [];
        if (record.finishDate) {
            const finishDate = new Date(record.finishDate);
            const dateString = finishDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            const year = finishDate.getFullYear();
            footerParts.push(`#${countInYear} of ${year}`);
            footerParts.push(dateString);
        }

        if (record.canceled === 1) {
            footerParts.push('Canceled');
        } else if (record.mainQuestDone === 1) {
            footerParts.push('Main Quest finished');
        }

        if (record.backlogItem === 1) {
            footerParts.push('Backlog');
        }

        ctx.fillText(footerParts.join(' | '), contentStartX + 20, footerY);

        // Version/Branding (Tilted Banner)
        const version = this.versionService.getVersion();
        const bannerText = `GG.DB ${version}`;
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        const bannerPadding = 8;
        const bannerTextWidth = ctx.measureText(bannerText).width;
        const bannerWidth = bannerTextWidth + (bannerPadding * 10); // Much wider to ensure it cuts off
        const bannerHeight = 22;

        ctx.save();
        // Position higher and to the left to avoid clipping
        const angle = -Math.PI / 4; // 45 degrees
        ctx.translate(width - 25, height - 25);
        ctx.rotate(angle);

        // Draw Banner background
        ctx.fillStyle = '#9ca3af'; // Same as narrative, gameplay label color
        // Offset it so the text is centered along the diagonal
        ctx.fillRect(-bannerWidth/2, -bannerHeight, bannerWidth, bannerHeight);

        // Draw text
        ctx.fillStyle = '#000000'; // Black color for the font
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bannerText, 0, -bannerHeight/2);
        ctx.restore();

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
