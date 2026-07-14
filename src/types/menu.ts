export interface Category {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  category: number;
  category_name: string;
  name: string;
  description: string;
  price: string;
  is_available: boolean;
}
