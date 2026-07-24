import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIngredients } from "@/services/inventoryService";
import { useMenuItems } from "@/services/menuService";
import { useCreateRecipe, useRecipes } from "@/services/recipesService";

interface Line {
  ingredientId: number;
  name: string;
  quantity: string;
}

export default function RecipesPage() {
  const { data: menuItems = [] } = useMenuItems();
  const { data: ingredients = [] } = useIngredients();
  const { data: recipes = [], isLoading } = useRecipes();
  const createRecipe = useCreateRecipe();

  const [menuItemId, setMenuItemId] = useState("");
  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const recipeItemIds = new Set(recipes.map((r) => r.menu_item));
  const availableMenuItems = menuItems.filter((m) => !recipeItemIds.has(m.id));

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addLine = () => {
    if (!ingredientId || !quantity) return;
    const ingredient = ingredients.find((i) => i.id === Number(ingredientId));
    if (!ingredient) return;
    setLines((prev) => [...prev, { ingredientId: ingredient.id, name: ingredient.name, quantity }]);
    setIngredientId("");
    setQuantity("");
  };

  const submit = () => {
    if (!menuItemId || lines.length === 0) return;
    createRecipe.mutate(
      {
        menu_item: Number(menuItemId),
        ingredients_input: lines.map((l) => ({ ingredient: l.ingredientId, quantity: l.quantity })),
      },
      {
        onSuccess: () => {
          setLines([]);
          setMenuItemId("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-primary">Recipes</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ingredient mapping for each dish.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="rounded">
          <CardContent className="space-y-3.5 p-5">
            <div className="font-serif text-lg font-semibold">New Recipe</div>
            <Select value={menuItemId} onValueChange={setMenuItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a menu item" />
              </SelectTrigger>
              <SelectContent>
                {availableMenuItems.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-2">
              <Select value={ingredientId} onValueChange={setIngredientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Ingredient" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.name} ({i.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <button
              onClick={addLine}
              className="w-full rounded-sm border border-border py-2.5 text-sm font-bold text-foreground"
            >
              Add Ingredient
            </button>

            {lines.length > 0 && (
              <div className="space-y-1 rounded-sm border border-border p-3 text-sm">
                {lines.map((l, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{l.name}</span>
                    <span className="text-muted-foreground">{l.quantity}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              disabled={createRecipe.isPending || !menuItemId || lines.length === 0}
              onClick={submit}
              className="w-full rounded-sm bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              Save Recipe
            </button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2.5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : recipes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recipes yet.</p>
          ) : (
            recipes.map((recipe) => {
              const expanded = expandedIds.has(recipe.id);
              return (
                <div key={recipe.id} className="overflow-hidden rounded border border-border bg-card">
                  <button
                    onClick={() => toggleExpanded(recipe.id)}
                    className="flex w-full items-center justify-between px-4.5 py-3.5 text-left"
                  >
                    <span className="text-[14.5px] font-bold text-foreground">{recipe.menu_item_name}</span>
                    <span className="text-[13px] text-muted-foreground">
                      {expanded ? "Hide ingredients ▲" : "View ingredients ▼"}
                    </span>
                  </button>
                  {expanded && (
                    <div className="flex flex-wrap gap-2 px-4.5 pb-4">
                      {recipe.ingredients.map((ri) => (
                        <div
                          key={ri.id}
                          className="rounded-full border border-border bg-background px-3 py-1.5 text-[12.5px] text-foreground/80"
                        >
                          {ri.ingredient_name} · {ri.quantity} {ri.unit}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
