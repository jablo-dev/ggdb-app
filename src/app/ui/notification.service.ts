import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({ providedIn: 'root' })
export class NotificationService {
    private snackBar = inject(MatSnackBar);
    add(message: {severity?: string; summary: string; detail: string; life?: number}) {
        this.snackBar.open(`${message.summary}: ${message.detail}`, 'Close', {duration:message.life || 5000, politeness:message.severity === 'error' ? 'assertive' : 'polite'});
    }
}
