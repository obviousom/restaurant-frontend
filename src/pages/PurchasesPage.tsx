import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIngredients } from "@/services/inventoryService";
import { useCreatePurchaseOrder, usePurchaseOrders, useReceivePurchaseOrder } from "@/services/purchasesService";
import { useSuppliers } from "@/services/suppliersService";

interface Line {
  ingredientId: number;
  name: string;
  quantity: string;
  unitCost: string;
}

export default function PurchasesPage() {
  const { data: suppliers = [] } = useSuppliers();
  const { data: ingredients = [] } = useIngredients();
  const { data: purchaseOrders = [], isLoading } = usePurchaseOrders();
  const createPO = useCreatePurchaseOrder();
  const receivePO = useReceivePurchaseOrder();

  const [supplierId, setSupplierId] = useState("");
  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [lines, setLines] = useState<Line[]>([]);

  const addLine = () => {
    if (!ingredientId || !quantity || !unitCost) return;
    const ingredient = ingredients.find((i) => i.id === Number(ingredientId));
    if (!ingredient) return;
    setLines((prev) => [
      ...prev,
      { ingredientId: ingredient.id, name: ingredient.name, quantity, unitCost },
    ]);
    setIngredientId("");
    setQuantity("");
    setUnitCost("");
  };

  const submitPO = () => {
    if (!supplierId || lines.length === 0) return;
    createPO.mutate(
      {
        supplier: Number(supplierId),
        items_input: lines.map((l) => ({
          ingredient: l.ingredientId,
          quantity: l.quantity,
          unit_cost: l.unitCost,
        })),
      },
      {
        onSuccess: () => {
          setLines([]);
          setSupplierId("");
        },
      }
    );
  };

  const poTotal = (items: (typeof purchaseOrders)[number]["items"]) =>
    items.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_cost), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-primary">Purchases</h2>
        <p className="mt-1 text-sm text-muted-foreground">Purchase orders raised to suppliers.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="rounded">
          <CardContent className="space-y-3.5 p-5">
            <div className="font-serif text-lg font-semibold">New Purchase Order</div>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-3 gap-2">
              <Select value={ingredientId} onValueChange={setIngredientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Ingredient" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Qty" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              <Input
                placeholder="Unit cost"
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
              />
            </div>
            <button
              onClick={addLine}
              className="w-full rounded-sm border border-border py-2.5 text-sm font-bold text-foreground"
            >
              Add Line
            </button>

            {lines.length > 0 && (
              <div className="space-y-1 rounded-sm border border-border p-3 text-sm">
                {lines.map((l, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {l.quantity} × {l.name}
                    </span>
                    <span className="text-muted-foreground">@ ₹{l.unitCost}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              disabled={createPO.isPending || !supplierId || lines.length === 0}
              onClick={submitPO}
              className="w-full rounded-sm bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              Create Purchase Order
            </button>
          </CardContent>
        </Card>

        <div className="overflow-hidden rounded border border-border bg-card">
          <div className="grid grid-cols-[0.7fr_1.4fr_1.6fr_0.9fr_0.9fr] bg-secondary px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-wide text-primary">
            <span>PO #</span>
            <span>Supplier</span>
            <span>Items</span>
            <span>Total</span>
            <span>Status</span>
          </div>
          {isLoading ? (
            <p className="p-5 text-sm text-muted-foreground">Loading...</p>
          ) : (
            purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="grid grid-cols-[0.7fr_1.4fr_1.6fr_0.9fr_0.9fr] items-center border-t border-border px-5 py-3.5 text-[13.5px]"
              >
                <span className="font-semibold">PO-{po.id}</span>
                <span>{po.supplier_name}</span>
                <span className="text-muted-foreground">
                  {po.items.map((it) => `${it.quantity} ${it.ingredient_name}`).join(", ")}
                </span>
                <span className="font-semibold">₹{poTotal(po.items).toFixed(2)}</span>
                <div className="flex flex-col items-start gap-1.5">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      po.status === "RECEIVED" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"
                    )}
                  >
                    {po.status === "RECEIVED" ? "Received" : po.status === "PENDING" ? "Pending" : po.status}
                  </span>
                  {po.status === "PENDING" && (
                    <button
                      disabled={receivePO.isPending}
                      onClick={() => receivePO.mutate(po.id)}
                      className="text-[11px] font-bold text-primary underline disabled:opacity-50"
                    >
                      Receive
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
