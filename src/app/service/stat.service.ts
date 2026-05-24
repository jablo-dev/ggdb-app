import { DataService } from './data.service';
import { inject } from '@angular/core';
import { GameRecord } from '../models/record.model';

export class StatService {
    dataService = inject(DataService);
    records: GameRecord[] = [];
    username: string = '';

    constructor() {
        this.username = this.dataService.getUsername();
        this.dataService.getAllRecords(this.username).subscribe((records: GameRecord[]) => {
            this.records = records;
        });
    }

    getTotalScore(record?: GameRecord): number {
        if (!record) return 0;

        const scores = ['scoreGameplay', 'scorePresentation', 'scoreNarrative', 'scoreQuality',
            'scoreSound', 'scoreContent', 'scorePacing', 'scoreBalance', 'scoreUIUX', 'scoreImpression'] as const;
        let reachedPoints = 0;
        let countedCategories = 0;

        for (const key of scores) {
            const value = record[key] ?? 0;
            if (value > 0) {
                reachedPoints += value;
                countedCategories++;
            }
        }
        if (countedCategories === 0) return 0;
        return Math.round((reachedPoints / (countedCategories * 10)) * 100);
    }
}
