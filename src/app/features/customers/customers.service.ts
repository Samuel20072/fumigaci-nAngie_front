import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '../../core/models/customer.model.js';
import { Service } from '../../core/models/service.model.js';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private http = inject(HttpClient);

  getAll(search?: string, isActive?: boolean): Observable<Customer[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (isActive !== undefined) params = params.set('isActive', String(isActive));
    return this.http.get<Customer[]>('/customers', { params });
  }

  getById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`/customers/${id}`);
  }

  search(query: string): Observable<Customer[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Customer[]>('/customers/search', { params });
  }

  create(dto: CreateCustomerDto): Observable<Customer> {
    return this.http.post<Customer>('/customers', dto);
  }

  update(id: string, dto: UpdateCustomerDto): Observable<Customer> {
    return this.http.patch<Customer>(`/customers/${id}`, dto);
  }

  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`/customers/${id}`);
  }

  getCustomerServices(customerId: string): Observable<Service[]> {
    return this.http.get<Service[]>(`/customers/${customerId}/services`);
  }
}
