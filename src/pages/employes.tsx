import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { MoreVertical, Plus, Search, Users, Pencil, Trash2, Ban, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { initials } from '@/lib/utils';
import {
  EMPLOYEE_STATUSES, EMPLOYMENT_TYPES, type Employee, type EmployeeInput,
} from '@/features/employees/api/employee.service';
import {
  useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee,
} from '@/features/employees/hooks/use-employees';

const DEPARTMENTS = ['Service', 'Kitchen', 'Bar', 'Office'];

function getStatusStyle(status: string) {
  switch (status) {
    case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100';
    case 'Retired': return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'Suspension': return 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100';
    case 'Sacked':
    case 'Resigned': return 'bg-red-50 text-red-700 border-red-200 shadow-sm shadow-red-100';
    case 'Leave': return 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm shadow-blue-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

function getTypeStyle(type: string) {
  switch (type) {
    case 'Full-time': return 'text-purple-700 border-purple-200 bg-purple-50 shadow-sm shadow-purple-100';
    case 'Intern': return 'text-amber-700 border-amber-200 bg-amber-50 shadow-sm shadow-amber-100';
    case 'Part time': return 'text-sky-700 border-sky-200 bg-sky-50 shadow-sm shadow-sky-100';
    case 'Remote': return 'text-teal-700 border-teal-200 bg-teal-50 shadow-sm shadow-teal-100';
    case 'Hybrid': return 'text-fuchsia-700 border-fuchsia-200 bg-fuchsia-50 shadow-sm shadow-fuchsia-100';
    default: return 'text-slate-600 border-slate-200 bg-slate-50';
  }
}

const emptyForm: EmployeeInput = {
  name: '', email: '', department: 'Service', designation: '',
  employmentType: 'Full-time', status: 'Active', salary: 0,
  phone: '', address: '', avatar: '', categories: [], contract: 'monthly', workload: 100,
};

/** Debounced search hook — keeps input responsive but delays API calls. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function DashboardPage() {
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 300);
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, isError, isFetching } = useEmployees({
    q: debouncedQ || undefined,
    department: deptFilter === 'all' ? undefined : deptFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const createMut = useCreateEmployee();
  const updateMut = useUpdateEmployee();
  const deleteMut = useDeleteEmployee();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeInput>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const employees = data?.items ?? [];
  const mutatingId = useMemo(() => {
    if (createMut.isPending) return '__creating__';
    if (updateMut.isPending && updateMut.variables?.id) return updateMut.variables.id;
    if (deleteMut.isPending && deleteMut.variables) return deleteMut.variables;
    return null;
  }, [createMut.isPending, updateMut.isPending, updateMut.variables, deleteMut.isPending, deleteMut.variables]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((e: Employee) => {
    setEditing(e);
    const { id: _id, createdAt: _c, ...rest } = e;
    setForm(rest);
    setModalOpen(true);
  }, []);

  const submit = useCallback(() => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (editing) {
      updateMut.mutate({ id: editing.id, data: form }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMut.mutate(form, { onSuccess: () => setModalOpen(false) });
    }
  }, [form, editing, createMut, updateMut]);

  const toggleStatus = useCallback((e: Employee) => {
    const next = e.status === 'Active' ? 'Suspension' : 'Active';
    updateMut.mutate({ id: e.id, data: { status: next } });
  }, [updateMut]);

  const handleDelete = useCallback(() => {
    if (deleteTarget) deleteMut.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMut]);

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">Team</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900 tracking-tight">Employees</h1>
          <p className="text-slate-500 mt-1 font-medium">Add, edit and manage your staff.</p>
        </div>
        <Button onClick={openAdd} className="rounded-xl h-11 px-6 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5">
          <Plus className="mr-2 h-4 w-4" /> Add employee
        </Button>
      </header>

      {/* Filters — separate from table to avoid table re-render on every keystroke */}
      <Card className="rounded-2xl border-slate-200/80 shadow-md shadow-slate-100/50 bg-white/80 backdrop-blur-sm">
        <CardContent className="flex flex-wrap gap-3 p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or role…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 rounded-xl h-11 border-slate-200 bg-white/60 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 font-medium transition-all"
            />
            {q !== debouncedQ && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 text-blue-500 animate-spin" />
            )}
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[180px] rounded-xl h-11 font-medium border-slate-200 bg-white/60 shadow-sm">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-xl">
              <SelectItem value="all">All departments</SelectItem>
              {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] rounded-xl h-11 font-medium border-slate-200 bg-white/60 shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-xl">
              <SelectItem value="all">All statuses</SelectItem>
              {EMPLOYEE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table — memoized, only re-renders when data/mutatingId changes */}
      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        mutatingId={mutatingId}
        onEdit={openEdit}
        onToggleStatus={toggleStatus}
        onDelete={setDeleteTarget}
        onAdd={openAdd}
      />

      {/* Add/Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">{editing ? 'Edit employee' : 'Add employee'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2 py-2">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl h-11 border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 transition-all" /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl h-11 border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 transition-all" /></Field>
            <Field label="Department">
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger className="rounded-xl h-11 border-slate-200 bg-white shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-xl">{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Designation"><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="rounded-xl h-11 border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 transition-all" /></Field>
            <Field label="Employment type">
              <Select value={form.employmentType} onValueChange={(v) => setForm({ ...form, employmentType: v as EmployeeInput['employmentType'] })}>
                <SelectTrigger className="rounded-xl h-11 border-slate-200 bg-white shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-xl">{EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as EmployeeInput['status'] })}>
                <SelectTrigger className="rounded-xl h-11 border-slate-200 bg-white shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-xl">{EMPLOYEE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Salary (CHF / month)"><Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} className="rounded-xl h-11 border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 transition-all" /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl h-11 border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 transition-all" /></Field>
            <div className="md:col-span-2">
              <Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl h-11 border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 transition-all" /></Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl font-semibold border-slate-200 hover:bg-slate-50" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/30" onClick={submit} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : editing ? 'Save changes' : 'Add employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">This will permanently remove the employee. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-semibold border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 hover:bg-red-700 font-semibold shadow-lg shadow-red-600/25 transition-all duration-200"
              onClick={handleDelete}
            >
              {deleteMut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─── Memoized Table Component ─────────────────────────────── */
const EmployeeTable = memo(function EmployeeTable({
  employees,
  isLoading,
  isError,
  isFetching,
  mutatingId,
  onEdit,
  onToggleStatus,
  onDelete,
  onAdd,
}: {
  employees: Employee[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  mutatingId: string | null;
  onEdit: (e: Employee) => void;
  onToggleStatus: (e: Employee) => void;
  onDelete: (e: Employee) => void;
  onAdd: () => void;
}) {
  return (
    <Card className={`rounded-2xl border-slate-200/80 shadow-lg shadow-slate-100/50 bg-white/90 backdrop-blur-sm overflow-hidden transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-80' : 'opacity-100'}`}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-blue-50/30 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="text-left py-4 px-6">Employee</th>
                <th className="text-left py-4 px-4">Department</th>
                <th className="text-left py-4 px-4">Type</th>
                <th className="text-left py-4 px-4">Status</th>
                <th className="text-right py-4 px-4">Salary</th>
                <th className="text-right py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Skeleton loading — stable layout, no jump */}
              {isLoading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skel-${i}`} className="border-b border-slate-100">
                  <td className="py-4 px-6"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-40" /></div></div></td>
                  <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="py-4 px-4"><Skeleton className="h-6 w-20 rounded-md" /></td>
                  <td className="py-4 px-4"><Skeleton className="h-6 w-20 rounded-md" /></td>
                  <td className="py-4 px-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                  <td className="py-4 px-6"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></td>
                </tr>
              ))}

              {/* Data rows */}
              {!isLoading && !isError && employees.map((e) => {
                const rowMutating = mutatingId === e.id;
                return (
                  <tr key={e.id} className={`border-b border-slate-50 transition-all duration-200 group ${
                    rowMutating ? 'bg-blue-50/40' : 'hover:bg-blue-50/20'
                  }`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60 text-blue-600 flex items-center justify-center text-xs font-bold overflow-hidden shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                          {e.avatar ? <img src={e.avatar} alt={e.name} className="h-full w-full object-cover" /> : initials(e.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{e.name}</p>
                          <p className="text-[11px] font-medium text-slate-400">{e.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-700">{e.department}</p>
                      <p className="text-[11px] text-slate-400">{e.designation}</p>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className={`font-semibold rounded-lg px-2.5 py-0.5 ${getTypeStyle(e.employmentType)}`}>{e.employmentType}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      {rowMutating ? (
                        <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 text-blue-500 animate-spin" /><span className="text-xs text-slate-400 font-medium">Updating…</span></div>
                      ) : (
                        <Badge variant="outline" className={`font-semibold rounded-lg px-2.5 py-0.5 ${getStatusStyle(e.status)}`}>{e.status}</Badge>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">CHF {e.salary.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100/80 transition-all" disabled={rowMutating}>
                            {rowMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-200/80 shadow-xl shadow-slate-200/50 bg-white/95 backdrop-blur-md">
                          <DropdownMenuItem className="cursor-pointer rounded-lg mx-1 my-0.5" onClick={() => onEdit(e)}><Pencil className="mr-2 h-4 w-4 text-blue-500" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer rounded-lg mx-1 my-0.5" onClick={() => onToggleStatus(e)}>
                            {e.status === 'Active' ? <><Ban className="mr-2 h-4 w-4 text-amber-500" /> Suspend</> : <><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Activate</>}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg mx-1 my-0.5 hover:bg-red-50" onClick={() => onDelete(e)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {isError && (
            <div className="py-16 text-center text-red-600 font-medium">Failed to load employees. Is the mock API running? (npm run dev:server)</div>
          )}
          {!isLoading && !isError && employees.length === 0 && (
            <div className="py-16 text-center text-slate-400 font-medium flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Users className="h-8 w-8 text-slate-300" />
              </div>
              <p>No employees match your filters.</p>
              <Button variant="outline" size="sm" onClick={onAdd} className="rounded-xl border-slate-200 text-blue-600 hover:bg-blue-50">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Add first employee
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-700 font-semibold text-sm">{label}</Label>
      {children}
    </div>
  );
}
