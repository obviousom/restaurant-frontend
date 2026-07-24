import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, getApiErrorMessage } from "@/lib/utils";
import { useCreateIngredient, useDeleteIngredient, useIngredients } from "@/services/inventoryService";

const emptyForm = { name: "", unit: "", quantity_in_stock: "", low_stock_threshold: "" };

export default function InventoryPage() {
  const { data: ingredients = [], isLoading } = useIngredients();
  const createIngredient = useCreateIngredient();
  const deleteIngredient = useDeleteIngredient();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errorMsg, setErrorMsg] = useState("");

  const removeIngredient = (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    setErrorMsg("");
    deleteIngredient.mutate(id, { onError: (err) => setErrorMsg(getApiErrorMessage(err)) });
  };

  const submit = () => {
    if (!form.name || !form.unit) return;
    createIngredient.mutate(
      {
        name: form.name,
        unit: form.unit,
        quantity_in_stock: form.quantity_in_stock || "0",
        low_stock_threshold: form.low_stock_threshold || "0",
      },
      {
        onSuccess: () => {
          setForm(emptyForm);
          setOpen(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary">Inventory</h2>
          <p className="mt-1 text-sm text-muted-foreground">Stock levels across the kitchen store.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-sm">New Ingredient</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">New Ingredient</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="ing-name">Name</Label>
                <Input id="ing-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ing-unit">Unit (kg, pcs, l...)</Label>
                <Input id="ing-unit" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ing-qty">Initial Stock</Label>
                <Input
                  id="ing-qty"
                  type="number"
                  value={form.quantity_in_stock}
                  onChange={(e) => setForm((f) => ({ ...f, quantity_in_stock: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ing-threshold">Low Stock Threshold</Label>
                <Input
                  id="ing-threshold"
                  type="number"
                  value={form.low_stock_threshold}
                  onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: e.target.value }))}
                />
              </div>
              <Button className="w-full" disabled={createIngredient.isPending} onClick={submit}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {errorMsg && (
        <div className="rounded-sm border border-destructive bg-destructive-subtle px-4 py-2.5 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      <div className="overflow-hidden rounded border border-border bg-card">
        <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_1fr_0.8fr_0.4fr] bg-secondary px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-wide text-primary">
          <span>Ingredient</span>
          <span>Stock</span>
          <span>Reorder At</span>
          <span>Level</span>
          <span>Status</span>
          <span></span>
        </div>
        {isLoading ? (
          <p className="p-5 text-sm text-muted-foreground">Loading...</p>
        ) : (
          ingredients.map((ing) => {
            const stock = Number(ing.quantity_in_stock);
            const threshold = Number(ing.low_stock_threshold);
            const pct = threshold > 0 ? Math.min(100, Math.round((stock / (threshold * 2)) * 100)) : stock > 0 ? 100 : 0;
            return (
              <div
                key={ing.id}
                className="group grid grid-cols-[1.6fr_0.8fr_0.8fr_1fr_0.8fr_0.4fr] items-center border-t border-border px-5 py-3.5 text-[13.5px]"
              >
                <span className="font-semibold">{ing.name}</span>
                <span className="text-foreground/80">
                  {ing.quantity_in_stock} {ing.unit}
                </span>
                <span className="text-muted-foreground">
                  {ing.low_stock_threshold} {ing.unit}
                </span>
                <span className="block h-1.5 overflow-hidden rounded-full bg-secondary">
                  <span
                    className={cn("block h-full rounded-full", ing.is_low_stock ? "bg-warning" : "bg-success")}
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span
                  className={cn(
                    "w-fit rounded-full px-2.5 py-1 text-[11px] font-bold",
                    ing.is_low_stock ? "bg-warning-subtle text-warning" : "bg-success-subtle text-success"
                  )}
                >
                  {ing.is_low_stock ? "Low Stock" : "OK"}
                </span>
                <button
                  onClick={() => removeIngredient(ing.id, ing.name)}
                  title="Delete ingredient"
                  className="justify-self-end text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
