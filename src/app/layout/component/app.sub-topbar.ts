import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '../../service/toolbar.service';

@Component({
    selector: 'app-sub-topbar',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="layout-sub-topbar" *ngIf="toolbarService.toolbarTemplate$ | async as template">
            <div class="layout-sub-topbar-content">
                <ng-container [ngTemplateOutlet]="template"></ng-container>
            </div>
        </div>
    `
})
export class AppSubTopbar {
    toolbarService = inject(ToolbarService);
}
