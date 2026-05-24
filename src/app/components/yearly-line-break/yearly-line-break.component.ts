import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-yearly-line-break',
  imports: [CommonModule],
  templateUrl: './yearly-line-break.component.html',
  styleUrl: './yearly-line-break.component.scss'
})
export class YearlyLineBreakComponent {
    @Input() year: number | null | undefined;
    @Input() count: number | null | undefined;
    @Input() isCollapsed = false;
    @Output() toggle = new EventEmitter<void>();

    onToggle() {
        this.toggle.emit();
    }
}
