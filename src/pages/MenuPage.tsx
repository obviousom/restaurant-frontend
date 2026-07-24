import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import type { MenuItem } from "@/types/menu";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, getApiErrorMessage } from "@/lib/utils";
import {
  useCategories,
  useCreateCategory,
  useCreateMenuItem,
  useDeleteCategory,
  useDeleteMenuItem,
  useMenuItems,
  useUpdateMenuItem,
} from "@/services/menuService";

export default function MenuPage() {
  const { data: categories = [] } = useCategories();
  const { data: items = [], isLoading } = useMenuItems();
  const createCategory = useCreateCategory();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();
  const deleteCategory = useDeleteCategory();

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [vegFilter, setVegFilter] = useState<"ALL" | "VEG" | "NONVEG">("ALL");
  const [errorMsg, setErrorMsg] = useState("");

  const removeItem = (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    setErrorMsg("");
    deleteItem.mutate(id, { onError: (err) => setErrorMsg(getApiErrorMessage(err)) });
  };

  const removeCategory = (id: number, name: string) => {
    if (!window.confirm(`Delete category "${name}"? This can't be undone.`)) return;
    setErrorMsg("");
    deleteCategory.mutate(id, {
      onSuccess: () => setCategoryId((cur) => (cur === id ? null : cur)),
      onError: (err) => setErrorMsg(getApiErrorMessage(err)),
    });
  };

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const [itemOpen, setItemOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const emptyItemForm = { name: "", price: "", category: "", description: "", is_veg: true };
  const [itemForm, setItemForm] = useState(emptyItemForm);

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

  const openNewItem = () => {
    setEditingId(null);
    setItemForm(emptyItemForm);
    setItemOpen(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingId(item.id);
    setItemForm({
      name: item.name,
      price: item.price,
      category: String(item.category),
      description: item.description,
      is_veg: item.is_veg,
    });
    setItemOpen(true);
  };

  const submitItem = () => {
    if (!itemForm.name || !itemForm.price || !itemForm.category) return;
    const payload = {
      name: itemForm.name,
      price: itemForm.price,
      category: Number(itemForm.category),
      description: itemForm.description,
      is_veg: itemForm.is_veg,
    };
    const onSuccess = () => {
      setItemForm(emptyItemForm);
      setEditingId(null);
      setItemOpen(false);
    };
    if (editingId) {
      updateItem.mutate({ id: editingId, ...payload }, { onSuccess, onError: (err) => setErrorMsg(getApiErrorMessage(err)) });
    } else {
      createItem.mutate(payload, { onSuccess, onError: (err) => setErrorMsg(getApiErrorMessage(err)) });
    }
  };

  const filteredItems = items.filter(
    (item) =>
      (categoryId === null || item.category === categoryId) &&
      (vegFilter === "ALL" || (vegFilter === "VEG" ? item.is_veg : !item.is_veg))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary">Menu</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage categories and dishes.</p>
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
                <DialogTitle className="font-serif">New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name</Label>
                <Input id="cat-name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
              </div>
              <Button onClick={submitCategory} disabled={createCategory.isPending}>
                Save
              </Button>
            </DialogContent>
          </Dialog>

          <Dialog
            open={itemOpen}
            onOpenChange={(open) => {
              setItemOpen(open);
              if (!open) setEditingId(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-sm" onClick={openNewItem}>
                + Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">{editingId ? "Edit Menu Item" : "New Menu Item"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Name</Label>
                  <Input
                    id="item-name"
                    value={itemForm.name}
                    onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-price">Price (₹)</Label>
                  <Input
                    id="item-price"
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={itemForm.category}
                    onValueChange={(value) => setItemForm((f) => ({ ...f, category: value }))}
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
                  <Label>Type</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setItemForm((f) => ({ ...f, is_veg: true }))}
                      className={cn(
                        "flex-1 rounded-sm border py-2 text-xs font-bold",
                        itemForm.is_veg
                          ? "border-success bg-success-subtle text-success"
                          : "border-border bg-background text-muted-foreground"
                      )}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemForm((f) => ({ ...f, is_veg: false }))}
                      className={cn(
                        "flex-1 rounded-sm border py-2 text-xs font-bold",
                        !itemForm.is_veg
                          ? "border-destructive bg-destructive-subtle text-destructive"
                          : "border-border bg-background text-muted-foreground"
                      )}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>
                <Button
                  onClick={submitItem}
                  disabled={createItem.isPending || updateItem.isPending}
                  className="w-full"
                >
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

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryId(null)}
          className={cn(
            "rounded-full border px-3.5 py-2 text-[12.5px] font-bold",
            categoryId === null
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground/70"
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <div key={c.id} className="group relative">
            <button
              onClick={() => setCategoryId(c.id)}
              className={cn(
                "rounded-full border px-3.5 py-2 pr-7 text-[12.5px] font-bold",
                categoryId === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground/70"
              )}
            >
              {c.name}
            </button>
            <button
              onClick={() => removeCategory(c.id, c.name)}
              title="Delete category"
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100",
                categoryId === c.id ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(["ALL", "VEG", "NONVEG"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVegFilter(v)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[12px] font-bold",
              vegFilter === v
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/70"
            )}
          >
            {v === "ALL" ? "All" : v === "VEG" ? "Veg" : "Non-Veg"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-3.5">
          {filteredItems.map((item) => (
            <div key={item.id} className="group relative rounded border border-border bg-card p-4">
              <div className="absolute right-3 top-3 flex gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEditItem(item)} title="Edit item" className="text-muted-foreground hover:text-primary">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => removeItem(item.id, item.name)}
                  title="Delete item"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mb-2 flex items-center gap-2 pr-5">
                <span
                  className="inline-block h-3 w-3 shrink-0 border-[1.5px]"
                  style={{ borderColor: item.is_veg ? "#2E7D32" : "#9C3B3B" }}
                  title={item.is_veg ? "Veg" : "Non-Veg"}
                />
                <span className="text-[14.5px] font-bold text-foreground">{item.name}</span>
              </div>
              <div className="mb-2.5 font-serif text-lg font-bold text-primary">₹{item.price}</div>
              <button
                onClick={() => updateItem.mutate({ id: item.id, is_available: !item.is_available })}
                disabled={updateItem.isPending}
                className={cn(
                  "w-full rounded-sm border py-1.5 text-xs font-bold disabled:opacity-50",
                  item.is_available
                    ? "border-success bg-success-subtle text-success"
                    : "border-border bg-secondary text-muted-foreground"
                )}
              >
                {item.is_available ? "Available" : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
