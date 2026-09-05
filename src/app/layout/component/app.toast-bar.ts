import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../service/toast.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription, timer } from 'rxjs';

@Component({
    selector: 'app-toast-bar',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div *ngIf="currentToast" class="layout-toast-bar" [ngClass]="currentToast.severity" @slideUp>
            <div class="layout-toast-bar-content">
                <div class="toast-info">
                    <i aria-hidden="true"
                        class="bi"
                        [ngClass]="{
                            'bi-check-circle': currentToast.severity === 'success',
                            'bi-exclamation-triangle': currentToast.severity === 'error' || currentToast.severity === 'warn',
                            'bi-info-circle': currentToast.severity === 'info'
                        }"
                    ></i>
                    <div class="toast-text">
                        <span class="toast-summary">{{ currentToast.summary }}</span>
                        <span class="toast-detail" *ngIf="currentToast.detail">: {{ currentToast.detail }}</span>
                    </div>
                </div>
                <button class="toast-close" (click)="close()">
                    <i aria-hidden="true" class="bi bi-x-lg"></i>
                </button>
            </div>
            <div class="toast-progress-bar">
                <div class="toast-progress-value" [style.animation-duration]="'10000ms'"></div>
            </div>
        </div>
    `,
    styles: [
        `
            .layout-toast-bar {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                z-index: 1010;
                background-color: var(--surface-card);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                height: 3rem;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                color: #ffffff;

                &.success {
                    background: linear-gradient(90deg, #065f46, #059669);
                    .bi {
                        color: #ffffff;
                    }
                    .toast-progress-value {
                        background-color: rgba(255, 255, 255, 0.7);
                    }
                }
                &.error {
                    background: linear-gradient(90deg, #dc2626, #ef4444);
                    .bi {
                        color: #ffffff;
                    }
                    .toast-progress-value {
                        background-color: rgba(255, 255, 255, 0.7);
                    }
                }
                &.warn {
                    background: linear-gradient(90deg, #d97706, #f59e0b);
                    .bi {
                        color: #ffffff;
                    }
                    .toast-progress-value {
                        background-color: rgba(255, 255, 255, 0.7);
                    }
                }
                &.info {
                    background: linear-gradient(90deg, #2563eb, #3b82f6);
                    .bi {
                        color: #ffffff;
                    }
                    .toast-progress-value {
                        background-color: rgba(255, 255, 255, 0.7);
                    }
                }
            }

            .layout-toast-bar-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 1.5rem;
                flex: 1;
            }

            .toast-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .toast-text {
                display: flex;
                align-items: baseline;
                gap: 0.5rem;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            .toast-summary {
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.075em;
                font-size: 0.875rem;
            }

            .toast-detail {
                font-size: 0.875rem;
                font-weight: 500;
                opacity: 0.95;
            }

            .toast-close {
                background: none;
                border: none;
                color: #ffffff;
                cursor: pointer;
                padding: 0.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                border-radius: 50%;
                opacity: 0.8;

                &:hover {
                    opacity: 1;
                    background-color: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }
            }

            .toast-progress-bar {
                height: 3px;
                width: 100%;
                background-color: rgba(0, 0, 0, 0.1);
            }

            .toast-progress-value {
                height: 100%;
                width: 0;
                animation: progress-shrink linear forwards;
            }

            @keyframes progress-shrink {
                from {
                    width: 100%;
                }
                to {
                    width: 0%;
                }
            }

            @media (max-width: 640px) {
                .layout-toast-bar-content {
                    padding: 0 1rem;
                }
                .toast-text {
                    flex-direction: column;
                    gap: 0;
                }
                .toast-summary {
                    font-size: 0.75rem;
                }
                .toast-detail {
                    font-size: 0.75rem;
                }
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    animations: [
        trigger('slideUp', [
            transition(':enter', [style({ transform: 'translateY(100%)', opacity: 0, 'box-shadow': 'none' }), animate('600ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ transform: 'translateY(0)', opacity: 1 }))]),
            transition(':leave', [animate('400ms cubic-bezier(0.25, 1, 0.5, 1)', style({ transform: 'translateY(100%)', opacity: 0 }))])
        ])
    ]
})
export class AppToastBar implements OnInit, OnDestroy {
    private toastService = inject(ToastService);
    currentToast: ToastMessage | null = null;
    private subscription: Subscription | null = null;
    private timerSubscription: Subscription | null = null;

    ngOnInit() {
        this.subscription = this.toastService.toast$.subscribe((toast) => {
            if (toast) {
                this.currentToast = toast;
                this.startTimer();
            } else {
                this.currentToast = null;
                this.clearTimer();
            }
        });
    }

    startTimer() {
        this.clearTimer();
        this.timerSubscription = timer(10000).subscribe(() => {
            this.close();
        });
    }

    clearTimer() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
            this.timerSubscription = null;
        }
    }

    close() {
        this.toastService.clear();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.clearTimer();
    }
}
