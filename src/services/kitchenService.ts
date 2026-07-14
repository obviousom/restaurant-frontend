import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type { Order, OrderStatus } from "@/types/order";
import type { Paginated } from "@/types/pagination";

export function useKitchenOrders() {
  return useQuery({
    queryKey: ["kitchen-orders"],
    queryFn: async () => (await api.get<Paginated<Order>>("/kitchen/")).data.results,
    refetchInterval: 4000,
  });
}

export function useAdvanceKitchenOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) =>
      (await api.post<Order>(`/kitchen/${id}/advance/`, { status })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-orders"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
