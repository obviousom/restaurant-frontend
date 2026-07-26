export interface Bill {
  id: number;
  order_id: number;
  table_number: number | null;
  location_label: string;
  customer_name: string | null;
  subtotal: string;
  tax: string;
  total: string;
  pdf_url: string | null;
  paid_at: string | null;
  created_at: string;
}
