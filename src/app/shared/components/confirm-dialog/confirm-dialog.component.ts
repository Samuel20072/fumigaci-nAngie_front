import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-backdrop animate-fade-in" (click)="onCancel()">
      <div class="modal-sheet" (click)="$event.stopPropagation()">
        <div class="drag-handle"></div>

        <div class="modal-header">
          <div class="modal-icon" [ngClass]="isDanger ? 'icon-danger' : 'icon-info'">
            <svg *ngIf="isDanger" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <svg *ngIf="!isDanger" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <h3 class="modal-title">{{ title }}</h3>
        </div>

        <p class="modal-message">{{ message }}</p>

        <div class="modal-actions">
          <button type="button" class="btn-secondary flex-1" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="flex-1"
            [ngClass]="isDanger ? 'btn-danger' : 'btn-primary'"
            (click)="onConfirm()"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .modal-sheet {
      background: var(--surface);
      width: 100%;
      max-width: 500px;
      border-top-left-radius: var(--radius-xl);
      border-top-right-radius: var(--radius-xl);
      padding: 16px 20px 24px;
      box-shadow: var(--shadow-float);
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .drag-handle {
      width: 36px;
      height: 4px;
      border-radius: 2px;
      background: var(--border);
      margin: 0 auto 16px;
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .modal-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-danger {
      background: var(--status-expired-bg);
      color: var(--status-expired-text);
    }

    .icon-info {
      background: var(--primary-50);
      color: var(--primary-600);
    }

    .modal-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--text-main);
    }

    .modal-message {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
    }

    .flex-1 {
      flex: 1;
    }

    .btn-danger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #dc2626;
      color: #ffffff;
      font-weight: 600;
      padding: 12px 18px;
      border-radius: var(--radius-md);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      transition: all 0.2s ease;
    }

    .btn-danger:active {
      transform: scale(0.97);
      opacity: 0.9;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = '¿Estás seguro?';
  @Input() message = 'Esta acción no se puede deshacer.';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() isDanger = true;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
