import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCreateIngredient, useIngredients } from "@/services/inventoryService";

const emptyForm = { name: "", unit: "", quantity_in_stock: "", low_stock_threshold: "" };

export default function InventoryPage() {
  const { data: ingredients = [], isLoading } = useIngredients();
  const createIngredient = useCreateIngredient();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

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
          <h2 className="text-2xl font-bold">Inventory</h2>
          <p className="text-muted-foreground">Current ingredient stock levels.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New Ingredient</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Ingredient</DialogTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ing) => (
                  <TableRow key={ing.id}>
                    <TableCell className="font-medium">{ing.name}</TableCell>
                    <TableCell>{ing.unit}</TableCell>
                    <TableCell>{ing.quantity_in_stock}</TableCell>
                    <TableCell>{ing.low_stock_threshold}</TableCell>
                    <TableCell>
                      <Badge variant={ing.is_low_stock ? "destructive" : "success"}>
                        {ing.is_low_stock ? "Low stock" : "OK"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
