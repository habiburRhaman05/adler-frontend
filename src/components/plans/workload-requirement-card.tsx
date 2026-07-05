import { AlertTriangle, ShieldAlert, Trash2, Loader2 } from "lucide-react";
import type { Category, WorkloadRequirement } from "../../lib/plan-data";

interface WorkloadRequirementCardProps {
  requirement: WorkloadRequirement;
  category?: Category;
  assigned: number;
  removing: boolean;
  onRemove: () => void;
}

/** Single workload requirement pill: need vs. assigned progress + over/under status. */
export function WorkloadRequirementCard({
  requirement,
  category,
  assigned,
  removing,
  onRemove,
}: WorkloadRequirementCardProps) {
  const pct = Math.min(100, (assigned / requirement.needed) * 100);
  const short = assigned < requirement.needed;
  const over = assigned > requirement.needed;

  return (
    <div className="w-56 shrink-0 rounded-2xl border border-slate-200 bg-white p-3.5 transition-all duration-300 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${category?.color || "bg-slate-400"}`} />
              <span className="truncate text-[13px] font-black text-slate-900">{requirement.label}</span>
            </div>
            <button
              onClick={onRemove}
              disabled={removing}
              className="shrink-0 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50 transition-colors"
            >
              {removing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="text-[11px] font-medium text-slate-500 pl-4">{category?.name || "No Category"}</div>
        </div>
      </div>
      
      <div className="mt-4 flex items-end justify-between">
        <div>
          {short && (
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-100">
              <AlertTriangle className="h-2.5 w-2.5" />
              Need {requirement.needed - assigned} more
            </div>
          )}
          {over && (
            <div className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-100">
              <ShieldAlert className="h-2.5 w-2.5" />
              {assigned - requirement.needed} over
            </div>
          )}
          {!short && !over && (
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100">
              Perfect
            </div>
          )}
        </div>
        <span className="text-[11px] font-black tabular-nums text-slate-400">
          {assigned}/{requirement.needed}
        </span>
      </div>
    </div>
  );
}
