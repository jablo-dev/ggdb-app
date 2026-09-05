import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

/** Preserve the editor's day/month/year entry format and local calendar dates. */
@Injectable()
export class LocalDateAdapter extends NativeDateAdapter {
    override parse(value: unknown): Date | null {
        if(value instanceof Date) return value;
        if(typeof value !== 'string' || !value.trim()) return null;
        const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if(!match) return new Date(NaN);
        const [, day, month, year] = match.map(Number);
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : new Date(NaN);
    }
    override format(date: Date, displayFormat: Object): string {
        if(displayFormat === 'input') return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
        return super.format(date, displayFormat);
    }
}
export const LOCAL_DATE_FORMATS = {
    parse: {dateInput:'input'},
    display: {dateInput:'input', monthYearLabel:{year:'numeric',month:'short'}, dateA11yLabel:{year:'numeric',month:'long',day:'numeric'}, monthYearA11yLabel:{year:'numeric',month:'long'}}
};
