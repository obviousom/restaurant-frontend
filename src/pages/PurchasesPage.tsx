import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Purchases</h2>
        <p className="text-muted-foreground">Create purchase orders and receive stock from suppliers.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Purchase Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <Button variant="outline" onClick={addLine} className="w-full">
              Add Line
            </Button>

            {lines.length > 0 && (
              <div className="space-y-1 rounded-md border p-3 text-sm">
                {lines.map((l, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {l.quantity} x {l.name}
                    </span>
                    <span>@ {l.unitCost}</span>
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full" disabled={createPO.isPending} onClick={submitPO}>
              Create Purchase Order
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell>{po.id}</TableCell>
                      <TableCell>{po.supplier_name}</TableCell>
                      <TableCell>
                        <Badge variant={po.status === "RECEIVED" ? "success" : "warning"}>{po.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {po.status === "PENDING" && (
                          <Button size="sm" disabled={receivePO.isPending} onClick={() => receivePO.mutate(po.id)}>
                            Receive
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
