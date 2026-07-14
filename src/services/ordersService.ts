import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type { CreateOrderInput, Order, OrderStatus } from "@/types/order";
import type { Paginated } from "@/types/pagination";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get<Paginated<Order>>("/orders/")).data.results,
    refetchInterval: 5000,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => (await api.post<Order>("/orders/", input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}

export function useSetOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) =>
      (await api.post<Order>(`/orders/${id}/set-status/`, { status })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["kitchen-orders"] });
    },
  });
}
