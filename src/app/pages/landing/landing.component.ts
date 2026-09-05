import { LayoutService } from '../../layout/service/layout.service';
import { MaterialUiModule } from '../../ui/material-ui';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, MaterialUiModule],
    templateUrl: './landing.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
    private layout = inject(LayoutService);
    version = '';

    features = [
        {
            icon: 'bi bi-list',
            title: 'Track Your Games',
            description: "Keep a comprehensive record of all the games you've completed. Never forget what you've played and when you finished it."
        },
        {
            icon: 'bi bi-star',
            title: 'Rate & Review',
            description: 'Score games across multiple categories including gameplay, presentation, narrative, and more. Build your personal gaming history.'
        },
        {
            icon: 'bi bi-graph-up',
            title: 'Personal Stats',
            description: 'View detailed statistics about your gaming habits, completion rates, and discover patterns in your gaming preferences.'
        },
        {
            icon: 'bi bi-heart',
            title: 'Mark Favorites',
            description: 'Highlight your favorite games and easily filter your collection to find the gems that made a lasting impression.'
        },
        {
            icon: 'bi bi-calendar',
            title: 'Timeline View',
            description: 'See your gaming journey organized by year and date, creating a visual timeline of your gaming experiences.'
        },
        {
            icon: 'bi bi-arrow-repeat',
            title: 'Replay Tracking',
            description: "Mark games you've replayed and track your replay value ratings to identify the games worth revisiting."
        }
    ];

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.initializeTheme();
    }

    private initializeTheme() {
        this.layout.applyFullTheme();
    }

    navigateToAuth(): void {
        this.router.navigate(['/auth/login']);
    }

    scrollToFeatures(): void {
        const element = document.getElementById('features');
        element?.scrollIntoView({ behavior: 'smooth' });
    }
}
