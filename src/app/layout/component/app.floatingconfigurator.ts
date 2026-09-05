import { MaterialUiModule } from '../../ui/material-ui';
import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';

@Component({
    selector: 'app-floating-configurator',
    imports: [AppConfigurator, MaterialUiModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div class="fixed flex gap-4 top-8 right-8">
            <div class="relative">
                <app-configurator />
            </div>
        </div>
    `
})
export class AppFloatingConfigurator {
    LayoutService = inject(LayoutService);

    isDarkTheme = computed(() => this.LayoutService.layoutConfig().darkTheme);
}
