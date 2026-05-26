import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { DataService } from '../data.service';
import { DialogModule } from 'primeng/dialog';
import { NgForOf, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { VersionService } from '../version.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RippleModule, AppFloatingConfigurator, NgForOf, CommonModule, DialogModule],
    templateUrl: './login.html',
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

    features = [
        {
            icon: 'pi pi-list',
            title: 'Track Your Games',
            description: "Keep a comprehensive record of all the games you've completed. Never forget what you've played and when you finished it."
        },
        {
            icon: 'pi pi-history',
            title: 'Backlog Management',
            description: 'Track games you are currently playing or plan to start soon. Manage your gaming queue and stay organized.'
        },
        {
            icon: 'pi pi-star',
            title: 'Rate & Review',
            description: 'Score games across multiple categories including gameplay, presentation, narrative, and more. Build your personal gaming history.'
        },
        {
            icon: 'pi pi-chart-line',
            title: 'Personal Stats',
            description: 'View detailed statistics about your gaming habits, completion rates, and discover patterns in your gaming preferences.'
        },
        {
            icon: 'pi pi-heart',
            title: 'Mark Favorites',
            description: 'Highlight your favorite games and easily filter your collection to find the gems that made a lasting impression.'
        },
        {
            icon: 'pi pi-calendar',
            title: 'Timeline View',
            description: 'See your gaming journey organized by year and date, creating a visual timeline of your gaming experiences.'
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
