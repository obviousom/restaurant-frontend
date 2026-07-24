export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  category: number;
  category_name: string;
  description: string;
  amount: string;
  date: string;
  created_by: number | null;
  created_by_username: string | null;
  created_at: string;
}

export interface CreateExpenseInput {
  category: number;
  description: string;
  amount: string;
  date: string;
}

export interface ExpenseCategoryTotal {
  category_id: number;
  category_name: string;
  total: string;
}

export interface MonthlySummary {
  month: string;
  revenue: string;
  total_expenses: string;
  profit: string;
  by_category: ExpenseCategoryTotal[];
}

export type RecurringFrequency = "MONTHLY" | "QUARTERLY";

export interface RecurringExpense {
  id: number;
  category: number;
  category_name: string;
  description: string;
  amount: string;
  frequency: RecurringFrequency;
  next_due_date: string;
  is_active: boolean;
  is_overdue: boolean;
  created_at: string;
}

export interface CreateRecurringExpenseInput {
  category: number;
  description: string;
  amount: string;
  frequency: RecurringFrequency;
  next_due_date: string;
}

export interface LogRecurringPaymentResult {
  expense: Expense;
  recurring: RecurringExpense;
}
