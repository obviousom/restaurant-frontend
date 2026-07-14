import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMenuItems } from "@/services/menuService";
import { useCreateOrder, useOrders, useSetOrderStatus } from "@/services/ordersService";
import { useTables } from "@/services/tablesService";
import type { OrderStatus } from "@/types/order";

const STATUS_OPTIONS: OrderStatus[] = ["PLACED", "IN_KITCHEN", "READY", "SERVED", "PAID", "CANCELLED"];

const STATUS_VARIANT: Record<OrderStatus, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PLACED: "secondary",
  IN_KITCHEN: "warning",
  READY: "warning",
  SERVED: "default",
  PAID: "success",
  CANCELLED: "destructive",
};

interface CartLine {
  menuItemId: number;
  name: string;
  price: string;
  quantity: number;
}

export default function OrdersPage() {
  const { data: tables = [] } = useTables();
  const { data: menuItems = [] } = useMenuItems();
  const { data: orders = [], isLoading } = useOrders();
  const createOrder = useCreateOrder();
  const setStatus = useSetOrderStatus();

  const [tableId, setTableId] = useState("");
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

  const submitOrder = () => {
    if (!tableId || cart.length === 0) return;
    createOrder.mutate(
      {
        table: Number(tableId),
        items_input: cart.map((line) => ({ menu_item: line.menuItemId, quantity: line.quantity })),
      },
      {
        onSuccess: () => {
          setCart([]);
          setTableId("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Orders</h2>
        <p className="text-muted-foreground">Take a new order and track existing ones.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Table</label>
              <Select value={tableId} onValueChange={setTableId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      Table {t.number} ({t.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Menu</label>
              <div className="grid grid-cols-2 gap-2">
                {menuItems
                  .filter((m) => m.is_available)
                  .map((item) => (
                    <Button key={item.id} variant="outline" size="sm" onClick={() => addToCart(item.id)}>
                      {item.name} — ${item.price}
                    </Button>
                  ))}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="space-y-2 rounded-md border p-3">
                {cart.map((line) => (
                  <div key={line.menuItemId} className="flex items-center justify-between text-sm">
                    <span>
                      {line.quantity} x {line.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>${(Number(line.price) * line.quantity).toFixed(2)}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeFromCart(line.menuItemId)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 text-sm font-semibold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!tableId || cart.length === 0 || createOrder.isPending}
              onClick={submitOrder}
            >
              {createOrder.isPending ? "Submitting..." : "Submit Order"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>Table {order.table_number}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>${Number(order.subtotal).toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          onValueChange={(value) =>
                            setStatus.mutate({ id: order.id, status: value as OrderStatus })
                          }
                        >
                          <SelectTrigger className="h-8 w-32">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
