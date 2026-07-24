import { Pencil, Repeat, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, getApiErrorMessage } from "@/lib/utils";
import { useBills } from "@/services/billingService";
import {
  useCreateExpense,
  useCreateExpenseCategory,
  useCreateRecurringExpense,
  useDeleteExpense,
  useDeleteExpenseCategory,
  useDeleteRecurringExpense,
  useExpenseCategories,
  useExpenses,
  useLogRecurringPayment,
  useRecurringExpenses,
  useUpdateRecurringExpense,
} from "@/services/expensesService";
import type { RecurringExpense, RecurringFrequency } from "@/types/expenses";

const inr = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);
const FREQUENCY_LABEL: Record<RecurringFrequency, string> = { MONTHLY: "Monthly", QUARTERLY: "Quarterly" };

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const emptyRecurringForm = { category: "", description: "", amount: "", frequency: "MONTHLY" as RecurringFrequency, next_due_date: today() };

export default function ExpensesPage() {
  const todayDate = today();
  const { data: categories = [] } = useExpenseCategories();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(todayDate);
  const { data: bills = [] } = useBills();
  const { data: recurring = [], isLoading: recurringLoading } = useRecurringExpenses();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();
  const createCategory = useCreateExpenseCategory();
  const deleteCategory = useDeleteExpenseCategory();
  const createRecurring = useCreateRecurringExpense();
  const updateRecurring = useUpdateRecurringExpense();
  const deleteRecurring = useDeleteRecurringExpense();
  const logPayment = useLogRecurringPayment();

  const [errorMsg, setErrorMsg] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [form, setForm] = useState({ category: "", description: "", amount: "" });

  const [recurringOpen, setRecurringOpen] = useState(false);
  const [editingRecurringId, setEditingRecurringId] = useState<number | null>(null);
  const [recurringForm, setRecurringForm] = useState(emptyRecurringForm);

  const submitCategory = () => {
    if (!categoryName.trim()) return;
    createCategory.mutate(categoryName, {
      onSuccess: () => {
        setCategoryName("");
        setCategoryOpen(false);
      },
      onError: (err) => setErrorMsg(getApiErrorMessage(err)),
    });
  };

  const submitExpense = () => {
    if (!form.category || !form.description || !form.amount) return;
    createExpense.mutate(
      { category: Number(form.category), description: form.description, amount: form.amount, date: todayDate },
      {
        onSuccess: () => {
          setForm({ category: "", description: "", amount: "" });
          setExpenseOpen(false);
        },
        onError: (err) => setErrorMsg(getApiErrorMessage(err)),
      }
    );
  };

  const removeExpense = (id: number, description: string) => {
    if (!window.confirm(`Delete expense "${description}"? This can't be undone.`)) return;
    setErrorMsg("");
    deleteExpense.mutate(id, { onError: (err) => setErrorMsg(getApiErrorMessage(err)) });
  };

  const removeCategory = (id: number, name: string) => {
    if (!window.confirm(`Delete category "${name}"? This can't be undone.`)) return;
    setErrorMsg("");
    deleteCategory.mutate(id, { onError: (err) => setErrorMsg(getApiErrorMessage(err)) });
  };

  const openNewRecurring = () => {
    setEditingRecurringId(null);
    setRecurringForm(emptyRecurringForm);
    setRecurringOpen(true);
  };

  const openEditRecurring = (r: RecurringExpense) => {
    setEditingRecurringId(r.id);
    setRecurringForm({
      category: String(r.category),
      description: r.description,
      amount: r.amount,
      frequency: r.frequency,
      next_due_date: r.next_due_date,
    });
    setRecurringOpen(true);
  };

  const submitRecurring = () => {
    if (!recurringForm.category || !recurringForm.description || !recurringForm.amount) return;
    const payload = {
      category: Number(recurringForm.category),
      description: recurringForm.description,
      amount: recurringForm.amount,
      frequency: recurringForm.frequency,
      next_due_date: recurringForm.next_due_date,
    };
    const onSuccess = () => {
      setRecurringForm(emptyRecurringForm);
      setEditingRecurringId(null);
      setRecurringOpen(false);
    };
    const onError = (err: unknown) => setErrorMsg(getApiErrorMessage(err));
    if (editingRecurringId) {
      updateRecurring.mutate({ id: editingRecurringId, ...payload }, { onSuccess, onError });
    } else {
      createRecurring.mutate(payload, { onSuccess, onError });
    }
  };

  const removeRecurring = (id: number, description: string) => {
    if (!window.confirm(`Delete recurring reminder "${description}"? This can't be undone.`)) return;
    setErrorMsg("");
    deleteRecurring.mutate(id, { onError: (err) => setErrorMsg(getApiErrorMessage(err)) });
  };

  const runLogPayment = (id: number) => {
    setErrorMsg("");
    logPayment.mutate(id, { onError: (err) => setErrorMsg(getApiErrorMessage(err)) });
  };

  const revenueToday = bills
    .filter((b) => b.paid_at && b.paid_at.slice(0, 10) === todayDate)
    .reduce((sum, b) => sum + Number(b.total), 0);
  const totalExpensesToday = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netToday = revenueToday - totalExpensesToday;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary">Expenses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track today's utility and staff costs against today's revenue.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-sm">
                + Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">New Expense Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="exp-cat-name">Name</Label>
                <Input id="exp-cat-name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
              </div>
              <Button onClick={submitCategory} disabled={createCategory.isPending}>
                Save
              </Button>
            </DialogContent>
          </Dialog>

          <Dialog
            open={recurringOpen}
            onOpenChange={(o) => {
              setRecurringOpen(o);
              if (!o) setEditingRecurringId(null);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-sm" onClick={openNewRecurring}>
                + Recurring Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">
                  {editingRecurringId ? "Edit Recurring Expense" : "New Recurring Expense"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={recurringForm.category}
                    onValueChange={(value) => setRecurringForm((f) => ({ ...f, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rec-desc">Description</Label>
                  <Input
                    id="rec-desc"
                    placeholder="e.g. Electricity bill"
                    value={recurringForm.description}
                    onChange={(e) => setRecurringForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rec-amount">Amount (₹)</Label>
                  <Input
                    id="rec-amount"
                    type="number"
                    step="0.01"
                    value={recurringForm.amount}
                    onChange={(e) => setRecurringForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <div className="flex gap-2">
                    {(["MONTHLY", "QUARTERLY"] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setRecurringForm((f) => ({ ...f, frequency: freq }))}
                        className={cn(
                          "flex-1 rounded-sm border py-2 text-xs font-bold",
                          recurringForm.frequency === freq
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground"
                        )}
                      >
                        {FREQUENCY_LABEL[freq]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rec-due">
                    {editingRecurringId ? "Next Due Date" : "First Due Date"}
                  </Label>
                  <Input
                    id="rec-due"
                    type="date"
                    value={recurringForm.next_due_date}
                    onChange={(e) => setRecurringForm((f) => ({ ...f, next_due_date: e.target.value }))}
                  />
                </div>
                <Button
                  onClick={submitRecurring}
                  disabled={createRecurring.isPending || updateRecurring.isPending}
                  className="w-full"
                >
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-sm">+ Add Expense</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => setForm((f) => ({ ...f, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp-desc">Description</Label>
                  <Input
                    id="exp-desc"
                    placeholder="e.g. July electricity bill"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp-amount">Amount (₹)</Label>
                  <Input
                    id="exp-amount"
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <Button onClick={submitExpense} disabled={createExpense.isPending} className="w-full">
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-sm border border-destructive bg-destructive-subtle px-4 py-2.5 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card className="rounded">
          <CardContent className="p-5">
            <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Revenue Today
            </div>
            <div className="font-serif text-[28px] font-bold text-foreground">₹{inr(revenueToday)}</div>
          </CardContent>
        </Card>
        <Card className="rounded">
          <CardContent className="p-5">
            <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Total Expenses Today
            </div>
            <div className="font-serif text-[28px] font-bold text-destructive">₹{inr(totalExpensesToday)}</div>
          </CardContent>
        </Card>
        <Card className="rounded">
          <CardContent className="p-5">
            <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
              {netToday >= 0 ? "Net Profit Today" : "Net Loss Today"}
            </div>
            <div className={cn("font-serif text-[28px] font-bold", netToday >= 0 ? "text-success" : "text-destructive")}>
              ₹{inr(Math.abs(netToday))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded">
        <CardContent className="p-5">
          <div className="mb-3.5 flex items-center gap-2 font-serif text-lg font-semibold">
            <Repeat className="h-4 w-4 text-primary" />
            Upcoming Expenses
          </div>
          {recurringLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : recurring.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recurring reminders set up. Use "+ Recurring Expense" for bills like rent or salary that repeat
              monthly or quarterly.
            </p>
          ) : (
            recurring.map((r) => (
              <div
                key={r.id}
                className={cn(
                  "group flex items-center justify-between gap-3 border-t border-border py-3 text-[13.5px]",
                  !r.is_active && "opacity-50"
                )}
              >
                <div>
                  <div>
                    <span className="font-semibold">{r.category_name}</span>
                    <span className="text-muted-foreground"> · {r.description}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">
                      {FREQUENCY_LABEL[r.frequency]} · Due {formatDate(r.next_due_date)}
                    </span>
                    {r.is_overdue && (
                      <span className="rounded-full bg-destructive-subtle px-2 py-0.5 font-bold text-destructive">
                        Overdue
                      </span>
                    )}
                    {!r.is_active && <span className="font-bold text-muted-foreground">Paused</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground">₹{inr(Number(r.amount))}</span>
                  <Button
                    size="sm"
                    disabled={logPayment.isPending || !r.is_active}
                    onClick={() => runLogPayment(r.id)}
                    className="h-8 rounded-sm px-3 text-xs"
                  >
                    Log Payment
                  </Button>
                  <button
                    onClick={() =>
                      updateRecurring.mutate({ id: r.id, is_active: !r.is_active })
                    }
                    title={r.is_active ? "Pause" : "Resume"}
                    className="text-xs font-bold text-muted-foreground opacity-0 hover:text-primary group-hover:opacity-100"
                  >
                    {r.is_active ? "Pause" : "Resume"}
                  </button>
                  <button
                    onClick={() => openEditRecurring(r)}
                    title="Edit"
                    className="text-muted-foreground opacity-0 hover:text-primary group-hover:opacity-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeRecurring(r.id, r.description)}
                    title="Delete"
                    className="text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Expense Categories
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <div key={c.id} className="group relative">
              <span className="rounded-full border border-border bg-card px-3.5 py-2 pr-7 text-[12.5px] font-bold text-foreground/70">
                {c.name}
              </span>
              <button
                onClick={() => removeCategory(c.id, c.name)}
                title="Delete category"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Card className="rounded">
        <CardContent className="p-5">
          <div className="mb-3.5 font-serif text-lg font-semibold">Today's Expenses</div>
          {expensesLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses logged today.</p>
          ) : (
            expenses.map((e) => (
              <div key={e.id} className="group flex justify-between border-t border-border py-2.5 text-[13.5px]">
                <span>
                  <span className="font-semibold">{e.category_name}</span>
                  <span className="text-muted-foreground"> · {e.description}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-destructive">₹{inr(Number(e.amount))}</span>
                  <button
                    onClick={() => removeExpense(e.id, e.description)}
                    title="Delete expense"
                    className="text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
          {expenses.length > 0 && (
            <div className="flex justify-between border-t border-border pt-2.5 text-[13px] font-bold">
              <span>Total</span>
              <span className="text-destructive">₹{inr(totalExpensesToday)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
