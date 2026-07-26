import type { Role } from "@/types/auth";

export interface NavItem {
  label: string;
  path: string;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", roles: ["ADMIN"] },
  { label: "Expenses", path: "/expenses", roles: ["ADMIN"] },
  { label: "P&L Report", path: "/pnl", roles: ["ADMIN"] },
  { label: "Staff & Salary", path: "/staff", roles: ["ADMIN"] },
  { label: "Sales Analytics", path: "/analytics", roles: ["ADMIN"] },
  { label: "Orders", path: "/orders", roles: ["ADMIN", "MANAGER", "CASHIER", "WAITER"] },
  { label: "Kitchen", path: "/kitchen", roles: ["ADMIN", "MANAGER", "CHEF"] },
  { label: "Billing", path: "/billing", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { label: "Customers", path: "/customers", roles: ["ADMIN", "MANAGER"] },
  { label: "Menu", path: "/menu", roles: ["ADMIN", "MANAGER"] },
  { label: "Inventory", path: "/inventory", roles: ["ADMIN", "MANAGER", "CHEF"] },
  { label: "Suppliers", path: "/suppliers", roles: ["ADMIN", "MANAGER"] },
  { label: "Purchases", path: "/purchases", roles: ["ADMIN", "MANAGER"] },
  { label: "Recipes", path: "/recipes", roles: ["ADMIN", "MANAGER"] },
];

export function firstAllowedPath(role: Role): string {
  const item = NAV_ITEMS.find((n) => n.roles.includes(role));
  return item ? item.path : "/login";
}
