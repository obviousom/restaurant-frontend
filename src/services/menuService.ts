import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type { Category, MenuItem } from "@/types/menu";
import type { Paginated } from "@/types/pagination";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<Paginated<Category>>("/menu/categories/")).data.results,
  });
}

export function useMenuItems() {
  return useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => (await api.get<Paginated<MenuItem>>("/menu/items/")).data.results,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => (await api.post<Category>("/menu/categories/", { name })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

interface MenuItemInput {
  category: number;
  name: string;
  description?: string;
  price: string;
  is_available?: boolean;
  is_veg?: boolean;
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: MenuItemInput) => (await api.post<MenuItem>("/menu/items/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items"] }),
  });
}

export function useUpdateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<MenuItemInput> & { id: number }) =>
      (await api.patch<MenuItem>(`/menu/items/${id}/`, input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items"] }),
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/menu/items/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.delete(`/menu/categories/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
