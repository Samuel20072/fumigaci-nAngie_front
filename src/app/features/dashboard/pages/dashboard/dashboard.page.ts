import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../dashboard.service.js';
import { ContactService } from '../../../../core/services/contact.service.js';
import { DashboardData } from '../../../../core/models/dashboard.model.js';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component.js';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component.js';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component.js';
import { formatFriendlyDate } from '../../../../shared/utils/date.utils.js';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="dashboard-page animate-fade-in">
      <!-- Header / Brand Hero -->
      <header class="hero-header">
        <div class="hero-content">
          <div class="hero-badge">FumiControl</div>
          <h1 class="hero-title">Gestión de Fumigación</h1>
          <p class="hero-subtitle">{{ todayFormatted }}</p>
        </div>
        <button class="btn-refresh" (click)="loadData()" title="Actualizar datos">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
          </svg>
        </button>
      </header>

      <!-- Loading State -->
      <app-loading-spinner *ngIf="isLoading()" message="Cargando panel de control..."></app-loading-spinner>

      <!-- Main Content -->
      <div *ngIf="!isLoading() && data()" class="dashboard-body">
        <!-- Quick Action Buttons -->
        <section class="quick-actions">
          <a routerLink="/customers/new" class="action-card action-primary">
            <div class="action-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="16" y1="11" x2="22" y2="11"></line>
              </svg>
            </div>
            <div class="action-text">
              <span class="action-title">Nuevo Cliente</span>
              <span class="action-desc">Registrar datos y teléfono</span>
            </div>
          </a>

          <a routerLink="/services/new" class="action-card action-secondary">
            <div class="action-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <div class="action-text">
              <span class="action-title">Nuevo Servicio</span>
              <span class="action-desc">Fumigación o Repaso</span>
            </div>
          </a>
        </section>

        <!-- KPI Summary Cards -->
        <section class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Clientes Activos</span>
              <div class="kpi-icon-wrap icon-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
            <div class="kpi-value">{{ data()?.summary?.activeCustomers || 0 }}</div>
            <span class="kpi-meta">de {{ data()?.summary?.totalCustomers || 0 }} totales</span>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Servicios Totales</span>
              <div class="kpi-icon-wrap icon-indigo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              </div>
            </div>
            <div class="kpi-value">{{ data()?.summary?.totalServices || 0 }}</div>
            <span class="kpi-meta">{{ data()?.summary?.fumigationCount || 0 }} fumig. / {{ data()?.summary?.repasoCount || 0 }} rep.</span>
          </div>

          <div class="kpi-card highlight-warning">
            <div class="kpi-header">
              <span class="kpi-label">Por Vencer</span>
              <div class="kpi-icon-wrap icon-amber">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            </div>
            <div class="kpi-value text-amber">{{ data()?.summary?.expiringCount || 0 }}</div>
            <span class="kpi-meta">Próximos 7 días</span>
          </div>

          <div class="kpi-card highlight-danger">
            <div class="kpi-header">
              <span class="kpi-label">Vencidos</span>
              <div class="kpi-icon-wrap icon-red">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
            </div>
            <div class="kpi-value text-red">{{ data()?.summary?.expiredCount || 0 }}</div>
            <span class="kpi-meta">Requieren contacto</span>
          </div>
        </section>

        <!-- Expiring Soon Alerts (Urgent Action for Mom) -->
        <section class="section-container" *ngIf="data()?.expiringServices && data()!.expiringServices.length > 0">
          <div class="section-header">
            <div>
              <h2 class="section-title">⚠️ Vigencias por Vencer</h2>
              <p class="section-subtitle">Contáctalos para agendar nuevo servicio</p>
            </div>
            <a routerLink="/services" class="section-link">Ver todos</a>
          </div>

          <div class="cards-list">
            <div *ngFor="let s of data()!.expiringServices" class="customer-action-card">
              <div class="card-main-info" [routerLink]="['/customers', s.customerId]">
                <div class="card-top-row">
                  <span class="customer-name">{{ s.customer?.fullName || 'Cliente' }}</span>
                  <app-status-badge [status]="s.expirationStatus" [daysRemaining]="s.daysRemaining"></app-status-badge>
                </div>
                <div class="customer-address">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{{ s.customer?.address || 'Dirección registrada' }}</span>
                </div>
                <div class="service-meta-date">
                  Servicio: {{ formatDate(s.serviceDate) }} • Vence: {{ formatDate(s.expirationDate) }}
                </div>
              </div>

              <!-- Action Bar for 1-Tap Contact -->
              <div class="card-actions-bar" *ngIf="s.customer?.phone">
                <button
                  class="btn-whatsapp flex-1"
                  (click)="contactService.openWhatsApp(s.customer!.phone, s.customer!.fullName, formatDate(s.serviceDate))"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.01-.069-.607-.197-1.423-.578-2.222-1.378-.996-.996-1.579-2.18-1.748-2.581-.17-.4-.019-.624.1-.795.108-.154.24-.374.36-.503.12-.13.16-.22.24-.37.08-.15.04-.28-.02-.4-.06-.12-.54-1.3-.74-1.78-.194-.467-.393-.404-.54-.412l-.46-.008c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.09.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>
                <button
                  class="btn-call"
                  (click)="contactService.callPhone(s.customer!.phone)"
                  title="Llamar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Services Section -->
        <section class="section-container">
          <div class="section-header">
            <div>
              <h2 class="section-title">Últimos Servicios</h2>
              <p class="section-subtitle">Historial de registros recientes</p>
            </div>
            <a routerLink="/services" class="section-link">Ver historial</a>
          </div>

          <div *ngIf="data()?.recentServices && data()!.recentServices.length > 0; else noRecent" class="cards-list">
            <div
              *ngFor="let s of data()!.recentServices"
              class="service-item-card"
              [routerLink]="['/services', s.id]"
            >
              <div class="service-type-icon" [ngClass]="s.type === 'FUMIGACION' ? 'icon-fum' : 'icon-rep'">
                <span>{{ s.type === 'FUMIGACION' ? 'F' : 'R' }}</span>
              </div>
              <div class="service-item-info">
                <div class="service-item-top">
                  <span class="customer-item-name">{{ s.customer?.fullName || 'Cliente' }}</span>
                  <span class="service-price" *ngIf="s.price">{{ s.price | currency:'COP':'$':'1.0-0' }}</span>
                </div>
                <div class="service-item-bottom">
                  <span class="service-type-tag">{{ s.type }}</span>
                  <span class="service-date-text">{{ formatDate(s.serviceDate) }}</span>
                </div>
              </div>
              <app-status-badge [status]="s.expirationStatus" [daysRemaining]="s.daysRemaining"></app-status-badge>
            </div>
          </div>

          <ng-template #noRecent>
            <app-empty-state
              icon="services"
              title="Aún no hay servicios"
              description="Registra tu primer servicio de fumigación para comenzar a controlar vigencias."
              actionLabel="Registrar Servicio"
              (actionClick)="navigateTo('/services/new')"
            ></app-empty-state>
          </ng-template>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 0 16px 20px;
    }

    .hero-header {
      background: var(--brand-gradient);
      margin: 0 -16px 16px;
      padding: 24px 20px 28px;
      color: #ffffff;
      border-bottom-left-radius: var(--radius-xl);
      border-bottom-right-radius: var(--radius-xl);
      box-shadow: 0 10px 25px -5px rgba(29, 78, 216, 0.25);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .hero-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      margin-bottom: 6px;
      backdrop-filter: blur(4px);
    }

    .hero-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 13px;
      opacity: 0.9;
      margin-top: 4px;
      text-transform: capitalize;
    }

    .btn-refresh {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.15);
      width: 38px;
      height: 38px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-refresh:active {
      transform: rotate(180deg);
      background: rgba(255, 255, 255, 0.3);
    }

    .dashboard-body {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Quick Actions */
    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .action-card {
      padding: 14px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s ease;
      box-shadow: var(--shadow-sm);
    }

    .action-primary {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
    }

    .action-secondary {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #15803d;
    }

    .action-card:active {
      transform: scale(0.97);
    }

    .action-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
      flex-shrink: 0;
    }

    .action-text {
      display: flex;
      flex-direction: column;
    }

    .action-title {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.2;
    }

    .action-desc {
      font-size: 11px;
      opacity: 0.8;
      margin-top: 2px;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .kpi-card {
      background: var(--surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      padding: 14px 16px;
      box-shadow: var(--shadow-sm);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .kpi-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .kpi-icon-wrap {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-blue { background: #dbeafe; color: #1d4ed8; }
    .icon-indigo { background: #e0e7ff; color: #4338ca; }
    .icon-amber { background: #fef3c7; color: #d97706; }
    .icon-red { background: #fee2e2; color: #dc2626; }

    .kpi-value {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.1;
    }

    .text-amber { color: #d97706; }
    .text-red { color: #dc2626; }

    .kpi-meta {
      font-size: 11px;
      color: var(--text-dim);
      display: block;
      margin-top: 4px;
    }

    .highlight-warning {
      border-color: #fde68a;
      background: #fffdf5;
    }

    .highlight-danger {
      border-color: #fecaca;
      background: #fff8f8;
    }

    /* Section Styles */
    .section-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 4px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
    }

    .section-subtitle {
      font-size: 12px;
      color: var(--text-muted);
    }

    .section-link {
      font-size: 13px;
      font-weight: 600;
      color: var(--primary-600);
    }

    .cards-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Urgent Expiring Card */
    .customer-action-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 14px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card-main-info {
      cursor: pointer;
    }

    .card-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .customer-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
    }

    .customer-address {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .service-meta-date {
      font-size: 12px;
      color: var(--text-dim);
      margin-top: 6px;
    }

    .card-actions-bar {
      display: flex;
      gap: 8px;
      border-top: 1px solid var(--surface-subtle);
      padding-top: 10px;
    }

    .flex-1 {
      flex: 1;
    }

    /* Service Item Card */
    .service-item-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .service-item-card:active {
      transform: scale(0.99);
      background: var(--surface-hover);
    }

    .service-type-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
      flex-shrink: 0;
    }

    .icon-fum {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .icon-rep {
      background: #fdf2f8;
      color: #db2777;
    }

    .service-item-info {
      flex: 1;
      min-width: 0;
    }

    .service-item-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .customer-item-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .service-price {
      font-size: 13px;
      font-weight: 700;
      color: var(--primary-700);
    }

    .service-item-bottom {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }

    .service-type-tag {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--surface-subtle);
      padding: 1px 6px;
      border-radius: var(--radius-sm);
    }

    .service-date-text {
      font-size: 12px;
      color: var(--text-dim);
    }
  `]
})
export class DashboardPageComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  contactService = inject(ContactService);

  data = signal<DashboardData | null>(null);
  isLoading = signal<boolean>(true);

  todayFormatted: string = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.dashboardService.loadDashboard().subscribe({
      next: (res: DashboardData) => {
        this.data.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  formatDate(d?: string | null): string {
    return formatFriendlyDate(d);
  }

  navigateTo(path: string) {
    window.location.href = path;
  }
}
