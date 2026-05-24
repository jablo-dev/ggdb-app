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
        Dialog, Button, TableModule
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
    allRecords: GameRecord[] = [];
    showLegend = false;
    displayMode: 'Cards' | 'Table' = 'Cards';
    expandedRows: { [id: number]: boolean } = {};
    showFavoritesOnly = false;

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
        });

        const savedMode = localStorage.getItem('ggdb_display_mode');
        if (savedMode === 'Table' || savedMode === 'Cards') {
            this.displayMode = savedMode;
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

    setDisplayMode(mode: 'Cards' | 'Table') {
        this.displayMode = mode;
        localStorage.setItem('ggdb_display_mode', mode);
    }

    goToDetail(record: GameRecord): void {
        this.router.navigate(['/detail'], {
            queryParams: { record: record.id }
        });
    }
}
