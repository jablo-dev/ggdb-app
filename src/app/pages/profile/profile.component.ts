import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProfileConfiguratorComponent } from './profile-configurator.component';
import { LayoutService } from '../../layout/service/layout.service';
import { DataService } from '../../service/data.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ToggleSwitchModule, ProfileConfiguratorComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
    layoutService: LayoutService = inject(LayoutService);
    dataService: DataService = inject(DataService);

    get playtimeEnabled(): boolean {
        return this.layoutService.layoutConfig().playtimeEnabled ?? false;
    }

    set playtimeEnabled(value: boolean) {
        this.layoutService.layoutConfig.update((state) => ({ ...state, playtimeEnabled: value }));
    }

    togglePlaytime(event: any) {
        const enabled = event.checked;

        const username = this.dataService.getUsername();
        if (username) {
            this.dataService.updateUserSetting(username, { playtimeEnabled: enabled ? 1 : 0 }).subscribe();
        }
    }
}
