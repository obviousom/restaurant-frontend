import { useState } from "react";

import { Input } from "@/components/ui/input";
import { orderLocationLabel, statusBadgeStyle } from "@/lib/status";

import { useCustomerOrders, useCustomers } from "@/services/customerService";

const inr = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const { data: customers = [], isLoading } = useCustomers(search);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data: history = [], isLoading: historyLoading } = useCustomerOrders(expandedId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-primary">Customers</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone who's ordered — repeat customers, spend, and order history.
        </p>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or phone"
        className="max-w-sm"
      />

      <div className="overflow-hidden rounded border border-border bg-card">
        <div className="grid grid-cols-[1.3fr_1fr_1.6fr_0.7fr_0.9fr_1fr] bg-secondary px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-wide text-primary">
          <span>Name</span>
          <span>Phone</span>
          <span>Address</span>
          <span>Orders</span>
          <span>Total Spent</span>
          <span>Last Order</span>
        </div>
        {isLoading ? (
          <p className="p-5 text-sm text-muted-foreground">Loading...</p>
        ) : customers.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No customers yet.</p>
        ) : (
          customers.map((c) => {
            const expanded = expandedId === c.id;
            return (
              <div key={c.id} className="border-t border-border">
                <button
                  onClick={() => setExpandedId(expanded ? null : c.id)}
                  className="grid w-full grid-cols-[1.3fr_1fr_1.6fr_0.7fr_0.9fr_1fr] items-center px-5 py-3.5 text-left text-[13.5px]"
                >
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-muted-foreground">{c.phone}</span>
                  <span className="truncate text-muted-foreground">{c.address || "—"}</span>
                  <span>{c.order_count}</span>
                  <span className="font-bold text-foreground">₹{inr(Number(c.total_spent))}</span>
                  <span className="text-muted-foreground">{formatDate(c.last_order_at)}</span>
                </button>
                {expanded && (
                  <div className="border-t border-border bg-secondary px-5 py-3.5">
                    {historyLoading ? (
                      <p className="text-sm text-muted-foreground">Loading order history...</p>
                    ) : history.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No orders yet.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {history.map((o) => (
                          <div
                            key={o.id}
                            className="flex items-center justify-between rounded-sm border border-border bg-card px-3.5 py-2.5 text-[12.5px]"
                          >
                            <div>
                              <div className="font-bold text-foreground">
                                {orderLocationLabel(o)} <span className="font-normal text-muted-foreground">· #{o.id}</span>
                              </div>
                              <div className="mt-0.5 text-muted-foreground">
                                {o.items.map((it) => `${it.quantity}× ${it.menu_item_name}`).join(", ")}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">{formatDate(o.created_at)}</span>
                              <span className="font-bold text-foreground">₹{inr(Number(o.subtotal))}</span>
                              <span
                                className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                                style={statusBadgeStyle(o.status)}
                              >
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
