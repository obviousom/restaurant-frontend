export type Role = "ADMIN" | "MANAGER" | "CHEF" | "CASHIER" | "WAITER";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  CASHIER: "Cashier",
  WAITER: "Waiter",
  CHEF: "Chef",
};

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
}
