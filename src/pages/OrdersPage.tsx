import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusBadgeStyle } from "@/lib/status";
import { cn } from "@/lib/utils";
import { useCategories, useMenuItems } from "@/services/menuService";
import { useCreateOrder, useOrders, useSetOrderStatus } from "@/services/ordersService";
import { useTables } from "@/services/tablesService";
import type { Order, OrderStatus } from "@/types/order";

const STATUS_OPTIONS: OrderStatus[] = ["PLACED", "IN_KITCHEN", "READY", "SERVED", "PAID", "CANCELLED"];

interface CartLine {
  menuItemId: number;
  name: string;
  price: string;
  quantity: number;
}

export default function OrdersPage() {
  const { data: tables = [] } = useTables();
  const { data: categories = [] } = useCategories();
  const { data: menuItems = [] } = useMenuItems();
  const { data: orders = [], isLoading } = useOrders();
  const createOrder = useCreateOrder();
  const setStatus = useSetOrderStatus();

  const [tableId, setTableId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);

  const addToCart = (id: number) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return;
    setCart((prev) => {
      const existing = prev.find((line) => line.menuItemId === id);
      if (existing) {
        return prev.map((line) =>
          line.menuItemId === id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...prev, { menuItemId: id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((line) => line.menuItemId !== id));
  };

  const cartTotal = cart.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0);

  const visibleMenuItems = menuItems.filter(
    (m) => m.is_available && (categoryId === null || m.category === categoryId)
  );

  const submitOrder = () => {
    if (!tableId || cart.length === 0) return;
    createOrder.mutate(
      {
        table: tableId,
        items_input: cart.map((line) => ({ menu_item: line.menuItemId, quantity: line.quantity })),
      },
      {
        onSuccess: () => {
          setCart([]);
          setTableId(null);
        },
      }
    );
  };

  const orderTotal = (o: Order) => Number(o.subtotal);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-primary">Orders</h2>
        <p className="mt-1 text-sm text-muted-foreground">Take a new order and track tickets in progress.</p>
      </div>

      <div className="grid grid-cols-[1fr_1.15fr] items-start gap-5">
        <Card className="rounded">
          <CardContent className="p-5">
            <div className="mb-3.5 font-serif text-lg font-semibold">New Order</div>

            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Table</div>
            <div className="mb-4.5 flex flex-wrap gap-2">
              {tables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTableId(t.id)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[12.5px] font-bold",
                    tableId === t.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground"
                  )}
                >
                  T{t.number}
                </button>
              ))}
            </div>

            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Menu</div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoryId(null)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-bold",
                  categoryId === null
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground"
                )}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-bold",
                    categoryId === c.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-muted-foreground"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="mb-4.5 grid max-h-[220px] grid-cols-2 gap-2 overflow-y-auto pr-1">
              {visibleMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item.id)}
                  className="w-full rounded-sm border border-border bg-background p-2.5 text-left"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 border-[1.5px]"
                      style={{ borderColor: item.is_veg ? "#2E7D32" : "#9C3B3B" }}
                    />
                    <div className="text-[12.5px] font-semibold text-foreground">{item.name}</div>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">₹{item.price}</div>
                </button>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="mb-4 rounded-sm border border-border bg-background p-3.5">
                {cart.map((line) => (
                  <div key={line.menuItemId} className="flex items-center justify-between py-1 text-[13px]">
                    <span>
                      {line.quantity} × {line.name}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="text-muted-foreground">
                        ₹{(Number(line.price) * line.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(line.menuItemId)}
                        className="text-xs font-bold text-destructive"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-[15px] font-bold text-foreground">
                  <span>Total</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              disabled={!tableId || cart.length === 0 || createOrder.isPending}
              onClick={submitOrder}
              className="w-full rounded-sm bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {createOrder.isPending ? "Submitting..." : "Submit Order"}
            </button>
          </CardContent>
        </Card>

        <Card className="rounded">
          <CardContent className="p-5">
            <div className="mb-3.5 font-serif text-lg font-semibold">Active Orders</div>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {orders
                  .filter((o) => o.status !== "PAID" && o.status !== "CANCELLED")
                  .map((order) => (
                    <div key={order.id} className="rounded-sm border border-border p-3.5">
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="text-[13.5px] font-bold">
                          Table {order.table_number}{" "}
                          <span className="font-normal text-muted-foreground">· #{order.id}</span>
                        </div>
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                          style={statusBadgeStyle(order.status)}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="mb-2 text-[12.5px] text-muted-foreground">
                        {order.items.map((it) => `${it.quantity}× ${it.menu_item_name}`).join(", ")}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">₹{orderTotal(order).toFixed(2)}</span>
                        <Select
                          onValueChange={(value) =>
                            setStatus.mutate({ id: order.id, status: value as OrderStatus })
                          }
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue placeholder="Change" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
