import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBills, useGenerateBill, usePayBill } from "@/services/billingService";
import { useOrders } from "@/services/ordersService";

export default function BillingPage() {
  const { data: orders = [] } = useOrders();
  const { data: bills = [], isLoading } = useBills();
  const generateBill = useGenerateBill();
  const payBill = usePayBill();

  const billableOrders = orders.filter((o) => o.status === "SERVED");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Billing</h2>
        <p className="text-muted-foreground">Generate bills for served orders and record payment.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ready to Bill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {billableOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No served orders awaiting a bill.</p>
          ) : (
            billableOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span>
                  Order #{order.id} — Table {order.table_number} — ${Number(order.subtotal).toFixed(2)}
                </span>
                <Button
                  size="sm"
                  disabled={generateBill.isPending}
                  onClick={() => generateBill.mutate(order.id)}
                >
                  Generate Bill
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            bills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div>
                  <div>
                    Bill #{bill.id} — Order #{bill.order_id} — Table {bill.table_number}
                  </div>
                  <div className="text-muted-foreground">
                    Subtotal ${bill.subtotal} + Tax ${bill.tax} = <strong>${bill.total}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={bill.paid_at ? "success" : "warning"}>
                    {bill.paid_at ? "Paid" : "Unpaid"}
                  </Badge>
                  {bill.pdf_url && (
                    <a href={bill.pdf_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        Download PDF
                      </Button>
                    </a>
                  )}
                  {!bill.paid_at && (
                    <Button size="sm" disabled={payBill.isPending} onClick={() => payBill.mutate(bill.id)}>
                      Mark Paid
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
