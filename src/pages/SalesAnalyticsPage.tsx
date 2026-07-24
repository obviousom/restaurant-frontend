import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useItemTrend, useSalesSummary } from "@/services/analyticsService";

const inr = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

function formatMonthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[m - 1]} ${y}`;
}

export default function SalesAnalyticsPage() {
  const [month, setMonth] = useState<string | undefined>(undefined);
  const { data, isLoading } = useSalesSummary(month);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { data: trend } = useItemTrend(selectedItem);

  useEffect(() => {
    if (data?.top_by_revenue?.[0] && !selectedItem) setSelectedItem(data.top_by_revenue[0].item_name);
  }, [data, selectedItem]);

  const isPartialJuly = data?.month === "2026-07";
  const vegTotal = (data?.veg.amount ?? 0) + (data?.nonveg.amount ?? 0) + (data?.unmatched.amount ?? 0);
  const vegPct = vegTotal > 0 ? Math.round(((data?.veg.amount ?? 0) / vegTotal) * 100) : 0;
  const nonvegPct = vegTotal > 0 ? Math.round(((data?.nonveg.amount ?? 0) / vegTotal) * 100) : 0;
  const maxCategoryAmount = data ? Math.max(1, ...data.by_category.map((c) => c.amount)) : 1;
  const maxTrendQty = trend && trend.length > 0 ? Math.max(1, ...trend.map((t) => t.quantity)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-primary">Sales Analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Month-wise and item-wise sales trends from the historical POS export (Feb–Jul 2026).
        </p>
      </div>

      <div className="rounded-sm border border-border bg-secondary px-4 py-3 text-[12.5px] text-muted-foreground">
        Based on monthly sales totals, so trends are accurate month-to-month and item-to-item. Day-of-week and
        rush-hour patterns will become available once more live orders build up in the system.
      </div>

      {data && (
        <div className="flex flex-wrap gap-2">
          {data.available_months.map((m) => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-[12.5px] font-bold",
                (month ?? data.available_months[data.available_months.length - 1]) === m
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground/70"
              )}
            >
              {formatMonthLabel(m)}
            </button>
          ))}
        </div>
      )}

      {isPartialJuly && (
        <div className="rounded-sm border border-border bg-secondary px-4 py-2.5 text-[12.5px] text-muted-foreground">
          July 2026 in the source data covers only 1–18 July (partial month) — totals and month-over-month
          comparisons for July will look lower than a full month.
        </div>
      )}

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card className="rounded">
              <CardContent className="p-5">
                <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  Total Qty Sold
                </div>
                <div className="font-serif text-[28px] font-bold text-foreground">{inr(data.total_quantity)}</div>
              </CardContent>
            </Card>
            <Card className="rounded">
              <CardContent className="p-5">
                <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  Total Revenue
                </div>
                <div className="font-serif text-[28px] font-bold text-foreground">₹{inr(data.total_revenue)}</div>
              </CardContent>
            </Card>
            <Card className="rounded">
              <CardContent className="p-5">
                <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  Veg Share (Revenue)
                </div>
                <div className="font-serif text-[28px] font-bold text-success">{vegPct}%</div>
              </CardContent>
            </Card>
            <Card className="rounded">
              <CardContent className="p-5">
                <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  Non-Veg Share (Revenue)
                </div>
                <div className="font-serif text-[28px] font-bold text-destructive">{nonvegPct}%</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Card className="rounded">
              <CardContent className="p-6">
                <div className="mb-4 font-serif text-lg font-semibold">Revenue by Category</div>
                <div className="flex flex-col gap-3">
                  {data.by_category.map((c) => (
                    <div key={c.category_name}>
                      <div className="mb-1 flex justify-between text-[13px]">
                        <span className="font-semibold text-foreground">{c.category_name}</span>
                        <span className="text-muted-foreground">
                          ₹{inr(c.amount)} · {inr(c.quantity)} sold
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.round((c.amount / maxCategoryAmount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded">
              <CardContent className="p-6">
                <div className="mb-4 font-serif text-lg font-semibold">
                  Item Trend {selectedItem ? `· ${selectedItem}` : ""}
                </div>
                {!trend || trend.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Click an item in the tables below to see its trend.</p>
                ) : (
                  <div className="flex h-[160px] items-end gap-3">
                    {trend.map((t) => (
                      <div key={t.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                        <div className="text-[10.5px] font-semibold text-muted-foreground">{inr(t.quantity)}</div>
                        <div
                          className="w-full rounded-t bg-accent"
                          style={{ height: `${Math.round((t.quantity / maxTrendQty) * 120)}px` }}
                        />
                        <div className="text-[10.5px] font-bold text-muted-foreground">
                          {formatMonthLabel(t.month).split(" ")[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Card className="rounded">
              <CardContent className="p-5">
                <div className="mb-3 font-serif text-lg font-semibold">Top Items by Revenue</div>
                {data.top_by_revenue.map((item) => (
                  <button
                    key={item.item_name}
                    onClick={() => setSelectedItem(item.item_name)}
                    className={cn(
                      "flex w-full justify-between border-t border-border py-2 text-left text-[13px]",
                      selectedItem === item.item_name && "text-primary"
                    )}
                  >
                    <span className="font-semibold">{item.item_name}</span>
                    <span className="text-muted-foreground">
                      ₹{inr(item.amount)} · {inr(item.quantity)}×
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded">
              <CardContent className="p-5">
                <div className="mb-3 font-serif text-lg font-semibold">Top Items by Quantity</div>
                {data.top_by_quantity.map((item) => (
                  <button
                    key={item.item_name}
                    onClick={() => setSelectedItem(item.item_name)}
                    className={cn(
                      "flex w-full justify-between border-t border-border py-2 text-left text-[13px]",
                      selectedItem === item.item_name && "text-primary"
                    )}
                  >
                    <span className="font-semibold">{item.item_name}</span>
                    <span className="text-muted-foreground">{inr(item.quantity)}× sold</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {data.movers.previous_month && (
            <div className="grid grid-cols-2 gap-5">
              <Card className="rounded">
                <CardContent className="p-5">
                  <div className="mb-3 font-serif text-lg font-semibold">
                    Trending Up <span className="text-xs font-normal text-muted-foreground">vs {formatMonthLabel(data.movers.previous_month)}</span>
                  </div>
                  {data.movers.increased.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No standout gainers this month.</p>
                  ) : (
                    data.movers.increased.map((m) => (
                      <div key={m.item_name} className="flex justify-between border-t border-border py-2 text-[13px]">
                        <span className="font-semibold">{m.item_name}</span>
                        <span className="font-bold text-success">+{m.pct_change}%</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              <Card className="rounded">
                <CardContent className="p-5">
                  <div className="mb-3 font-serif text-lg font-semibold">
                    Trending Down <span className="text-xs font-normal text-muted-foreground">vs {formatMonthLabel(data.movers.previous_month)}</span>
                  </div>
                  {data.movers.decreased.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No standout decliners this month.</p>
                  ) : (
                    data.movers.decreased.map((m) => (
                      <div key={m.item_name} className="flex justify-between border-t border-border py-2 text-[13px]">
                        <span className="font-semibold">{m.item_name}</span>
                        <span className="font-bold text-destructive">{m.pct_change}%</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
