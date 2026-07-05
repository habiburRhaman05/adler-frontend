import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { CalendarRange, Loader2 } from "lucide-react";
import { useDB } from "@/lib/plan-data";
import { CreatePlanDialog } from "@/components/plans/create-plan-dialog";
import { PlanFiltersBar } from "@/components/plans/plan-filters-bar";
import { PlansEmptyState } from "@/components/plans/plans-empty-state";
import { PlanCard } from "@/components/plans/plan-card";

export function PlansPage() {
  const db = useDB();
  const plans = db.plans;
  const now = new Date();
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [weekFilter, setWeekFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    document.title = "Plans — Shift Planner";
  }, []);

  const hasActiveFilters = monthFilter !== "all" || weekFilter !== "all" || q.trim() !== "";

  const filtered = useMemo(() => {
    return plans
      .filter((p) => (monthFilter === "all" ? true : p.month === Number(monthFilter)))
      .filter((p) => (weekFilter === "all" ? true : p.week === Number(weekFilter)))
      .filter((p) => (q ? p.name.toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [plans, monthFilter, weekFilter, q]);

  return (
    <div className="relative min-h-screen bg-slate-50 text-foreground overflow-hidden dark:bg-slate-950">
      <header className="relative top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <CalendarRange className="h-5 w-5" />
            </div>
            <div>
              <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                Shift Planner
              </Link>
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Plans</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="[&_button]:rounded-full [&_button]:px-5 [&_button]:font-bold [&_button]:bg-blue-600 [&_button]:hover:bg-blue-700">
              <CreatePlanDialog now={now} />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 py-8">
        <div className="animate-in fade-in slide-in-from-top-1 duration-500">
          <PlanFiltersBar
            q={q}
            onQChange={setQ}
            monthFilter={monthFilter}
            onMonthFilterChange={setMonthFilter}
            weekFilter={weekFilter}
            onWeekFilterChange={setWeekFilter}
          />
        </div>

        {filtered.length === 0 ? (
          <PlansEmptyState now={now} filtered={hasActiveFilters && plans.length > 0} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <div
                key={p.id}
                className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500"
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              >
                <PlanCard plan={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}