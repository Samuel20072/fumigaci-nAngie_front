import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, Params } from '@angular/router';
import { ServicesService } from '../../services.service.js';
import { CustomersService } from '../../../customers/customers.service.js';
import { NotificationService } from '../../../../core/services/notification.service.js';
import { ServiceType, ServiceStatus } from '../../../../core/models/service.model.js';
import { Customer } from '../../../../core/models/customer.model.js';
import { Service } from '../../../../core/models/service.model.js';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component.js';

@Component({
  selector: 'app-service-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Top Navigation -->
      <div class="form-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Atrás</span>
        </button>
        <h1 class="form-title">{{ isEditMode() ? 'Editar Servicio' : 'Nuevo Servicio' }}</h1>
        <div style="width: 40px;"></div>
      </div>

      <!-- Form Card -->
      <div class="form-card" *ngIf="!isLoading(); else loadingTpl">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Customer Selector -->
          <div class="form-group" *ngIf="!isEditMode()">
            <label class="form-label">Cliente *</label>
            <select
              class="form-control"
              [class.is-invalid]="isFieldInvalid('customerId')"
              formControlName="customerId"
              (change)="onCustomerChanged()"
            >
              <option value="" disabled>Selecciona un cliente</option>
              <option *ngFor="let c of customers()" [value]="c.id">
                {{ c.fullName }} ({{ c.phone }})
              </option>
            </select>
            <span class="form-error" *ngIf="isFieldInvalid('customerId')">
              Debes seleccionar un cliente
            </span>
          </div>

          <!-- Service Type Selector (FUMIGACION vs REPASO) -->
          <div class="form-group">
            <label class="form-label">Tipo de Servicio *</label>
            <div class="type-segmented-control">
              <button
                type="button"
                class="seg-btn"
                [class.active]="form.get('type')?.value === ServiceType.FUMIGACION"
                (click)="setType(ServiceType.FUMIGACION)"
              >
                🛡️ Fumigación
              </button>
              <button
                type="button"
                class="seg-btn"
                [class.active]="form.get('type')?.value === ServiceType.REPASO"
                (click)="setType(ServiceType.REPASO)"
              >
                🔄 Repaso
              </button>
            </div>
          </div>

          <!-- Parent Service Selector (only if REPASO) -->
          <div class="form-group" *ngIf="form.get('type')?.value === ServiceType.REPASO">
            <label class="form-label">Fumigación Original Asociada (Opcional)</label>
            <select class="form-control" formControlName="parentServiceId">
              <option value="">Ninguno / Repaso General</option>
              <option *ngFor="let p of parentServices()" [value]="p.id">
                Fumigación del {{ p.serviceDate }}
              </option>
            </select>
          </div>

          <!-- Service Date -->
          <div class="form-group">
            <label class="form-label">Fecha del Servicio *</label>
            <input
              type="date"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('serviceDate')"
              formControlName="serviceDate"
              (change)="onServiceDateChange()"
            />
            <span class="form-error" *ngIf="isFieldInvalid('serviceDate')">
              La fecha del servicio es requerida
            </span>
          </div>

          <!-- Expiration Mode / Vigencia -->
          <div class="form-group">
            <label class="form-label">Vigencia / Garantía</label>
            
            <!-- Quick Preset Days -->
            <div class="preset-days-grid">
              <button
                type="button"
                class="preset-chip"
                [class.selected]="selectedPresetDays() === 30"
                (click)="applyPresetDays(30)"
              >
                30 días (1 mes)
              </button>
              <button
                type="button"
                class="preset-chip"
                [class.selected]="selectedPresetDays() === 90"
                (click)="applyPresetDays(90)"
              >
                90 días (3 meses)
              </button>
              <button
                type="button"
                class="preset-chip"
                [class.selected]="selectedPresetDays() === 180"
                (click)="applyPresetDays(180)"
              >
                180 días (6 meses)
              </button>
              <button
                type="button"
                class="preset-chip"
                [class.selected]="selectedPresetDays() === 365"
                (click)="applyPresetDays(365)"
              >
                1 año
              </button>
              <button
                type="button"
                class="preset-chip"
                [class.selected]="selectedPresetDays() === 0"
                (click)="applyPresetDays(0)"
              >
                Sin vigencia
              </button>
            </div>

            <!-- Manual Expiration Date Input -->
            <div class="mt-2">
              <label class="form-sublabel">O selecciona la fecha exacta:</label>
              <input
                type="date"
                class="form-control"
                formControlName="expirationDate"
                (change)="selectedPresetDays.set(null)"
              />
            </div>
          </div>

          <!-- Price & Payment Method -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Precio ($ COP)</label>
              <input
                type="number"
                class="form-control"
                formControlName="price"
                placeholder="Ej. 150000"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Método de Pago</label>
              <select class="form-control" formControlName="paymentMethod">
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Nequi / Daviplata">Nequi / Daviplata</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label class="form-label">Notas / Observaciones</label>
            <textarea
              class="form-control"
              rows="3"
              formControlName="notes"
              placeholder="Ej. Se aplicó gel en cocina y aspersión perimetral. Garantía de 3 meses."
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn-primary w-full"
              [disabled]="form.invalid || isSubmitting()"
            >
              <span *ngIf="!isSubmitting()">
                {{ isEditMode() ? 'Guardar Cambios' : 'Registrar Servicio' }}
              </span>
              <span *ngIf="isSubmitting()">Guardando...</span>
            </button>
          </div>
        </form>
      </div>

      <ng-template #loadingTpl>
        <app-loading-spinner message="Cargando formulario..."></app-loading-spinner>
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

    .type-segmented-control {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: var(--surface-subtle);
      padding: 4px;
      border-radius: var(--radius-md);
    }

    .seg-btn {
      padding: 10px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 700;
      color: var(--text-muted);
      transition: all 0.2s ease;
    }

    .seg-btn.active {
      background: var(--surface);
      color: var(--primary-600);
      box-shadow: var(--shadow-sm);
    }

    .preset-days-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 4px;
    }

    .preset-chip {
      padding: 7px 12px;
      border-radius: var(--radius-full);
      background: var(--surface);
      border: 1px solid var(--border);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      transition: all 0.2s ease;
    }

    .preset-chip.selected {
      background: var(--primary-50);
      color: var(--primary-700);
      border-color: var(--primary-500);
      font-weight: 700;
    }

    .mt-2 {
      margin-top: 10px;
    }

    .form-sublabel {
      font-size: 11px;
      color: var(--text-dim);
      display: block;
      margin-bottom: 4px;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-actions {
      margin-top: 24px;
    }

    .w-full {
      width: 100%;
      padding: 14px;
      font-size: 16px;
    }
  `]
})
export class ServiceFormPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private servicesService = inject(ServicesService);
  private customersService = inject(CustomersService);
  private notificationService = inject(NotificationService);

  readonly ServiceType = ServiceType;

  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  serviceId = signal<string | null>(null);

  customers = signal<Customer[]>([]);
  parentServices = signal<Service[]>([]);
  selectedPresetDays = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    customerId: ['', [Validators.required]],
    type: [ServiceType.FUMIGACION, [Validators.required]],
    status: [ServiceStatus.REALIZADO, [Validators.required]],
    serviceDate: [new Date().toISOString().split('T')[0], [Validators.required]],
    expirationDate: [''],
    price: [null],
    paymentMethod: ['Efectivo'],
    notes: [''],
    parentServiceId: [''],
  });

  ngOnInit() {
    this.loadCustomersList();

    this.route.params.subscribe((params: Params) => {
      const id = params['id'];
      if (id) {
        this.isEditMode.set(true);
        this.serviceId.set(id);
        this.loadServiceData(id);
      }
    });

    this.route.queryParams.subscribe((queryParams: Params) => {
      if (!this.isEditMode()) {
        if (queryParams['customerId']) {
          this.form.patchValue({ customerId: queryParams['customerId'] });
          this.onCustomerChanged();
        }
        if (queryParams['type']) {
          this.form.patchValue({ type: queryParams['type'] });
        }
        if (queryParams['parentServiceId']) {
          this.form.patchValue({ parentServiceId: queryParams['parentServiceId'] });
        }
      }
    });
  }

  loadCustomersList() {
    this.customersService.getAll(undefined, true).subscribe({
      next: (res: Customer[]) => this.customers.set(res),
    });
  }

  loadServiceData(id: string) {
    this.isLoading.set(true);
    this.servicesService.getById(id).subscribe({
      next: (s: Service) => {
        this.form.patchValue({
          customerId: s.customerId,
          type: s.type,
          status: s.status,
          serviceDate: s.serviceDate ? s.serviceDate.split('T')[0] : '',
          expirationDate: s.expirationDate ? s.expirationDate.split('T')[0] : '',
          price: s.price,
          paymentMethod: s.paymentMethod || 'Efectivo',
          notes: s.notes || '',
          parentServiceId: s.parentServiceId || '',
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('No se pudo cargar el servicio');
        this.router.navigate(['/services']);
      },
    });
  }

  onCustomerChanged() {
    const custId = this.form.get('customerId')?.value;
    if (custId) {
      this.servicesService.getByCustomer(custId).subscribe({
        next: (services: Service[]) => {
          const fumigations = services.filter((s: Service) => s.type === ServiceType.FUMIGACION);
          this.parentServices.set(fumigations);
        },
      });
    }
  }

  setType(type: ServiceType) {
    this.form.patchValue({ type });
  }

  applyPresetDays(days: number) {
    this.selectedPresetDays.set(days);
    if (days === 0) {
      this.form.patchValue({ expirationDate: '' });
      return;
    }

    const sDate = this.form.get('serviceDate')?.value;
    if (sDate) {
      const parts = sDate.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      d.setDate(d.getDate() + days);
      const iso = d.toISOString().split('T')[0];
      this.form.patchValue({ expirationDate: iso });
    }
  }

  onServiceDateChange() {
    if (this.selectedPresetDays() && this.selectedPresetDays()! > 0) {
      this.applyPresetDays(this.selectedPresetDays()!);
    }
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
    const val = this.form.value;

    const payload = {
      ...val,
      price: val.price ? Number(val.price) : undefined,
      parentServiceId: val.parentServiceId || undefined,
      expirationDate: val.expirationDate || undefined,
    };

    if (this.isEditMode() && this.serviceId()) {
      this.servicesService.update(this.serviceId()!, payload).subscribe({
        next: (s: Service) => {
          this.isSubmitting.set(false);
          this.notificationService.success('Servicio actualizado con éxito');
          this.router.navigate(['/services', s.id]);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
    } else {
      this.servicesService.create(payload).subscribe({
        next: (s: Service) => {
          this.isSubmitting.set(false);
          this.notificationService.success('Servicio registrado con éxito');
          this.router.navigate(['/services', s.id]);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
    }
  }

  goBack() {
    if (this.isEditMode() && this.serviceId()) {
      this.router.navigate(['/services', this.serviceId()]);
    } else {
      this.router.navigate(['/services']);
    }
  }
}
