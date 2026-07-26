export type OrderStatus = "PLACED" | "IN_KITCHEN" | "READY" | "SERVED" | "PAID" | "CANCELLED";
export type OrderType = "DINE_IN" | "DELIVERY";

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
  table: number | null;
  table_number: number | null;
  order_type: OrderType;
  customer: number | null;
  customer_name: string | null;
  delivery_address: string;
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
  order_type?: OrderType;
  table?: number;
  customer?: number;
  delivery_address?: string;
  items_input: OrderItemInput[];
}
