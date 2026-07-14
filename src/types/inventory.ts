export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  quantity_in_stock: string;
  low_stock_threshold: string;
  is_low_stock: boolean;
}

export interface StockMovement {
  id: number;
  ingredient: number;
  ingredient_name: string;
  change_type: "PURCHASE" | "CONSUMPTION" | "ADJUSTMENT";
  quantity: string;
  reference: string;
  created_at: string;
}
