import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CustomersService } from '../../customers.service.js';
import { ContactService } from '../../../../core/services/contact.service.js';
import { NotificationService } from '../../../../core/services/notification.service.js';
import { Customer } from '../../../../core/models/customer.model.js';
import { Service } from '../../../../core/models/service.model.js';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component.js';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component.js';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component.js';
import { formatFriendlyDate } from '../../../../shared/utils/date.utils.js';

import { Params } from '@angular/router';

@Component({
  selector: 'app-customer-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="page-container animate-fade-in" *ngIf="customer(); else loadingTpl">
      <!-- Top Navigation Header -->
      <div class="top-nav-bar">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Clientes</span>
        </button>
        <div class="header-actions">
          <a [routerLink]="['/customers', customer()!.id, 'edit']" class="btn-icon" title="Editar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </a>
          <button class="btn-icon btn-icon-danger" (click)="isConfirmOpen.set(true)" title="Desactivar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Customer Profile Card -->
      <div class="customer-profile-card">
        <div class="avatar-header">
          <div class="avatar-circle">
            {{ customer()!.fullName.charAt(0).toUpperCase() }}
          </div>
          <div class="profile-title-wrap">
            <h1 class="customer-name">{{ customer()!.fullName }}</h1>
            <span class="status-badge" [class.inactive]="!customer()!.isActive">
              {{ customer()!.isActive ? 'Cliente Activo' : 'Cliente Inactivo' }}
            </span>
          </div>
        </div>

        <!-- Big 1-Tap Contact Action Buttons -->
        <div class="contact-actions-grid">
          <button
            class="btn-whatsapp contact-big-btn"
            (click)="contactService.openWhatsApp(customer()!.phone, customer()!.fullName)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.01-.069-.607-.197-1.423-.578-2.222-1.378-.996-.996-1.579-2.18-1.748-2.581-.17-.4-.019-.624.1-.795.108-.154.24-.374.36-.503.12-.13.16-.22.24-.37.08-.15.04-.28-.02-.4-.06-.12-.54-1.3-.74-1.78-.194-.467-.393-.404-.54-.412l-.46-.008c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.09.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
            </svg>
            <span>Enviar WhatsApp</span>
          </button>

          <button
            class="btn-call contact-big-btn"
            (click)="contactService.callPhone(customer()!.phone)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>Llamar por Teléfono</span>
          </button>
        </div>

        <!-- Details Info List -->
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">Teléfono</span>
            <span class="info-val font-bold">{{ customer()!.phone }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Dirección</span>
            <span class="info-val">{{ customer()!.address }}</span>
          </div>

          <div class="info-item" *ngIf="customer()!.neighborhood">
            <span class="info-label">Barrio / Sector</span>
            <span class="info-val">{{ customer()!.neighborhood }}</span>
          </div>

          <div class="info-item" *ngIf="customer()!.city">
            <span class="info-label">Ciudad</span>
            <span class="info-val">{{ customer()!.city }}</span>
          </div>

          <div class="info-item" *ngIf="customer()!.notes">
            <span class="info-label">Notas / Observaciones</span>
            <span class="info-val notes-text">{{ customer()!.notes }}</span>
          </div>
        </div>
      </div>

      <!-- Service History Section -->
      <section class="services-section">
        <div class="section-top">
          <div>
            <h2 class="section-title">Historial de Servicios</h2>
            <p class="section-subtitle">{{ services().length }} servicios registrados</p>
          </div>
          <a [routerLink]="['/services/new']" [queryParams]="{ customerId: customer()!.id }" class="btn-primary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Nuevo Servicio</span>
          </a>
        </div>

        <div class="services-timeline" *ngIf="services().length > 0; else noServices">
          <div *ngFor="let s of services()" class="service-history-card" [routerLink]="['/services', s.id]">
            <div class="service-card-header">
              <div class="service-type-badge" [ngClass]="s.type === 'FUMIGACION' ? 'type-fum' : 'type-rep'">
                {{ s.type }}
              </div>
              <app-status-badge [status]="s.expirationStatus" [daysRemaining]="s.daysRemaining"></app-status-badge>
            </div>

            <div class="service-details-row">
              <div class="detail-cell">
                <span class="detail-label">Fecha Servicio</span>
                <span class="detail-value">{{ formatDate(s.serviceDate) }}</span>
              </div>
              <div class="detail-cell" *ngIf="s.expirationDate">
                <span class="detail-label">Vencimiento</span>
                <span class="detail-value">{{ formatDate(s.expirationDate) }}</span>
              </div>
              <div class="detail-cell" *ngIf="s.price">
                <span class="detail-label">Precio</span>
                <span class="detail-value font-bold">{{ s.price | currency:'COP':'$':'1.0-0' }}</span>
              </div>
            </div>

            <div class="service-notes" *ngIf="s.notes">
              <p>{{ s.notes }}</p>
            </div>
          </div>
        </div>

        <ng-template #noServices>
          <div class="no-services-box">
            <p>Este cliente aún no tiene servicios registrados.</p>
            <a [routerLink]="['/services/new']" [queryParams]="{ customerId: customer()!.id }" class="btn-secondary btn-sm">
              Registrar primer servicio
            </a>
          </div>
        </ng-template>
      </section>

      <!-- Confirmation Modal -->
      <app-confirm-dialog
        [isOpen]="isConfirmOpen()"
        title="¿Desactivar cliente?"
        [message]="'¿Seguro que deseas desactivar a ' + customer()!.fullName + '? Sus servicios continuarán guardados en el historial.'"
        confirmText="Desactivar"
        [isDanger]="true"
        (confirmed)="deactivateCustomer()"
        (cancelled)="isConfirmOpen.set(false)"
      ></app-confirm-dialog>
    </div>

    <ng-template #loadingTpl>
      <app-loading-spinner message="Cargando información del cliente..."></app-loading-spinner>
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

    .customer-profile-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 18px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .avatar-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .avatar-circle {
      width: 54px;
      height: 54px;
      border-radius: var(--radius-full);
      background: var(--brand-gradient);
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(29, 78, 216, 0.25);
    }

    .profile-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .customer-name {
      font-size: 19px;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
    }

    .status-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background: #ecfdf5;
      color: #047857;
      align-self: flex-start;
    }

    .status-badge.inactive {
      background: #f1f5f9;
      color: #64748b;
    }

    .contact-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .contact-big-btn {
      padding: 12px 14px;
      font-size: 14px;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      border-top: 1px solid var(--border);
      padding-top: 14px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .info-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-val {
      font-size: 14px;
      color: var(--text-main);
    }

    .font-bold {
      font-weight: 700;
    }

    .notes-text {
      background: var(--surface-subtle);
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      font-size: 13px;
    }

    /* Services Section */
    .services-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--text-main);
    }

    .section-subtitle {
      font-size: 12px;
      color: var(--text-muted);
    }

    .btn-sm {
      padding: 8px 14px;
      font-size: 13px;
      border-radius: var(--radius-md);
    }

    .services-timeline {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .service-history-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 14px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .service-history-card:active {
      transform: scale(0.99);
      background: var(--surface-hover);
    }

    .service-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .service-type-badge {
      font-size: 12px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }

    .type-fum {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .type-rep {
      background: #fdf2f8;
      color: #db2777;
    }

    .service-details-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      background: var(--surface-subtle);
      padding: 8px 12px;
      border-radius: var(--radius-md);
    }

    .detail-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .detail-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-dim);
      text-transform: uppercase;
    }

    .detail-value {
      font-size: 12px;
      color: var(--text-main);
    }

    .service-notes {
      font-size: 12px;
      color: var(--text-muted);
      font-style: italic;
    }

    .no-services-box {
      background: var(--surface);
      border: 1px dashed var(--border);
      border-radius: var(--radius-lg);
      padding: 24px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      color: var(--text-muted);
      font-size: 14px;
    }
  `]
})
export class CustomerDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customersService = inject(CustomersService);
  contactService = inject(ContactService);
  private notificationService = inject(NotificationService);

  customer = signal<Customer | null>(null);
  services = signal<Service[]>([]);
  isConfirmOpen = signal<boolean>(false);

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const id = params['id'];
      if (id) {
        this.loadCustomer(id);
      }
    });
  }

  loadCustomer(id: string) {
    this.customersService.getById(id).subscribe({
      next: (c: Customer) => {
        this.customer.set(c);
        this.loadServices(id);
      },
      error: () => {
        this.notificationService.error('No se pudo encontrar el cliente');
        this.router.navigate(['/customers']);
      },
    });
  }

  loadServices(customerId: string) {
    this.customersService.getCustomerServices(customerId).subscribe({
      next: (res: Service[]) => this.services.set(res),
    });
  }

  deactivateCustomer() {
    const c = this.customer();
    if (!c) return;

    this.customersService.deactivate(c.id).subscribe({
      next: () => {
        this.notificationService.success('Cliente desactivado con éxito');
        this.isConfirmOpen.set(false);
        this.loadCustomer(c.id);
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
    this.router.navigate(['/customers']);
  }
}
