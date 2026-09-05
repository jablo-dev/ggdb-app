import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `<div class="layout-footer"><span>GoodGamesDB | Playthrough Tracker</span>|<a href="https://jablo.dev" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">jablo.dev</a></div>`
})
export class AppFooter {}
