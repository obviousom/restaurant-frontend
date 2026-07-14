import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type { CreateRecipeInput, Recipe } from "@/types/recipe";
import type { Paginated } from "@/types/pagination";

export function useRecipes() {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () => (await api.get<Paginated<Recipe>>("/recipes/")).data.results,
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateRecipeInput) => (await api.post<Recipe>("/recipes/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipes"] }),
  });
}
