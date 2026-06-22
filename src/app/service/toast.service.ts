import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
    severity: 'success' | 'error' | 'info' | 'warn';
    summary: string;
    detail: string;
    id: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
    toast$ = this.toastSubject.asObservable();
    private currentId = 0;

    constructor() {}

    success(summary: string, detail: string): void {
        console.log('[Toast] success fired');
        const message: ToastMessage = { severity: 'success', summary, detail, id: ++this.currentId };
        this.toastSubject.next(message);
    }

    error(summary: string, detail: string): void {
        console.log('[Toast] error fired');
        const message: ToastMessage = { severity: 'error', summary, detail, id: ++this.currentId };
        this.toastSubject.next(message);
    }

    clear() {
        this.toastSubject.next(null);
    }
}
