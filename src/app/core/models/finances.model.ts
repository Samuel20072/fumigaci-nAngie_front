import { ExpenseCategory } from './expense.model.js';

export interface CategoryExpenseBreakdown {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyFinancesReport {
  month: string;
  totalIncome: number;
  completedServicesCount: number;
  totalExpenses: number;
  expensesCount: number;
  netProfit: number;
  recurringExpensesTotal: number;
  categoryBreakdown: CategoryExpenseBreakdown[];
}
