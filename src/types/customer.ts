export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  created_at: string;
  order_count: number;
  total_spent: string;
  last_order_at: string | null;
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  address: string;
}
