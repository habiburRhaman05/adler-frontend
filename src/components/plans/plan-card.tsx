import { Link } from "react-router-dom";
import { useState } from "react";
import { CalendarRange, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, MONTHS, type Plan } from "../../lib/plan-data";

interface PlanCardProps {
  plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const [deleting, setDeleting] = useState(false);
  const totalCost = plan.slots.reduce((s, x) => s + x.cost, 0);
  const accepted = plan.slots.filter((s) => s.status === "accepted").length;
  const rejected = plan.slots.filter((s) => s.status === "rejected").length;

  const handleDelete = async () => {
    if (!confirm(`Delete "${plan.name}"?`)) return;
    setDeleting(true);
    await api.deletePlan(plan.id);
    setDeleting(false);
    toast.success("Plan deleted");
  };

return (
  <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    {/* Gradient Header */}
    {/* <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500" /> */}

    {/* Glow */}
    {/* <div className="absolute -top-8 right-0 h-20 w-20 rounded-full bg-cyan-300/30 blur-3xl transition duration-500 group-hover:scale-125" /> */}

    <div className="relative flex h-full flex-col p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-black backdrop-blur">
            <CalendarRange className="h-3 w-3" />
            {MONTHS[plan.month]} · W{plan.week} · {plan.year}
          </div>

          <h3 className="mt-3 truncate text-lg font-bold text-black">
            {plan.name}
          </h3>

       
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-white/20 p-1.5 text-black backdrop-blur transition hover:bg-red-500"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="mt-1 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 text-center text-white shadow">
          <p className="text-xl font-bold">{plan.slots.length}</p>
          <span className="text-[10px] uppercase tracking-wide opacity-90">
            Slots
          </span>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 p-3 text-center text-white shadow">
          <p className="text-xl font-bold">{accepted}</p>
          <span className="text-[10px] uppercase tracking-wide opacity-90">
            Accepted
          </span>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 p-3 text-center text-white shadow">
          <p className="text-xl font-bold">{rejected}</p>
          <span className="text-[10px] uppercase tracking-wide opacity-90">
            Rejected
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[10px] font-medium text-slate-500">
          <span>Progress</span>
          <span>
            {accepted}/{plan.slots.length}
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 transition-all duration-500"
            style={{
              width: `${
                (accepted / Math.max(plan.slots.length, 1)) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Cost */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-[11px] text-slate-500">Total Cost</p>
          <p className="text-xl font-bold text-slate-900">
            ${totalCost.toFixed(0)}
          </p>
        </div>

        <div className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-semibold text-white">
          Budget
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex gap-2 pt-2">
        <Link
          to={`/dashboard/plans/${plan.id}/summary`}
          className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Details
        </Link>

        <Link
          to={`/dashboard/plans/${plan.id}`}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg"
        >
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  </div>
);
}
