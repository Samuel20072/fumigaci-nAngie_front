import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { DashboardSummary, DashboardData } from '../../core/models/dashboard.model.js';
import { Service } from '../../core/models/service.model.js';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>('/dashboard/summary');
  }

  getRecentServices(): Observable<Service[]> {
    return this.http.get<Service[]>('/dashboard/recent-services');
  }

  getExpiringCustomers(): Observable<Service[]> {
    return this.http.get<Service[]>('/dashboard/expiring-customers');
  }

  loadDashboard(): Observable<DashboardData> {
    return forkJoin({
      summary: this.getSummary(),
      recentServices: this.getRecentServices(),
      expiringServices: this.getExpiringCustomers(),
    });
  }
}
