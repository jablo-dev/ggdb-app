import { MaterialUiModule } from '../../ui/material-ui';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from '../../layout/service/layout.service';
import { DataService } from '../../service/data.service';
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
    selector: 'app-profile-configurator',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe, MaterialUiModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div class="flex flex-col gap-6">
            <div>
                <span class="text-sm text-muted-color font-semibold">{{ 'configurator.primary' | translate }}</span>
                <div class="palette-grid">
                    @for (primaryColor of primaryColors(); track primaryColor.name) {
                        <div class="flex items-center gap-2">
                            <button
                                type="button"
                                [title]="'colors.' + primaryColor.name | translate"
                                (click)="updateColors($event, 'primary', primaryColor)"
                                [ngClass]="{ 'outline-primary': primaryColor.name === selectedPrimaryColor() }"
                                class="border-none w-6 h-6 rounded-full p-0 cursor-pointer outline-none outline-offset-2 outline-2 hover:scale-110 transition-transform duration-200 flex-shrink-0"
                                [style]="{
                                    'background-color': primaryColor?.name === 'noir' ? 'var(--text-color)' : primaryColor?.palette?.['500']
                                }"
                            ></button>
                            <span class="text-sm capitalize truncate">{{ 'colors.' + primaryColor.name | translate }}</span>
                        </div>
                    }
                </div>
            </div>
            <div>
                <span class="text-sm text-muted-color font-semibold">{{ 'configurator.surface' | translate }}</span>
                <div class="palette-grid">
                    @for (surface of surfaces; track surface.name) {
                        <div class="flex items-center gap-2">
                            <button
                                type="button"
                                [title]="'colors.' + surface.name | translate"
                                (click)="updateColors($event, 'surface', surface)"
                                [ngClass]="{ 'outline-primary': selectedSurfaceColor() ? selectedSurfaceColor() === surface.name : surface.name === 'zinc' }"
                                class="border-none w-6 h-6 rounded-full p-0 cursor-pointer outline-none outline-offset-2 outline-2 hover:scale-110 transition-transform duration-200 flex-shrink-0"
                                [style]="{
                                    'background-color': surface?.name === 'noir' ? 'var(--text-color)' : surface?.palette?.['500']
                                }"
                            ></button>
                            <span class="text-sm capitalize truncate">{{ 'colors.' + surface.name | translate }}{{ surface.name === 'ocean' ? '*' : '' }}</span>
                        </div>
                    }
                </div>
                <p class="text-xs text-muted-color mt-4 italic">
                    {{ 'configurator.ocean_note' | translate }}
                </p>
            </div>
        </div>
    `
})
export class ProfileConfiguratorComponent {
    router = inject(Router);
    layoutService: LayoutService = inject(LayoutService);
    platformId = inject(PLATFORM_ID);
    dataService = inject(DataService);

    presets = ['Material'];

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

    isDarkTheme = computed(() => this.layoutService.layoutConfig().darkTheme);

    primaryColors = this.layoutService.primaryColors;

    gridColumns = computed(() => {
        return Math.ceil(this.primaryColors().length / 5);
    });

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
}
