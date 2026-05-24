import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-yearly-line-break',
  imports: [],
  templateUrl: './yearly-line-break.component.html',
  styleUrl: './yearly-line-break.component.scss'
})
export class YearlyLineBreakComponent {
    @Input() year: number | null | undefined;
    @Input() count: number | null | undefined;
}
