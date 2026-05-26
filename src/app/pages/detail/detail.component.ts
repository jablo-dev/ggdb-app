import { Component, OnInit, inject, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Rating } from 'primeng/rating';
import { RadioButton } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { FieldsetModule } from 'primeng/fieldset';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { RecordType } from '../../enum/type.enum';
import { Locations } from '../../enum/location.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutService } from '../../layout/service/layout.service';
import { DataService } from '../../service/data.service';
import { GameRecord } from '../../models/record.model';
import { ToastService } from '../../service/toast.service';
import { ConfirmationService } from 'primeng/api';
import { StatService } from '../../service/stat.service';
import { Toolbar } from 'primeng/toolbar';
import { ClipboardService } from '../../service/clipboard.service';
import { IgdbService, IgdbCover } from '../../service/igdb.service';
import { ToolbarService } from '../../service/toolbar.service';

@Component({
    selector: 'app-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, ToggleSwitchModule, SelectModule, InputNumberModule, DatePickerModule, TextareaModule, FloatLabelModule, SliderModule, ButtonModule, Rating, Toolbar, TooltipModule, FieldsetModule, DialogModule, ProgressSpinnerModule],
    providers: [StatService],
    templateUrl: './detail.component.html',
    styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit, OnDestroy {
    @ViewChild('toolbarTemplate', { static: true }) toolbarTemplate!: TemplateRef<any>;

    private source: string | null = null;
    statService: StatService = inject(StatService);
    form!: FormGroup;
    formEditable = false;
    isGeneratingCard = false;
    dataService = inject(DataService);
    recordTypes = Object.values(RecordType);
    locationTypes = Object.values(Locations);

    layoutService: LayoutService = inject(LayoutService);
    private toolbarService = inject(ToolbarService);

    scoreFields: string[] = ['scoreGameplay', 'scorePresentation', 'scoreNarrative', 'scoreQuality', 'scoreSound', 'scoreContent', 'scorePacing', 'scoreBalance', 'scoreUIUX', 'scoreImpression'];

    coverDialogVisible = false;
    coverSearchLoading = false;
    coverResults: IgdbCover[] = [];
    selectedCoverUrl: string | null = null;

    playtimeDialogVisible = false;
    customHoursToAdd = 1;

    scoreFieldComments: Record<string, string> = {
        scoreGameplay: 'How engaging and responsive was the core gameplay loop?',
        scorePresentation: 'Visuals, animations, polish and overall impression.',
        scoreNarrative: 'Storytelling, writing, characters, and world-building.',
        scoreQuality: 'Stability, bug-free experience, and polish level.',
        scoreSound: 'Music, sound effects, and audio design.',
        scoreContent: 'Amount and quality of content available.',
        scorePacing: 'Flow of progression and timing of major beats.',
        scoreBalance: 'Difficulty tuning and fair challenge.',
        scoreUIUX: 'Menus, HUD, and overall usability.',
        scoreImpression: 'Your overall impression.'
    };

    replayValueOptions = [
        { value: 1, label: 'No replay value' },
        { value: 2, label: 'Maybe someday' },
        { value: 3, label: 'Would replay' },
        { value: 4, label: 'Definitely again' },
        { value: 5, label: 'Can’t stop playing!' }
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private toast: ToastService,
        private confirmationService: ConfirmationService,
        private clipboardService: ClipboardService,
        private igdbService: IgdbService
    ) {}

    getReplayValueLabel(value: number): string {
        const option = this.replayValueOptions.find(opt => opt.value === value);
        return option ? option.label : '';
    }

    ngOnInit(): void {
        this.toolbarService.setTemplate(this.toolbarTemplate);
        this.route.queryParams.subscribe((params) => {
            const recordParam = params['record'];
            this.source = params['source'] || null;
            if (recordParam === 'new') {
                this.formEditable = true;
                this.initForm();
            } else if (!isNaN(+recordParam)) {
                const record = this.dataService.getRecords().find((r) => r.id === +recordParam);
                if (record) {
                    this.formEditable = false;
                    this.initForm(record);
                } else {
                    console.warn('Record not found.');
                    this.formEditable = true;
                    this.initForm();
                }
            }
        });
    }

    get playtimeEnabled(): boolean {
        return this.layoutService.layoutConfig().playtimeEnabled ?? false;
    }

    initForm(record?: GameRecord): void {
        const isBacklog = this.source === 'backlog' || record?.backlogItem === 1;

        this.form = this.fb.group({
            id: [record?.id ?? 0],
            ownerId: [record?.ownerId ?? 0],
            name: [record?.name ?? '', Validators.required],
            status: [record?.status ?? ''],
            type: [record?.type ?? '', Validators.required],
            location: [record?.location ? (Locations[record.location as keyof typeof Locations] || record.location) : '', Validators.required],
            createDate: [record?.createDate ? this.parseStringToDate(record.createDate) : ''],
            finishDate: [record?.finishDate ? this.parseStringToDate(record.finishDate) : '', isBacklog ? [] : [Validators.required]],
            note: [record?.note ?? ''],
            replayValue: [record?.replayValue ?? 1, isBacklog ? [] : [Validators.required]],
            mainQuestDone: [record?.mainQuestDone === 1],
            fav: [record?.fav === 1],
            replay: [record?.replay === 1],
            backlogItem: [isBacklog],
            canceled: [record?.canceled === 1],
            cover: [record?.cover ?? ''],
            playtime: [record?.playtime ?? 0],
            ...Object.fromEntries(this.scoreFields.map((field) => [field, record?.[field as keyof GameRecord] ?? 1])),
            ...Object.fromEntries(this.scoreFields.map((field) => [`${field}Enabled`, record ? record[field as keyof GameRecord] !== 0 : true]))
        });

        if (this.source === 'backlog' && !record?.id) {
            this.form.get('backlogItem')?.disable();
        }

        // Subscribe to backlogItem changes to update validation
        this.form.get('backlogItem')?.valueChanges.subscribe((backlog) => {
            const finishDateControl = this.form.get('finishDate');
            const replayValueControl = this.form.get('replayValue');

            if (backlog) {
                finishDateControl?.clearValidators();
                replayValueControl?.clearValidators();
            } else {
                finishDateControl?.setValidators([Validators.required]);
                replayValueControl?.setValidators([Validators.required]);
            }
            finishDateControl?.updateValueAndValidity();
            replayValueControl?.updateValueAndValidity();
        });

        this.scoreFields.forEach((field) => {
            const toggleControl = this.form.get(`${field}Enabled`);
            const scoreControl = this.form.get(field);

            toggleControl?.valueChanges.subscribe((enabled) => {
                if (!enabled) {
                    scoreControl?.setValue(0);
                } else {
                    if (scoreControl?.value === 0) {
                        scoreControl.setValue(1);
                    }
                }
            });
        });
        if (!this.formEditable) {
            this.form.disable();
        }
    }

    get totalScore(): number {
        const rawValue = this.form.getRawValue();
        const rawRecord: GameRecord = {
            ...rawValue,
            mainQuestDone: rawValue.mainQuestDone ? 1 : 0,
            fav: rawValue.fav ? 1 : 0,
            replay: rawValue.replay ? 1 : 0,
            backlogItem: rawValue.backlogItem ? 1 : 0,
            canceled: rawValue.canceled ? 1 : 0
        };
        return this.statService.getTotalScore(rawRecord);
    }

    toggleEdit(): void {
        this.formEditable = !this.formEditable;

        if (this.formEditable) {
            this.form.enable();
            if (this.source === 'backlog' && !this.form.get('id')?.value) {
                this.form.get('backlogItem')?.disable();
            }
        } else {
            this.form.disable();
            this.initForm(this.form.value);
        }
    }

    finishGame(): void {
        this.formEditable = true;
        this.form.enable();
        this.form.get('backlogItem')?.enable();
        this.form.patchValue({ backlogItem: false });
        // The valueChanges subscription in initForm will handle validators
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const raw = this.form.getRawValue();
        const payload = {
            id: raw.id,
            name: raw.name,
            status: raw.status,
            type: raw.type,
            location: this.getEnumKeyFromValue(Locations, raw.location) || raw.location,
            createDate: raw.createDate ? this.formatDateToString(raw.createDate) : '',
            finishDate: raw.finishDate ? this.formatDateToString(raw.finishDate) : '',
            note: raw.note,
            replay: raw.replay ? 1 : 0,
            mainQuestDone: raw.mainQuestDone ? 1 : 0,
            fav: raw.fav ? 1 : 0,
            backlogItem: raw.backlogItem ? 1 : 0,
            canceled: raw.canceled ? 1 : 0,
            replayValue: raw.replayValue,
            cover: raw.cover,
            playtime: raw.playtime,
            ...Object.fromEntries(this.scoreFields.map((field) => [field, raw[field]]))
        };

        const username = this.dataService.loginService.getUsername();
        if (!username) {
            console.error('No username found');
            return;
        }

        const isUpdate = raw.id && raw.id > 0;
        const request$ = isUpdate ? this.dataService.updateRecord(username, payload) : this.dataService.createRecord(username, payload);

        request$.subscribe({
            next: () => {
                this.router.navigate(['/overview'], {
                    queryParams: {
                        toast: isUpdate ? 'updated' : 'created',
                        game: payload.name
                    }
                });
            },
            error: () => {
                this.toast.error(`${isUpdate ? 'Update' : 'Create'} failed`, 'Something went wrong while saving.');
            }
        });
    }

    confirmDelete(): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this playthrough?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.performDelete();
            }
        });
    }

    performDelete(): void {
        const id = this.form.get('id')?.value;
        const username = this.dataService.loginService.getUsername();
        if (!username || !id) return;

        this.dataService.deleteRecord(username, id).subscribe({
            next: () => {
                this.toast.success('Deleted', `${this.form.get('name')?.value} has been deleted.`);
                this.router.navigate(['/overview']);
            }
        });
    }

    reset(): void {
        this.form.reset();
    }

    getEnumKeyFromValue(enumObj: any, value: string): string {
        return Object.keys(enumObj).find((key) => enumObj[key] === value) || value;
    }

    formatDateToString(date: Date | string): string {
        if (!date) return '';

        const dateObj = date instanceof Date ? date : new Date(date);

        // Use local date components to avoid timezone issues
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    parseStringToDate(dateString: string): Date | null {
        if (!dateString) return null;

        // Parse the date string and create a date in local timezone
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    returnToOverview() {
        this.router.navigate(['/overview'], {});
    }

    addPlaytimeHours(hours: number): void {
        const currentMinutes = this.form.get('playtime')?.value || 0;
        this.form.get('playtime')?.setValue(currentMinutes + Math.round(hours * 60));
        this.form.markAsDirty();
    }

    showPlaytimeDialog(): void {
        this.customHoursToAdd = 1;
        this.playtimeDialogVisible = true;
    }

    quickAddAndSave(hours: number): void {
        if (!this.formEditable) {
            this.toggleEdit();
        }
        this.addPlaytimeHours(hours);
        this.playtimeDialogVisible = false;
    }

    formatPlaytime(minutes: number): string {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    }

    openCoverDialog(): void {
        const name = this.form.get('name')?.value;
        if (!name) {
            this.toast.error('No name', 'Please enter a game name first.');
            return;
        }
        const username = this.dataService.loginService.getUsername();
        if (!username) return;

        this.coverDialogVisible = true;
        this.coverSearchLoading = true;
        this.coverResults = [];

        this.igdbService.searchCovers(name, username).subscribe({
            next: (covers) => {
                this.coverResults = covers;
                this.coverSearchLoading = false;
            },
            error: () => {
                this.coverSearchLoading = false;
                this.toast.error('IGDB Error', 'Failed to fetch cover images.');
            }
        });
    }

    selectCover(cover: IgdbCover): void {
        if (!this.formEditable) {
            this.toggleEdit();
        }
        const coverUrl = 'https:' + cover.url.replace('t_thumb', 't_cover_big');
        this.selectedCoverUrl = coverUrl;
        this.form.get('cover')?.setValue(coverUrl);
        this.form.markAsDirty();
        this.coverDialogVisible = false;
        this.toast.success('Cover selected', `Cover for "${cover.game_name}" selected.`);
    }

    async copyCardToClipboard(): Promise<void> {
        if (this.isGeneratingCard) return; // Prevent multiple clicks

        this.isGeneratingCard = true;

        try {
            const rawRecord: GameRecord = {
                ...this.form.value,
                mainQuestDone: this.form.value.mainQuestDone ? 1 : 0,
                fav: this.form.value.fav ? 1 : 0,
                replay: this.form.value.replay ? 1 : 0
            };

            await this.clipboardService.generateAndCopyCardToClipboard(rawRecord, this.totalScore);
            this.toast.success('Copied!', 'Game card copied to clipboard as PNG');
        } catch (error) {
            console.error('Failed to copy card:', error);
            if (error instanceof Error && error.message.includes('downloaded')) {
                this.toast.success('Downloaded', 'Clipboard not supported. Image downloaded instead.');
            } else {
                this.toast.error('Copy failed', 'Unable to copy card to clipboard');
            }
        } finally {
            this.isGeneratingCard = false;
        }
    }

    ngOnDestroy(): void {
        this.toolbarService.setTemplate(null);
    }
}
