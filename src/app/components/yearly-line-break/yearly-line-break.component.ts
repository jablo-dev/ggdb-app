import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-yearly-line-break',
    imports: [CommonModule, TranslatePipe],
    templateUrl: './yearly-line-break.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './yearly-line-break.component.scss'
})
export class YearlyLineBreakComponent {
    @Input() year: number | null | undefined;
    @Input() count: number | null | undefined;
    @Input() isCollapsed = false;
    @Input() allFlipped = false;
    @Output() toggle = new EventEmitter<void>();
    @Output() flipAll = new EventEmitter<void>();

    onToggle() {
        this.toggle.emit();
    }

    onFlipAll(event: MouseEvent) {
        event.stopPropagation();
        this.flipAll.emit();
    }

    get cardFlipEnabled(): boolean {
        return localStorage.getItem('cardFlipEnabled') === 'true';
    }
}
