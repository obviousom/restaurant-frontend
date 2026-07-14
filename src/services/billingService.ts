import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type { Bill } from "@/types/billing";
import type { Paginated } from "@/types/pagination";

export function useBills() {
  return useQuery({
    queryKey: ["bills"],
    queryFn: async () => (await api.get<Paginated<Bill>>("/billing/")).data.results,
  });
}

export function useGenerateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: number) =>
      (await api.post<Bill>("/billing/generate/", { order: orderId })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bills"] }),
  });
}

export function usePayBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (billId: number) => (await api.post<Bill>(`/billing/${billId}/pay/`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
