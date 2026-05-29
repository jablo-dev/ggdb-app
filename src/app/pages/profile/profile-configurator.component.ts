import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { $t, updatePreset, updateSurfacePalette } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import Lara from '@primeng/themes/lara';
import Nora from '@primeng/themes/nora';
import { PrimeNG } from 'primeng/config';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { LayoutService } from '../../layout/service/layout.service';
import { DataService } from '../../service/data.service';

const presets = {
    Aura,
    Lara,
    Nora
} as const;

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
    imports: [CommonModule, FormsModule, SelectButtonModule, ToggleSwitchModule],
    template: `
        <div class="flex flex-col gap-6">
            <div>
                <span class="text-sm text-muted-color font-semibold">Primary Colors</span>
                <div class="pt-2 grid gap-x-4 gap-y-2" [style]="{'grid-template-rows': 'repeat(5, minmax(0, 1fr))', 'grid-auto-flow': 'column', 'grid-template-columns': 'repeat(' + gridColumns() + ', minmax(0, 1fr))'}">
                    @for (primaryColor of primaryColors(); track primaryColor.name) {
                        <div class="flex items-center gap-2">
                            <button
                                type="button"
                                [title]="primaryColor.name"
                                (click)="updateColors($event, 'primary', primaryColor)"
                                [ngClass]="{ 'outline-primary': primaryColor.name === selectedPrimaryColor() }"
                                class="border-none w-6 h-6 rounded-full p-0 cursor-pointer outline-none outline-offset-2 outline-2 hover:scale-110 transition-transform duration-200 flex-shrink-0"
                                [style]="{
                                    'background-color': primaryColor?.name === 'noir' ? 'var(--text-color)' : primaryColor?.palette?.['500']
                                }"
                            ></button>
                            <span class="text-sm capitalize truncate">{{ primaryColor.name }}</span>
                        </div>
                    }
                </div>
            </div>
            <div>
                <span class="text-sm text-muted-color font-semibold">Surface Colors</span>
                <div class="pt-2 grid gap-x-4 gap-y-2" [style]="{'grid-template-rows': 'repeat(5, minmax(0, 1fr))', 'grid-auto-flow': 'column', 'grid-template-columns': 'repeat(' + gridColumns() + ', minmax(0, 1fr))'}">
                    @for (surface of surfaces; track surface.name) {
                        <div class="flex items-center gap-2">
                            <button
                                type="button"
                                [title]="surface.name"
                                (click)="updateColors($event, 'surface', surface)"
                                [ngClass]="{ 'outline-primary': selectedSurfaceColor() ? selectedSurfaceColor() === surface.name : surface.name === 'zinc' }"
                                class="border-none w-6 h-6 rounded-full p-0 cursor-pointer outline-none outline-offset-2 outline-2 hover:scale-110 transition-transform duration-200 flex-shrink-0"
                                [style]="{
                                    'background-color': surface?.name === 'noir' ? 'var(--text-color)' : surface?.palette?.['500']
                                }"
                            ></button>
                            <span class="text-sm capitalize truncate">{{ surface.name }}{{ surface.name === 'ocean' ? '*' : '' }}</span>
                        </div>
                    }
                </div>
                <p class="text-xs text-muted-color mt-4 italic">
                    * Ocean is currently a test-run for more vivid surface colors and can provide issues with the viewing experience
                </p>
            </div>
        </div>
    `
})
export class ProfileConfiguratorComponent {
    router = inject(Router);
    config: PrimeNG = inject(PrimeNG);
    layoutService: LayoutService = inject(LayoutService);
    platformId = inject(PLATFORM_ID);
    primeng = inject(PrimeNG);
    dataService = inject(DataService);

    presets = Object.keys(presets);

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

    getPresetExt() {
        const color: any = this.primaryColors().find((c: any) => c.name === this.selectedPrimaryColor()) || {};
        const preset = this.layoutService.layoutConfig().preset;

        return {
            semantic: {
                primary: color.palette,
                colorScheme: {
                    light: {
                        primary: {
                            color: '{primary.500}',
                            contrastColor: '#ffffff',
                            hoverColor: '{primary.600}',
                            activeColor: '{primary.700}'
                        },
                        highlight: {
                            background: '{primary.50}',
                            focusBackground: '{primary.100}',
                            color: '{primary.700}',
                            focusColor: '{primary.800}'
                        }
                    },
                    dark: {
                        primary: {
                            color: '{primary.400}',
                            contrastColor: '{surface.900}',
                            hoverColor: '{primary.300}',
                            activeColor: '{primary.200}'
                        },
                        highlight: {
                            background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                            focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                            color: 'rgba(255,255,255,.87)',
                            focusColor: 'rgba(255,255,255,.87)'
                        }
                    }
                }
            }
        };
    }

    updateColors(event: any, type: string, color: any) {
        if (type === 'primary') {
            this.layoutService.layoutConfig.update((state) => ({ ...state, primary: color.name }));
        } else if (type === 'surface') {
            this.layoutService.layoutConfig.update((state) => ({ ...state, surface: color.name }));
        }

        this.layoutService.applyFullTheme();
        event.stopPropagation();
    }

    applyTheme(type: string, color: any) {
        if (type === 'primary') {
            updatePreset(this.getPresetExt());
        } else if (type === 'surface') {
            updateSurfacePalette(color.palette);
        }
    }

    onPresetChange(event: any) {
        this.layoutService.layoutConfig.update((state) => ({ ...state, preset: event }));
        this.layoutService.applyFullTheme();
    }
}
