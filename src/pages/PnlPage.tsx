import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMonthlySummary } from "@/services/expensesService";

const inr = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const thisMonth = () => new Date().toISOString().slice(0, 7);

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export default function PnlPage() {
  const [month, setMonth] = useState(thisMonth());
  const { data, isLoading } = useMonthlySummary(month);

  const revenue = data ? Number(data.revenue) : 0;
  const totalExpenses = data ? Number(data.total_expenses) : 0;
  const profit = data ? Number(data.profit) : 0;
  const isProfit = profit >= 0;
  const maxCategoryTotal = data
    ? Math.max(1, ...data.by_category.map((c) => Number(c.total)))
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary">P&amp;L Report</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monthly revenue vs. expenses — what the restaurant actually made or lost.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pnl-month" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Month
          </Label>
          <Input
            id="pnl-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <>
          <div className="mb-1 font-serif text-lg font-semibold text-foreground">{formatMonth(month)}</div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="rounded">
              <CardContent className="p-5">
                <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  Total Revenue
                </div>
                <div className="font-serif text-[28px] font-bold text-foreground">₹{inr(revenue)}</div>
                <div className="mt-1.5 text-[12px] text-muted-foreground">Bills collected this month</div>
              </CardContent>
            </Card>
            <Card className="rounded">
              <CardContent className="p-5">
                <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  Total Expenses
                </div>
                <div className="font-serif text-[28px] font-bold text-destructive">₹{inr(totalExpenses)}</div>
              </CardContent>
            </Card>
            <Card className="rounded">
              <CardContent className="p-5">
                <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  {isProfit ? "Net Profit" : "Net Loss"}
                </div>
                <div
                  className={cn(
                    "font-serif text-[28px] font-bold",
                    isProfit ? "text-success" : "text-destructive"
                  )}
                >
                  ₹{inr(Math.abs(profit))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded">
            <CardContent className="p-6">
              <div className="mb-4 font-serif text-lg font-semibold">Expenses by Category</div>
              {data.by_category.length === 0 ? (
                <p className="text-sm text-muted-foreground">No expenses logged for this month.</p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {data.by_category.map((c) => (
                    <div key={c.category_id}>
                      <div className="mb-1.5 flex justify-between text-[13.5px]">
                        <span className="font-semibold text-foreground">{c.category_name}</span>
                        <span className="text-muted-foreground">₹{inr(Number(c.total))}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.round((Number(c.total) / maxCategoryTotal) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
