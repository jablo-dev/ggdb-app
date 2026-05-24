import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    private loadingCount = 0;
    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();

    constructor() {
        const router = inject(Router);
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.resetLoading();
            }
        });
    }

    startLoading(): void {
        this.loadingCount++;
        this.loadingSubject.next(true);
    }

    stopLoading(): void {
        this.loadingCount = Math.max(0, this.loadingCount - 1);
        this.loadingSubject.next(this.loadingCount > 0);
    }

    resetLoading(): void {
        this.loadingCount = 0;
        this.loadingSubject.next(false);
    }
}
