import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBills, useGenerateBill, usePayBill } from "@/services/billingService";
import { useOrders } from "@/services/ordersService";

const PAYMENT_METHODS = ["Cash", "UPI", "Card"];

export default function BillingPage() {
  const { data: orders = [] } = useOrders();
  const { data: bills = [], isLoading } = useBills();
  const generateBill = useGenerateBill();
  const payBill = usePayBill();

  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const billableOrders = orders.filter((o) => o.status === "SERVED");
  const unpaidBills = bills.filter((b) => !b.paid_at);
  const paidBills = bills.filter((b) => b.paid_at);
  const selectedBill = bills.find((b) => b.id === selectedBillId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-primary">Billing</h2>
        <p className="mt-1 text-sm text-muted-foreground">Generate the bill and settle payment.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="rounded">
          <CardContent className="p-5">
            <div className="mb-3.5 font-serif text-lg font-semibold">Ready to Bill</div>
            <div className="flex flex-col gap-2.5">
              {billableOrders.length === 0 && unpaidBills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No served orders awaiting a bill.</p>
              ) : (
                <>
                  {billableOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-sm border border-border p-3 text-[13px]"
                    >
                      <span className="font-bold">
                        Table {order.table_number}{" "}
                        <span className="font-normal text-muted-foreground">
                          — ₹{Number(order.subtotal).toFixed(2)}
                        </span>
                      </span>
                      <button
                        disabled={generateBill.isPending}
                        onClick={() =>
                          generateBill.mutate(order.id, { onSuccess: (bill) => setSelectedBillId(bill.id) })
                        }
                        className="rounded-sm bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-50"
                      >
                        Generate Bill
                      </button>
                    </div>
                  ))}
                  {unpaidBills.map((bill) => (
                    <button
                      key={bill.id}
                      onClick={() => setSelectedBillId(bill.id)}
                      className={cn(
                        "w-full rounded-sm border p-3 text-left text-[13px]",
                        selectedBillId === bill.id ? "border-primary bg-background" : "border-border bg-card"
                      )}
                    >
                      <span className="font-bold">
                        Table {bill.table_number} · Bill #{bill.id}
                      </span>
                      <span className="float-right text-muted-foreground">₹{bill.total}</span>
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="mb-2.5 mt-5 font-serif text-base font-semibold">Recently Settled</div>
            <div className="flex flex-col gap-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : paidBills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bills settled yet.</p>
              ) : (
                paidBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex justify-between border-t border-border py-2 text-[12.5px] text-muted-foreground"
                  >
                    <span>
                      Table {bill.table_number} · #{bill.id}
                    </span>
                    <span className="font-bold text-success">₹{bill.total} paid</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded">
          <CardContent className="p-5">
            {selectedBill ? (
              <>
                <div className="mb-3.5 font-serif text-lg font-semibold">
                  Bill · Table {selectedBill.table_number}
                </div>
                <div className="border-t border-border pt-2.5">
                  <div className="flex justify-between text-[12.5px] text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{selectedBill.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[12.5px] text-muted-foreground">
                    <span>Tax</span>
                    <span>₹{selectedBill.tax}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-[17px] font-bold text-foreground">
                    <span>Total</span>
                    <span>₹{selectedBill.total}</span>
                  </div>
                </div>

                {!selectedBill.paid_at && (
                  <>
                    <div className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Payment method
                    </div>
                    <div className="mb-5 flex gap-2">
                      {PAYMENT_METHODS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={cn(
                            "flex-1 rounded-sm border py-2.5 text-[13px] font-bold",
                            paymentMethod === m
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={payBill.isPending}
                      onClick={() => payBill.mutate(selectedBill.id, { onSuccess: () => setSelectedBillId(null) })}
                      className="w-full rounded-sm bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
                    >
                      Mark as Paid
                    </button>
                  </>
                )}

                {selectedBill.pdf_url && (
                  <a
                    href={selectedBill.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block w-full rounded-sm border border-border py-2.5 text-center text-[13px] font-bold text-foreground"
                  >
                    Download PDF
                  </a>
                )}
              </>
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center text-center text-[13.5px] text-muted-foreground">
                Select an order from the left to generate its bill.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
