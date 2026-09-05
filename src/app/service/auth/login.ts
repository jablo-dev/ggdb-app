import { MaterialUiModule } from '../../ui/material-ui';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { DataService } from '../data.service';
import { NgForOf, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { VersionService } from '../version.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, AppFloatingConfigurator, NgForOf, CommonModule, TranslatePipe, MaterialUiModule],
    templateUrl: './login.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './login.scss'
})
export class Login {
    email: string = '';
    password: string = '';
    showPatchnotes = false;
    loginError = false;
    patchnotes: { version: string; date: string; changes: string[]; major?: boolean }[] = [];
    version: string = '';
    isLatestMajor: boolean = false;
    isInfoVisible: boolean = true;

    features = [
        {
            icon: 'bi bi-list',
            title: 'login.features.track.title',
            description: 'login.features.track.description'
        },
        {
            icon: 'bi bi-clock-history',
            title: 'login.features.backlog.title',
            description: 'login.features.backlog.description'
        },
        {
            icon: 'bi bi-star',
            title: 'login.features.rate.title',
            description: 'login.features.rate.description'
        },
        {
            icon: 'bi bi-graph-up',
            title: 'login.features.stats.title',
            description: 'login.features.stats.description'
        },
        {
            icon: 'bi bi-heart',
            title: 'login.features.favorites.title',
            description: 'login.features.favorites.description'
        },
        {
            icon: 'bi bi-calendar',
            title: 'login.features.timeline.title',
            description: 'login.features.timeline.description'
        }
    ];

    constructor(
        private dataService: DataService,
        private router: Router,
        private http: HttpClient,
        private versionService: VersionService
    ) {
        this.loadPatchnotes();
        this.version = this.versionService.getVersion();
        const savedInfoVisible = localStorage.getItem('ggdb-login-info-visible');
        if (savedInfoVisible !== null) {
            this.isInfoVisible = savedInfoVisible === 'true';
        }
    }

    toggleInfo(): void {
        this.isInfoVisible = !this.isInfoVisible;
        localStorage.setItem('ggdb-login-info-visible', this.isInfoVisible.toString());
    }

    loadPatchnotes() {
        this.http.get<any[]>('assets/patchnotes.json').subscribe({
            next: (data) => {
                this.patchnotes = data;
                if (this.patchnotes.length > 0 && this.patchnotes[0].major) {
                    this.isLatestMajor = true;
                }
            },
            error: (err) => console.error('Failed to load patchnotes:', err)
        });
    }

    login(): void {
        const user = { username: this.email, pwd: this.password };
        this.loginError = false; // Reset error state

        this.dataService.login(user).subscribe({
            next: (res: { success: boolean; sessionId?: string; message?: string }) => {
                if (res.success) {
                    this.router.navigateByUrl('/');
                } else {
                    this.loginError = true;
                }
            },
            error: (err) => {
                console.error('Login error:', err);
                this.loginError = true;
            }
        });
    }

    join(): void {
        this.router.navigateByUrl('/auth/join');
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }
}
