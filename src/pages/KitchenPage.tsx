import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdvanceKitchenOrder, useKitchenOrders } from "@/services/kitchenService";
import type { OrderStatus } from "@/types/order";

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
        <h2 className="text-2xl font-bold">Kitchen</h2>
        <p className="text-muted-foreground">Orders awaiting preparation, refreshed automatically.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active orders in the kitchen.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => {
            const next = NEXT_STATUS[order.status];
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Table {order.table_number}</CardTitle>
                    <Badge>{order.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1 text-sm">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity} x {item.menu_item_name}
                      </li>
                    ))}
                  </ul>
                  {next && (
                    <Button
                      className="w-full"
                      disabled={advance.isPending}
                      onClick={() => advance.mutate({ id: order.id, status: next })}
                    >
                      {NEXT_LABEL[order.status]}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
