import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-wrap" [style.minHeight]="height">
      <div class="spinner"></div>
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 24px;
    }

    .spinner {
      width: 38px;
      height: 38px;
      border: 3.5px solid var(--primary-100);
      border-top-color: var(--primary-600);
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .spinner-message {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-muted);
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message?: string;
  @Input() height: string = '200px';
}
