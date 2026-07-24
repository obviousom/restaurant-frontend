export interface CategoryTotal {
  category_name: string;
  quantity: number;
  amount: number;
}

export interface ItemTotal {
  item_name: string;
  category_name: string | null;
  quantity: number;
  amount: number;
}

export interface MoverItem {
  item_name: string;
  quantity: number;
  previous_quantity: number;
  pct_change: number;
}

export interface SalesSummary {
  month: string;
  available_months: string[];
  total_quantity: number;
  total_revenue: number;
  veg: { quantity: number; amount: number };
  nonveg: { quantity: number; amount: number };
  unmatched: { quantity: number; amount: number };
  by_category: CategoryTotal[];
  top_by_quantity: ItemTotal[];
  top_by_revenue: ItemTotal[];
  movers: {
    previous_month: string | null;
    increased: MoverItem[];
    decreased: MoverItem[];
  };
}

export interface TrendPoint {
  month: string;
  quantity: number;
  amount: number;
}

export interface MonthlyTotal {
  month: string;
  total_quantity: number;
  total_revenue: number;
}
