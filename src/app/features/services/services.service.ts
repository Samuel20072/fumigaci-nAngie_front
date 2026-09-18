import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service, CreateServiceDto, UpdateServiceDto, ServiceType, ServiceStatus } from '../../core/models/service.model.js';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private http = inject(HttpClient);

  getAll(type?: ServiceType, status?: ServiceStatus): Observable<Service[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);
    return this.http.get<Service[]>('/services', { params });
  }

  getById(id: string): Observable<Service> {
    return this.http.get<Service>(`/services/${id}`);
  }

  getByCustomer(customerId: string): Observable<Service[]> {
    return this.http.get<Service[]>(`/services/customer/${customerId}`);
  }

  getExpiring(): Observable<Service[]> {
    return this.http.get<Service[]>('/services/expiring');
  }

  getExpired(): Observable<Service[]> {
    return this.http.get<Service[]>('/services/expired');
  }

  create(dto: CreateServiceDto): Observable<Service> {
    return this.http.post<Service>('/services', dto);
  }

  update(id: string, dto: UpdateServiceDto): Observable<Service> {
    return this.http.patch<Service>(`/services/${id}`, dto);
  }

  cancel(id: string): Observable<void> {
    return this.http.delete<void>(`/services/${id}`);
  }
}
