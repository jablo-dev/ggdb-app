import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { DataService } from '../data.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
    selector: 'app-join',
    standalone: true,
    imports: [InputTextModule, PasswordModule, ButtonModule, RippleModule, FormsModule, AppFloatingConfigurator, Toast],
    template: `
        <p-toast position="top-right" [style]="{ top: '50px' }" [breakpoints]="{ '600px': { top: '70px' } }" styleClass="z-[1100] right-6" />
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div>
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-200" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <svg id="Ebene_2" class="w-[45%] mx-auto" data-name="Ebene 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260.69 260.69">
                                <defs>
                                    <style>
                                        .cls-1 {
                                            fill: var(--primary-color);
                                            stroke-width: 0px;
                                        }
                                    </style>
                                </defs>
                                <g id="Ebene_1-2" data-name="Ebene 1">
                                    <g>
                                        <path
                                            class="cls-1"
                                            d="M79.71,257.28l-33.97-19.62c-12.16-7.02-16.34-22.62-9.32-34.78l31.6-54.73c.42-.72.17-1.65-.55-2.06l-54.73-31.6C.57,107.47-3.61,91.86,3.41,79.71l19.62-33.97c7.02-12.16,22.62-16.34,34.78-9.32l54.73,31.6c.72.42,1.65.17,2.06-.55l31.6-54.73c7.02-12.16,22.62-16.34,34.78-9.32l33.97,19.62c12.16,7.02,16.34,22.62,9.32,34.78l-31.6,54.73c-.42.72-.17,1.65.55,2.06l54.73,31.6c12.16,7.02,16.34,22.62,9.32,34.78l-19.62,33.97c-7.02,12.16-22.62,16.34-34.78,9.32l-54.73-31.6c-.72-.42-1.65-.17-2.06.55l-31.6,54.73c-7.02,12.16-22.62,16.34-34.78,9.32ZM52.8,45.07c-7.38-4.26-16.86-1.72-21.12,5.66l-19.62,33.97c-4.26,7.38-1.72,16.86,5.66,21.12l54.73,31.6c5.5,3.17,7.39,10.23,4.21,15.72l-31.6,54.73c-4.26,7.38-1.72,16.86,5.66,21.12l33.97,19.62c7.38,4.26,16.86,1.72,21.12-5.66l31.6-54.73c3.17-5.5,10.23-7.39,15.72-4.21l54.73,31.6c7.38,4.26,16.86,1.72,21.12-5.66l19.62-33.97c4.26-7.38,1.72-16.86-5.66-21.12l-54.73-31.6c-5.5-3.17-7.39-10.23-4.21-15.72l31.6-54.73c4.26-7.38,1.72-16.86-5.66-21.12l-33.97-19.62c-7.38-4.26-16.86-1.72-21.12,5.66l-31.6,54.73c-3.17,5.5-10.23,7.39-15.72,4.21l-54.73-31.6Z"
                                        />
                                        <path
                                            class="cls-1"
                                            d="M110.91,164.01c-18.56-10.72-24.95-34.54-14.23-53.1s34.54-24.95,53.1-14.23,24.95,34.54,14.23,53.1-34.54,24.95-53.1,14.23ZM144.78,105.34c-13.79-7.96-31.48-3.22-39.44,10.57s-3.22,31.48,10.57,39.44,31.48,3.22,39.44-10.57,3.22-31.48-10.57-39.44Z"
                                        />
                                        <path
                                            class="cls-1"
                                            d="M171.29,81.3l-18.95-10.94c-4.52-2.61-7.22-7.29-7.22-12.51,0-5.22,2.7-9.9,7.22-12.51l18.95-10.94c4.52-2.61,9.92-2.61,14.44,0,4.52,2.61,7.22,7.29,7.22,12.51v21.88c0,5.22-2.7,9.9-7.22,12.51-4.52,2.61-9.92,2.61-14.44,0ZM180.74,43.06c-.67-.39-2.44-1.16-4.44,0l-18.95,10.94c-2.01,1.16-2.22,3.08-2.22,3.85,0,.77.22,2.69,2.22,3.85l18.95,10.94c2.01,1.16,3.78.39,4.44,0,.67-.39,2.22-1.53,2.22-3.85v-21.88c0-2.32-1.55-3.46-2.22-3.85Z"
                                        />
                                        <path
                                            class="cls-1"
                                            d="M74.86,226.44h0c-4.52-2.61-7.22-7.29-7.22-12.51v-21.88c0-5.22,2.7-9.9,7.22-12.51,4.52-2.61,9.92-2.61,14.44,0l18.95,10.94c4.52,2.61,7.22,7.29,7.22,12.51,0,5.22-2.7,9.9-7.22,12.51l-18.95,10.94c-4.52,2.61-9.92,2.61-14.44,0ZM84.31,188.21c-2.01-1.16-3.78-.39-4.44,0-.67.39-2.22,1.53-2.22,3.85v21.88c0,2.32,1.55,3.46,2.22,3.85h0c.67.39,2.44,1.16,4.44,0l18.95-10.94c2.01-1.16,2.22-3.08,2.22-3.85,0-.77-.22-2.69-2.22-3.85l-18.95-10.94Z"
                                        />
                                        <path
                                            class="cls-1"
                                            d="M50.61,113.65c-2.15-1.24-3.97-3.05-5.28-5.31l-10.94-18.95c-2.61-4.52-2.61-9.92,0-14.44,2.61-4.52,7.29-7.22,12.51-7.22h21.88c5.22,0,9.9,2.7,12.51,7.22,2.61,4.52,2.61,9.92,0,14.44l-10.94,18.95c-2.61,4.52-7.29,7.22-12.51,7.22-2.61,0-5.09-.68-7.23-1.92ZM43.06,84.39l10.94,18.95c1.16,2.01,3.08,2.22,3.85,2.22.77,0,2.69-.22,3.85-2.22l10.94-18.95c1.16-2.01.39-3.78,0-4.44s-1.53-2.22-3.85-2.22h-21.88c-2.32,0-3.46,1.55-3.85,2.22-.39.67-1.16,2.44,0,4.44h0Z"
                                        />
                                        <path
                                            class="cls-1"
                                            d="M184.43,190.91c-2.15-1.24-3.97-3.05-5.28-5.31-2.61-4.52-2.61-9.92,0-14.44l10.94-18.95c2.61-4.52,7.29-7.22,12.51-7.22,5.22,0,9.9,2.7,12.51,7.22l10.94,18.95c2.61,4.52,2.61,9.92,0,14.44-2.61,4.52-7.29,7.22-12.51,7.22h-21.88c-2.61,0-5.09-.68-7.23-1.92ZM204.86,155.58c-.89-.51-1.78-.59-2.25-.59-.77,0-2.69.22-3.85,2.22l-10.94,18.95c-1.16,2.01-.39,3.78,0,4.44.39.67,1.53,2.22,3.85,2.22h21.88c2.32,0,3.46-1.55,3.85-2.22.39-.67,1.16-2.44,0-4.44l-10.94-18.95c-.45-.79-1.03-1.3-1.6-1.63Z"
                                        />
                                    </g>
                                </g>
                            </svg>
                            <br />
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
                                <span class="font-bold size-4">GoodGamesDB</span>
                            </div>
                            <span class="text-muted-color font-medium">Create your account</span>
                        </div>

                        <div>
                            <div>
                                <div class="flex flex-col items-center justify-center">
                                    <input pInputText type="text" placeholder="Username" class="w-full md:w-[30rem] mb-4" [(ngModel)]="username" />
                                    <input pInputText type="email" placeholder="Email" class="w-full md:w-[30rem] mb-4" [(ngModel)]="email" />
                                    <input pInputText type="text" placeholder="Access Token" class="w-full md:w-[30rem] mb-4" [(ngModel)]="token" />
                                    <p-password id="password" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" [feedback]="false" [fluid]="true" styleClass="w-full md:w-[30rem] mb-8"> </p-password>
                                    <p-button label="Join now!" styleClass="w-full md:w-[30rem]" (onClick)="register()" [disabled]="isSubmitting"></p-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class JoinComponent {
    username = '';
    password = '';
    token = '';
    email = '';
    isSubmitting = false;

    constructor(
        private dataService: DataService,
        private router: Router,
        private toast: MessageService
    ) {}

    register(): void {
        if (this.isSubmitting) return;

        const trimmedUsername = this.username.trim().toLowerCase();
        const trimmedEmail = this.email.trim();
        const trimmedPassword = this.password;

        if (!trimmedUsername) {
            this.toast.add({
                severity: 'warn',
                summary: 'Invalid username',
                detail: 'Please enter a username.',
                life: 3000
            });
            return;
        }

        if (!trimmedEmail || !this.validateEmail(trimmedEmail)) {
            this.toast.add({
                severity: 'warn',
                summary: 'Invalid email',
                detail: 'Please enter a valid email address.',
                life: 3000
            });
            return;
        }

        if (!trimmedPassword || trimmedPassword.length < 8) {
            this.toast.add({
                severity: 'warn',
                summary: 'Weak password',
                detail: 'Password must be at least 8 characters long.',
                life: 3000
            });
            return;
        }

        if (!this.token) {
            this.toast.add({
                severity: 'warn',
                summary: 'Invalid token',
                detail: 'Please enter a valid token.',
                life: 3000
            });
            return;
        }

        const user = {
            username: trimmedUsername,
            pwd: trimmedPassword,
            token: this.token,
            email: trimmedEmail
        };

        this.isSubmitting = true;

        this.dataService.register(user).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toast.add({
                        severity: 'success',
                        summary: 'Registration successful',
                        detail: res.message || 'You can now log in.',
                        life: 3000
                    });
                    setTimeout(() => this.router.navigate(['/auth/login']), 3000);
                } else {
                    this.isSubmitting = false;
                }
            },
            error: () => {
                this.isSubmitting = false;
                this.toast.add({
                    severity: 'error',
                    summary: 'Registration failed',
                    detail: 'A network error occurred. Please try again.',
                    life: 3000
                });
            }
        });
    }

    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
