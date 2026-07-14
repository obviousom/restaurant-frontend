import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type { Supplier } from "@/types/supplier";
import type { Paginated } from "@/types/pagination";

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => (await api.get<Paginated<Supplier>>("/suppliers/")).data.results,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Supplier, "id">) => (await api.post<Supplier>("/suppliers/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}
