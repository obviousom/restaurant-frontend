import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const recipeItemIds = new Set(recipes.map((r) => r.menu_item));
  const availableMenuItems = menuItems.filter((m) => !recipeItemIds.has(m.id));

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
        <h2 className="text-2xl font-bold">Recipes</h2>
        <p className="text-muted-foreground">
          Map each menu item to the ingredients it consumes, so serving an order deducts stock automatically.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Recipe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <Button variant="outline" className="w-full" onClick={addLine}>
              Add Ingredient
            </Button>

            {lines.length > 0 && (
              <div className="space-y-1 rounded-md border p-3 text-sm">
                {lines.map((l, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{l.name}</span>
                    <span>{l.quantity}</span>
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full" disabled={createRecipe.isPending} onClick={submit}>
              Save Recipe
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Recipes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recipes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recipes yet.</p>
            ) : (
              recipes.map((recipe) => (
                <div key={recipe.id} className="rounded-md border p-3 text-sm">
                  <div className="font-medium">{recipe.menu_item_name}</div>
                  <ul className="mt-1 text-muted-foreground">
                    {recipe.ingredients.map((ri) => (
                      <li key={ri.id}>
                        {ri.quantity} {ri.unit} of {ri.ingredient_name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
