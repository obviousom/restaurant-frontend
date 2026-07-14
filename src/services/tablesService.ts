import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type { Table, TableStatus } from "@/types/table";
import type { Paginated } from "@/types/pagination";

export function useTables() {
  return useQuery({
    queryKey: ["tables"],
    queryFn: async () => (await api.get<Paginated<Table>>("/tables/")).data.results,
    refetchInterval: 8000,
  });
}

export function useSetTableStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: TableStatus }) =>
      (await api.post<Table>(`/tables/${id}/set-status/`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
  });
}
