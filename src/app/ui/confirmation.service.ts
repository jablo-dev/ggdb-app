import { Component, Injectable, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
interface Confirmation {
    header: string;
    message: string;
    icon?: string;
    accept: () => void;
}
@Component({
    selector: 'app-confirmation',
    imports: [MatDialogModule, MatButtonModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `<h2 mat-dialog-title>{{ data.header }}</h2>
        <mat-dialog-content>{{ data.message }}</mat-dialog-content
        ><mat-dialog-actions align="end"><button mat-button [mat-dialog-close]="false" cdkFocusInitial>Cancel</button><button mat-flat-button [mat-dialog-close]="true">Delete</button></mat-dialog-actions>`
})
export class ConfirmationComponent {
    data = inject<Confirmation>(MAT_DIALOG_DATA);
}
@Injectable({ providedIn: 'root' })
export class ConfirmationService {
    private dialog = inject(MatDialog);
    confirm(data: Confirmation) {
        this.dialog
            .open(ConfirmationComponent, { data, width: '440px', maxWidth: '94vw', autoFocus: 'first-tabbable' })
            .afterClosed()
            .subscribe((confirmed) => {
                if (confirmed === true) data.accept();
            });
    }
}
