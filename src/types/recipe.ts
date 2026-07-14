export interface RecipeIngredient {
  id: number;
  ingredient: number;
  ingredient_name: string;
  unit: string;
  quantity: string;
}

export interface Recipe {
  id: number;
  menu_item: number;
  menu_item_name: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredientInput {
  ingredient: number;
  quantity: string;
}

export interface CreateRecipeInput {
  menu_item: number;
  ingredients_input: RecipeIngredientInput[];
}
