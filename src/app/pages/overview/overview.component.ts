import { MaterialUiModule } from '../../ui/material-ui';
import { Component, ElementRef, inject, OnInit, ViewChild, OnDestroy, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../service/data.service';
import { GameRecord } from '../../models/record.model';
import { EntryCardComponent } from '../../components/entry-card/entry-card.component';
import { YearlyLineBreakComponent } from '../../components/yearly-line-break/yearly-line-break.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../service/toast.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingService } from '../../service/loading.service';
import { DataDisplayService } from '../../service/data-display.service';
import { ScrollService } from '../../service/scroll.service';
import { ToolbarService } from '../../service/toolbar.service';

interface GameRecordGroup {
    year: number | null;
    yearCount: number | null;
    gameRecord: GameRecord;
    id: number;
}

@Component({
    selector: 'app-overview',
    standalone: true,
    imports: [CommonModule, EntryCardComponent, YearlyLineBreakComponent, FormsModule, ReactiveFormsModule, TranslatePipe, MaterialUiModule],
    templateUrl: './overview.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit, OnDestroy {
    @ViewChild('dt') table!: ElementRef<HTMLElement>;
    @ViewChild('toolbarTemplate', { static: true }) toolbarTemplate!: TemplateRef<any>;

    private readonly dataService = inject(DataService);
    private readonly route = inject(ActivatedRoute);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);
    private readonly loadingService = inject(LoadingService);
    private readonly scrollService = inject(ScrollService);
    private readonly toolbarService = inject(ToolbarService);
    readonly dataDisplay = inject(DataDisplayService);

    groupedGameRecords: GameRecordGroup[] = [];
    visibleTableRecords: GameRecordGroup[] = [];
    visibleCardRecords: GameRecordGroup[] = [];
    allRecords: GameRecord[] = [];
    showLegend = false;
    displayMode: 'Cards' | 'Table' | 'Timeline' = 'Cards';
    expandedRows: { [id: number]: boolean } = {};

    filterOptions: any[] = [];
    selectedFilters: string[] = ['all', 'fav', 'canceled'];

    sortOptions: any[] = [];
    selectedSort: string = 'finishDate-desc';

    timelineRecords: any[] = [];
    allTimelineRecords: any[] = [];
    collapsedYears: { [year: number]: boolean } = {};
    flippedYears: { [year: number]: boolean } = this.readFlippedYears();

    private static readonly FLIPPED_YEARS_KEY = 'overviewFlippedYears';

    private readFlippedYears(): { [year: number]: boolean } {
        try {
            const raw = sessionStorage.getItem(OverviewComponent.FLIPPED_YEARS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    private writeFlippedYears(): void {
        try {
            sessionStorage.setItem(OverviewComponent.FLIPPED_YEARS_KEY, JSON.stringify(this.flippedYears));
        } catch {
            // ignore
        }
    }

    isYearFlipped(year: number | null | undefined): boolean {
        if (year == null) return false;
        return !!this.flippedYears[year];
    }

    toggleYearFlip(year: number | null | undefined): void {
        if (year == null) return;
        this.flippedYears[year] = !this.flippedYears[year];
        if (!this.flippedYears[year]) delete this.flippedYears[year];
        this.writeFlippedYears();
    }

    getForceFlipped(record: GameRecord | undefined): boolean | null {
        if (!record || !record.finishDate) return null;
        const y = new Date(record.finishDate).getFullYear();
        return this.flippedYears[y] ? true : null;
    }
    sortField: string = 'finishDate';
    sortOrder: number = -1;

    resetSorting(): void {
        this.selectedSort = 'finishDate-desc';
        localStorage.setItem('ggdb_selected_sort', this.selectedSort);
        this.sortField = 'finishDate';
        this.sortOrder = -1;
        this.filterRecords();
    }

    private _searchTerm = '';

    resolveTypeLabel(type: string): string {
        return type ?? '';
    }

    get searchTerm(): string {
        return this._searchTerm;
    }

    set searchTerm(value: string) {
        this._searchTerm = value;
        this.filterRecords();
    }

    get selectedFiltersLabel(): string {
        if (!this.selectedFilters || this.selectedFilters.length === 0) {
            return 'Filter';
        }

        // Use the order from filterOptions to find the first selected one
        const firstSelectedOption = this.filterOptions.find((option) => this.selectedFilters.includes(option.value));

        const label = firstSelectedOption ? firstSelectedOption.label : 'Filter';

        if (this.selectedFilters.length > 1) {
            return `${label} (+${this.selectedFilters.length - 1})`;
        }

        return label;
    }

    private readonly translate = inject(TranslateService);
    private langChangeSubscription: Subscription = new Subscription();

    updateOptions() {
        this.filterOptions = [
            { label: this.translate.instant('overview.filters.default'), value: 'all', icon: 'bi bi-grid' },
            { label: this.translate.instant('overview.filters.favorites'), value: 'fav', icon: 'bi bi-star-fill' },
            { label: this.translate.instant('overview.filters.canceled'), value: 'canceled', icon: 'bi bi-x-circle' }
        ];

        this.sortOptions = [
            { label: this.translate.instant('overview.sorts.finished_newest'), value: 'finishDate-desc', icon: 'bi bi-calendar', field: 'finishDate', order: -1 },
            { label: this.translate.instant('overview.sorts.finished_oldest'), value: 'finishDate-asc', icon: 'bi bi-calendar', field: 'finishDate', order: 1 },
            { label: this.translate.instant('overview.sorts.score_high'), value: 'score-desc', icon: 'bi bi-sort-down', field: 'score', order: -1 },
            { label: this.translate.instant('overview.sorts.score_low'), value: 'score-asc', icon: 'bi bi-sort-up', field: 'score', order: 1 },
            { label: this.translate.instant('overview.sorts.platform_az'), value: 'platform-asc', icon: 'bi bi-sort-alpha-down', field: 'platform', order: 1 },
            { label: this.translate.instant('overview.sorts.platform_za'), value: 'platform-desc', icon: 'bi bi-sort-alpha-up', field: 'platform', order: -1 }
        ];
    }

    ngOnInit(): void {
        this.updateOptions();
        this.langChangeSubscription = this.translate.onLangChange.subscribe(() => this.updateOptions());

        const savedFilters = localStorage.getItem('ggdb_selected_filters');
        if (savedFilters) {
            try {
                this.selectedFilters = JSON.parse(savedFilters);
            } catch (e) {
                console.error('Error parsing saved filters', e);
            }
        }

        const savedSort = localStorage.getItem('ggdb_selected_sort');
        if (savedSort) {
            this.selectedSort = savedSort;
            const option = this.sortOptions.find((o) => o.value === this.selectedSort);
            if (option) {
                this.sortField = option.field;
                this.sortOrder = option.order;
            }
        }

        this.toolbarService.setTemplate(this.toolbarTemplate);
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
            this.allRecords = records;
            this.filterRecords();

            // Restore scroll position
            setTimeout(() => {
                if (this.displayMode === 'Table' && this.table) {
                    const savedPosition = this.scrollService.getScrollPosition('overview_table');
                    const scrollableElement = this.table.nativeElement;
                    if (scrollableElement) {
                        scrollableElement.scrollTop = savedPosition;
                    }
                } else {
                    const scrollContainer = document.querySelector('.layout-main');
                    if (scrollContainer) {
                        const savedPosition = this.scrollService.getScrollPosition('overview');
                        scrollContainer.scrollTop = savedPosition;
                    }
                }
            }, 0);
        });

        const savedMode = localStorage.getItem('ggdb_display_mode');
        if (savedMode === 'Table' || savedMode === 'Cards' || savedMode === 'Timeline') {
            this.displayMode = savedMode as 'Cards' | 'Table' | 'Timeline';
        }
    }

    onSortChange(): void {
        localStorage.setItem('ggdb_selected_sort', this.selectedSort);
        const option = this.sortOptions.find((o) => o.value === this.selectedSort);
        if (option) {
            this.sortField = option.field;
            this.sortOrder = option.order;
            this.filterRecords();
        }
    }

    onSearchEnter(): void {
        this.filterRecords();
    }

    sort(field: string): void {
        if (this.sortField === field) {
            this.toggleSortOrder();
        } else {
            this.sortField = field;
            this.sortOrder = 1;
            this.filterRecords();
        }
    }

    toggleSortOrder(): void {
        this.sortOrder = this.sortOrder === 1 ? -1 : 1;
        this.filterRecords();
    }

    filterRecords(): void {
        localStorage.setItem('ggdb_selected_filters', JSON.stringify(this.selectedFilters));
        const term = this._searchTerm.trim().toLowerCase();
        let filtered = term.length === 0 ? [...this.allRecords] : this.allRecords.filter((r) => r.name.toLowerCase().includes(term));

        // Filter out backlog items from the overview
        filtered = filtered.filter((r) => r.backlogItem !== 1);

        const showFav = this.selectedFilters.includes('fav');
        const showCanceled = this.selectedFilters.includes('canceled');
        const showAll = this.selectedFilters.includes('all');

        filtered = filtered.filter((r) => {
            if (r.fav === 1 && showFav) return true;
            if (r.canceled === 1 && showCanceled) return true;
            if (r.fav === 0 && r.canceled === 0 && showAll) return true;
            return false;
        });

        // Apply sorting
        filtered.sort((a, b) => {
            let valA: any;
            let valB: any;

            switch (this.sortField) {
                case 'score':
                    valA = this.dataDisplay.getTotalScore(a);
                    valB = this.dataDisplay.getTotalScore(b);
                    // Special case for score: nulls should go to bottom
                    if (valA === null) valA = this.sortOrder === 1 ? Infinity : -Infinity;
                    if (valB === null) valB = this.sortOrder === 1 ? Infinity : -Infinity;
                    break;
                case 'finishDate':
                    valA = a.finishDate ? new Date(a.finishDate).getTime() : 0;
                    valB = b.finishDate ? new Date(b.finishDate).getTime() : 0;
                    break;
                case 'platform':
                    valA = this.dataDisplay.getPlatformLabel(a.location).toLowerCase();
                    valB = this.dataDisplay.getPlatformLabel(b.location).toLowerCase();
                    break;
                default:
                    valA = (a as any)[this.sortField];
                    valB = (b as any)[this.sortField];
            }

            if (valA < valB) return -1 * this.sortOrder;
            if (valA > valB) return 1 * this.sortOrder;
            return 0;
        });

        this.groupedGameRecords = this.groupRecordsByYear(filtered);
        this.updateVisibleTable();
        this.updateVisibleCards();
        this.allTimelineRecords = this.prepareTimelineData(filtered);
        this.updateVisibleTimeline();
    }

    openAdd(): void {
        this.router.navigate(['/detail'], {
            queryParams: { record: 'new', source: 'overview' }
        });
    }

    private groupRecordsByYear(records: GameRecord[]): GameRecordGroup[] {
        const result: GameRecordGroup[] = [];
        let lastYear: number | null = null;

        const counts = records.reduce(
            (map, record) => {
                const year = new Date(record.finishDate).getFullYear();
                map[year] = (map[year] || 0) + 1;
                return map;
            },
            {} as Record<number, number>
        );

        for (const record of records) {
            const year = new Date(record.finishDate).getFullYear();

            const showHeaders = this.sortField === 'finishDate';
            const insertSplitter = showHeaders && year !== lastYear;

            if (insertSplitter) {
                result.push({
                    year: year,
                    gameRecord: record,
                    yearCount: counts[year],
                    id: record.id * -1000000 // Ensure unique ID for year header
                });
            }

            result.push({
                year: null,
                gameRecord: record,
                yearCount: null,
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

            const monthRecords = sortedRecords.filter((r) => {
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
        const years = Object.keys(groupedByYear)
            .map(Number)
            .sort((a, b) => b - a);

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
        this.updateVisibleCards();
    }

    private updateVisibleTimeline(): void {
        this.timelineRecords = this.allTimelineRecords.filter((event) => {
            if (event.isYearHeader) return true;
            return !this.isYearCollapsed(event.year);
        });
    }

    private updateVisibleTable(): void {
        let currentYearCollapsed = false;
        let lastYearInGroup: number | null = null;

        this.visibleTableRecords = this.groupedGameRecords.filter((group) => {
            if (group.year !== null) {
                lastYearInGroup = group.year;
                currentYearCollapsed = this.isYearCollapsed(group.year);
                return true;
            }

            if (this.sortField === 'finishDate' && lastYearInGroup !== null) {
                return !currentYearCollapsed;
            }

            return true;
        });
    }

    private updateVisibleCards(): void {
        let currentYearCollapsed = false;
        let lastYearInGroup: number | null = null;

        this.visibleCardRecords = this.groupedGameRecords.filter((group) => {
            if (group.year !== null) {
                lastYearInGroup = group.year;
                currentYearCollapsed = this.isYearCollapsed(group.year);
                return true;
            }

            if (this.sortField === 'finishDate' && lastYearInGroup !== null) {
                return !currentYearCollapsed;
            }

            return true;
        });
    }

    isYearCollapsed(year: number): boolean {
        return !!this.collapsedYears[year];
    }

    isMobile(): boolean {
        return window.innerWidth < 576;
    }

    setDisplayMode(mode: 'Cards' | 'Table' | 'Timeline') {
        this.displayMode = mode;
        localStorage.setItem('ggdb_display_mode', mode);
    }

    goToDetail(record: GameRecord): void {
        if (this.displayMode === 'Table' && this.table) {
            const scrollableElement = this.table.nativeElement;
            if (scrollableElement) {
                this.scrollService.setScrollPosition('overview_table', scrollableElement.scrollTop);
            }
        } else {
            const scrollContainer = document.querySelector('.layout-main');
            if (scrollContainer) {
                this.scrollService.setScrollPosition('overview', scrollContainer.scrollTop);
            }
        }
        this.router.navigate(['/detail'], {
            queryParams: { record: record.id, source: 'overview' }
        });
    }

    ngOnDestroy(): void {
        this.langChangeSubscription.unsubscribe();
        this.toolbarService.setTemplate(null);
        if (this.displayMode === 'Table' && this.table) {
            const scrollableElement = this.table.nativeElement;
            if (scrollableElement) {
                this.scrollService.setScrollPosition('overview_table', scrollableElement.scrollTop);
            }
        } else {
            const scrollContainer = document.querySelector('.layout-main');
            if (scrollContainer) {
                this.scrollService.setScrollPosition('overview', scrollContainer.scrollTop);
            }
        }
    }
}
