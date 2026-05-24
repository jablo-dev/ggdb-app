import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PrimeNG } from 'primeng/config';
import { updatePreset, updateSurfacePalette } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
    private primeng = inject(PrimeNG);
    version = '';

    features = [
        {
            icon: 'pi pi-list',
            title: 'Track Your Games',
            description: 'Keep a comprehensive record of all the games you\'ve completed. Never forget what you\'ve played and when you finished it.'
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
        },
        {
            icon: 'pi pi-replay',
            title: 'Replay Tracking',
            description: 'Mark games you\'ve replayed and track your replay value ratings to identify the games worth revisiting.'
        }
    ];

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.initializeTheme();
    }

    private initializeTheme(): void {
        // Apply noir primary and slate surface theme directly
        this.applyTheme('noir', 'slate');
    }

    private applyTheme(primaryColor: string, surfaceColor: string): void {
        // Primary color palettes
        const primaryPalettes: Record<string, any> = {
            'noir': {
                50: '#f8fafc',
                100: '#f1f5f9',
                200: '#e2e8f0',
                300: '#cbd5e1',
                400: '#94a3b8',
                500: '#64748b',
                600: '#475569',
                700: '#334155',
                800: '#1e293b',
                900: '#0f172a',
                950: '#020617'
            },
            'emerald': {
                50: '#ecfdf5',
                100: '#d1fae5',
                200: '#a7f3d0',
                300: '#6ee7b7',
                400: '#34d399',
                500: '#10b981',
                600: '#059669',
                700: '#047857',
                800: '#065f46',
                900: '#064e3b',
                950: '#022c22'
            }
        };

        // Surface color palettes
        const surfacePalettes: Record<string, any> = {
            'slate': {
                0: '#ffffff',
                50: '#f8fafc',
                100: '#f1f5f9',
                200: '#e2e8f0',
                300: '#cbd5e1',
                400: '#94a3b8',
                500: '#64748b',
                600: '#475569',
                700: '#334155',
                800: '#1e293b',
                900: '#0f172a',
                950: '#020617'
            }
        };

        // Apply primary color theme
        const primaryPalette = primaryPalettes[primaryColor];
        if (primaryPalette) {
            updatePreset({
                semantic: {
                    primary: primaryPalette
                }
            });
        }

        // Apply surface color theme
        const surfacePalette = surfacePalettes[surfaceColor];
        if (surfacePalette) {
            updateSurfacePalette(surfacePalette);
        }

        // Set the base theme
        this.primeng.theme.set({ preset: Aura });
    }

    navigateToAuth(): void {
        this.router.navigate(['/auth/login']);
    }

    scrollToFeatures(): void {
        const element = document.getElementById('features');
        element?.scrollIntoView({ behavior: 'smooth' });
    }
}
