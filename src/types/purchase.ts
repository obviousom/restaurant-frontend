export type PurchaseOrderStatus = "PENDING" | "RECEIVED" | "CANCELLED";

export interface PurchaseOrderItem {
  id: number;
  ingredient: number;
  ingredient_name: string;
  quantity: string;
  unit_cost: string;
}

export interface PurchaseOrder {
  id: number;
  supplier: number;
  supplier_name: string;
  status: PurchaseOrderStatus;
  created_by: number | null;
  created_at: string;
  received_at: string | null;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItemInput {
  ingredient: number;
  quantity: string;
  unit_cost: string;
}

export interface CreatePurchaseOrderInput {
  supplier: number;
  items_input: PurchaseOrderItemInput[];
}
