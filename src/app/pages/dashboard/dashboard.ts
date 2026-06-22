import { Component, inject, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../service/data.service';
import { GameRecord } from '../../models/record.model'
import { GameCompletionChartComponent } from '../../components/game-completion-chart/game-completion-chart.component';
import { MedalPieChartComponent } from '../../components/medal-pie-chart/medal-pie-chart.component';
import { StatService } from '../../service/stat.service';
import { VersionService } from '../../service/version.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    providers: [StatService],
    imports: [CommonModule, GameCompletionChartComponent, MedalPieChartComponent, TranslatePipe],
    templateUrl: 'dashboard.html'
})
export class Dashboard implements OnInit {
    statService: StatService = inject(StatService);
    username: string = '';
    records: GameRecord[] = [];
    bestGame: { name: string, score: number } | null = null;
    version: string;

    constructor(
        private dataService: DataService,
        private versionService: VersionService
    ) {
        this.version = this.versionService.getVersion();
    }

    ngOnInit(): void {
        this.username = this.dataService.getUsername();
        this.dataService.getAllRecords(this.username).subscribe((records: GameRecord[]) => {
            this.records = records.filter(r => r.backlogItem !== 1);
            this.bestGame = this.getHighestRatedGame();
        });
    }

    getCurrentYear(): number {
        return new Date().getFullYear();
    }

    getPreviousYear(): number {
        return new Date().getFullYear() - 1;
    }

    countAllRecords(): number {
        return this.records.length;
    }

    countRecordsPerYear(year: number): number {
        let count = 0;
        this.records.map((record: GameRecord) => {
            if (new Date(record.finishDate).getFullYear() === year) {
                count++;
            }
        });
        return count;
    }

    getHighestRatedGame(): { name: string, score: number } | null {
        if (!this.records.length) return null;

        let maxScore = -1;
        let bestGames: GameRecord[] = [];

        for (const record of this.records) {
            const totalScore = this.statService.getTotalScore(record);

            if (totalScore > maxScore) {
                maxScore = totalScore;
                bestGames = [record];
            } else if (totalScore === maxScore) {
                bestGames.push(record);
            }
        }

        bestGames.sort((a, b) => new Date(b.finishDate).getTime() - new Date(a.finishDate).getTime());
        const bestGame = bestGames[0];
        return { name: bestGame?.name || '', score: this.statService.getTotalScore(bestGame) };
    }

    getAverageRatingForYear(year: number): number {
        const yearRecords = this.records.filter(record =>
            new Date(record.finishDate).getFullYear() === year
        );

        if (yearRecords.length === 0) return 0;

        const totalScore = yearRecords.reduce((sum, record) =>
            sum + this.statService.getTotalScore(record), 0
        );

        return Math.round(totalScore / yearRecords.length);
    }

    getCurrentYearAverageRating(): number {
        return this.getAverageRatingForYear(this.getCurrentYear());
    }

    getLastYearAverageRating(): number {
        return this.getAverageRatingForYear(this.getPreviousYear());
    }

    getYearWithHighestAverage(): { year: number, average: number } {
        if (!this.records.length) return { year: 0, average: 0 };

        const yearAverages = new Map<number, { total: number, count: number }>();

        // Calculate totals and counts for each year
        this.records.forEach(record => {
            const year = new Date(record.finishDate).getFullYear();
            const score = this.statService.getTotalScore(record);

            if (!yearAverages.has(year)) {
                yearAverages.set(year, { total: 0, count: 0 });
            }

            const yearData = yearAverages.get(year)!;
            yearData.total += score;
            yearData.count += 1;
        });

        let bestYear = 0;
        let bestAverage = 0;

        yearAverages.forEach((data, year) => {
            const average = Math.round(data.total / data.count);
            if (average > bestAverage) {
                bestAverage = average;
                bestYear = year;
            }
        });

        return { year: bestYear, average: bestAverage };
    }

    getAverageScore(): number {
        if (!this.records.length) return 0;
        const totalScore = this.records.reduce((sum, record) => sum + this.statService.getTotalScore(record), 0);
        return Math.round(totalScore / this.records.length);
    }

    getMostPlayedLocation(): string {
        if (!this.records.length) return 'N/A';
        const locations = new Map<string, number>();
        this.records.forEach(r => {
            const loc = r.location || 'Unknown';
            locations.set(loc, (locations.get(loc) || 0) + 1);
        });
        let mostPlayed = 'N/A';
        let maxCount = 0;
        locations.forEach((count, loc) => {
            if (count > maxCount) {
                maxCount = count;
                mostPlayed = loc;
            }
        });
        return mostPlayed;
    }

    getCompletionRate(): number {
        if (!this.records.length) return 0;
        // Assuming status 'Completed' means finished. Adjust if needed.
        const completed = this.records.filter(r => r.status === 'Completed').length;
        return Math.round((completed / this.records.length) * 100);
    }

    getStrongestMonth(): string {
        if (!this.records.length) return 'N/A';
        const months = new Map<number, number>();
        this.records.forEach(r => {
            const date = new Date(r.finishDate);
            const month = date.getMonth();
            months.set(month, (months.get(month) || 0) + 1);
        });

        let strongestMonth = -1;
        let maxCount = 0;
        months.forEach((count, month) => {
            if (count > maxCount) {
                maxCount = count;
                strongestMonth = month;
            }
        });

        if (strongestMonth === -1) return 'N/A';
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return monthNames[strongestMonth];
    }

    getYearWithMostMedals(type: 'gold' | 'silver'): { year: number, count: number } {
        if (!this.records.length) return { year: 0, count: 0 };
        const yearCounts = new Map<number, number>();

        this.records.forEach(r => {
            const score = this.statService.getTotalScore(r);
            const year = new Date(r.finishDate).getFullYear();
            let isMedal = false;
            if (type === 'gold' && score >= 90) isMedal = true;
            if (type === 'silver' && score >= 85 && score < 90) isMedal = true;

            if (isMedal) {
                yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
            }
        });

        let bestYear = 0;
        let maxCount = 0;
        yearCounts.forEach((count, year) => {
            if (count > maxCount) {
                maxCount = count;
                bestYear = year;
            }
        });

        return { year: bestYear, count: maxCount };
    }
}

