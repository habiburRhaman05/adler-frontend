import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Users,
  ClipboardCheck,
  AlertTriangle,
  ArrowLeftRight,
  BellRing,
  ArrowRight,
  Clock,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  employees,
  submittedAvailability,
  notSubmitted,
  currentMonth,
  weeks,
  swapRequests,
} from "@/lib/mock-data";

export function OverviewPage() {
  const pct = Math.round((submittedAvailability.submitted / submittedAvailability.total) * 100);
  const pending = swapRequests.filter((s) => s.status === "pending");
  const missing = notSubmitted.map((id) => employees.find((e) => e.id === id)!).filter(Boolean);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Overview</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900 tracking-tight">Good morning, Martin</h1>
          <p className="text-slate-500 mt-1 font-medium">Here's how {currentMonth} is shaping up.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild className="rounded-xl font-semibold bg-white border-slate-200">
            <Link to="/plans">Open weekly plan</Link>
          </Button>
          <Button asChild className="rounded-xl font-semibold shadow-md shadow-primary/20">
            <Link to="/approvals">Review swaps <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<ClipboardCheck className="h-4 w-4" />}
          label="Availability submitted"
          value={`${submittedAvailability.submitted} / ${submittedAvailability.total}`}
          hint={`${pct}% of active staff`}
          colorClass="text-primary bg-primary/10"
        >
          <Progress value={pct} className="mt-3 h-2" />
        </KpiCard>
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Active employees"
          value={String(employees.filter((e) => e.active).length)}
          hint="Across 6 categories"
          colorClass="text-sky-600 bg-sky-50"
        />
        <KpiCard
          icon={<ArrowLeftRight className="h-4 w-4" />}
          label="Pending swaps"
          value={String(pending.length)}
          hint="Waiting for your review"
          colorClass="text-amber-600 bg-amber-50"
          accent
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Rule violations"
          value="2"
          hint="Week 3 draft — L-GAV checks"
          colorClass="text-rose-600 bg-rose-50"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weeks status */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex-row items-center justify-between bg-slate-50/50 border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Weekly plan status</CardTitle>
              <p className="text-sm font-medium text-slate-500 mt-1">{currentMonth}</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/5">
              <Link to="/plans">Open <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 p-6">
            {weeks.map((w) => (
              <div key={w.id} className="rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:shadow-sm transition-all bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{w.label}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{w.range}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {w.status === "published" && "Notified 12 employees"}
                  {w.status === "submitted" && "Awaiting acceptances (7 / 12)"}
                  {w.status === "draft" && "Not submitted yet"}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Missing submissions */}
        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">Not submitted yet</CardTitle>
            <p className="text-sm font-medium text-slate-500 mt-1">Send a one-tap reminder.</p>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {missing.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200">
                    {e.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{e.name}</p>
                    <p className="text-[11px] font-medium text-slate-500 truncate">{e.email}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary hover:text-primary hover:bg-primary/5 rounded-lg"
                  onClick={() => toast.success(`Reminder sent to ${e.name.split(" ")[0]}`)}
                >
                  <BellRing className="h-4 w-4 mr-1.5" /> Nudge
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending swaps preview */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex-row items-center justify-between bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">Pending shift swaps</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/5">
              <Link to="/approvals">All swaps <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {pending.slice(0, 2).map((s) => {
              const from = employees.find((e) => e.id === s.fromEmployeeId)!;
              const to = employees.find((e) => e.id === s.toEmployeeId)!;
              return (
                <div key={s.id} className="rounded-xl border border-slate-200 p-5 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{from.name}</span>
                      <span className="text-slate-500 font-medium text-xs mt-0.5 bg-slate-50 px-2 py-1 rounded-md">{s.fromShift.day} · {s.fromShift.time}</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ArrowLeftRight className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{to.name}</span>
                      <span className="text-slate-500 font-medium text-xs mt-0.5 bg-slate-50 px-2 py-1 rounded-md">{s.toShift.day} · {s.toShift.time}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={s.ruleCheck === "pass" ? "border-emerald-200 text-emerald-600 bg-emerald-50 ml-auto px-3 py-1" : "border-rose-200 text-rose-600 bg-rose-50 ml-auto px-3 py-1"}
                    >
                      {s.ruleCheck === "pass" ? "Rules OK" : "Rule fail"}
                    </Badge>
                  </div>
                  {s.ruleNote && <p className="text-[13px] font-medium text-rose-600 mt-4 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">{s.ruleNote}</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> This month
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5 text-sm">
            <Stat label="Scheduled hours" value="1,842 h" />
            <div className="h-px w-full bg-slate-100" />
            <Stat label="Overtime" value="46 h" tone="warning" />
            <div className="h-px w-full bg-slate-100" />
            <Stat label="Wage cost" value="CHF 52,410" />
            <div className="h-px w-full bg-slate-100" />
            <Stat label="Rejected shifts" value="3" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon, label, value, hint, accent, colorClass, children,
}: { icon: React.ReactNode; label: string; value: string; hint: string; accent?: boolean; colorClass: string; children?: React.ReactNode }) {
  return (
    <Card className={`rounded-2xl shadow-sm bg-white border ${accent ? "border-primary/40 ring-1 ring-primary/10" : "border-slate-200"}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${colorClass}`}>
            {icon}
          </span>
          {label}
        </div>
        <p className="mt-4 text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-1">{hint}</p>
        {children}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: "draft" | "submitted" | "published" }) {
  const map = {
    draft: { label: "Draft", cls: "bg-slate-100 text-slate-600 border-slate-200" },
    submitted: { label: "Submitted", cls: "bg-amber-50 text-amber-600 border-amber-200" },
    published: { label: "Published", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  } as const;
  const m = map[status];
  return <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${m.cls}`}>{m.label}</span>;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warning" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className={`font-bold ${tone === "warning" ? "text-amber-600" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}
