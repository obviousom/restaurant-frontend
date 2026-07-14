import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type { CreatePurchaseOrderInput, PurchaseOrder } from "@/types/purchase";
import type { Paginated } from "@/types/pagination";

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => (await api.get<Paginated<PurchaseOrder>>("/purchases/")).data.results,
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePurchaseOrderInput) =>
      (await api.post<PurchaseOrder>("/purchases/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });
}

export function useReceivePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api.post<PurchaseOrder>(`/purchases/${id}/receive/`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
      qc.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}
