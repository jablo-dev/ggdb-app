import { Injectable, effect, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { $t, updatePreset, updateSurfacePalette } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import Lara from '@primeng/themes/lara';
import Nora from '@primeng/themes/nora';

const presets = {
    Aura,
    Lara,
    Nora
} as const;

type KeyOfType<T> = keyof T extends infer U ? U : never;

export interface layoutConfig {
    preset?: string;
    primary?: string;
    surface?: string | undefined | null;
    darkTheme?: boolean;
    playtimeEnabled?: boolean;
    menuMode?: string;
}

interface LayoutState {
    staticMenuDesktopInactive?: boolean;
    overlayMenuActive?: boolean;
    configSidebarVisible?: boolean;
    staticMenuMobileActive?: boolean;
    menuHoverActive?: boolean;
}

interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    _config: layoutConfig = {
        preset: 'Aura',
        primary: 'emerald',
        surface: null,
        darkTheme: true,
        playtimeEnabled: false,
        menuMode: 'overlay'
    };

    _state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    };

    layoutConfig = signal<layoutConfig>(this._config);

    layoutState = signal<LayoutState>(this._state);

    private configUpdate = new Subject<layoutConfig>();

    private overlayOpen = new Subject<any>();

    private menuSource = new Subject<MenuChangeEvent>();

    private resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();

    resetSource$ = this.resetSource.asObservable();

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    theme = computed(() => (this.layoutConfig()?.darkTheme ? 'light' : 'dark'));

    isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive);

    isDarkTheme = computed(() => this.layoutConfig().darkTheme);

    getPrimary = computed(() => this.layoutConfig().primary);

    getSurface = computed(() => this.layoutConfig().surface);

    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');

    transitionComplete = signal<boolean>(false);

    private initialized = false;

    private platformId = inject(PLATFORM_ID);

    surfaces = [
        {
            name: 'slate',
            palette: {
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
        },
        {
            name: 'gray',
            palette: {
                0: '#ffffff',
                50: '#f9fafb',
                100: '#f3f4f6',
                200: '#e5e7eb',
                300: '#d1d5db',
                400: '#9ca3af',
                500: '#6b7280',
                600: '#4b5563',
                700: '#374151',
                800: '#1f2937',
                900: '#111827',
                950: '#030712'
            }
        },
        {
            name: 'zinc',
            palette: {
                0: '#ffffff',
                50: '#fafafa',
                100: '#f4f4f5',
                200: '#e4e4e7',
                300: '#d4d4d8',
                400: '#a1a1aa',
                500: '#71717a',
                600: '#52525b',
                700: '#3f3f46',
                800: '#27272a',
                900: '#18181b',
                950: '#09090b'
            }
        },
        {
            name: 'neutral',
            palette: {
                0: '#ffffff',
                50: '#fafafa',
                100: '#f5f5f5',
                200: '#e5e5e5',
                300: '#d4d4d4',
                400: '#a3a3a3',
                500: '#737373',
                600: '#525252',
                700: '#404040',
                800: '#262626',
                900: '#171717',
                950: '#0a0a0a'
            }
        },
        {
            name: 'stone',
            palette: {
                0: '#ffffff',
                50: '#fafaf9',
                100: '#f5f5f4',
                200: '#e7e5e4',
                300: '#d6d3d1',
                400: '#a8a29e',
                500: '#78716c',
                600: '#57534e',
                700: '#44403c',
                800: '#292524',
                900: '#1c1917',
                950: '#0c0a09'
            }
        },
        {
            name: 'soho',
            palette: {
                0: '#ffffff',
                50: '#ececec',
                100: '#dedfdf',
                200: '#c4c4c6',
                300: '#adaeb0',
                400: '#97979b',
                500: '#7f8084',
                600: '#6a6b70',
                700: '#55565b',
                800: '#3f4046',
                900: '#2c2c34',
                950: '#16161d'
            }
        },
        {
            name: 'viva',
            palette: {
                0: '#ffffff',
                50: '#f3f3f3',
                100: '#e7e7e8',
                200: '#cfcfd0',
                300: '#b7b7b9',
                400: '#9f9fa1',
                500: '#87878a',
                600: '#6f6f72',
                700: '#57575b',
                800: '#3f3f43',
                900: '#28282c',
                950: '#101014'
            }
        },
        {
            name: 'ocean',
            palette: {
                0: '#ffffff',
                50: '#fbfcfd',
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
        }
    ];

    primaryColors = computed(() => {
        const config = this.layoutConfig();
        const preset = config.preset as KeyOfType<typeof presets>;
        const presetPalette = presets[preset].primitive;
        const colors = [
            'red',
            'crimson',
            'rose',
            'pink',
            'fuchsia',
            'purple',
            'violet',
            'lavender',
            'indigo',
            'navy',
            'blue',
            'sky',
            'cyan',
            'teal',
            'emerald',
            'mint',
            'green',
            'cactus',
            'lime',
            'olive',
            'yellow',
            'amber',
            'gold',
            'orange',
            'coral',
            'brown',
            'maroon',
            'coffee',
            'wood',
            'earth',
            'sand',
            'stone',
            'neutral',
            'gray',
            'slate',
            'zinc',
            'iron',
            'steel',
            'tin',
            'nickel',
            'lead',
            'platinum',
            'silver',
            'bronze',
            'copper'
        ];
        const palettes: any[] = [{ name: 'noir', palette: {} }];

        const uniqueColors = Array.from(new Set(colors));

        uniqueColors.forEach((color) => {
            const palette = presetPalette?.[color as KeyOfType<typeof presetPalette>];
            if (palette) {
                palettes.push({
                    name: color,
                    palette: palette
                });
            }
        });

        return palettes;
    });

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            const savedPrimary = localStorage.getItem('primaryColor');
            const savedSurface = localStorage.getItem('surfaceColor');
            const savedPreset = localStorage.getItem('themePreset');

            this._config = {
                ...this._config,
                primary: savedPrimary || this._config.primary,
                surface: savedSurface || this._config.surface,
                preset: savedPreset || this._config.preset,
                darkTheme: true
            };
            this.layoutConfig.set(this._config);

            // Apply theme as soon as possible
            this.applyFullTheme();
        }

        effect(() => {
            const config = this.layoutConfig();
            if (config) {
                this.onConfigUpdate();
                if (isPlatformBrowser(this.platformId)) {
                    if (config.primary) localStorage.setItem('primaryColor', config.primary);
                    if (config.surface) localStorage.setItem('surfaceColor', config.surface);
                    if (config.preset) localStorage.setItem('themePreset', config.preset);
                    localStorage.setItem('darkTheme', 'true');

                    // Re-apply theme when config changes
                    this.applyFullTheme();
                }
            }
        });
    }

    toggleDarkMode(): void {
        document.documentElement.classList.add('app-dark');
        document.body.classList.add('app-dark');
    }

    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => {
            this.transitionComplete.set(false);
        });
    }

    onMenuToggle() {
        if (this.isOverlay()) {
            this.layoutState.update((prev) => ({ ...prev, overlayMenuActive: !this.layoutState().overlayMenuActive }));

            if (this.layoutState().overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.layoutState.update((prev) => ({ ...prev, staticMenuDesktopInactive: !this.layoutState().staticMenuDesktopInactive }));
        } else {
            this.layoutState.update((prev) => ({ ...prev, staticMenuMobileActive: !this.layoutState().staticMenuMobileActive }));

            if (this.layoutState().staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onConfigUpdate() {
        this._config = { ...this.layoutConfig() };
        this.configUpdate.next(this.layoutConfig());
    }

    applyFullTheme() {
        const config = this.layoutConfig();
        if (!config) return;

        // Apply Preset and Primary Color logic
        const preset = presets[config.preset as KeyOfType<typeof presets>];
        const surfacePalette = this.surfaces.find((s) => s.name === config.surface)?.palette;

        $t()
            .preset(preset)
            .preset(this.getPresetExt())
            .surfacePalette(surfacePalette)
            .use({ useDefaultOptions: true });

        // Apply Dark Mode
        this.toggleDarkMode();
    }

    getPresetExt() {
        const config = this.layoutConfig();
        const preset = config.preset as KeyOfType<typeof presets>;
        const presetPalette = presets[preset].primitive;
        const colorName = config.primary;

        const color: any = colorName === 'noir' ? { name: 'noir', palette: {} } : {
            name: colorName,
            palette: presetPalette?.[colorName as KeyOfType<typeof presetPalette>]
        };

        const shadowStyles = {
            colorScheme: {
                dark: {
                    content: {
                        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid {surface.700}'
                    },
                    inputtext: {
                        border: '1px solid {surface.700}'
                    }
                }
            }
        };

        if (color.name === 'noir') {
            return {
                semantic: {
                    primary: {
                        50: '{surface.50}',
                        100: '{surface.100}',
                        200: '{surface.200}',
                        300: '{surface.300}',
                        400: '{surface.400}',
                        500: '{surface.500}',
                        600: '{surface.600}',
                        700: '{surface.700}',
                        800: '{surface.800}',
                        900: '{surface.900}',
                        950: '{surface.950}'
                    },
                    ...shadowStyles,
                    colorScheme: {
                        dark: {
                            ...shadowStyles.colorScheme.dark,
                            primary: {
                                color: '{primary.50}',
                                contrastColor: '{primary.950}',
                                hoverColor: '{primary.100}',
                                activeColor: '{primary.200}'
                            },
                            highlight: {
                                background: '{primary.50}',
                                focusBackground: '{primary.300}',
                                color: '{primary.950}',
                                focusColor: '{primary.950}'
                            }
                        }
                    }
                }
            };
        } else {
            if (preset === 'Nora') {
                return {
                    semantic: {
                        primary: color.palette,
                        ...shadowStyles,
                        colorScheme: {
                            dark: {
                                ...shadowStyles.colorScheme.dark,
                                primary: {
                                    color: '{primary.500}',
                                    contrastColor: '{surface.900}',
                                    hoverColor: '{primary.400}',
                                    activeColor: '{primary.300}'
                                },
                                highlight: {
                                    background: '{primary.500}',
                                    focusBackground: '{primary.400}',
                                    color: '{surface.900}',
                                    focusColor: '{surface.900}'
                                }
                            }
                        }
                    }
                };
            } else {
                return {
                    semantic: {
                        primary: color.palette,
                        ...shadowStyles,
                        colorScheme: {
                            dark: {
                                ...shadowStyles.colorScheme.dark,
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
        }
    }

    onMenuStateChange(event: MenuChangeEvent) {
        this.menuSource.next(event);
    }

    reset() {
        this.resetSource.next(true);
    }
}
