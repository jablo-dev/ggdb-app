import { MaterialUiModule } from '../../ui/material-ui';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from '../service/layout.service';
import { TranslatePipe } from '@ngx-translate/core';

declare type KeyOfType<T> = keyof T extends infer U ? U : never;

declare type SurfacesType = {
    name?: string;
    palette?: {
        0?: string;
        50?: string;
        100?: string;
        200?: string;
        300?: string;
        400?: string;
        500?: string;
        600?: string;
        700?: string;
        800?: string;
        900?: string;
        950?: string;
    };
};

@Component({
    selector: 'app-configurator',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe, MaterialUiModule],
    template: `
        <div class="flex flex-col gap-4">
            <div>
                <span class="text-sm text-muted-color font-semibold">{{ 'configurator.primary' | translate }}</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-start">
                    @for (primaryColor of primaryColors(); track primaryColor.name) {
                        <button
                            type="button"
                            [title]="'colors.' + primaryColor.name | translate"
                            (click)="updateColors($event, 'primary', primaryColor)"
                            [ngClass]="{ 'outline-primary': primaryColor.name === selectedPrimaryColor() }"
                            class="border-none w-5 h-5 rounded-full p-0 cursor-pointer outline-none outline-offset-1"
                            [style]="{
                                'background-color': primaryColor?.name === 'noir' ? 'var(--text-color)' : primaryColor?.palette?.['500']
                            }"
                        ></button>
                    }
                </div>
            </div>
            <div>
                <span class="text-sm text-muted-color font-semibold">{{ 'configurator.surface' | translate }}</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-start">
                    @for (surface of surfaces; track surface.name) {
                        <button
                            type="button"
                            [title]="'colors.' + surface.name | translate"
                            (click)="updateColors($event, 'surface', surface)"
                            [ngClass]="{ 'outline-primary': selectedSurfaceColor() ? selectedSurfaceColor() === surface.name : surface.name === 'zinc' }"
                            class="border-none w-5 h-5 rounded-full p-0 cursor-pointer outline-none outline-offset-1"
                            [style]="{
                                'background-color': surface?.name === 'noir' ? 'var(--text-color)' : surface?.palette?.['500']
                            }"
                        ></button>
                    }
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    host: {
        class: 'hidden absolute top-[3.25rem] right-0 w-72 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]'
    }
})
export class AppConfigurator {
    router = inject(Router);

    layoutService: LayoutService = inject(LayoutService);

    platformId = inject(PLATFORM_ID);

    presets = ['Material'];

    showMenuModeButton = signal(!this.router.url.includes('auth'));

    menuModeOptions = [
        { label: 'Static', value: 'static' },
        { label: 'Overlay', value: 'overlay' }
    ];

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.layoutService.applyFullTheme();
        }
    }

    surfaces = this.layoutService.surfaces;

    selectedPrimaryColor = computed(() => {
        return this.layoutService.layoutConfig().primary;
    });

    selectedSurfaceColor = computed(() => this.layoutService.layoutConfig().surface);

    selectedPreset = computed(() => this.layoutService.layoutConfig().preset);

    menuMode = computed(() => this.layoutService.layoutConfig().menuMode);

    primaryColors = this.layoutService.primaryColors;

    updateColors(event: any, type: string, color: any) {
        if (type === 'primary') {
            this.layoutService.layoutConfig.update((state) => ({ ...state, primary: color.name }));
        } else if (type === 'surface') {
            this.layoutService.layoutConfig.update((state) => ({ ...state, surface: color.name }));
        }

        this.layoutService.applyFullTheme();
        event.stopPropagation();
    }

    applyTheme() {
        this.layoutService.applyFullTheme();
    }

    onPresetChange(event: any) {
        this.layoutService.layoutConfig.update((state) => ({ ...state, preset: event }));
        this.layoutService.applyFullTheme();
    }

    onMenuModeChange(event: string) {
        this.layoutService.layoutConfig.update((prev) => ({ ...prev, menuMode: event }));
    }
}
