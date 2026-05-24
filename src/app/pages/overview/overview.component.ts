import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../service/data.service';
import { GameRecord } from '../../models/record.model';
import { CardModule } from 'primeng/card';
import { EntryCardComponent } from '../../components/entry-card/entry-card.component';
import { YearlyLineBreakComponent } from '../../components/yearly-line-break/yearly-line-break.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../service/toast.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Toolbar } from 'primeng/toolbar';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { LoadingService } from '../../service/loading.service';
import { Table, TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { DataDisplayService } from '../../service/data-display.service';
import { RecordType } from '../../enum/type.enum';

interface GameRecordGroup {
    year: number | null;
    yearCount: number | null;
    gameRecord: GameRecord;
    id: number;
}

@Component({
    selector: 'app-overview',
    standalone: true,
    imports: [
        CommonModule, CardModule, EntryCardComponent, YearlyLineBreakComponent,
        FormsModule, Toolbar, InputText, ReactiveFormsModule, IconField, InputIcon,
        Dialog, Button, TableModule, TimelineModule
    ],
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
    @ViewChild('dt') table!: Table;

    private readonly dataService = inject(DataService);
    private readonly route = inject(ActivatedRoute);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);
    private readonly loadingService = inject(LoadingService);
    readonly dataDisplay = inject(DataDisplayService);

    groupedGameRecords: GameRecordGroup[] = [];
    visibleTableRecords: GameRecordGroup[] = [];
    allRecords: GameRecord[] = [];
    showLegend = false;
    displayMode: 'Cards' | 'Table' | 'Timeline' = 'Cards';
    expandedRows: { [id: number]: boolean } = {};
    showFavoritesOnly = false;
    timelineRecords: any[] = [];
    allTimelineRecords: any[] = [];
    collapsedYears: { [year: number]: boolean } = {};

    private _searchTerm = '';

    resolveTypeLabel(type: keyof typeof RecordType): string {
        return RecordType[type] ?? type;
    }

    get searchTerm(): string {
        return this._searchTerm;
    }

    set searchTerm(value: string) {
        this._searchTerm = value;
        this.filterRecords();
    }

    ngOnInit(): void {
        // Initialize expandedRows as an empty object
        this.expandedRows = {};

        this.route.queryParams.subscribe((params) => {
            const toastType = params['toast'];
            const gameName = params['game'];

            if (toastType && gameName) {
                let message = '';
                let summary = '';

                if (toastType === 'created') {
                    summary = 'Saved!';
                    message = `${gameName} successfully finished!`;
                } else if (toastType === 'updated') {
                    summary = 'Updated!';
                    message = `${gameName} successfully updated.`;
                } else if (toastType === 'deleted') {
                    summary = 'Deleted!';
                    message = `${gameName} has been deleted.`;
                }

                if (message) {
                    setTimeout(() => this.toast.success(summary, message), 0);

                    this.router.navigate([], {
                        queryParams: { toast: null, game: null },
                        queryParamsHandling: 'merge'
                    });
                }
            }
        });

        const username = this.dataService.loginService.getUsername();
        if (!username) return;

        this.dataService.getAllRecords(username).subscribe((records) => {
            records.sort((a, b) => new Date(b.finishDate).getTime() - new Date(a.finishDate).getTime());
            this.allRecords = records;
            this.groupedGameRecords = this.groupRecordsByYear(records);
            this.updateVisibleTable();
            this.allTimelineRecords = this.prepareTimelineData(records);
            this.updateVisibleTimeline();
        });

        const savedMode = localStorage.getItem('ggdb_display_mode');
        if (savedMode === 'Table' || savedMode === 'Cards' || savedMode === 'Timeline') {
            this.displayMode = savedMode as 'Cards' | 'Table' | 'Timeline';
        }
    }

    onSearchEnter(): void {
        const term = this.searchTerm.trim().toLowerCase();
        let filtered = term.length === 0
            ? this.allRecords
            : this.allRecords.filter((r) => r.name.toLowerCase().includes(term));

        if (this.showFavoritesOnly) {
            filtered = filtered.filter((r) => r.fav === 1);
        }

        this.groupedGameRecords = this.groupRecordsByYear(filtered);
        this.updateVisibleTable();
        this.allTimelineRecords = this.prepareTimelineData(filtered);
        this.updateVisibleTimeline();
    }

    filterRecords(): void {
        const term = this._searchTerm.trim().toLowerCase();
        let filtered = term.length === 0
            ? this.allRecords
            : this.allRecords.filter((r) => r.name.toLowerCase().includes(term));

        if (this.showFavoritesOnly) {
            filtered = filtered.filter((r) => r.fav === 1);
        }

        this.groupedGameRecords = this.groupRecordsByYear(filtered);
        this.updateVisibleTable();
        this.allTimelineRecords = this.prepareTimelineData(filtered);
        this.updateVisibleTimeline();
    }

    toggleFavoritesFilter(): void {
        this.showFavoritesOnly = !this.showFavoritesOnly;
        this.filterRecords();
    }

    openAdd(): void {
        this.router.navigate(['/detail'], { queryParams: { record: 'new' } });
    }

    private groupRecordsByYear(records: GameRecord[]): GameRecordGroup[] {
        const result: GameRecordGroup[] = [];
        let lastYear: number | null = null;

        const counts = records.reduce((map, record) => {
            const year = new Date(record.finishDate).getFullYear();
            map[year] = (map[year] || 0) + 1;
            return map;
        }, {} as Record<number, number>);

        for (const record of records) {
            const year = new Date(record.finishDate).getFullYear();
            const insertSplitter = year !== lastYear;

            result.push({
                year: insertSplitter ? year : null,
                gameRecord: record,
                yearCount: insertSplitter ? counts[year] : null,
                id: record.id
            });

            lastYear = year;
        }

        return result;
    }

    private prepareTimelineData(records: GameRecord[]): any[] {
        if (records.length === 0) return [];

        const groupedByYear: { [year: number]: any[] } = {};
        const sortedRecords = [...records].sort((a, b) => new Date(b.finishDate).getTime() - new Date(a.finishDate).getTime());

        if (sortedRecords.length === 0) return [];

        const firstDate = new Date(sortedRecords[sortedRecords.length - 1].finishDate);
        const lastDate = new Date(sortedRecords[0].finishDate);

        let current = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
        const end = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);

        while (current >= end) {
            const year = current.getFullYear();
            const month = current.getMonth();

            const monthRecords = sortedRecords.filter(r => {
                const d = new Date(r.finishDate);
                return d.getFullYear() === year && d.getMonth() === month;
            });

            if (monthRecords.length > 0 || month === 0) {
                if (!groupedByYear[year]) {
                    groupedByYear[year] = [];
                }
                groupedByYear[year].push({
                    date: new Date(current),
                    monthRecords,
                    isYearHighlight: month === 0,
                    year
                });
            }

            current.setMonth(current.getMonth() - 1);
        }

        const timeline: any[] = [];
        const years = Object.keys(groupedByYear).map(Number).sort((a, b) => b - a);

        for (const year of years) {
            // Add a special record for the year header
            timeline.push({
                isYearHeader: true,
                year: year,
                date: new Date(year, 11, 31) // For sorting/display consistency
            });

            // Add all months for this year
            for (const monthData of groupedByYear[year]) {
                timeline.push({
                    ...monthData,
                    isYearHeader: false
                });
            }
        }

        return timeline;
    }

    toggleYearCollapse(year: number): void {
        this.collapsedYears[year] = !this.collapsedYears[year];
        this.updateVisibleTimeline();
        this.updateVisibleTable();
    }

    private updateVisibleTimeline(): void {
        this.timelineRecords = this.allTimelineRecords.filter(event => {
            if (event.isYearHeader) return true;
            return !this.isYearCollapsed(event.year);
        });
    }

    private updateVisibleTable(): void {
        let currentYearCollapsed = false;
        this.visibleTableRecords = this.groupedGameRecords.filter(group => {
            if (group.year !== null) {
                currentYearCollapsed = this.isYearCollapsed(group.year);
                return true;
            }
            return !currentYearCollapsed;
        });
    }

    isYearCollapsed(year: number): boolean {
        return !!this.collapsedYears[year];
    }

    setDisplayMode(mode: 'Cards' | 'Table' | 'Timeline') {
        this.displayMode = mode;
        localStorage.setItem('ggdb_display_mode', mode);
    }

    goToDetail(record: GameRecord): void {
        this.router.navigate(['/detail'], {
            queryParams: { record: record.id }
        });
    }
}
