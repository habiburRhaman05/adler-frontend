import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle2, Trash2, CalendarRange, Users, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePlan, useChangePlanStatus, useDeletePlan } from "@/features/plans/hooks/use-plans";
import { useEmployees } from "@/features/employees/hooks/use-employees";
import { initials, formatDate } from "@/lib/utils";
import { useCategories } from "@/features/categories/hooks/use-categories";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  submitted: { label: "Submitted", cls: "bg-amber-50 text-amber-600 border-amber-200" },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-600 border-rose-200" },
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function PlanDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: plan, isLoading, isError } = usePlan(id);
  const { data: employeesData } = useEmployees();
  const { data: categoriesData } = useCategories();
  const changeStatus = useChangePlanStatus();
  const deleteMut = useDeletePlan();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const employees = employeesData?.items ?? [];
  const categories = categoriesData?.items ?? [];
  const nameOf = (id: string) => employees.find((e) => e.id === id)?.name ?? id;
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-[1400px]">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-600 font-medium">Plan not found or the mock API is not running.</p>
        <Button asChild variant="outline" className="rounded-xl"><Link to="/plans/manage">Back to plans</Link></Button>
      </div>
    );
  }

  const meta = STATUS_META[plan.status] ?? STATUS_META.draft;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1400px]">
      <Button asChild variant="ghost" className="text-slate-500 hover:text-slate-900 -ml-2">
        <Link to="/plans/manage"><ArrowLeft className="h-4 w-4 mr-1.5" /> Back to plans</Link>
      </Button>

      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <CalendarRange className="h-6 w-6" />
              <h1 className="text-2xl font-bold text-slate-900">Week {plan.weekNumber}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${meta.cls}`}>{meta.label}</span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-2">{plan.month} · {plan.dateRange.start} → {plan.dateRange.end}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Created {formatDate(plan.createdAt)}{plan.submittedAt ? ` · Submitted ${formatDate(plan.submittedAt)}` : ""}</p>
          </div>
          <div className="flex gap-2">
            {plan.status === "draft" && (
              <Button onClick={() => changeStatus.mutate({ id: plan.id, status: "submitted" })} disabled={changeStatus.isPending} className="rounded-xl font-semibold shadow-md shadow-primary/20">
                <Send className="h-4 w-4 mr-2" /> Submit
              </Button>
            )}
            {plan.status === "submitted" && (
              <Button onClick={() => changeStatus.mutate({ id: plan.id, status: "approved" })} disabled={changeStatus.isPending} className="rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-md">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
              </Button>
            )}
            {plan.status === "draft" && (
              <Button variant="outline" className="rounded-xl font-semibold border-slate-200 text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {plan.violations && plan.violations.length > 0 && (
        <Card className="border border-rose-200 bg-rose-50/50 rounded-2xl shadow-sm">
          <CardContent className="p-5 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-700">{plan.violations.length} rule violation(s)</p>
              <ul className="mt-1 text-sm text-rose-600 space-y-1">{plan.violations.map((v, i) => <li key={i}>• {v}</li>)}</ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manpower needs */}
      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4"><CardTitle className="text-lg font-bold text-slate-900">Manpower needs</CardTitle></CardHeader>
        <CardContent className="p-6">
          {(plan.manpower ?? []).length === 0 ? (
            <p className="text-slate-500 font-medium">No manpower requirements defined.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {plan.manpower!.map((m, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
                  <p className="font-bold text-slate-900 text-sm">{m.day}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{m.shiftType} · {catName(m.categoryId)}</p>
                  <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary font-semibold border-0">{m.required} needed</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Assignments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {plan.assignments.length === 0 ? (
            <p className="text-slate-500 font-medium text-center py-12">No employees assigned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-slate-50/90 border-b border-slate-200 p-4 text-left font-bold text-slate-700 min-w-[200px]">Employee</th>
                    {DAYS.map((d) => <th key={d} className="border-b border-slate-200 p-3 text-left font-bold text-slate-700 min-w-[120px] bg-slate-50/50">{d.slice(0, 3)}</th>)}
                    <th className="border-b border-slate-200 p-3 text-right font-bold text-slate-700 bg-slate-50/50">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.assignments.map((a) => (
                    <tr key={a.employeeId} className="hover:bg-slate-50/50">
                      <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-100 p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">{initials(nameOf(a.employeeId))}</div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{nameOf(a.employeeId)}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{catName(a.categoryId)}</p>
                          </div>
                        </div>
                      </td>
                      {DAYS.map((d) => {
                        const shift = a.shifts.find((s) => s.day === d);
                        return (
                          <td key={d} className="border-b border-slate-100 p-2 align-top">
                            {shift ? (
                              <div className="rounded-lg bg-primary/5 border border-primary/10 p-2 text-xs">
                                <p className="font-semibold text-primary">{shift.startTime}–{shift.endTime}</p>
                                {shift.shiftType && <p className="text-slate-500 mt-0.5">{shift.shiftType}</p>}
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs flex justify-center">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="border-b border-slate-100 p-3 text-right font-bold text-slate-900">{a.totalHours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
            <AlertDialogDescription>This draft plan will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-rose-600 hover:bg-rose-700" onClick={() => deleteMut.mutate(plan.id, { onSuccess: () => navigate("/plans/manage") })}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
