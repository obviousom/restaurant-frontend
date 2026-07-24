import { Pencil, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/types/auth";
import { getApiErrorMessage } from "@/lib/utils";
import {
  useCreateStaffProfile,
  useDeleteStaffProfile,
  useStaffProfiles,
  useUpdateStaffProfile,
  useUsers,
} from "@/services/staffService";

const inr = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const emptyForm = { user_id: "", employee_id: "", position: "", salary: "" };

export default function StaffPage() {
  const { data: staff = [], isLoading } = useStaffProfiles();
  const { data: users = [] } = useUsers();
  const createProfile = useCreateStaffProfile();
  const updateProfile = useUpdateStaffProfile();
  const deleteProfile = useDeleteStaffProfile();

  const [errorMsg, setErrorMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const unassignedUsers = users.filter((u) => !staff.some((s) => s.user.id === u.id));

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (id: number, employeeId: string, position: string, salary: string) => {
    setEditingId(id);
    setForm({ user_id: "", employee_id: employeeId, position, salary });
    setOpen(true);
  };

  const submit = () => {
    if (editingId) {
      if (!form.employee_id || !form.salary) return;
      updateProfile.mutate(
        { id: editingId, employee_id: form.employee_id, position: form.position, salary: form.salary },
        {
          onSuccess: () => setOpen(false),
          onError: (err) => setErrorMsg(getApiErrorMessage(err)),
        }
      );
      return;
    }
    if (!form.user_id || !form.employee_id || !form.salary) return;
    createProfile.mutate(
      {
        user_id: Number(form.user_id),
        employee_id: form.employee_id,
        position: form.position,
        salary: form.salary,
        hire_date: new Date().toISOString().slice(0, 10),
      },
      {
        onSuccess: () => {
          setForm(emptyForm);
          setOpen(false);
        },
        onError: (err) => setErrorMsg(getApiErrorMessage(err)),
      }
    );
  };

  const remove = (id: number, name: string) => {
    if (!window.confirm(`Remove staff record for "${name}"? This can't be undone.`)) return;
    setErrorMsg("");
    deleteProfile.mutate(id, { onError: (err) => setErrorMsg(getApiErrorMessage(err)) });
  };

  const totalPayroll = staff.reduce((sum, s) => sum + Number(s.salary), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary">Staff &amp; Salary</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage staff records and monthly salary.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setEditingId(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="rounded-sm" onClick={openNew}>
              + Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">{editingId ? "Edit Staff" : "Add Staff"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {!editingId && (
                <div className="space-y-2">
                  <Label>User account</Label>
                  <Select value={form.user_id} onValueChange={(v) => setForm((f) => ({ ...f, user_id: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedUsers.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.username} ({ROLE_LABELS[u.role]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="staff-empid">Employee ID</Label>
                <Input
                  id="staff-empid"
                  value={form.employee_id}
                  onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-position">Position</Label>
                <Input
                  id="staff-position"
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-salary">Monthly Salary (₹)</Label>
                <Input
                  id="staff-salary"
                  type="number"
                  step="0.01"
                  value={form.salary}
                  onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
                />
              </div>
              <Button
                onClick={submit}
                disabled={createProfile.isPending || updateProfile.isPending}
                className="w-full"
              >
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
        <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr_0.5fr] bg-secondary px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-wide text-primary">
          <span>Staff</span>
          <span>Employee ID</span>
          <span>Position</span>
          <span>Role</span>
          <span>Monthly Salary</span>
          <span></span>
        </div>
        {isLoading ? (
          <p className="p-5 text-sm text-muted-foreground">Loading...</p>
        ) : staff.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No staff records yet.</p>
        ) : (
          staff.map((s) => (
            <div
              key={s.id}
              className="group grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr_0.5fr] items-center border-t border-border px-5 py-3.5 text-[13.5px]"
            >
              <span className="font-semibold">{s.user.username}</span>
              <span className="text-muted-foreground">{s.employee_id}</span>
              <span>{s.position || "—"}</span>
              <span className="text-muted-foreground">{ROLE_LABELS[s.user.role]}</span>
              <span className="font-bold text-foreground">₹{inr(Number(s.salary))}</span>
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => openEdit(s.id, s.employee_id, s.position, s.salary)}
                  title="Edit"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => remove(s.id, s.user.username)}
                  title="Delete"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
        {staff.length > 0 && (
          <div className="flex justify-between border-t border-border bg-secondary px-5 py-3 text-[13px] font-bold">
            <span>Total Monthly Payroll</span>
            <span className="text-primary">₹{inr(totalPayroll)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
