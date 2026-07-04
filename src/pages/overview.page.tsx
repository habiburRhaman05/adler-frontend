import { Link } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  Clock,
  TrendingUp,
  CalendarPlus,
  CalendarRange,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployees } from "@/features/employees/hooks/use-employees";
import { usePlans } from "@/features/plans/hooks/use-plans";
import { useApprovals } from "@/features/approvals/hooks/use-approvals";
import { useAuthStore } from "@/stores/auth.store";
import { initials } from "@/lib/utils";
import type { Plan } from "@/features/plans/api/plan.service";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  submitted: { label: "Submitted", cls: "bg-amber-50 text-amber-600 border-amber-200" },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-600 border-rose-200" },
};

export function OverviewPage() {
  const user = useAuthStore((s) => s.user);
  const { data: employeesData, isLoading: empLoading } = useEmployees();
  const { data: plansData, isLoading: plansLoading } = usePlans({ _sort: "weekNumber", _order: "asc" });
  const { data: approvalsData, isLoading: apprLoading } = useApprovals();

  const employees = employeesData?.items ?? [];
  const plans = plansData?.items ?? [];
  const approvals = approvalsData?.items ?? [];

  const activeCount = employees.filter((e) => e.status === "Active").length;
  const pending = approvals.filter((a) => a.status === "pending");
  const violations = plans.reduce((sum, p) => sum + (p.violations?.length ?? 0), 0);
  const nameOf = (id: string) => employees.find((e) => e.id === id)?.name ?? id;

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Overview</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900 tracking-tight">Good day, {firstName}</h1>
          <p className="text-slate-500 mt-1 font-medium">Here's how things are shaping up.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild className="rounded-xl font-semibold bg-white border-slate-200">
            <Link to="/plans/manage">Manage plans</Link>
          </Button>
          <Button asChild className="rounded-xl font-semibold shadow-md shadow-primary/20">
            <Link to="/plan/create">Create plan <CalendarPlus className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard loading={empLoading} icon={<Users className="h-4 w-4" />} label="Active employees" value={String(activeCount)} hint={`${employees.length} total`} colorClass="text-sky-600 bg-sky-50" />
        <KpiCard loading={plansLoading} icon={<CalendarRange className="h-4 w-4" />} label="Plans" value={String(plans.length)} hint={`${plans.filter((p) => p.status === "draft").length} draft`} colorClass="text-primary bg-primary/10" />
        <KpiCard loading={apprLoading} icon={<ArrowLeftRight className="h-4 w-4" />} label="Pending swaps" value={String(pending.length)} hint="Waiting for review" colorClass="text-amber-600 bg-amber-50" accent />
        <KpiCard loading={plansLoading} icon={<AlertTriangle className="h-4 w-4" />} label="Rule violations" value={String(violations)} hint="Across all plans" colorClass="text-rose-600 bg-rose-50" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weeks status */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex-row items-center justify-between bg-slate-50/50 border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Plan status</CardTitle>
              <p className="text-sm font-medium text-slate-500 mt-1">Weekly plans by status</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/5">
              <Link to="/plans/manage">Open <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 p-6">
            {plansLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            {!plansLoading && plans.length === 0 && <p className="text-slate-500 font-medium col-span-2 py-8 text-center">No plans yet. Create one to get started.</p>}
            {!plansLoading && plans.map((w) => (
              <Link key={w.id} to={`/plan/${w.id}`} className="rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:shadow-sm transition-all bg-white block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Week {w.weekNumber}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{w.dateRange.start} → {w.dateRange.end}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {w.assignments.length} assignment{w.assignments.length !== 1 ? "s" : ""}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Pending swaps preview */}
        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex-row items-center justify-between bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">Pending swaps</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/5">
              <Link to="/approvals">All <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {apprLoading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            {!apprLoading && pending.length === 0 && <p className="text-slate-500 font-medium text-center py-6">No pending swaps.</p>}
            {!apprLoading && pending.slice(0, 3).map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-200 p-3 bg-white shadow-sm">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-slate-900 truncate">{nameOf(s.swapData.fromEmployeeId)}</span>
                  <ArrowLeftRight className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="font-bold text-slate-900 truncate">{nameOf(s.swapData.toEmployeeId)}</span>
                  <Badge variant="outline" className={`ml-auto shrink-0 ${s.swapData.ruleCheck === "pass" ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-rose-200 text-rose-600 bg-rose-50"}`}>
                    {s.swapData.ruleCheck === "pass" ? "OK" : "Fail"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2">{s.swapData.fromShift.day} · {s.swapData.fromShift.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Missing submissions / not-submitted employees */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">Recently added staff</CardTitle>
            <p className="text-sm font-medium text-slate-500 mt-1">Newest members of the team.</p>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {empLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            {!empLoading && employees.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200 overflow-hidden">
                    {e.avatar ? <img src={e.avatar} alt={e.name} className="h-full w-full object-cover" /> : initials(e.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{e.name}</p>
                    <p className="text-[11px] font-medium text-slate-500 truncate">{e.designation} · {e.department}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50">{e.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5 text-sm">
            <Stat label="Total employees" value={String(employees.length)} loading={empLoading} />
            <div className="h-px w-full bg-slate-100" />
            <Stat label="Approved plans" value={String(plans.filter((p) => p.status === "approved").length)} loading={plansLoading} />
            <div className="h-px w-full bg-slate-100" />
            <Stat label="Submitted plans" value={String(plans.filter((p) => p.status === "submitted").length)} loading={plansLoading} tone="warning" />
            <div className="h-px w-full bg-slate-100" />
            <Stat label="Pending swaps" value={String(pending.length)} loading={apprLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, hint, accent, colorClass, loading }: { icon: React.ReactNode; label: string; value: string; hint: string; accent?: boolean; colorClass: string; loading?: boolean }) {
  return (
    <Card className={`rounded-2xl shadow-sm bg-white border ${accent ? "border-primary/40 ring-1 ring-primary/10" : "border-slate-200"}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${colorClass}`}>{icon}</span>
          {label}
        </div>
        {loading ? (
          <Skeleton className="mt-4 h-9 w-20" />
        ) : (
          <p className="mt-4 text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        )}
        <p className="text-xs font-medium text-slate-500 mt-1">{hint}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Plan["status"] }) {
  const m = STATUS_META[status] ?? STATUS_META.draft;
  return <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${m.cls}`}>{m.label}</span>;
}

function Stat({ label, value, tone, loading }: { label: string; value: string; tone?: "warning"; loading?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 font-medium">{label}</span>
      {loading ? <Skeleton className="h-4 w-10" /> : <span className={`font-bold ${tone === "warning" ? "text-amber-600" : "text-slate-900"}`}>{value}</span>}
    </div>
  );
}
