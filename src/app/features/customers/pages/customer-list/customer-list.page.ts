import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomersService } from '../../customers.service.js';
import { ContactService } from '../../../../core/services/contact.service.js';
import { Customer } from '../../../../core/models/customer.model.js';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component.js';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component.js';

@Component({
  selector: 'app-customer-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Header -->
      <header class="page-header">
        <h1 class="page-title">Directorio de Clientes</h1>
        <p class="page-subtitle">{{ customers().length }} clientes registrados</p>
      </header>

      <!-- Search & Filter Controls -->
      <div class="search-bar-wrap">
        <div class="search-input-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="Buscar por nombre, teléfono o dirección..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
          />
          <button *ngIf="searchQuery" class="clear-btn" (click)="clearSearch()">
            &times;
          </button>
        </div>

        <div class="filter-pills">
          <button
            class="filter-pill"
            [class.active]="filterActive() === undefined"
            (click)="setFilter(undefined)"
          >
            Todos
          </button>
          <button
            class="filter-pill"
            [class.active]="filterActive() === true"
            (click)="setFilter(true)"
          >
            Activos
          </button>
          <button
            class="filter-pill"
            [class.active]="filterActive() === false"
            (click)="setFilter(false)"
          >
            Inactivos
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <app-loading-spinner *ngIf="isLoading()" message="Buscando clientes..."></app-loading-spinner>

      <!-- Customer Cards List -->
      <div *ngIf="!isLoading()" class="customers-list">
        <div *ngFor="let c of customers()" class="customer-card">
          <div class="card-content" [routerLink]="['/customers', c.id]">
            <div class="card-header-row">
              <span class="customer-name">{{ c.fullName }}</span>
              <span class="status-indicator" [class.inactive]="!c.isActive">
                {{ c.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </div>

            <div class="info-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span class="phone-number">{{ c.phone }}</span>
            </div>

            <div class="info-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span class="address-text">{{ c.address }}<ng-container *ngIf="c.neighborhood">, {{ c.neighborhood }}</ng-container></span>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="card-footer-actions">
            <button
              class="btn-whatsapp flex-1"
              (click)="contactService.openWhatsApp(c.phone, c.fullName)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.01-.069-.607-.197-1.423-.578-2.222-1.378-.996-.996-1.579-2.18-1.748-2.581-.17-.4-.019-.624.1-.795.108-.154.24-.374.36-.503.12-.13.16-.22.24-.37.08-.15.04-.28-.02-.4-.06-.12-.54-1.3-.74-1.78-.194-.467-.393-.404-.54-.412l-.46-.008c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.09.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
              </svg>
              <span>WhatsApp</span>
            </button>
            <button
              class="btn-call"
              (click)="contactService.callPhone(c.phone)"
              title="Llamar"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </button>
          </div>
        </div>

        <app-empty-state
          *ngIf="customers().length === 0"
          icon="customers"
          title="No hay clientes registrados"
          description="Agrega tu primer cliente usando el botón + para comenzar."
          actionLabel="Registrar Cliente"
          (actionClick)="navigateToNew()"
        ></app-empty-state>
      </div>

      <!-- Floating Action Button -->
      <a routerLink="/customers/new" class="fab-btn" title="Nuevo Cliente">
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
      margin-bottom: 16px;
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

    .search-bar-wrap {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 16px;
    }

    .search-input-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: var(--text-dim);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 12px 38px 12px 38px;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--border);
      background: var(--surface);
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .clear-btn {
      position: absolute;
      right: 12px;
      font-size: 18px;
      color: var(--text-dim);
    }

    .filter-pills {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .filter-pill {
      padding: 6px 14px;
      border-radius: var(--radius-full);
      background: var(--surface);
      border: 1px solid var(--border);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .filter-pill.active {
      background: var(--primary-600);
      color: #ffffff;
      border-color: var(--primary-600);
    }

    .customers-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .customer-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 14px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s ease;
    }

    .card-content {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .card-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .customer-name {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
    }

    .status-indicator {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background: #ecfdf5;
      color: #047857;
    }

    .status-indicator.inactive {
      background: #f1f5f9;
      color: #64748b;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-muted);
    }

    .phone-number {
      font-weight: 600;
      color: var(--text-main);
    }

    .card-footer-actions {
      display: flex;
      gap: 8px;
      border-top: 1px solid var(--surface-subtle);
      padding-top: 10px;
    }

    .flex-1 {
      flex: 1;
    }
  `]
})
export class CustomerListPageComponent implements OnInit {
  private customersService = inject(CustomersService);
  contactService = inject(ContactService);

  customers = signal<Customer[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery: string = '';
  filterActive = signal<boolean | undefined>(undefined);

  private searchTimeout: any;

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.isLoading.set(true);
    this.customersService.getAll(this.searchQuery, this.filterActive()).subscribe({
      next: (data: Customer[]) => {
        this.customers.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(query: string) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadCustomers();
    }, 250);
  }

  clearSearch() {
    this.searchQuery = '';
    this.loadCustomers();
  }

  setFilter(status?: boolean) {
    this.filterActive.set(status);
    this.loadCustomers();
  }

  navigateToNew() {
    window.location.href = '/customers/new';
  }
}
