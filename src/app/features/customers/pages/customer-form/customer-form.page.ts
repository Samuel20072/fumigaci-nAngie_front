import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, Params } from '@angular/router';
import { Customer } from '../../../../core/models/customer.model.js';
import { CustomersService } from '../../customers.service.js';
import { NotificationService } from '../../../../core/services/notification.service.js';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component.js';

@Component({
  selector: 'app-customer-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Header -->
      <div class="form-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Atrás</span>
        </button>
        <h1 class="form-title">{{ isEditMode() ? 'Editar Cliente' : 'Nuevo Cliente' }}</h1>
        <div style="width: 40px;"></div>
      </div>

      <!-- Duplicate Warning Alert Modal / Box -->
      <div *ngIf="duplicateConflict()" class="conflict-alert animate-fade-in">
        <div class="conflict-icon">⚠️</div>
        <div class="conflict-content">
          <strong>Teléfono ya registrado</strong>
          <p>Este número ya pertenece a <strong>{{ duplicateConflict()?.name }}</strong>.</p>
          <div class="conflict-actions">
            <button class="btn-conflict-view" (click)="viewExistingCustomer(duplicateConflict()!.id)">
              Ver Cliente Existente
            </button>
            <button class="btn-conflict-dismiss" (click)="duplicateConflict.set(null)">
              Corregir
            </button>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="form-card" *ngIf="!isLoading(); else loadingTpl">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Nombre Completo -->
          <div class="form-group">
            <label class="form-label">Nombre Completo *</label>
            <input
              type="text"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('fullName')"
              formControlName="fullName"
              placeholder="Ej. María García"
            />
            <span class="form-error" *ngIf="isFieldInvalid('fullName')">
              El nombre del cliente es obligatorio
            </span>
          </div>

          <!-- Teléfono -->
          <div class="form-group">
            <label class="form-label">Teléfono / Celular (WhatsApp) *</label>
            <input
              type="tel"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('phone')"
              formControlName="phone"
              placeholder="Ej. 3001234567"
            />
            <span class="form-error" *ngIf="isFieldInvalid('phone')">
              Ingresa un número telefónico válido (mínimo 7 dígitos)
            </span>
          </div>

          <!-- Dirección -->
          <div class="form-group">
            <label class="form-label">Dirección *</label>
            <input
              type="text"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('address')"
              formControlName="address"
              placeholder="Ej. Calle 45 # 23-10 Apto 302"
            />
            <span class="form-error" *ngIf="isFieldInvalid('address')">
              La dirección es obligatoria
            </span>
          </div>

          <!-- Barrio & Ciudad en 2 columnas -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Barrio / Sector</label>
              <input
                type="text"
                class="form-control"
                formControlName="neighborhood"
                placeholder="Ej. El Poblado"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Ciudad</label>
              <input
                type="text"
                class="form-control"
                formControlName="city"
                placeholder="Ej. Medellín"
              />
            </div>
          </div>

          <!-- Notas -->
          <div class="form-group">
            <label class="form-label">Notas / Instrucciones adicionales</label>
            <textarea
              class="form-control"
              rows="3"
              formControlName="notes"
              placeholder="Ej. Timbre no funciona, llamar al llegar. Perro en la casa."
            ></textarea>
          </div>

          <!-- Estado Activo (solo en modo edición) -->
          <div class="form-group switch-group" *ngIf="isEditMode()">
            <label class="switch-label">
              <span>Cliente Activo</span>
              <input type="checkbox" formControlName="isActive" class="switch-checkbox" />
            </label>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn-primary w-full"
              [disabled]="form.invalid || isSubmitting()"
            >
              <span *ngIf="!isSubmitting()">
                {{ isEditMode() ? 'Guardar Cambios' : 'Registrar Cliente' }}
              </span>
              <span *ngIf="isSubmitting()">Guardando...</span>
            </button>
          </div>
        </form>
      </div>

      <ng-template #loadingTpl>
        <app-loading-spinner message="Cargando datos..."></app-loading-spinner>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-header {
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

    .form-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-main);
    }

    .form-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .switch-group {
      background: var(--surface-subtle);
      padding: 12px 16px;
      border-radius: var(--radius-md);
    }

    .switch-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      cursor: pointer;
    }

    .switch-checkbox {
      width: 20px;
      height: 20px;
      accent-color: var(--primary-600);
    }

    .form-actions {
      margin-top: 24px;
    }

    .w-full {
      width: 100%;
      padding: 14px;
      font-size: 16px;
    }

    .conflict-alert {
      background: #fffbeb;
      border: 1.5px solid #fde68a;
      border-radius: var(--radius-lg);
      padding: 14px;
      display: flex;
      gap: 12px;
      box-shadow: var(--shadow-sm);
    }

    .conflict-icon {
      font-size: 24px;
    }

    .conflict-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
      color: #92400e;
    }

    .conflict-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .btn-conflict-view {
      background: #d97706;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
    }

    .btn-conflict-dismiss {
      background: #ffffff;
      border: 1px solid #d97706;
      color: #d97706;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
    }
  `]
})
export class CustomerFormPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customersService = inject(CustomersService);
  private notificationService = inject(NotificationService);

  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  customerId = signal<string | null>(null);

  duplicateConflict = signal<{ id: string; name: string } | null>(null);

  form: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    address: ['', [Validators.required]],
    neighborhood: [''],
    city: ['Medellín'],
    notes: [''],
    isActive: [true],
  });

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const id = params['id'];
      if (id) {
        this.isEditMode.set(true);
        this.customerId.set(id);
        this.loadCustomerData(id);
      }
    });
  }

  loadCustomerData(id: string) {
    this.isLoading.set(true);
    this.customersService.getById(id).subscribe({
      next: (c: Customer) => {
        this.form.patchValue({
          fullName: c.fullName,
          phone: c.phone,
          address: c.address,
          neighborhood: c.neighborhood || '',
          city: c.city || '',
          notes: c.notes || '',
          isActive: c.isActive,
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('No se pudo cargar el cliente');
        this.router.navigate(['/customers']);
      },
    });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.duplicateConflict.set(null);

    const val = this.form.value;

    if (this.isEditMode() && this.customerId()) {
      this.customersService.update(this.customerId()!, val).subscribe({
        next: (c: Customer) => {
          this.isSubmitting.set(false);
          this.notificationService.success('Cliente actualizado correctamente');
          this.router.navigate(['/customers', c.id]);
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          if (err.status === 409 && err.error?.existingCustomerId) {
            this.duplicateConflict.set({
              id: err.error.existingCustomerId,
              name: err.error.existingCustomerName || 'Cliente existente',
            });
          }
        },
      });
    } else {
      this.customersService.create(val).subscribe({
        next: (c: Customer) => {
          this.isSubmitting.set(false);
          this.notificationService.success('Cliente registrado con éxito');
          this.router.navigate(['/customers', c.id]);
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          if (err.status === 409 && err.error?.existingCustomerId) {
            this.duplicateConflict.set({
              id: err.error.existingCustomerId,
              name: err.error.existingCustomerName || 'Cliente existente',
            });
          }
        },
      });
    }
  }

  viewExistingCustomer(id: string) {
    this.router.navigate(['/customers', id]);
  }

  goBack() {
    if (this.isEditMode() && this.customerId()) {
      this.router.navigate(['/customers', this.customerId()]);
    } else {
      this.router.navigate(['/customers']);
    }
  }
}
