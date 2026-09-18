import { Customer } from './customer.model.js';

export enum ServiceType {
  FUMIGACION = 'FUMIGACION',
  REPASO = 'REPASO',
}

export enum ServiceStatus {
  PROGRAMADO = 'PROGRAMADO',
  REALIZADO = 'REALIZADO',
  CANCELADO = 'CANCELADO',
}

export enum ExpirationStatus {
  ACTIVE = 'ACTIVE',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
  NO_DATE = 'NO_DATE',
}

export interface Service {
  id: string;
  customerId: string;
  customer?: Customer;
  type: ServiceType;
  status: ServiceStatus;
  serviceDate: string;
  expirationDate?: string;
  price?: number;
  paymentMethod?: string;
  notes?: string;
  parentServiceId?: string;
  parentService?: Service;
  expirationStatus?: ExpirationStatus;
  daysRemaining?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  customerId: string;
  type: ServiceType;
  status: ServiceStatus;
  serviceDate: string;
  expirationDate?: string;
  durationDays?: number;
  price?: number;
  paymentMethod?: string;
  notes?: string;
  parentServiceId?: string;
}

export interface UpdateServiceDto {
  type?: ServiceType;
  status?: ServiceStatus;
  serviceDate?: string;
  expirationDate?: string;
  price?: number;
  paymentMethod?: string;
  notes?: string;
  parentServiceId?: string;
}
