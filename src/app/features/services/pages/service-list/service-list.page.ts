import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServicesService } from '../../services.service.js';
import { Service, ServiceType, ExpirationStatus } from '../../../../core/models/service.model.js';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component.js';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component.js';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component.js';
import { formatFriendlyDate } from '../../../../shared/utils/date.utils.js';

type ServiceFilterTab = 'ALL' | 'EXPIRING' | 'EXPIRED' | 'ACTIVE' | 'REPASO';

@Component({
  selector: 'app-service-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Header -->
      <header class="page-header">
        <h1 class="page-title">Historial de Servicios</h1>
        <p class="page-subtitle">{{ filteredServices().length }} servicios encontrados</p>
      </header>

      <!-- Filter Tabs -->
      <div class="filter-tabs-scroll">
        <button
          class="filter-tab"
          [class.active]="activeTab() === 'ALL'"
          (click)="setTab('ALL')"
        >
          Todos ({{ services().length }})
        </button>
        <button
          class="filter-tab tab-warning"
          [class.active]="activeTab() === 'EXPIRING'"
          (click)="setTab('EXPIRING')"
        >
          ⚠️ Por Vencer ({{ countByTab('EXPIRING') }})
        </button>
        <button
          class="filter-tab tab-danger"
          [class.active]="activeTab() === 'EXPIRED'"
          (click)="setTab('EXPIRED')"
        >
          🔴 Vencidos ({{ countByTab('EXPIRED') }})
        </button>
        <button
          class="filter-tab"
          [class.active]="activeTab() === 'ACTIVE'"
          (click)="setTab('ACTIVE')"
        >
          🟢 Vigentes ({{ countByTab('ACTIVE') }})
        </button>
        <button
          class="filter-tab"
          [class.active]="activeTab() === 'REPASO'"
          (click)="setTab('REPASO')"
        >
          Repasos ({{ countByTab('REPASO') }})
        </button>
      </div>

      <!-- Loading State -->
      <app-loading-spinner *ngIf="isLoading()" message="Cargando servicios..."></app-loading-spinner>

      <!-- Services List -->
      <div *ngIf="!isLoading()" class="services-list">
        <div
          *ngFor="let s of filteredServices()"
          class="service-card"
          [routerLink]="['/services', s.id]"
        >
          <div class="card-top">
            <div class="service-type-badge" [ngClass]="s.type === 'FUMIGACION' ? 'badge-fum' : 'badge-rep'">
              {{ s.type }}
            </div>
            <app-status-badge [status]="s.expirationStatus" [daysRemaining]="s.daysRemaining"></app-status-badge>
          </div>

          <div class="customer-info-box">
            <span class="customer-name">{{ s.customer?.fullName || 'Cliente no disponible' }}</span>
            <span class="customer-address" *ngIf="s.customer?.address">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{{ s.customer?.address }}</span>
            </span>
          </div>

          <div class="card-dates-grid">
            <div class="date-cell">
              <span class="date-lbl">Fecha Servicio</span>
              <span class="date-val">{{ formatDate(s.serviceDate) }}</span>
            </div>
            <div class="date-cell" *ngIf="s.expirationDate">
              <span class="date-lbl">Vigencia Hasta</span>
              <span class="date-val font-semibold">{{ formatDate(s.expirationDate) }}</span>
            </div>
            <div class="date-cell" *ngIf="s.price">
              <span class="date-lbl">Valor</span>
              <span class="date-val text-primary font-bold">{{ s.price | currency:'COP':'$':'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <app-empty-state
          *ngIf="filteredServices().length === 0"
          icon="services"
          title="No hay servicios en esta categoría"
          description="Intenta seleccionando otra pestaña de filtro o registra un nuevo servicio."
          actionLabel="Registrar Servicio"
          (actionClick)="navigateToNew()"
        ></app-empty-state>
      </div>

      <!-- Floating Action Button -->
      <a routerLink="/services/new" class="fab-btn" title="Nuevo Servicio">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </a>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 16px;
    }

    .page-header {
      margin-bottom: 14px;
    }

    .page-title {
      font-size: 22px;
      font-weight: 800;
      color: var(--text-main);
    }

    .page-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .filter-tabs-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 12px;
      margin-bottom: 8px;
      -webkit-overflow-scrolling: touch;
    }

    .filter-tab {
      padding: 8px 14px;
      border-radius: var(--radius-full);
      background: var(--surface);
      border: 1px solid var(--border);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .filter-tab.active {
      background: var(--primary-600);
      color: #ffffff;
      border-color: var(--primary-600);
    }

    .tab-warning.active {
      background: #d97706;
      border-color: #d97706;
    }

    .tab-danger.active {
      background: #dc2626;
      border-color: #dc2626;
    }

    .services-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .service-card {
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

    .service-card:active {
      transform: scale(0.99);
      background: var(--surface-hover);
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .service-type-badge {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
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

    .customer-info-box {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .customer-name {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
    }

    .customer-address {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 13px;
      color: var(--text-muted);
    }

    .card-dates-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      background: var(--surface-subtle);
      padding: 8px 12px;
      border-radius: var(--radius-md);
    }

    .date-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .date-lbl {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-dim);
      text-transform: uppercase;
    }

    .date-val {
      font-size: 12px;
      color: var(--text-main);
    }

    .font-semibold {
      font-weight: 600;
    }

    .font-bold {
      font-weight: 700;
    }

    .text-primary {
      color: var(--primary-700);
    }
  `]
})
export class ServiceListPageComponent implements OnInit {
  private servicesService = inject(ServicesService);

  services = signal<Service[]>([]);
  isLoading = signal<boolean>(true);
  activeTab = signal<ServiceFilterTab>('ALL');

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.isLoading.set(true);
    this.servicesService.getAll().subscribe({
      next: (data: Service[]) => {
        this.services.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  setTab(tab: ServiceFilterTab) {
    this.activeTab.set(tab);
  }

  filteredServices(): Service[] {
    const list = this.services();
    const tab = this.activeTab();

    switch (tab) {
      case 'EXPIRING':
        return list.filter((s: Service) => s.expirationStatus === ExpirationStatus.EXPIRING_SOON);
      case 'EXPIRED':
        return list.filter((s: Service) => s.expirationStatus === ExpirationStatus.EXPIRED);
      case 'ACTIVE':
        return list.filter((s: Service) => s.expirationStatus === ExpirationStatus.ACTIVE);
      case 'REPASO':
        return list.filter((s: Service) => s.type === ServiceType.REPASO);
      default:
        return list;
    }
  }

  countByTab(tab: ServiceFilterTab): number {
    const list = this.services();
    switch (tab) {
      case 'EXPIRING':
        return list.filter((s: Service) => s.expirationStatus === ExpirationStatus.EXPIRING_SOON).length;
      case 'EXPIRED':
        return list.filter((s: Service) => s.expirationStatus === ExpirationStatus.EXPIRED).length;
      case 'ACTIVE':
        return list.filter((s: Service) => s.expirationStatus === ExpirationStatus.ACTIVE).length;
      case 'REPASO':
        return list.filter((s: Service) => s.type === ServiceType.REPASO).length;
      default:
        return list.length;
    }
  }

  formatDate(d?: string | null): string {
    return formatFriendlyDate(d);
  }

  navigateToNew() {
    window.location.href = '/services/new';
  }
}
