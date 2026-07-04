import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, CalendarRange, Users, ArrowRight, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePlans, useDeletePlan } from "@/features/plans/hooks/use-plans";
import type { Plan } from "@/features/plans/api/plan.service";
import { formatDate } from "@/lib/utils";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  submitted: { label: "Submitted", cls: "bg-amber-50 text-amber-600 border-amber-200" },
  approved: { label: "Approved", cls: "bg-blue-50 text-blue-600 border-blue-200" },
  rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-600 border-rose-200" },
};

export function ManagePlansPage() {
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState("all");

  const { data, isLoading, isError } = usePlans({
    status: status === "all" ? undefined : status,
    month: month === "all" ? undefined : month,
    _sort: "weekNumber",
    _order: "asc",
  });
  const deleteMut = useDeletePlan();
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);

  const plans = data?.items ?? [];
  const months = Array.from(new Set(plans.map((p) => p.month)));

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Manage plans</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900 tracking-tight">All plans</h1>
          <p className="text-slate-500 mt-1 font-medium">Weekly manpower plans across every month.</p>
        </div>
        <Button asChild className="rounded-xl h-11 px-6 font-semibold shadow-md shadow-primary/20">
          <Link to="/plan/create"><CalendarPlus className="mr-2 h-4 w-4" /> Create plan</Link>
        </Button>
      </header>

      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
        <CardContent className="flex flex-wrap gap-3 p-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px] rounded-xl h-11 font-medium border-slate-200"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[180px] rounded-xl h-11 font-medium border-slate-200"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All months</SelectItem>
              {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isError && <div className="py-16 text-center text-rose-600 font-medium">Failed to load plans. Is the mock API running? (npm run dev:server)</div>}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border-slate-200 shadow-sm bg-white"><CardContent className="p-6 space-y-4"><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-40" /><Skeleton className="h-10 w-full rounded-lg" /></CardContent></Card>
        ))}

        {!isLoading && plans.length === 0 && !isError && (
          <Card className="rounded-2xl border-slate-200 border-dashed bg-slate-50/50 md:col-span-2 lg:col-span-3">
            <CardContent className="py-16 text-center text-slate-500 font-medium">No plans match your filters. Create one to get started.</CardContent>
          </Card>
        )}

        {!isLoading && plans.map((p) => {
          const meta = STATUS_META[p.status] ?? STATUS_META.draft;
          const totalRequired = (p.manpower ?? []).reduce((a, m) => a + m.required, 0);
          return (
            <Card key={p.id} className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden transition-all hover:border-primary/30 hover:shadow-md">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-primary">
                      <CalendarRange className="h-5 w-5" />
                      <h3 className="text-lg font-bold text-slate-900">Week {p.weekNumber}</h3>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1">{p.month} · {p.dateRange.start} → {p.dateRange.end}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${meta.cls}`}>{meta.label}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 font-medium bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-slate-400" /> {p.assignments.length} assigned</span>
                  <span className="text-slate-300">|</span>
                  <span>{totalRequired} needed</span>
                </div>

                <p className="text-[11px] text-slate-400 font-medium">Updated {formatDate(p.submittedAt ?? p.createdAt)}</p>

                <div className="flex gap-2 pt-1">
                  <Button asChild variant="outline" className="flex-1 rounded-xl font-semibold border-slate-200">
                    <Link to={`/plan/${p.id}`}>View <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                  </Button>
                  {p.status === "draft" && (
                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => setDeleteTarget(p)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Week {deleteTarget?.weekNumber} plan?</AlertDialogTitle>
            <AlertDialogDescription>This draft plan will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-rose-600 hover:bg-rose-700" onClick={() => { if (deleteTarget) deleteMut.mutate(deleteTarget.id); setDeleteTarget(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
