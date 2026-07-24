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
import { useCreateSupplier, useSuppliers } from "@/services/suppliersService";

const emptyForm = { name: "", contact_person: "", phone: "", email: "", address: "" };

export default function SuppliersPage() {
  const { data: suppliers = [], isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const submit = () => {
    if (!form.name) return;
    createSupplier.mutate(form, {
      onSuccess: () => {
        setForm(emptyForm);
        setOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary">Suppliers</h2>
          <p className="mt-1 text-sm text-muted-foreground">Vendors supplying the kitchen.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-sm">New Supplier</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">New Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {(["name", "contact_person", "phone", "email", "address"] as const).map((field) => (
                <div className="space-y-2" key={field}>
                  <Label htmlFor={field}>{field.replace("_", " ")}</Label>
                  <Input
                    id={field}
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <Button className="w-full" disabled={createSupplier.isPending} onClick={submit}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {suppliers.map((s) => (
            <div key={s.id} className="rounded border border-border bg-card p-4.5">
              <div className="mb-1.5 text-[15px] font-bold text-foreground">{s.name}</div>
              {s.contact_person && (
                <div className="mb-1 text-[12.5px] text-muted-foreground">Contact: {s.contact_person}</div>
              )}
              <div className="text-[12.5px] text-muted-foreground">
                {[s.phone, s.email].filter(Boolean).join(" · ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
