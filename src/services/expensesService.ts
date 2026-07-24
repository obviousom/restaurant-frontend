import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type {
  CreateExpenseInput,
  CreateRecurringExpenseInput,
  Expense,
  ExpenseCategory,
  LogRecurringPaymentResult,
  MonthlySummary,
  RecurringExpense,
} from "@/types/expenses";
import type { Paginated } from "@/types/pagination";

export function useExpenseCategories() {
  return useQuery({
    queryKey: ["expense-categories"],
    queryFn: async () => (await api.get<Paginated<ExpenseCategory>>("/expenses/categories/")).data.results,
  });
}

export function useCreateExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => (await api.post<ExpenseCategory>("/expenses/categories/", { name })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expense-categories"] }),
  });
}

export function useDeleteExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/expenses/categories/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expense-categories"] }),
  });
}

export function useExpenses(date?: string) {
  return useQuery({
    queryKey: ["expenses", date ?? "all"],
    queryFn: async () =>
      (await api.get<Paginated<Expense>>("/expenses/", { params: date ? { date } : undefined })).data.results,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => (await api.post<Expense>("/expenses/", input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["expenses-summary"] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/expenses/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["expenses-summary"] });
    },
  });
}

export function useMonthlySummary(month: string) {
  return useQuery({
    queryKey: ["expenses-summary", month],
    queryFn: async () =>
      (await api.get<MonthlySummary>("/expenses/summary/", { params: { month } })).data,
  });
}

export function useRecurringExpenses() {
  return useQuery({
    queryKey: ["recurring-expenses"],
    queryFn: async () =>
      (await api.get<Paginated<RecurringExpense>>("/expenses/recurring/")).data.results,
  });
}

export function useCreateRecurringExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateRecurringExpenseInput) =>
      (await api.post<RecurringExpense>("/expenses/recurring/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recurring-expenses"] }),
  });
}

export function useUpdateRecurringExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<CreateRecurringExpenseInput> & { id: number; is_active?: boolean }) =>
      (await api.patch<RecurringExpense>(`/expenses/recurring/${id}/`, input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recurring-expenses"] }),
  });
}

export function useDeleteRecurringExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/expenses/recurring/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recurring-expenses"] }),
  });
}

export function useLogRecurringPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      (await api.post<LogRecurringPaymentResult>(`/expenses/recurring/${id}/log-payment/`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring-expenses"] });
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["expenses-summary"] });
    },
  });
}
