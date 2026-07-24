import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type { Paginated } from "@/types/pagination";
import type { CreateStaffProfileInput, StaffProfile, StaffUser, UpdateStaffProfileInput } from "@/types/staff";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get<StaffUser[]>("/auth/users/")).data,
  });
}

export function useStaffProfiles() {
  return useQuery({
    queryKey: ["staff-profiles"],
    queryFn: async () => (await api.get<Paginated<StaffProfile>>("/staff/")).data.results,
  });
}

export function useCreateStaffProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateStaffProfileInput) => (await api.post<StaffProfile>("/staff/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-profiles"] }),
  });
}

export function useUpdateStaffProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateStaffProfileInput) =>
      (await api.patch<StaffProfile>(`/staff/${id}/`, input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-profiles"] }),
  });
}

export function useDeleteStaffProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/staff/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-profiles"] }),
  });
}
