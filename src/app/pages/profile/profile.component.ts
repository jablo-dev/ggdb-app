import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { ProfileConfiguratorComponent } from './profile-configurator.component';
import { LayoutService } from '../../layout/service/layout.service';
import { DataService } from '../../service/data.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ToggleSwitchModule, SelectModule, ProfileConfiguratorComponent, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
    layoutService: LayoutService = inject(LayoutService);
    dataService: DataService = inject(DataService);
    translateService: TranslateService = inject(TranslateService);

    get playtimeEnabled(): boolean {
        return this.layoutService.layoutConfig().playtimeEnabled ?? false;
    }

    set playtimeEnabled(value: boolean) {
        this.layoutService.layoutConfig.update((state) => ({ ...state, playtimeEnabled: value }));
    }

    get language(): string {
        return this.translateService.currentLang() || 'en';
    }

    set language(value: string) {
        this.translateService.use(value).subscribe(() => {
            localStorage.setItem('language', value);
        });
    }

    get rpgRarityEnabled(): boolean {
        return localStorage.getItem('rpgRarityEnabled') === 'true';
    }

    set rpgRarityEnabled(value: boolean) {
        localStorage.setItem('rpgRarityEnabled', value ? 'true' : 'false');
    }

    get cardFlipEnabled(): boolean {
        return localStorage.getItem('cardFlipEnabled') === 'true';
    }

    set cardFlipEnabled(value: boolean) {
        localStorage.setItem('cardFlipEnabled', value ? 'true' : 'false');
    }

    get moreAnimationsEnabled(): boolean {
        return localStorage.getItem('moreAnimationsEnabled') === 'true';
    }

    set moreAnimationsEnabled(value: boolean) {
        localStorage.setItem('moreAnimationsEnabled', value ? 'true' : 'false');
        if (value) {
            document.body.classList.add('more-animations');
        } else {
            document.body.classList.remove('more-animations');
        }
    }

    togglePlaytime(event: any) {
        const enabled = event.checked;

        const username = this.dataService.getUsername();
        if (username) {
            this.dataService.updateUserSetting(username, { playtimeEnabled: enabled ? 1 : 0 }).subscribe();
        }
    }
}
