import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinancesService } from '../../finances.service.js';
import { NotificationService } from '../../../../core/services/notification.service.js';
import {
  Expense,
  ExpenseCategory,
  ExpenseCategoryLabels,
  CreateExpenseDto,
} from '../../../../core/models/expense.model.js';
import { MonthlyFinancesReport } from '../../../../core/models/finances.model.js';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component.js';

@Component({
  selector: 'app-finances-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Header -->
      <header class="page-header">
        <div>
          <h1 class="page-title">Gastos y Ganancias</h1>
          <p class="page-subtitle">Control financiero y balance mensual</p>
        </div>
        <button class="btn-primary-sm" (click)="openAddModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Gasto</span>
        </button>
      </header>

      <!-- Month Selector Bar -->
      <div class="month-selector-bar">
        <button class="btn-month-nav" (click)="prevMonth()" title="Mes anterior">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div class="current-month-display">
          <span class="month-name">{{ formatMonthName(selectedMonth()) }}</span>
        </div>

        <button class="btn-month-nav" (click)="nextMonth()" title="Mes siguiente">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Loading Spinner -->
      <app-loading-spinner *ngIf="isLoading()" message="Calculando finanzas..."></app-loading-spinner>

      <ng-container *ngIf="!isLoading()">
        <!-- Hero Balance Net Profit Card -->
        <div class="hero-balance-card" [class.profit-positive]="(report()?.netProfit || 0) >= 0" [class.profit-negative]="(report()?.netProfit || 0) < 0">
          <div class="hero-header">
            <span class="hero-label">GANANCIA NETA DEL MES</span>
            <span class="hero-badge">
              {{ (report()?.netProfit || 0) >= 0 ? '✨ Saldo a Favor' : '⚠️ En Déficit' }}
            </span>
          </div>

          <div class="hero-amount">
            {{ formatCurrency(report()?.netProfit || 0) }}
          </div>

          <div class="hero-subtext">
            <span>Ingresos cobrados menos gastos operacionales</span>
          </div>
        </div>

        <!-- 2 Column Financial KPI Grid -->
        <div class="kpi-grid">
          <!-- Total Income Card -->
          <div class="kpi-card income-card">
            <div class="kpi-icon-wrap income-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-title">Ingresos Servicios</span>
              <span class="kpi-value text-income">{{ formatCurrency(report()?.totalIncome || 0) }}</span>
              <span class="kpi-sub">{{ report()?.completedServicesCount || 0 }} servicios realizados</span>
            </div>
          </div>

          <!-- Total Expenses Card -->
          <div class="kpi-card expense-card">
            <div class="kpi-icon-wrap expense-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-title">Gastos Totales</span>
              <span class="kpi-value text-expense">{{ formatCurrency(report()?.totalExpenses || 0) }}</span>
              <span class="kpi-sub">{{ report()?.expensesCount || 0 }} gastos registrados</span>
            </div>
          </div>
        </div>

        <!-- Expense Category Breakdown Section -->
        <section class="section-card" *ngIf="(report()?.totalExpenses || 0) > 0">
          <h2 class="section-title">¿En qué se fue el dinero?</h2>
          <div class="category-breakdown-list">
            <div *ngFor="let cat of activeCategoryBreakdowns()" class="category-row">
              <div class="cat-header">
                <div class="cat-label-wrap">
                  <span class="cat-icon">{{ getCategoryInfo(cat.category).icon }}</span>
                  <span class="cat-name">{{ getCategoryInfo(cat.category).label }}</span>
                </div>
                <div class="cat-amount-wrap">
                  <span class="cat-total">{{ formatCurrency(cat.total) }}</span>
                  <span class="cat-percentage">{{ cat.percentage }}%</span>
                </div>
              </div>
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  [style.width.%]="cat.percentage"
                  [style.backgroundColor]="getCategoryInfo(cat.category).color"
                ></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Expenses List Section -->
        <section class="section-card">
          <div class="section-header-row">
            <h2 class="section-title">Historial de Gastos ({{ expenses().length }})</h2>
            <button class="btn-link" (click)="openAddModal()">+ Nuevo Gasto</button>
          </div>

          <div *ngIf="expenses().length === 0" class="empty-expenses">
            <p>No has registrado ningún gasto en este mes.</p>
            <button class="btn-secondary-sm" (click)="openAddModal()">
              Registrar el primer gasto
            </button>
          </div>

          <div *ngIf="expenses().length > 0" class="expenses-list">
            <div *ngFor="let exp of expenses()" class="expense-item-card">
              <div class="expense-left">
                <div
                  class="expense-icon-badge"
                  [style.backgroundColor]="getCategoryInfo(exp.category).bg"
                  [style.color]="getCategoryInfo(exp.category).color"
                >
                  {{ getCategoryInfo(exp.category).icon }}
                </div>
                <div class="expense-details">
                  <span class="expense-concept">{{ exp.concept }}</span>
                  <div class="expense-meta">
                    <span class="expense-category-pill">{{ getCategoryInfo(exp.category).label }}</span>
                    <span class="expense-date">{{ formatDate(exp.expenseDate) }}</span>
                    <span *ngIf="exp.isRecurring" class="recurring-tag">Fijo</span>
                  </div>
                  <p *ngIf="exp.notes" class="expense-notes">{{ exp.notes }}</p>
                </div>
              </div>

              <div class="expense-right">
                <span class="expense-amount">-{{ formatCurrency(exp.amount) }}</span>
                <button
                  class="btn-delete-expense"
                  (click)="confirmDeleteExpense(exp)"
                  title="Eliminar gasto"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </ng-container>

      <!-- Modal: Registrar Gasto -->
      <div *ngIf="isAddModalOpen()" class="modal-backdrop animate-fade-in" (click)="closeAddModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Registrar Gasto</h3>
            <button class="btn-close" (click)="closeAddModal()">&times;</button>
          </div>

          <form [formGroup]="expenseForm" (ngSubmit)="submitExpense()" class="modal-form">
            <!-- Preset Quick Category Selector -->
            <div class="form-group">
              <label class="form-label">Categoría *</label>
              <div class="category-chips-grid">
                <button
                  type="button"
                  *ngFor="let cat of availableCategories"
                  class="category-chip"
                  [class.selected]="expenseForm.get('category')?.value === cat"
                  (click)="selectCategory(cat)"
                >
                  <span class="chip-icon">{{ getCategoryInfo(cat).icon }}</span>
                  <span class="chip-label">{{ getCategoryInfo(cat).label }}</span>
                </button>
              </div>
            </div>

            <!-- Concept / Description -->
            <div class="form-group">
              <label class="form-label">Concepto / Descripción *</label>
              <input
                type="text"
                class="form-input"
                placeholder="Ej. Gasolina de la moto, Veneno cucarachicida, etc."
                formControlName="concept"
              />
            </div>

            <!-- Amount -->
            <div class="form-group">
              <label class="form-label">Valor / Monto ($ COP) *</label>
              <div class="input-with-prefix">
                <span class="input-prefix">$</span>
                <input
                  type="number"
                  class="form-input has-prefix"
                  placeholder="25000"
                  formControlName="amount"
                />
              </div>
            </div>

            <!-- Expense Date -->
            <div class="form-group">
              <label class="form-label">Fecha del gasto *</label>
              <input
                type="date"
                class="form-input"
                formControlName="expenseDate"
              />
            </div>

            <!-- Is Recurring Checkbox -->
            <div class="form-checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="isRecurring" />
                <span class="checkbox-custom"></span>
                <span>¿Es un gasto fijo mensual? (Gasolina recurrente, arriendo, etc.)</span>
              </label>
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label class="form-label">Notas o detalles (opcional)</label>
              <textarea
                class="form-textarea"
                rows="2"
                placeholder="Ej. Comprado en la droguería de la esquina..."
                formControlName="notes"
              ></textarea>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="closeAddModal()">Cancelar</button>
              <button
                type="submit"
                class="btn-submit"
                [disabled]="expenseForm.invalid || isSubmitting()"
              >
                {{ isSubmitting() ? 'Guardando...' : 'Guardar Gasto' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 16px;
      padding-bottom: 90px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 540px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .page-title {
      font-size: 22px;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .btn-primary-sm {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--brand-gradient);
      color: #ffffff;
      border: none;
      border-radius: var(--radius-full);
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(29, 78, 216, 0.25);
      transition: transform 0.2s ease, opacity 0.2s ease;
      white-space: nowrap;
    }

    .btn-primary-sm:active {
      transform: scale(0.96);
    }

    /* Month Selector Bar */
    .month-selector-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 6px 12px;
      box-shadow: var(--shadow-sm);
    }

    .btn-month-nav {
      background: transparent;
      border: none;
      color: var(--text-muted);
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease, color 0.2s ease;
    }

    .btn-month-nav:hover {
      background: var(--surface-subtle);
      color: var(--text-main);
    }

    .current-month-display {
      text-align: center;
    }

    .month-name {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
      text-transform: capitalize;
    }

    /* Hero Balance Card */
    .hero-balance-card {
      border-radius: var(--radius-xl);
      padding: 20px;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease;
    }

    .hero-balance-card.profit-positive {
      background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%);
    }

    .hero-balance-card.profit-negative {
      background: linear-gradient(135deg, #dc2626 0%, #e11d48 100%);
    }

    .hero-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .hero-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      opacity: 0.9;
    }

    .hero-badge {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      padding: 3px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 700;
    }

    .hero-amount {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 4px 0;
    }

    .hero-subtext {
      font-size: 12px;
      opacity: 0.85;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .kpi-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: var(--shadow-sm);
    }

    .kpi-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .income-icon {
      background: #ecfdf5;
      color: #059669;
    }

    .expense-icon {
      background: #fef2f2;
      color: #dc2626;
    }

    .kpi-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .kpi-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
    }

    .kpi-value {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }

    .text-income {
      color: #059669;
    }

    .text-expense {
      color: #dc2626;
    }

    .kpi-sub {
      font-size: 11px;
      color: var(--text-dim);
    }

    /* Section Card */
    .section-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 18px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .section-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
    }

    .btn-link {
      background: transparent;
      border: none;
      color: var(--primary-600);
      font-size: 13px;
      font-weight: 700;
      padding: 0;
    }

    /* Category Breakdown */
    .category-breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .category-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .cat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .cat-label-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cat-icon {
      font-size: 16px;
    }

    .cat-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
    }

    .cat-amount-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cat-total {
      font-size: 13px;
      font-weight: 800;
      color: var(--text-main);
    }

    .cat-percentage {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      background: var(--surface-subtle);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
    }

    .progress-bar-bg {
      height: 7px;
      background: var(--surface-subtle);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Expenses List */
    .empty-expenses {
      text-align: center;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--text-muted);
      font-size: 14px;
    }

    .btn-secondary-sm {
      background: var(--surface-subtle);
      color: var(--primary-700);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 700;
    }

    .expenses-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .expense-item-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px;
      background: var(--surface-subtle);
      border-radius: var(--radius-lg);
      transition: transform 0.15s ease;
    }

    .expense-left {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .expense-icon-badge {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .expense-details {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .expense-concept {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .expense-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .expense-category-pill {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .expense-date {
      font-size: 11px;
      color: var(--text-dim);
    }

    .recurring-tag {
      font-size: 10px;
      font-weight: 700;
      background: #e0f2fe;
      color: #0369a1;
      padding: 1px 6px;
      border-radius: var(--radius-sm);
    }

    .expense-notes {
      font-size: 12px;
      color: var(--text-muted);
      font-style: italic;
      margin-top: 2px;
    }

    .expense-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .expense-amount {
      font-size: 14px;
      font-weight: 800;
      color: #dc2626;
    }

    .btn-delete-expense {
      background: transparent;
      border: none;
      color: var(--text-dim);
      padding: 6px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s ease, background 0.2s ease;
    }

    .btn-delete-expense:hover {
      color: #dc2626;
      background: #fee2e2;
    }

    /* Modal Form */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    @media (min-width: 600px) {
      .modal-backdrop {
        align-items: center;
        padding: 20px;
      }
    }

    .modal-card {
      background: var(--surface);
      width: 100%;
      max-width: 500px;
      border-top-left-radius: var(--radius-xl);
      border-top-right-radius: var(--radius-xl);
      padding: 24px;
      box-shadow: var(--shadow-float);
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: 90vh;
      overflow-y: auto;
    }

    @media (min-width: 600px) {
      .modal-card {
        border-radius: var(--radius-xl);
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-main);
    }

    .btn-close {
      background: transparent;
      border: none;
      font-size: 24px;
      color: var(--text-muted);
      cursor: pointer;
      line-height: 1;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .category-chips-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .category-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: var(--surface-subtle);
      border: 1.5px solid transparent;
      border-radius: var(--radius-md);
      font-size: 12px;
      font-weight: 700;
      color: var(--text-main);
      text-align: left;
      transition: all 0.2s ease;
    }

    .category-chip.selected {
      background: var(--primary-50);
      border-color: var(--primary-600);
      color: var(--primary-700);
    }

    .form-input, .form-textarea {
      background: var(--surface-subtle);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      font-size: 14px;
      color: var(--text-main);
      outline: none;
      transition: border-color 0.2s ease, background 0.2s ease;
      width: 100%;
    }

    .form-input:focus, .form-textarea:focus {
      border-color: var(--primary-600);
      background: #ffffff;
    }

    .input-with-prefix {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-prefix {
      position: absolute;
      left: 14px;
      font-weight: 700;
      color: var(--text-muted);
    }

    .form-input.has-prefix {
      padding-left: 28px;
      font-size: 16px;
      font-weight: 700;
    }

    .form-checkbox-group {
      padding: 8px 0;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: var(--text-main);
      cursor: pointer;
    }

    .checkbox-label input {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-600);
      cursor: pointer;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }

    .btn-cancel {
      flex: 1;
      padding: 12px;
      background: var(--surface-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      font-size: 14px;
      font-weight: 700;
      color: var(--text-muted);
    }

    .btn-submit {
      flex: 2;
      padding: 12px;
      background: var(--brand-gradient);
      border: none;
      border-radius: var(--radius-lg);
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(29, 78, 216, 0.25);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class FinancesPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private financesService = inject(FinancesService);
  private notificationService = inject(NotificationService);

  selectedMonth = signal<string>(new Date().toISOString().slice(0, 7)); // 'YYYY-MM'
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  isAddModalOpen = signal<boolean>(false);

  report = signal<MonthlyFinancesReport | null>(null);
  expenses = signal<Expense[]>([]);

  availableCategories = Object.values(ExpenseCategory);

  expenseForm: FormGroup = this.fb.group({
    concept: ['', [Validators.required, Validators.maxLength(200)]],
    category: [ExpenseCategory.GASOLINA, [Validators.required]],
    amount: [null, [Validators.required, Validators.min(1)]],
    expenseDate: [new Date().toISOString().split('T')[0], [Validators.required]],
    isRecurring: [false],
    notes: [''],
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    const month = this.selectedMonth();

    this.financesService.getMonthlySummary(month).subscribe({
      next: (rep) => {
        this.report.set(rep);
        this.financesService.getExpenses(month).subscribe({
          next: (exps) => {
            this.expenses.set(exps);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
      },
      error: () => {
        this.notificationService.error('Error al cargar datos financieros');
        this.isLoading.set(false);
      },
    });
  }

  prevMonth() {
    const [yearStr, monthStr] = this.selectedMonth().split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    const formatted = `${year}-${String(month).padStart(2, '0')}`;
    this.selectedMonth.set(formatted);
    this.loadData();
  }

  nextMonth() {
    const [yearStr, monthStr] = this.selectedMonth().split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    const formatted = `${year}-${String(month).padStart(2, '0')}`;
    this.selectedMonth.set(formatted);
    this.loadData();
  }

  formatMonthName(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 15);
    return date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    }
    return dateStr;
  }

  getCategoryInfo(cat: ExpenseCategory) {
    return ExpenseCategoryLabels[cat] || {
      label: cat,
      icon: '💰',
      color: '#4b5563',
      bg: '#f3f4f6',
    };
  }

  activeCategoryBreakdowns() {
    const list = this.report()?.categoryBreakdown || [];
    return list.filter((c) => c.total > 0);
  }

  selectCategory(cat: ExpenseCategory) {
    this.expenseForm.patchValue({ category: cat });
  }

  openAddModal() {
    this.expenseForm.reset({
      concept: '',
      category: ExpenseCategory.GASOLINA,
      amount: null,
      expenseDate: new Date().toISOString().split('T')[0],
      isRecurring: false,
      notes: '',
    });
    this.isAddModalOpen.set(true);
  }

  closeAddModal() {
    this.isAddModalOpen.set(false);
  }

  submitExpense() {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const val = this.expenseForm.value;

    const dto: CreateExpenseDto = {
      concept: val.concept,
      category: val.category,
      amount: Number(val.amount),
      expenseDate: val.expenseDate,
      isRecurring: Boolean(val.isRecurring),
      notes: val.notes || undefined,
    };

    this.financesService.createExpense(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeAddModal();
        this.notificationService.success('Gasto registrado con éxito');
        this.loadData();
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  confirmDeleteExpense(exp: Expense) {
    const confirmDelete = window.confirm(
      `¿Deseas eliminar el gasto "${exp.concept}" por ${this.formatCurrency(exp.amount)}?`
    );
    if (!confirmDelete) return;

    this.financesService.deleteExpense(exp.id).subscribe({
      next: () => {
        this.notificationService.success('Gasto eliminado');
        this.loadData();
      },
      error: () => {
        this.notificationService.error('No se pudo eliminar el gasto');
      },
    });
  }
}
