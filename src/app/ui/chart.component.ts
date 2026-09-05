import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);
@Component({
    selector: 'app-chart',
    template: `<canvas #canvas role="img" [attr.aria-label]="description"></canvas>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [
        `
            :host {
                display: block;
                position: relative;
                width: 100%;
            }
        `
    ]
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input() type: ChartConfiguration['type'] = 'bar';
    @Input() data: any;
    @Input() options: any;
    @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
    private chart?: Chart;
    get description() {
        return (this.data?.labels || []).map((label: string, i: number) => `${label}: ${(this.data?.datasets || []).map((d: any) => d.data[i]).join(', ')}`).join('; ');
    }
    ngAfterViewInit() {
        this.render();
    }
    ngOnChanges() {
        if (this.canvas) this.render();
    }
    private render() {
        this.chart?.destroy();
        if (this.data) this.chart = new Chart(this.canvas.nativeElement, { type: this.type, data: this.data, options: this.options });
    }
    ngOnDestroy() {
        this.chart?.destroy();
    }
}
