import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../service/data.service';
import { LayoutService } from '../../layout/service/layout.service';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, InputTextModule, TooltipModule],
  templateUrl: './admin.component.html',
  styles: [`
    :host {
        display: block;
        padding: 1rem;
    }
    ::ng-deep .log-field {
        font-weight: 600;
        color: var(--primary-color);
    }
  `]
})
export class AdminComponent implements OnInit {
    private dataService = inject(DataService);
    private layoutService = inject(LayoutService);
    logs: any[] = [];
    selectedDetails: any = null;

    ngOnInit() {
        this.loadLogs();
    }

    loadLogs() {
        const username = this.dataService.loginService.getUsername();
        if (username) {
            this.dataService.getAdminLogs(username).subscribe(data => {
                this.logs = data.filter(log => log.action !== 'current-user');
            });
        }
    }

    getSeverity(action: string): string {
        switch (action) {
            case 'login': return 'info';
            case 'logout': return 'secondary';
            case 'login_failed': return 'danger';
            case 'create': return 'success';
            case 'update': return 'warn';
            case 'delete': return 'danger';
            case 'error': return 'danger';
            default: return 'secondary';
        }
    }

    formatLogMessage(log: any): string {
        const { action, details, user } = log;
        if (!details && !['login', 'logout', 'login_failed'].includes(action)) {
            return log.message || 'No details available';
        }

        switch (action) {
            case 'create':
                return `Added <span class="log-field">${details.entry_name}</span> on <span class="log-field">${details.location}</span> with score <span class="log-field">${details.total_score}</span>`;

            case 'update':
                return Object.entries(details).map(([key, value]) => `${key}: <span class="log-field">${value}</span>`).join(', ');

            case 'delete':
                return `Deleted <span class="log-field">${details.entry_name}</span>`;

            case 'login':
                return `User <span class="log-field">${user}</span> logged in`;

            case 'logout':
                return `User <span class="log-field">${user}</span> logged out`;

            case 'login_failed':
                return `Login failed for <span class="log-field">${user}</span>`;

            default:
                return log.message || 'Action performed';
        }
    }

    @HostListener('window:showLogDetails', ['$event'])
    onShowLogDetails(event: any) {
        this.selectedDetails = event.detail;
    }

    showDetails(details: any) {
        this.selectedDetails = details;
    }

    copyToClipboard(details: any) {
        navigator.clipboard.writeText(JSON.stringify(details, null, 2));
    }
}
