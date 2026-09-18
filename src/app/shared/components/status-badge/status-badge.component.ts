import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpirationStatus } from '../../../core/models/service.model.js';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">
      <span class="badge-dot"></span>
      <span class="badge-text">{{ labelText }}</span>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.2px;
      border: 1px solid transparent;
      white-space: nowrap;
    }

    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    /* Active */
    .badge-active {
      background: var(--status-active-bg);
      color: var(--status-active-text);
      border-color: var(--status-active-border);
    }
    .badge-active .badge-dot {
      background: var(--status-active-dot);
    }

    /* Expiring Soon */
    .badge-expiring {
      background: var(--status-expiring-bg);
      color: var(--status-expiring-text);
      border-color: var(--status-expiring-border);
    }
    .badge-expiring .badge-dot {
      background: var(--status-expiring-dot);
      animation: pulseGlow 1.8s infinite ease-in-out;
    }

    /* Expired */
    .badge-expired {
      background: var(--status-expired-bg);
      color: var(--status-expired-text);
      border-color: var(--status-expired-border);
    }
    .badge-expired .badge-dot {
      background: var(--status-expired-dot);
    }

    /* No date / Inactive */
    .badge-nodate {
      background: var(--status-nodate-bg);
      color: var(--status-nodate-text);
      border-color: var(--status-nodate-border);
    }
    .badge-nodate .badge-dot {
      background: var(--status-nodate-dot);
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status?: ExpirationStatus | string;
  @Input() daysRemaining?: number | null;
  @Input() customLabel?: string;

  get badgeClass(): string {
    switch (this.status) {
      case ExpirationStatus.ACTIVE:
      case 'ACTIVE':
        return 'badge-active';
      case ExpirationStatus.EXPIRING_SOON:
      case 'EXPIRING_SOON':
        return 'badge-expiring';
      case ExpirationStatus.EXPIRED:
      case 'EXPIRED':
        return 'badge-expired';
      default:
        return 'badge-nodate';
    }
  }

  get labelText(): string {
    if (this.customLabel) return this.customLabel;

    switch (this.status) {
      case ExpirationStatus.ACTIVE:
      case 'ACTIVE':
        return this.daysRemaining ? `Vigente (${this.daysRemaining}d)` : 'Vigente';
      case ExpirationStatus.EXPIRING_SOON:
      case 'EXPIRING_SOON':
        return this.daysRemaining !== null && this.daysRemaining !== undefined
          ? `Vence en ${this.daysRemaining}d`
          : 'Por Vencer';
      case ExpirationStatus.EXPIRED:
      case 'EXPIRED':
        return 'Vencido';
      case ExpirationStatus.NO_DATE:
      case 'NO_DATE':
      default:
        return 'Sin vigencia';
    }
  }
}
