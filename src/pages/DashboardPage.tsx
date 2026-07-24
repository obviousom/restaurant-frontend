import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useMonthlyTotals, useSalesSummary } from "@/services/analyticsService";
import { useBills } from "@/services/billingService";
import { useExpenses } from "@/services/expensesService";
import { useOrders } from "@/services/ordersService";
import { ROLE_LABELS } from "@/types/auth";

const inr = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
const today = () => new Date().toISOString().slice(0, 10);

function formatMonthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[m - 1]} '${String(y).slice(2)}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const roleLabel = user ? ROLE_LABELS[user.role] : "";
  const todayDate = today();

  const { data: orders = [] } = useOrders();
  const { data: bills = [] } = useBills();
  const { data: expensesToday = [] } = useExpenses(todayDate);
  const { data: monthlyTotals = [] } = useMonthlyTotals();
  const { data: salesSummary } = useSalesSummary();

  const ordersToday = orders.filter((o) => o.created_at.slice(0, 10) === todayDate);
  const revenueToday = bills
    .filter((b) => b.paid_at && b.paid_at.slice(0, 10) === todayDate)
    .reduce((sum, b) => sum + Number(b.total), 0);
  const expensesTotalToday = expensesToday.reduce((sum, e) => sum + Number(e.amount), 0);
  const avgOrderValue = ordersToday.length > 0 ? revenueToday / ordersToday.length : 0;
  const dailyBusinessTotal = revenueToday - expensesTotalToday;

  const kpis = [
    { label: "Today's Revenue", value: `₹${inr(revenueToday)}` },
    { label: "Orders Today", value: String(ordersToday.length) },
    { label: "Avg Order Value", value: `₹${inr(avgOrderValue)}` },
    { label: "Daily Business Total", value: `₹${inr(dailyBusinessTotal)}`, sub: "After today's expenses" },
  ];

  const maxMonthRevenue = monthlyTotals.length > 0 ? Math.max(...monthlyTotals.map((m) => m.total_revenue)) : 1;
  const bestSellers = salesSummary?.top_by_quantity.slice(0, 4) ?? [];
  const maxSellerQty = bestSellers.length > 0 ? Math.max(...bestSellers.map((s) => s.quantity)) : 1;

  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-serif text-[32px] font-bold text-primary">Namaste, {roleLabel}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Here's how the restaurant is doing today.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded">
            <CardContent className="p-5">
              <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                {k.label}
              </div>
              <div className="font-serif text-[30px] font-bold text-foreground">{k.value}</div>
              {k.sub && <div className="mt-1.5 text-[12.5px] font-semibold text-muted-foreground">{k.sub}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-5">
        <Card className="rounded">
          <CardContent className="p-6">
            <div className="mb-4.5 font-serif text-lg font-semibold">Monthly Revenue Trend</div>
            {monthlyTotals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No historical sales data imported yet.</p>
            ) : (
              <div className="flex h-[180px] items-end gap-3.5 border-b border-border pt-2.5">
                {monthlyTotals.map((m) => (
                  <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div className="text-[11px] font-semibold text-muted-foreground">
                      ₹{Math.round(m.total_revenue / 1000)}k
                    </div>
                    <div
                      className="w-[26px] rounded-t bg-accent"
                      style={{ height: `${Math.round((m.total_revenue / maxMonthRevenue) * 140)}px` }}
                    />
                    <div className="text-[11.5px] font-bold text-muted-foreground">{formatMonthLabel(m.month)}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 text-[11px] text-muted-foreground">
              From imported historical sales data (Feb–Jul 2026).
            </div>
          </CardContent>
        </Card>

        <Card className="rounded">
          <CardContent className="p-6">
            <div className="mb-4 font-serif text-lg font-semibold">
              Best Sellers {salesSummary?.month ? `· ${formatMonthLabel(salesSummary.month)}` : ""}
            </div>
            {bestSellers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales data yet.</p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {bestSellers.map((s) => (
                  <div key={s.item_name}>
                    <div className="mb-1.5 flex justify-between gap-2.5 text-[13.5px]">
                      <span className="font-semibold text-foreground">{s.item_name}</span>
                      <span className="shrink-0 text-muted-foreground">{inr(s.quantity)} sold</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.round((s.quantity / maxSellerQty) * 100)}%` }}
                      />
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
