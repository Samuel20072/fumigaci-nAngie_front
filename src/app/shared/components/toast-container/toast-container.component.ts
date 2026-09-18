import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service.js';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrapper">
      <div
        *ngFor="let toast of notificationService.toasts()"
        class="toast-item animate-fade-in"
        [ngClass]="'toast-' + toast.type"
        (click)="notificationService.remove(toast.id)"
      >
        <div class="toast-content">
          <strong *ngIf="toast.title" class="toast-title">{{ toast.title }}</strong>
          <span class="toast-desc">{{ toast.message }}</span>
        </div>
        <button class="toast-close" (click)="notificationService.remove(toast.id); $event.stopPropagation()">
          &times;
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-wrapper {
      position: fixed;
      top: 16px;
      left: 16px;
      right: 16px;
      max-width: 500px;
      margin: 0 auto;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      border: 1px solid transparent;
      backdrop-filter: blur(8px);
      transition: all 0.2s ease;
    }

    .toast-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .toast-title {
      font-size: 13px;
      font-weight: 700;
    }

    .toast-desc {
      font-size: 13px;
      line-height: 1.3;
    }

    .toast-close {
      font-size: 20px;
      line-height: 1;
      padding: 4px;
      color: inherit;
      opacity: 0.7;
    }

    .toast-success {
      background: #ecfdf5;
      color: #065f46;
      border-color: #a7f3d0;
    }

    .toast-error {
      background: #fef2f2;
      color: #991b1b;
      border-color: #fecaca;
    }

    .toast-warning {
      background: #fffbeb;
      color: #92400e;
      border-color: #fde68a;
    }

    .toast-info {
      background: #eff6ff;
      color: #1e40af;
      border-color: #bfdbfe;
    }
  `]
})
export class ToastContainerComponent {
  notificationService = inject(NotificationService);
}
