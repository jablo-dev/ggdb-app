import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '../../service/toolbar.service';
import { ToastService } from '../../service/toast.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-sub-topbar',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="layout-sub-topbar" *ngIf="toolbarService.toolbarTemplate$ | async as template" [ngClass]="{ 'has-toast': toastService.toast$ | async }" @slideDown>
            <div class="layout-sub-topbar-content">
                <ng-container [ngTemplateOutlet]="template"></ng-container>
            </div>
        </div>
    `,
    styles: [
        `
            .layout-sub-topbar {
                /* No extra top shift needed when toast is at the bottom */
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    animations: [
        trigger('slideDown', [
            transition(':enter', [style({ transform: 'translateY(-100%)', opacity: 0, 'box-shadow': 'none' }), animate('600ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ transform: 'translateY(0)', opacity: 1 }))]),
            transition(':leave', [animate('400ms cubic-bezier(0.25, 1, 0.5, 1)', style({ transform: 'translateY(-100%)', opacity: 0, 'box-shadow': 'none' }))])
        ])
    ]
})
export class AppSubTopbar {
    toolbarService = inject(ToolbarService);
    toastService = inject(ToastService);
}
