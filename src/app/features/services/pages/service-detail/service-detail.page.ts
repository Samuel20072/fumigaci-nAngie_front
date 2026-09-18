import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from '../../services.service.js';
import { ContactService } from '../../../../core/services/contact.service.js';
import { NotificationService } from '../../../../core/services/notification.service.js';
import { Service, ServiceType } from '../../../../core/models/service.model.js';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component.js';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component.js';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component.js';
import { formatFriendlyDate } from '../../../../shared/utils/date.utils.js';

import { Params } from '@angular/router';

@Component({
  selector: 'app-service-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="page-container animate-fade-in" *ngIf="service(); else loadingTpl">
      <!-- Top Navigation Header -->
      <div class="top-nav-bar">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Servicios</span>
        </button>
        <div class="header-actions">
          <a [routerLink]="['/services', service()!.id, 'edit']" class="btn-icon" title="Editar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </a>
          <button class="btn-icon btn-icon-danger" (click)="isConfirmOpen.set(true)" title="Cancelar Servicio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Service Info Card -->
      <div class="service-main-card">
        <div class="card-hero-row">
          <div class="service-type-badge" [ngClass]="service()!.type === 'FUMIGACION' ? 'badge-fum' : 'badge-rep'">
            {{ service()!.type }}
          </div>
          <app-status-badge [status]="service()!.expirationStatus" [daysRemaining]="service()!.daysRemaining"></app-status-badge>
        </div>

        <div class="dates-hero-box">
          <div class="date-hero-cell">
            <span class="hero-lbl">Fecha de Realización</span>
            <span class="hero-val">{{ formatDate(service()!.serviceDate) }}</span>
          </div>
          <div class="date-hero-cell" *ngIf="service()!.expirationDate">
            <span class="hero-lbl">Fecha de Vencimiento</span>
            <span class="hero-val font-bold text-primary">{{ formatDate(service()!.expirationDate) }}</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="details-grid">
          <div class="detail-item" *ngIf="service()!.price">
            <span class="detail-label">Valor del Servicio</span>
            <span class="detail-val font-bold">{{ service()!.price | currency:'COP':'$':'1.0-0' }}</span>
          </div>

          <div class="detail-item" *ngIf="service()!.paymentMethod">
            <span class="detail-label">Método de Pago</span>
            <span class="detail-val">{{ service()!.paymentMethod }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">Estado</span>
            <span class="detail-val">{{ service()!.status }}</span>
          </div>
        </div>

        <!-- Notes -->
        <div class="notes-box" *ngIf="service()!.notes">
          <span class="detail-label">Notas / Observaciones</span>
          <p class="notes-text">{{ service()!.notes }}</p>
        </div>

        <!-- Parent Service (for Repaso) -->
        <div class="parent-service-box" *ngIf="service()!.parentServiceId">
          <span class="detail-label">Fumigación Original Asociada</span>
          <a [routerLink]="['/services', service()!.parentServiceId]" class="parent-link">
            <span>Ver servicio de fumigación padre</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </a>
        </div>
      </div>

      <!-- Customer Summary Card with 1-Tap Actions -->
      <div class="customer-card-box" *ngIf="service()!.customer">
        <div class="customer-card-header">
          <div>
            <span class="detail-label">Cliente</span>
            <h3 class="customer-title" [routerLink]="['/customers', service()!.customerId]">
              {{ service()!.customer!.fullName }}
            </h3>
          </div>
          <a [routerLink]="['/customers', service()!.customerId]" class="link-view">
            Ver Ficha
          </a>
        </div>

        <div class="customer-address">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{{ service()!.customer!.address }}</span>
        </div>

        <!-- 1-Tap Contact Action Buttons -->
        <div class="contact-actions-grid">
          <button
            class="btn-whatsapp flex-1"
            (click)="contactService.openWhatsApp(service()!.customer!.phone, service()!.customer!.fullName, formatDate(service()!.serviceDate))"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.01-.069-.607-.197-1.423-.578-2.222-1.378-.996-.996-1.579-2.18-1.748-2.581-.17-.4-.019-.624.1-.795.108-.154.24-.374.36-.503.12-.13.16-.22.24-.37.08-.15.04-.28-.02-.4-.06-.12-.54-1.3-.74-1.78-.194-.467-.393-.404-.54-.412l-.46-.008c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.09.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
            </svg>
            <span>WhatsApp</span>
          </button>

          <button
            class="btn-call flex-1"
            (click)="contactService.callPhone(service()!.customer!.phone)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>Llamar</span>
          </button>
        </div>
      </div>

      <!-- Quick Action: If Fumigación, allow creating a Repaso for this service -->
      <div class="repaso-action-box" *ngIf="service()!.type === 'FUMIGACION'">
        <div class="repaso-text-wrap">
          <strong>¿Requiere repaso?</strong>
          <p>Registra una visita de repaso vinculada a esta fumigación.</p>
        </div>
        <a
          [routerLink]="['/services/new']"
          [queryParams]="{ customerId: service()!.customerId, parentServiceId: service()!.id, type: 'REPASO' }"
          class="btn-secondary btn-sm"
        >
          ➕ Agendar Repaso
        </a>
      </div>

      <!-- Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="isConfirmOpen()"
        title="¿Cancelar servicio?"
        message="El estado del servicio pasará a Cancelado."
        confirmText="Cancelar Servicio"
        [isDanger]="true"
        (confirmed)="cancelService()"
        (cancelled)="isConfirmOpen.set(false)"
      ></app-confirm-dialog>
    </div>

    <ng-template #loadingTpl>
      <app-loading-spinner message="Cargando detalle del servicio..."></app-loading-spinner>
    </ng-template>
  `,
  styles: [`
    .page-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .top-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 15px;
      font-weight: 700;
      color: var(--primary-600);
      padding: 6px 0;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon-danger {
      color: var(--status-expired-text);
      background: var(--status-expired-bg);
    }

    .service-main-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 18px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-hero-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .service-type-badge {
      font-size: 13px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      letter-spacing: 0.5px;
    }

    .badge-fum {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .badge-rep {
      background: #fdf2f8;
      color: #db2777;
    }

    .dates-hero-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: var(--surface-subtle);
      padding: 12px 14px;
      border-radius: var(--radius-lg);
    }

    .date-hero-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .hero-lbl {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-dim);
      text-transform: uppercase;
    }

    .hero-val {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
    }

    .text-primary {
      color: var(--primary-700);
    }

    .font-bold {
      font-weight: 800;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .detail-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-val {
      font-size: 14px;
      color: var(--text-main);
    }

    .notes-box {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .notes-text {
      background: var(--surface-subtle);
      padding: 10px 12px;
      border-radius: var(--radius-md);
      font-size: 13px;
      color: var(--text-main);
      line-height: 1.4;
    }

    .parent-service-box {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border-top: 1px solid var(--border);
      padding-top: 12px;
    }

    .parent-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--primary-600);
    }

    /* Customer Card Box */
    .customer-card-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 16px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .customer-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .customer-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-main);
      cursor: pointer;
    }

    .link-view {
      font-size: 13px;
      font-weight: 700;
      color: var(--primary-600);
    }

    .customer-address {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-muted);
    }

    .contact-actions-grid {
      display: flex;
      gap: 10px;
    }

    .flex-1 {
      flex: 1;
    }

    /* Repaso Suggestion Box */
    .repaso-action-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--radius-lg);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .repaso-text-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 13px;
      color: #1e40af;
    }

    .repaso-text-wrap p {
      font-size: 12px;
      opacity: 0.85;
    }

    .btn-sm {
      padding: 8px 12px;
      font-size: 12px;
      white-space: nowrap;
    }
  `]
})
export class ServiceDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private servicesService = inject(ServicesService);
  contactService = inject(ContactService);
  private notificationService = inject(NotificationService);

  service = signal<Service | null>(null);
  isConfirmOpen = signal<boolean>(false);

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const id = params['id'];
      if (id) {
        this.loadService(id);
      }
    });
  }

  loadService(id: string) {
    this.servicesService.getById(id).subscribe({
      next: (s: Service) => this.service.set(s),
      error: () => {
        this.notificationService.error('No se pudo encontrar el servicio');
        this.router.navigate(['/services']);
      },
    });
  }

  cancelService() {
    const s = this.service();
    if (!s) return;

    this.servicesService.cancel(s.id).subscribe({
      next: () => {
        this.notificationService.success('Servicio cancelado');
        this.isConfirmOpen.set(false);
        this.loadService(s.id);
      },
      error: () => {
        this.isConfirmOpen.set(false);
      },
    });
  }

  formatDate(d?: string | null): string {
    return formatFriendlyDate(d);
  }

  goBack() {
    this.router.navigate(['/services']);
  }
}
