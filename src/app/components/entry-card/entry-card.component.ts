import { Component, inject, Input, OnDestroy, SimpleChanges } from '@angular/core';
import { CardModule } from 'primeng/card';
import { GameRecord } from '../../models/record.model';
import { CommonModule, DatePipe, NgClass, NgIf, NgStyle } from '@angular/common';
import { RecordType } from '../../enum/type.enum';
import { Router } from '@angular/router';
import { DataDisplayService } from '../../service/data-display.service';
import { ScrollService } from '../../service/scroll.service';
import { LayoutService } from '../../layout/service/layout.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-entry-card',
    standalone: true,
    imports: [CardModule, NgIf, DatePipe, NgClass, NgStyle, CommonModule, TranslatePipe],
    templateUrl: './entry-card.component.html',
    styleUrl: './entry-card.component.scss'
})
export class EntryCardComponent {
    @Input() gameRecord: GameRecord | undefined;
    router = inject(Router);
    display = inject(DataDisplayService);
    scrollService = inject(ScrollService);
    layoutService = inject(LayoutService);
    imageError: boolean = false;
    flipped: boolean = false;

    score: number = 0;

    get playtimeEnabled(): boolean {
        return this.layoutService.layoutConfig().playtimeEnabled ?? false;
    }

    get cardFlipEnabled(): boolean {
        return localStorage.getItem('cardFlipEnabled') === 'true';
    }

    subScores: { key: string; label: string; value: number }[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['gameRecord'] && this.gameRecord) {
            this.score = this.display.getTotalScore(this.gameRecord);
            this.imageError = false; // Reset error flag when record changes
            this.flipped = false;
            this.subScores = this.buildSubScores(this.gameRecord);
        }
    }

    private buildSubScores(record: GameRecord): { key: string; label: string; value: number }[] {
        const map: { key: keyof GameRecord; label: string }[] = [
            { key: 'scoreGameplay', label: 'entry_card.score_gameplay' },
            { key: 'scorePresentation', label: 'entry_card.score_presentation' },
            { key: 'scoreNarrative', label: 'entry_card.score_narrative' },
            { key: 'scoreSound', label: 'entry_card.score_sound' },
            { key: 'scoreContent', label: 'entry_card.score_content' },
            { key: 'scorePacing', label: 'entry_card.score_pacing' },
            { key: 'scoreBalance', label: 'entry_card.score_balance' },
            { key: 'scoreQuality', label: 'entry_card.score_quality' },
            { key: 'scoreUIUX', label: 'entry_card.score_uiux' },
            { key: 'scoreImpression', label: 'entry_card.score_impression' }
        ];
        return map
            .map((m) => ({ key: m.key as string, label: m.label, value: (record[m.key] as number) ?? 0 }))
            .filter((s) => s.value > 0);
    }

    onCardClick(event: MouseEvent): void {
        if (this.cardFlipEnabled) {
            event.stopPropagation();
            this.flipped = !this.flipped;
        } else {
            this.goToDetail();
        }
    }

    onDetailClick(event: MouseEvent): void {
        event.stopPropagation();
        this.goToDetail();
    }

    getRecordTypeLabel(type: string | undefined): string {
        if (!type) {
            return '';
        }
        if (type === 'Full Release' || type === 'FULL') {
            return '';
        }
        return type;
    }

    getScoreRange(score: number): string {
        if (score >= 95) return 'gold';
        if (score >= 90) return 'silver';
        if (score >= 85) return 'bronze';
        return 'normal';
    }

    formatPlaytime(minutes: number | undefined): string {
        if (!minutes) return '0h';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    }

    goToDetail(): void {
        if (this.gameRecord) {
            const scrollContainer = document.querySelector('.layout-main');
            if (scrollContainer) {
                this.scrollService.setScrollPosition('overview', scrollContainer.scrollTop);
            }
            this.router.navigate(['/detail'], {
                queryParams: { record: this.gameRecord.id, source: 'overview' }
            });
        }
    }
}
