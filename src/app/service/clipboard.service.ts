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
            const canvas = this.createCard(record, totalScore, countInYear);
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

    private downloadCard(record: GameRecord, totalScore: number): void {
        const countInYear = this.getCountInYear(record);
        const canvas = this.createCard(record, totalScore, countInYear);
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

    private createCard(record: GameRecord, totalScore: number, countInYear: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const width = 500;
        const height = 250;

        const devicePixelRatio = window.devicePixelRatio || 1;

        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.scale(devicePixelRatio, devicePixelRatio);

        const primaryColor = this.getPrimaryColor();
        const surfaceColors = this.getSurfaceColors();

        ctx.fillStyle = surfaceColors.dark;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        const title = record.name || 'Unknown Game';

        const maxTitleWidth = 400;
        let displayTitle = title;
        const titleMetrics = ctx.measureText(title);
        if (titleMetrics.width > maxTitleWidth) {
            while (ctx.measureText(displayTitle + '...').width > maxTitleWidth && displayTitle.length > 0) {
                displayTitle = displayTitle.slice(0, -1);
            }
            displayTitle += '...';
        }

        ctx.fillText(displayTitle, 30, 40);

        ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';

        let scoreColor: string;
        if (totalScore >= 95) {
            scoreColor = '#FFD700';
        } else if (totalScore >= 90) {
            scoreColor = '#C0C0C0';
        } else if (totalScore >= 85) {
            scoreColor = '#e49a6e';
        } else {
            scoreColor = '#ffffff';
        }

        // Draw a big semi-transparent background number for "sexiness"
        ctx.save();
        ctx.font = 'bold 120px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = 0.05;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(totalScore.toString(), width / 2 + 150, height / 2);

        // Add a slight border in primary color
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.15;
        ctx.strokeText(totalScore.toString(), width / 2 + 150, height / 2);
        ctx.restore();

        // Reset text baseline for other drawings
        ctx.textBaseline = 'alphabetic';

        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#d1d5db';
        ctx.textAlign = 'left';

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

        const rightAreaStartX = 30;
        const col1X = rightAreaStartX;
        const col2X = rightAreaStartX + 150;
        let startY = 70;
        const rowHeight = 18;

        allScoreFields.forEach((field, index) => {
            const score = record[field.key as keyof GameRecord] as number || 0;

            const x = index % 2 === 0 ? col1X : col2X;
            const currentY = startY + Math.floor(index / 2) * rowHeight;

            ctx.fillStyle = '#9ca3af';
            ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
            ctx.fillText(`${field.label}:`, x, currentY);

            if (score === 0) {
                ctx.fillStyle = '#6b7280';
                ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
                ctx.fillText('-', x + 100, currentY);
            } else {
                ctx.fillStyle = primaryColor;
                ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
                ctx.fillText(score.toString(), x + 100, currentY);
            }
        });

        const replayValueLabels = ['No replay value', 'Maybe someday', 'Would replay', 'Definitely again', "Can't stop playing!"];
        const replayValue = record.replayValue || 1;
        const replayLabel = replayValueLabels[replayValue - 1] || 'Unknown';

        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'left';
        ctx.fillText(`Total score:`, 30, height - 70);
        ctx.fillStyle = primaryColor;
        ctx.fillText(`${totalScore}`, 30 + ctx.measureText('Total score: ').width, height - 70);

        ctx.fillStyle = '#9ca3af';
        ctx.fillText(`Replay value:`, 30, height - 52);
        ctx.fillStyle = primaryColor;
        ctx.fillText(`${replayLabel}`, 30 + ctx.measureText('Replay value: ').width, height - 52);

        if (record.finishDate) {
            const finishDate = new Date(record.finishDate);
            const dateString = finishDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const year = finishDate.getFullYear();
            let footerText = `#${countInYear} of ${year} | ${dateString}`;

            if (record.mainQuestDone === 1) {
                footerText += ' | Main Quest finished';
            }

            if (record.replay === 1) {
                footerText += ' | Replay';
            }

            ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.textAlign = 'left';
            ctx.fillText(footerText, 30, height - 15);
        }

        const version = this.versionService.getVersion();
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#4b5563';
        ctx.textAlign = 'right';
        ctx.fillText(`GG.DB ${version}`, width - 30, height - 15);

        return canvas;
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
