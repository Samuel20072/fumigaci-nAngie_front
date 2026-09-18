import { Service } from './service.model.js';

export interface DashboardSummary {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  totalServices: number;
  fumigationCount: number;
  repasoCount: number;
  expiringCount: number;
  expiredCount: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentServices: Service[];
  expiringServices: Service[];
}
