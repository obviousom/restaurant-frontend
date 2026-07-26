import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderLocationLabel, statusBadgeStyle } from "@/lib/status";
import { cn, getApiErrorMessage } from "@/lib/utils";
import { useCreateCustomer, useCustomers } from "@/services/customerService";
import { useCategories, useMenuItems } from "@/services/menuService";
import { useCreateOrder, useOrders, useSetOrderStatus } from "@/services/ordersService";
import { useTables } from "@/services/tablesService";
import type { Order, OrderStatus, OrderType } from "@/types/order";

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
  const createCustomer = useCreateCustomer();

  const [orderType, setOrderType] = useState<OrderType>("DINE_IN");
  const [deliveryStep, setDeliveryStep] = useState<"items" | "customer">("items");
  const [tableId, setTableId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [attachCustomerOpen, setAttachCustomerOpen] = useState(false);

  const { data: customerMatches = [] } = useCustomers(customerPhone.trim() || customerName.trim());

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

  const resetOrderForm = () => {
    setCart([]);
    setTableId(null);
    setOrderType("DINE_IN");
    setDeliveryStep("items");
    setCustomerName("");
    setCustomerPhone("");
    setDeliveryAddress("");
    setSelectedCustomerId(null);
    setAttachCustomerOpen(false);
  };

  const selectCustomerMatch = (c: { id: number; name: string; phone: string; address: string }) => {
    setSelectedCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setDeliveryAddress(c.address);
  };

  const onNameChange = (value: string) => {
    setCustomerName(value);
    setSelectedCustomerId(null);
  };
  const onPhoneChange = (value: string) => {
    setCustomerPhone(value);
    setSelectedCustomerId(null);
  };

  // Finds-or-creates a customer from the name/phone fields. Returns null when there's
  // nothing to resolve (dine-in with the optional "attach customer" section left blank).
  const resolveCustomerId = async (): Promise<number | null> => {
    if (!customerName.trim() || !customerPhone.trim()) return null;
    if (selectedCustomerId) return selectedCustomerId;
    const customer = await createCustomer.mutateAsync({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      address: deliveryAddress.trim(),
    });
    return customer.id;
  };

  const submitDineInOrder = async () => {
    if (!tableId || cart.length === 0) return;
    setErrorMsg("");
    try {
      const customerId = attachCustomerOpen ? await resolveCustomerId() : null;
      createOrder.mutate(
        {
          order_type: "DINE_IN",
          table: tableId,
          customer: customerId ?? undefined,
          items_input: cart.map((line) => ({ menu_item: line.menuItemId, quantity: line.quantity })),
        },
        { onSuccess: resetOrderForm, onError: (err) => setErrorMsg(getApiErrorMessage(err)) }
      );
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    }
  };

  const submitDeliveryOrder = async () => {
    if (cart.length === 0 || !customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) return;
    setErrorMsg("");
    try {
      const customerId = await resolveCustomerId();
      createOrder.mutate(
        {
          order_type: "DELIVERY",
          customer: customerId!,
          delivery_address: deliveryAddress.trim(),
          items_input: cart.map((line) => ({ menu_item: line.menuItemId, quantity: line.quantity })),
        },
        { onSuccess: resetOrderForm, onError: (err) => setErrorMsg(getApiErrorMessage(err)) }
      );
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    }
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

            {errorMsg && (
              <div className="mb-3.5 rounded-sm border border-destructive bg-destructive-subtle px-3.5 py-2 text-xs text-destructive">
                {errorMsg}
              </div>
            )}

            <div className="mb-4.5 flex gap-2">
              {(["DINE_IN", "DELIVERY"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setOrderType(t);
                    setDeliveryStep("items");
                  }}
                  className={cn(
                    "flex-1 rounded-sm border py-2 text-xs font-bold",
                    orderType === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {t === "DINE_IN" ? "Dine-in" : "Delivery"}
                </button>
              ))}
            </div>

            {orderType === "DELIVERY" && deliveryStep === "customer" ? (
              <>
                <div className="mb-3.5 rounded-sm border border-border bg-background p-3">
                  <div className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Order ({cart.length} item{cart.length === 1 ? "" : "s"})
                  </div>
                  {cart.map((line) => (
                    <div key={line.menuItemId} className="flex justify-between text-[12.5px] text-foreground/80">
                      <span>
                        {line.quantity} × {line.name}
                      </span>
                      <span>₹{(Number(line.price) * line.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="mt-1.5 flex justify-between border-t border-border pt-1.5 text-[13px] font-bold">
                    <span>Total</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Customer Details
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      value={customerName}
                      onChange={(e) => onNameChange(e.target.value)}
                      placeholder="Customer name"
                    />
                    {!selectedCustomerId && customerName.trim() && customerMatches.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full max-h-32 overflow-y-auto rounded-sm border border-border bg-card shadow-md">
                        {customerMatches.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => selectCustomerMatch(c)}
                            className="block w-full border-b border-border px-3 py-2 text-left text-[12.5px] last:border-b-0 hover:bg-secondary"
                          >
                            <span className="font-semibold">{c.name}</span>{" "}
                            <span className="text-muted-foreground">· {c.phone}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input
                    value={customerPhone}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    placeholder="Phone number"
                  />
                  {selectedCustomerId && (
                    <div className="text-[11.5px] font-semibold text-success">
                      Matched existing customer · editing will create a new one instead
                    </div>
                  )}
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Delivery address"
                    rows={2}
                    className="w-full rounded-sm border border-border bg-background p-2 text-[13px] text-foreground"
                  />
                </div>

                <div className="mt-4.5 flex gap-2">
                  <button
                    onClick={() => setDeliveryStep("items")}
                    className="flex-1 rounded-sm border border-border py-3 text-sm font-bold text-muted-foreground"
                  >
                    ← Back
                  </button>
                  <button
                    disabled={
                      !customerName.trim() ||
                      !customerPhone.trim() ||
                      !deliveryAddress.trim() ||
                      createOrder.isPending ||
                      createCustomer.isPending
                    }
                    onClick={submitDeliveryOrder}
                    className="flex-1 rounded-sm bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
                  >
                    {createOrder.isPending || createCustomer.isPending ? "Submitting..." : "Submit Order"}
                  </button>
                </div>
              </>
            ) : (
              <>
                {orderType === "DINE_IN" && (
                  <>
                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Table
                    </div>
                    <div className="mb-2.5 flex flex-wrap gap-2">
                      {tables.map((t) => {
                        const selected = tableId === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setTableId(t.id)}
                            title={t.status === "FREE" ? "Free" : t.status === "OCCUPIED" ? "Occupied" : "Reserved"}
                            className={cn(
                              "flex flex-col items-center rounded-sm border px-3.5 py-2 text-[12.5px] font-bold leading-tight",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : t.status === "OCCUPIED"
                                  ? "border-destructive bg-destructive-subtle text-destructive"
                                  : t.status === "RESERVED"
                                    ? "border-warning bg-warning-subtle text-warning"
                                    : "border-success bg-success-subtle text-success"
                            )}
                          >
                            T{t.number}
                            <span
                              className={cn(
                                "text-[9px] font-semibold uppercase",
                                !selected && "opacity-70"
                              )}
                            >
                              {t.status === "FREE" ? "Free" : t.status === "OCCUPIED" ? "Occupied" : "Reserved"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mb-4 text-[11px] text-muted-foreground">
                      Occupied tables are still selectable — use this to add another round to a table already
                      seated.
                    </div>
                  </>
                )}

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

                {orderType === "DINE_IN" ? (
                  <>
                    {!attachCustomerOpen ? (
                      <button
                        onClick={() => setAttachCustomerOpen(true)}
                        className="mb-4 text-xs font-bold text-primary"
                      >
                        + Attach customer (optional)
                      </button>
                    ) : (
                      <div className="mb-4 space-y-2 rounded-sm border border-border bg-background p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            Customer (optional)
                          </div>
                          <button
                            onClick={() => {
                              setAttachCustomerOpen(false);
                              setCustomerName("");
                              setCustomerPhone("");
                              setSelectedCustomerId(null);
                            }}
                            className="text-[11px] font-bold text-muted-foreground"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="relative">
                          <Input
                            value={customerName}
                            onChange={(e) => onNameChange(e.target.value)}
                            placeholder="Customer name"
                          />
                          {!selectedCustomerId && customerName.trim() && customerMatches.length > 0 && (
                            <div className="absolute z-10 mt-1 max-h-32 w-full overflow-y-auto rounded-sm border border-border bg-card shadow-md">
                              {customerMatches.map((c) => (
                                <button
                                  key={c.id}
                                  onClick={() => selectCustomerMatch(c)}
                                  className="block w-full border-b border-border px-3 py-2 text-left text-[12.5px] last:border-b-0 hover:bg-secondary"
                                >
                                  <span className="font-semibold">{c.name}</span>{" "}
                                  <span className="text-muted-foreground">· {c.phone}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <Input
                          value={customerPhone}
                          onChange={(e) => onPhoneChange(e.target.value)}
                          placeholder="Phone number"
                        />
                        {selectedCustomerId && (
                          <div className="text-[11.5px] font-semibold text-success">Matched existing customer</div>
                        )}
                      </div>
                    )}
                    <button
                      disabled={!tableId || cart.length === 0 || createOrder.isPending || createCustomer.isPending}
                      onClick={submitDineInOrder}
                      className="w-full rounded-sm bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
                    >
                      {createOrder.isPending || createCustomer.isPending ? "Submitting..." : "Submit Order"}
                    </button>
                  </>
                ) : (
                  <button
                    disabled={cart.length === 0}
                    onClick={() => setDeliveryStep("customer")}
                    className="w-full rounded-sm bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
                  >
                    Next: Customer Details →
                  </button>
                )}
              </>
            )}
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
                          {orderLocationLabel(order)}{" "}
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
