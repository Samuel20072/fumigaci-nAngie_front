import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-container">
      <div class="empty-icon-wrap">
        <svg *ngIf="icon === 'customers'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>

        <svg *ngIf="icon === 'services'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>

        <svg *ngIf="icon === 'search'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>

      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-desc">{{ description }}</p>

      <button *ngIf="actionLabel" class="btn-primary empty-btn" (click)="actionClick.emit()">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
      margin: 20px 0;
    }

    .empty-icon-wrap {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-xl);
      background: var(--primary-50);
      color: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 8px;
    }

    .empty-desc {
      font-size: 14px;
      color: var(--text-muted);
      max-width: 280px;
      margin-bottom: 20px;
      line-height: 1.4;
    }

    .empty-btn {
      padding: 10px 22px;
      font-size: 14px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: 'customers' | 'services' | 'search' = 'customers';
  @Input() title: string = 'No se encontraron resultados';
  @Input() description: string = 'Prueba ajustando los filtros o agregando un nuevo registro.';
  @Input() actionLabel?: string;
  @Output() actionClick = new EventEmitter<void>();
}
