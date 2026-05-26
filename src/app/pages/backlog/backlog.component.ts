import { Component, inject, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { GameRecord } from '../../models/record.model';
import { DataDisplayService } from '../../service/data-display.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToolbarService } from '../../service/toolbar.service';

@Component({
    selector: 'app-backlog',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, ToolbarModule, IconFieldModule, InputIconModule, InputTextModule, FormsModule],
    templateUrl: './backlog.component.html'
})
export class BacklogComponent implements OnInit, OnDestroy {
    @ViewChild('toolbarTemplate', { static: true }) toolbarTemplate!: TemplateRef<any>;

    backlogItems: GameRecord[] = [];
    filteredBacklogItems: GameRecord[] = [];
    searchTerm: string = '';

    private dataService = inject(DataService);
    private dataDisplay = inject(DataDisplayService);
    private router = inject(Router);
    private toolbarService = inject(ToolbarService);

    ngOnInit() {
        this.toolbarService.setTemplate(this.toolbarTemplate);
        const username = this.dataService.loginService.getUsername();
        if (username) {
            this.dataService.getAllRecords(username).subscribe((records) => {
                this.backlogItems = records.filter((r) => r.backlogItem === 1);
                this.onSearch();
            });
        }
    }

    onSearch() {
        if (!this.searchTerm.trim()) {
            this.filteredBacklogItems = [...this.backlogItems];
        } else {
            const term = this.searchTerm.toLowerCase().trim();
            this.filteredBacklogItems = this.backlogItems.filter((item) => item.name.toLowerCase().includes(term));
        }
    }

    getPlatformLabel(location: string): string {
        return this.dataDisplay.getPlatformLabel(location);
    }

    goToDetail(record: GameRecord) {
        this.router.navigate(['/detail'], { queryParams: { record: record.id } });
    }

    openAdd() {
        this.router.navigate(['/detail'], { queryParams: { record: 'new', source: 'backlog' } });
    }

    ngOnDestroy() {
        this.toolbarService.setTemplate(null);
    }
}
