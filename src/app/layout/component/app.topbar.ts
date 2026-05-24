import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../service/layout.service';
import { DataService } from '../../service/data.service';
import { LoginService } from '../../service/login.service';
import { ToastModule } from 'primeng/toast';
import { LoadingService } from '../../service/loading.service';
import { ProgressBar } from 'primeng/progressbar';
import { VersionService } from '../../service/version.service';
import { ScrollService } from '../../service/scroll.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, ToastModule, ProgressBar],
    templateUrl: 'app.topbar.html'
})
export class AppTopbar {
    isLoading$;
    version: string;
    username: string = '';

    private readonly scrollService = inject(ScrollService);

    constructor(
        public layoutService: LayoutService,
        private dataService: DataService,
        private loginService: LoginService,
        private router: Router,
        private loadingService: LoadingService,
        private versionService: VersionService
    ) {
        this.isLoading$ = this.loadingService.loading$;
        this.version = this.versionService.getVersion();
        this.loadCurrentUser();
    }

    private loadCurrentUser(): void {
        const rawUsername = this.loginService.getUsername();
        if (rawUsername) {
            this.dataService.getCurrentUser(rawUsername).subscribe(response => {
                if (response.success && response.user) {
                    // Use the properly capitalized username from the API response
                    this.username = response.user.username;

                    // Load user settings into layout service
                    if (response.user.playtimeEnabled !== undefined) {
                        const playtimeEnabled = response.user.playtimeEnabled === 1;
                        this.layoutService.layoutConfig.update(state => ({
                            ...state,
                            playtimeEnabled
                        }));
                        localStorage.setItem('playtimeEnabled', playtimeEnabled.toString());
                    }
                } else {
                    // Fallback to the username from login service
                    this.username = rawUsername;
                }
            });
        }
    }

    ngOnInit() {
        this.isLoading$.subscribe(v => console.log('Loading:', v));
    }

    isActive(path: string): boolean {
        return this.router.url === path;
    }

    openOverview() {
        const scrollContainer = document.querySelector('.layout-main');
        if (scrollContainer && this.router.url === '/overview') {
            this.scrollService.setScrollPosition('overview', scrollContainer.scrollTop);
        }
        this.router.navigate(['/overview']);
    }

    openBacklog() {
        const scrollContainer = document.querySelector('.layout-main');
        if (scrollContainer && this.router.url === '/overview') {
            this.scrollService.setScrollPosition('overview', scrollContainer.scrollTop);
        }
        this.router.navigate(['/backlog']);
    }

    openDashboard(): void {
        const scrollContainer = document.querySelector('.layout-main');
        if (scrollContainer && this.router.url === '/overview') {
            this.scrollService.setScrollPosition('overview', scrollContainer.scrollTop);
        }
        this.router.navigate(['/']);
    }

    openProfile(): void {
        const scrollContainer = document.querySelector('.layout-main');
        if (scrollContainer && this.router.url === '/overview') {
            this.scrollService.setScrollPosition('overview', scrollContainer.scrollTop);
        }
        this.router.navigate(['/profile']);
    }

    logout(): void {
        const username = this.loginService.getUsername();

        if (username) {
            this.dataService.logout(username).subscribe(() => {
                this.router.navigate(['/auth/login']);
            });
        } else {
            this.router.navigate(['/auth/login']);
        }
    }
}
