export type OrderStatus = "PLACED" | "IN_KITCHEN" | "READY" | "SERVED" | "PAID" | "CANCELLED";

export interface OrderItem {
  id: number;
  menu_item: number;
  menu_item_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface Order {
  id: number;
  table: number;
  table_number: number;
  status: OrderStatus;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  subtotal: string | number;
}

export interface OrderItemInput {
  menu_item: number;
  quantity: number;
}

export interface CreateOrderInput {
  table: number;
  items_input: OrderItemInput[];
}
