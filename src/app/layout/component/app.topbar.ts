import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../service/layout.service';
import { DataService } from '../../service/data.service';
import { LoginService } from '../../service/login.service';
import { LoadingService } from '../../service/loading.service';
import { VersionService } from '../../service/version.service';
import { ScrollService } from '../../service/scroll.service';
import { AppSubTopbar } from './app.sub-topbar';
import { AppToastBar } from './app.toast-bar';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, AppSubTopbar, AppToastBar, TranslatePipe, MatButtonModule, MatProgressBarModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: 'app.topbar.html'
})
export class AppTopbar {
    isLoading$;
    version: string;
    username: string = '';

    private readonly scrollService = inject(ScrollService);

    constructor(
        public layoutService: LayoutService,
        public dataService: DataService,
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
            this.dataService.getCurrentUser(rawUsername).subscribe((response) => {
                if (response.success && response.user) {
                    // Use the properly capitalized username from the API response
                    this.username = response.user.username;

                    // Load user settings into layout service
                    if (response.user.playtimeEnabled !== undefined) {
                        const playtimeEnabled = response.user.playtimeEnabled === 1;
                        this.layoutService.layoutConfig.update((state) => ({
                            ...state,
                            playtimeEnabled
                        }));
                    }
                } else {
                    // Fallback to the username from login service
                    this.username = rawUsername;
                }
            });
        }
    }

    ngOnInit() {
        this.isLoading$.subscribe((v) => console.log('Loading:', v));
    }

    isActive(path: string): boolean {
        const url = this.router.url;

        if (path === '/') {
            return url === '/' || url.startsWith('/?');
        }

        if (url.startsWith('/detail')) {
            const urlTree = this.router.parseUrl(url);
            const source = urlTree.queryParamMap.get('source');

            if (path === '/overview' && (!source || source === 'overview')) {
                return true;
            }

            if (path === '/backlog' && source === 'backlog') {
                return true;
            }
        }

        return url.startsWith(path);
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

    openAdmin(): void {
        const scrollContainer = document.querySelector('.layout-main');
        if (scrollContainer && this.router.url === '/overview') {
            this.scrollService.setScrollPosition('overview', scrollContainer.scrollTop);
        }
        this.router.navigate(['/admin']);
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
