import { Component, inject, Input, OnDestroy, SimpleChanges } from '@angular/core';
import { CardModule } from 'primeng/card';
import { GameRecord } from '../../models/record.model';
import { CommonModule, DatePipe, NgClass, NgIf, NgStyle } from '@angular/common';
import { RecordType } from '../../enum/type.enum';
import { Router } from '@angular/router';
import { DataDisplayService } from '../../service/data-display.service';
import { ScrollService } from '../../service/scroll.service';
import { LayoutService } from '../../layout/service/layout.service';

@Component({
    selector: 'app-entry-card',
    standalone: true,
    imports: [CardModule, NgIf, DatePipe, NgClass, NgStyle, CommonModule],
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

    score: number = 0;

    get playtimeEnabled(): boolean {
        return this.layoutService.layoutConfig().playtimeEnabled ?? false;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['gameRecord'] && this.gameRecord) {
            this.score = this.display.getTotalScore(this.gameRecord);
            this.imageError = false; // Reset error flag when record changes
        }
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
