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
    <div className="group relative h-full flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-transparent px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-800">
            <CalendarRange className="h-3.5 w-3.5" />
            {MONTHS[plan.month]} · Week {plan.week} · {plan.year}
          </div>
          <h3 className="mt-4 truncate text-xl font-black leading-tight tracking-tight text-slate-900">{plan.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-500">
            {plan.description || "No description."}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 disabled:opacity-50"
          aria-label="Delete plan"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center justify-center rounded-xl py-3 text-center transition-colors hover:bg-slate-50">
          <span className="text-xl font-black text-slate-900">{plan.slots.length}</span>
          <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Slots</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-50/80 py-3 text-center transition-colors hover:bg-emerald-100/80">
          <span className="text-xl font-black text-emerald-700">{accepted}</span>
          <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-800">Accepted</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-rose-50/80 py-3 text-center transition-colors hover:bg-rose-100/80">
          <span className="text-xl font-black text-rose-700">{rejected}</span>
          <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-rose-800">Rejected</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5 mt-5">
        <div className="text-sm">
          <span className="text-slate-500 font-medium">Cost </span>
          <span className="font-black text-slate-900">${totalCost.toFixed(0)}</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold">
          <Link to={`/dashboard/plans/${plan.id}/summary`} className="text-slate-900 hover:text-slate-600 transition-colors">
            Details
          </Link>
          <Link to={`/dashboard/plans/${plan.id}`} className="flex items-center gap-1 text-slate-900 hover:text-slate-600 transition-colors">
            Open <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
