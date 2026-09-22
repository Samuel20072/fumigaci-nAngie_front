import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseCategory,
} from '../../core/models/expense.model.js';
import { MonthlyFinancesReport } from '../../core/models/finances.model.js';

@Injectable({
  providedIn: 'root',
})
export class FinancesService {
  private http = inject(HttpClient);

  getMonthlySummary(month?: string): Observable<MonthlyFinancesReport> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    return this.http.get<MonthlyFinancesReport>('/finances/monthly-summary', { params });
  }

  getExpenses(month?: string, category?: ExpenseCategory): Observable<Expense[]> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (category) params = params.set('category', category);
    return this.http.get<Expense[]>('/expenses', { params });
  }

  createExpense(dto: CreateExpenseDto): Observable<Expense> {
    return this.http.post<Expense>('/expenses', dto);
  }

  updateExpense(id: string, dto: UpdateExpenseDto): Observable<Expense> {
    return this.http.patch<Expense>(`/expenses/${id}`, dto);
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`/expenses/${id}`);
  }
}
