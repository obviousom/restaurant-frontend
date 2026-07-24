import { formatElapsed } from "@/lib/status";
import { useAdvanceKitchenOrder, useKitchenOrders } from "@/services/kitchenService";
import type { OrderStatus } from "@/types/order";

const COLUMNS: { key: OrderStatus; label: string }[] = [
  { key: "PLACED", label: "Placed" },
  { key: "IN_KITCHEN", label: "In Kitchen" },
  { key: "READY", label: "Ready" },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PLACED: "IN_KITCHEN",
  IN_KITCHEN: "READY",
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  PLACED: "Start Cooking",
  IN_KITCHEN: "Mark Ready",
};

export default function KitchenPage() {
  const { data: orders = [], isLoading } = useKitchenOrders();
  const advance = useAdvanceKitchenOrder();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-primary">Kitchen Display</h2>
        <p className="mt-1 text-sm text-muted-foreground">Live tickets for the kitchen line.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active orders in the kitchen.</p>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {COLUMNS.map((col) => {
            const tickets = orders.filter((o) => o.status === col.key);
            return (
              <div key={col.key}>
                <div className="border-b-2 border-border pb-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {col.label} · {tickets.length}
                </div>
                <div className="mt-3.5 flex flex-col gap-3">
                  {tickets.map((order) => {
                    const next = NEXT_STATUS[order.status];
                    return (
                      <div
                        key={order.id}
                        className="rounded-sm border border-border border-l-4 border-l-accent bg-card p-3.5"
                      >
                        <div className="mb-1 flex justify-between text-[13.5px] font-bold">
                          <span>Table {order.table_number}</span>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {formatElapsed(order.created_at)}
                          </span>
                        </div>
                        <div className="mb-3 text-[12.5px] leading-relaxed text-foreground/80">
                          {order.items.map((it) => `${it.quantity}× ${it.menu_item_name}`).join(", ")}
                        </div>
                        {next && (
                          <button
                            disabled={advance.isPending}
                            onClick={() => advance.mutate({ id: order.id, status: next })}
                            className="w-full rounded-sm bg-primary py-2 text-[12.5px] font-bold text-primary-foreground disabled:opacity-50"
                          >
                            {NEXT_LABEL[order.status]}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
