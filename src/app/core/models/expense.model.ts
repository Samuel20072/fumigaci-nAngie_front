export enum ExpenseCategory {
  GASOLINA = 'GASOLINA',
  VENENOS_QUIMICOS = 'VENENOS_QUIMICOS',
  HERRAMIENTAS_EQUIPOS = 'HERRAMIENTAS_EQUIPOS',
  TRANSPORTE = 'TRANSPORTE',
  PUBLICIDAD = 'PUBLICIDAD',
  OTROS = 'OTROS',
}

export const ExpenseCategoryLabels: Record<ExpenseCategory, { label: string; icon: string; color: string; bg: string }> = {
  [ExpenseCategory.GASOLINA]: {
    label: 'Gasolina Moto',
    icon: '⛽',
    color: '#e05a47',
    bg: '#fdf2f0',
  },
  [ExpenseCategory.VENENOS_QUIMICOS]: {
    label: 'Venenos e Insumos',
    icon: '🧪',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  [ExpenseCategory.HERRAMIENTAS_EQUIPOS]: {
    label: 'Herramientas y Equipos',
    icon: '🔧',
    color: '#0284c7',
    bg: '#f0f9ff',
  },
  [ExpenseCategory.TRANSPORTE]: {
    label: 'Transporte y Pasajes',
    icon: '🛵',
    color: '#d97706',
    bg: '#fffbeb',
  },
  [ExpenseCategory.PUBLICIDAD]: {
    label: 'Publicidad y Volantes',
    icon: '📢',
    color: '#059669',
    bg: '#ecfdf5',
  },
  [ExpenseCategory.OTROS]: {
    label: 'Otros Gastos',
    icon: '📦',
    color: '#4b5563',
    bg: '#f3f4f6',
  },
};

export interface Expense {
  id: string;
  concept: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  isRecurring: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface CreateExpenseDto {
  concept: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  isRecurring?: boolean;
  notes?: string;
}

export interface UpdateExpenseDto {
  concept?: string;
  category?: ExpenseCategory;
  amount?: number;
  expenseDate?: string;
  isRecurring?: boolean;
  notes?: string;
}
