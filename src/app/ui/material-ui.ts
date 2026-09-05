import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ContentChildren, Directive, ElementRef, EventEmitter, Input, NgModule, OnChanges, OnDestroy, Output, QueryList, TemplateRef, ViewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { LocalDateAdapter, LOCAL_DATE_FORMATS } from './local-date-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

/** Shared form controls forward value, touched and disabled state to Angular forms. */
@Directive()
export abstract class FormControlView implements ControlValueAccessor {
    @Input() disabled = false;
    @Input() inactive = false;
    private formDisabled = false;
    get isDisabled() { return this.disabled || this.inactive || this.formDisabled; }
    @Input() placeholder = '';
    @Input() inputId = '';
    @Input() ariaLabel = '';
    @Input() styleClass = '';
    value: any = null;
    private control = inject(NgControl, { self: true, optional: true });
    protected host = inject(ElementRef<HTMLElement>);
    constructor() {
        if (this.control) this.control.valueAccessor = this;
    }
    onValue: (value: any) => void = () => {};
    touched: () => void = () => {};
    writeValue(value: any) {
        this.value = value;
    }
    registerOnChange(fn: (value: any) => void) {
        this.onValue = fn;
    }
    registerOnTouched(fn: () => void) {
        this.touched = fn;
    }
    setDisabledState(disabled: boolean) {
        this.formDisabled = disabled;
    }
    update(value: any) {
        this.value = value;
        this.onValue(value);
    }
    get label(): string {
        return this.ariaLabel || this.placeholder || this.host.nativeElement.parentElement?.querySelector('label')?.textContent?.trim() || this.host.nativeElement.closest('app-fieldset')?.querySelector('legend')?.textContent?.trim() || 'Value';
    }
}

@Component({
    selector: 'app-action',
    host: { '[class]': 'styleClass' },
    imports: [CommonModule, MatButtonModule],
    template: `<button
        [matButton]="text ? 'text' : outlined ? 'outlined' : 'filled'"
        [type]="type"
        [disabled]="disabled"
        [class]="styleClass"
        [class.action-danger]="severity === 'danger'"
        [attr.aria-label]="label || ariaLabel || iconLabel"
        (click)="onClick.emit($event)"
    >
        <i *ngIf="icon" [class]="icon" aria-hidden="true"></i>{{ label }}<ng-content />
    </button>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [
        `
            :host {
                display: inline-block;
            }
            button {
                width: 100%;
                gap: 0.5rem;
            }
            .action-danger {
                --mat-sys-primary: var(--mat-sys-error);
            }
        `
    ]
})
export class ActionComponent {
    @Input() label = '';
    @Input() icon = '';
    @Input() ariaLabel = '';
    @Input() disabled = false;
    @Input() outlined = false;
    @Input() text = false;
    @Input() rounded = false;
    @Input() plain = false;
    @Input() severity = '';
    @Input() size = '';
    @Input() styleClass = '';
    @Input() type = 'button';
    @Output() onClick = new EventEmitter<MouseEvent>();
    get iconLabel() {
        return (
            this.icon
                .replace(/\bpi\b|\bbi\b/g, '')
                .replace(/pi-|bi-|-/g, ' ')
                .trim() || 'Action'
        );
    }
}

@Directive({ selector: 'ng-template[appTemplate]' })
export class UiTemplate {
    @Input() appTemplate = '';
    constructor(public template: TemplateRef<any>) {}
}

@Component({
    selector: 'app-select',
    imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule],
    template: `<mat-form-field appearance="outline" subscriptSizing="dynamic" [class]="styleClass">
        <mat-label>{{ label }}</mat-label>
        <mat-select [value]="value" [multiple]="multiple" [disabled]="isDisabled" [id]="inputId" (selectionChange)="select($event.value)" (closed)="touched()">
            <mat-select-trigger>{{ selectedLabel }}</mat-select-trigger>
            @if (filter) {
                <div class="select-search"><input matInput aria-label="Filter options" placeholder="Filter options" [ngModelOptions]="{standalone: true}" [(ngModel)]="query" (keydown)="$event.stopPropagation()" (click)="$event.stopPropagation()" /></div>
            }
            @for (option of filteredOptions; track optionValueOf(option)) {
                <mat-option [value]="optionValueOf(option)"><i *ngIf="option?.icon" [class]="option.icon" aria-hidden="true"></i> {{ optionLabelOf(option) }}</mat-option>
            }
        </mat-select>
    </mat-form-field>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [
        `
            :host {
                display: inline-block;
                min-width: 0;
            }
            mat-form-field {
                width: 100%;
                min-width: 140px;
            }
            .select-search {
                padding: 12px 16px;
                position: sticky;
                top: 0;
                background: var(--mat-sys-surface-container);
                z-index: 1;
            }
        `
    ]
})
export class SelectComponent extends FormControlView {
    @Input() options: any[] = [];
    @Input() optionLabel = '';
    @Input() optionValue = '';
    @Input() multiple = false;
    @Input() filter = false;
    @Output() onChange = new EventEmitter<{ value: any }>();
    query = '';
    optionValueOf(option: any) {
        return this.optionValue ? option?.[this.optionValue] : option;
    }
    optionLabelOf(option: any) {
        return this.optionLabel ? option?.[this.optionLabel] : (option?.label ?? option);
    }
    get filteredOptions() {
        return this.options.filter((o) => String(this.optionLabelOf(o)).toLowerCase().includes(this.query.toLowerCase()));
    }
    get selectedLabel() {
        return this.options
            .filter((o) => (this.multiple ? (this.value || []).includes(this.optionValueOf(o)) : this.optionValueOf(o) === this.value))
            .map((o) => this.optionLabelOf(o))
            .join(', ');
    }
    select(value: any) {
        this.update(value);
        this.onChange.emit({ value });
    }
}

@Component({
    selector: 'app-number',
    imports: [FormsModule, MatInputModule, MatFormFieldModule],
    template: `<mat-form-field appearance="outline" subscriptSizing="dynamic"
        ><mat-label>{{ label }}</mat-label
        ><input matInput type="number" [id]="inputId" [ngModelOptions]="{standalone: true}" [ngModel]="value" (ngModelChange)="update($event)" (blur)="touched()" [disabled]="isDisabled" [readonly]="readonly" [min]="min" [max]="max" /><span matTextSuffix>{{ suffix }}</span></mat-form-field
    >`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [
        `
            :host {
                display: block;
                min-width: 0;
            }
            mat-form-field {
                width: 100%;
            }
        `
    ]
})
export class NumberComponent extends FormControlView {
    @Input() min: number | null = null;
    @Input() max: number | null = null;
    @Input() suffix = '';
    @Input() readonly = false;
}

@Component({
    selector: 'app-date',
    providers: [{provide:DateAdapter,useClass:LocalDateAdapter},{provide:MAT_DATE_FORMATS,useValue:LOCAL_DATE_FORMATS}],
    imports: [FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule],
    template: `<mat-form-field appearance="outline" subscriptSizing="dynamic"
        ><mat-label>{{ label }}</mat-label
        ><input matInput [id]="inputId" [matDatepicker]="picker" [ngModelOptions]="{standalone: true}" [ngModel]="value" (ngModelChange)="update($event)" [disabled]="isDisabled" (blur)="touched()" /><mat-datepicker-toggle matIconSuffix [for]="picker" /><mat-datepicker #picker
    /></mat-form-field>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [
        `
            :host {
                display: block;
            }
            mat-form-field {
                width: 100%;
            }
        `
    ]
})
export class DateComponent extends FormControlView {}

@Component({
    selector: 'app-password',
    imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
    template: `<mat-form-field appearance="outline" subscriptSizing="dynamic"
        ><mat-label>{{ label }}</mat-label
        ><input matInput [id]="inputId" [type]="hidden ? 'password' : 'text'" [ngModelOptions]="{standalone: true}" [ngModel]="value" (ngModelChange)="update($event)" (blur)="touched()" [disabled]="isDisabled" autocomplete="current-password" /><button
            mat-icon-button
            matIconSuffix
            type="button"
            [attr.aria-label]="hidden ? 'Show password' : 'Hide password'"
            [attr.aria-pressed]="!hidden"
            (click)="hidden = !hidden"
        >
            <i aria-hidden="true" class="bi" [class.bi-eye]="hidden" [class.bi-eye-slash]="!hidden"></i></button
    ></mat-form-field>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [
        `
            :host {
                display: block;
            }
            mat-form-field {
                width: 100%;
            }
        `
    ]
})
export class PasswordComponent extends FormControlView {
    hidden = true;
}

@Component({
    selector: 'app-rating',
    imports: [FormsModule, MatSliderModule],
    template: `<mat-slider min="0" [max]="stars" step="1" discrete [disabled]="isDisabled"><input matSliderThumb [ngModelOptions]="{standalone: true}" [ngModel]="value || 0" (ngModelChange)="update($event)" (blur)="touched()" [attr.aria-label]="label" /></mat-slider>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [
        `
            :host {
                display: block;
                flex: 1;
                min-width: 0;
            }
            mat-slider {
                width: calc(100% - 24px);
            }
        `
    ]
})
export class RatingComponent extends FormControlView {
    @Input() stars = 10;
}

@Component({
    selector: 'app-autocomplete',
    imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
    template: `<mat-form-field appearance="outline" subscriptSizing="dynamic"
        ><mat-label>{{ label }}</mat-label
        ><input matInput [id]="inputId" [ngModelOptions]="{standalone: true}" [ngModel]="value" (ngModelChange)="search($event)" (blur)="touched()" [disabled]="isDisabled" [matAutocomplete]="auto" /><mat-autocomplete #auto="matAutocomplete" (optionSelected)="update($event.option.value)">
            @for (item of suggestions; track item.id) {
                <mat-option [value]="item[optionValue || field]">{{ item[field] }}</mat-option>
            }
        </mat-autocomplete></mat-form-field
    >`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [
        `
            :host {
                display: block;
            }
            mat-form-field {
                width: 100%;
            }
        `
    ]
})
export class AutocompleteComponent extends FormControlView implements OnDestroy {
    @Input() suggestions: any[] = [];
    @Input() field = 'name';
    @Input() optionValue = 'name';
    @Input() delay = 300;
    @Input() minLength = 2;
    @Output() completeMethod = new EventEmitter<{ query: string }>();
    private timer?: ReturnType<typeof setTimeout>;
    search(value: string) {
        this.update(value);
        clearTimeout(this.timer);
        if (value?.length >= this.minLength) this.timer = setTimeout(() => this.completeMethod.emit({ query: value }), this.delay);
        else this.suggestions = [];
    }
    ngOnDestroy() {
        clearTimeout(this.timer);
    }
}

@Component({
    selector: 'app-fieldset',
    template: `<fieldset>
        <legend>{{ legend }}</legend>
        <ng-content />
    </fieldset>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [
        `
            :host {
                display: block;
            }
            fieldset {
                min-width: 0;
                height: 100%;
                border: 1px solid var(--mat-sys-outline-variant);
                border-radius: 16px;
                padding: 24px;
                background: var(--mat-sys-surface-container-low);
            }
            legend {
                padding: 0 10px;
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 0.03em;
                color: var(--mat-sys-primary);
            }
        `
    ]
})
export class FieldsetComponent {
    @Input() legend = '';
}

@Component({
    selector: 'app-dialog',
    imports: [MatDialogModule, MatButtonModule],
    template: `<ng-template #content
        ><div class="dialog-heading">
            <h2 mat-dialog-title>{{ header }}</h2>
            @if (closable) {
                <button mat-icon-button type="button" aria-label="Close dialog" (click)="close()"><i aria-hidden="true" class="bi bi-x-lg"></i></button>
            }
        </div>
        <mat-dialog-content><ng-content /></mat-dialog-content
    ></ng-template>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [
        `
            :host {
                display: none;
            }
            .dialog-heading {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-right: 16px;
            }
        `
    ]
})
export class DialogComponent implements OnChanges, AfterViewInit, OnDestroy {
    @Input() header = '';
    @Input() visible = false;
    @Input() closable = true;
    @Input() dismissableMask = true;
    @Input() dialogStyle: Record<string, any> = {};
    @Output() visibleChange = new EventEmitter<boolean>();
    @ViewChild('content', { static: true }) content!: TemplateRef<unknown>;
    private dialog = inject(MatDialog);
    private ref?: MatDialogRef<unknown>;
    private ready = false;
    ngAfterViewInit() {
        this.ready = true;
        this.sync();
    }
    ngOnChanges() {
        if (this.ready) this.sync();
    }
    private sync() {
        if (this.visible && !this.ref) {
            this.ref = this.dialog.open(this.content, {
                width: this.dialogStyle['width'] || '640px',
                maxWidth: this.dialogStyle['maxWidth'] || '94vw',
                maxHeight: '90dvh',
                disableClose: !this.closable,
                autoFocus: 'first-tabbable',
                restoreFocus: true
            });
            this.ref.afterClosed().subscribe(() => {
                this.ref = undefined;
                if (this.visible) {
                    this.visible = false;
                    this.visibleChange.emit(false);
                }
            });
        } else if (!this.visible) this.ref?.close();
    }
    close() {
        this.ref?.close();
    }
    ngOnDestroy() {
        this.ref?.close();
    }
}


const material = [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRippleModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule
];
const controls = [ActionComponent, SelectComponent, NumberComponent, DateComponent, PasswordComponent, RatingComponent, AutocompleteComponent, FieldsetComponent, DialogComponent, UiTemplate];
@NgModule({ imports: [...material, ...controls], exports: [...material, ...controls] })
export class MaterialUiModule {}
