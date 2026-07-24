import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type { Ingredient, StockMovement } from "@/types/inventory";
import type { Paginated } from "@/types/pagination";

export function useIngredients() {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => (await api.get<Paginated<Ingredient>>("/inventory/ingredients/")).data.results,
  });
}

export function useLowStockIngredients() {
  return useQuery({
    queryKey: ["ingredients", "low-stock"],
    queryFn: async () => (await api.get<Ingredient[]>("/inventory/ingredients/low-stock/")).data,
  });
}

export function useStockMovements() {
  return useQuery({
    queryKey: ["stock-movements"],
    queryFn: async () => (await api.get<Paginated<StockMovement>>("/inventory/movements/")).data.results,
  });
}

interface IngredientInput {
  name: string;
  unit: string;
  quantity_in_stock: string;
  low_stock_threshold: string;
}

export function useCreateIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: IngredientInput) =>
      (await api.post<Ingredient>("/inventory/ingredients/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ingredients"] }),
  });
}

export function useDeleteIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/inventory/ingredients/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ingredients"] }),
  });
}
