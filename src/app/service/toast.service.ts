import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {
    constructor(private messageService: MessageService) {}

    success(summary: string, detail: string): void {
        console.log('[Toast] success fired');
        this.messageService.add({ severity: 'success', summary, detail });
    }

    error(summary: string, detail: string): void {
        console.log('[Toast] error fired');
        this.messageService.add({ severity: 'error', summary, detail });
    }
}
