import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import type { MonthlyTotal, SalesSummary, TrendPoint } from "@/types/analytics";

export function useSalesMonths() {
  return useQuery({
    queryKey: ["sales-months"],
    queryFn: async () => (await api.get<string[]>("/analytics/sales/months/")).data,
  });
}

export function useMonthlyTotals() {
  return useQuery({
    queryKey: ["sales-monthly-totals"],
    queryFn: async () => (await api.get<MonthlyTotal[]>("/analytics/sales/monthly-totals/")).data,
  });
}

export function useSalesSummary(month?: string) {
  return useQuery({
    queryKey: ["sales-summary", month ?? "latest"],
    queryFn: async () =>
      (await api.get<SalesSummary>("/analytics/sales/summary/", { params: month ? { month } : undefined })).data,
  });
}

export function useItemTrend(itemName: string | null) {
  return useQuery({
    queryKey: ["sales-trend", itemName],
    queryFn: async () =>
      (await api.get<TrendPoint[]>("/analytics/sales/trend/", { params: { item_name: itemName } })).data,
    enabled: !!itemName,
  });
}
