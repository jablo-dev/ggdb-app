import { Component, Input, OnChanges, inject } from '@angular/core';
import { GameRecord } from '../../models/record.model';
import { UIChart } from 'primeng/chart';
import { StatService } from '../../service/stat.service';

@Component({
    selector: 'app-medal-pie-chart',
    standalone: true,
    imports: [UIChart],
    template: `
        <div class="card flex flex-col h-full">
            <h5 class="text-center mb-0">Medal Distribution</h5>
            <div class="text-center text-xs text-muted-color mb-4">How many games got bronze, silver or gold</div>
            <div class="w-full flex-1 flex items-center justify-center min-h-0 mx-auto" style="max-width: fit-content;">
                <p-chart type="pie" [data]="chartData" [options]="chartOptions" style="display: block; width: 100%;"></p-chart>
            </div>
        </div>
    `
})
export class MedalPieChartComponent implements OnChanges {
    @Input() records: GameRecord[] = [];
    statService = inject(StatService);

    chartData: any;
    chartOptions: any;

    ngOnChanges() {
        this.initChart();
    }

    private initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        const medals = this.calculateMedals();

        this.chartData = {
            labels: ['Gold', 'Silver', 'Bronze', 'None'],
            datasets: [
                {
                    data: [medals.gold, medals.silver, medals.bronze, medals.none],
                    backgroundColor: [
                        '#FFD700', // Gold
                        '#C0C0C0', // Silver
                        '#CD7F32', // Bronze
                        '#1a1a1a'  // None (Dark, almost black)
                    ],
                    hoverBackgroundColor: [
                        '#FFDF00',
                        '#D3D3D3',
                        '#DB9370',
                        '#2a2a2a'
                    ]
                }
            ]
        };

        this.chartOptions = {
            layout: {
                padding: 0
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            },
            maintainAspectRatio: true,
            aspectRatio: 1
        };
    }

    private calculateMedals() {
        const counts = { gold: 0, silver: 0, bronze: 0, none: 0 };
        this.records.forEach(record => {
            const score = this.statService.getTotalScore(record);
            if (score >= 90) counts.gold++;
            else if (score >= 85) counts.silver++;
            else if (score >= 80) counts.bronze++;
            else counts.none++;
        });
        return counts;
    }
}
