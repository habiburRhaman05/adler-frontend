import { useState } from "react";
import { toast } from "sonner";
import { api, type Category, type Plan, type WorkloadRequirement } from "../../lib/plan-data";
import { WorkloadRequirementCard } from "./workload-requirement-card";

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface WorkloadBarProps {
  plan: Plan;
  categories: Category[];
  assignedCounts: Map<string, number>;
}

/** Horizontal, top-level workload status bar with an "Add requirement" dialog. */
export function WorkloadBar({ plan, categories, assignedCounts }: WorkloadBarProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [catId, setCatId] = useState<string>(categories[0]?.id ?? "");
  const [needed, setNeeded] = useState(2);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const addReq = async () => {
    if (!label.trim() || !catId) return;
    const req: WorkloadRequirement = { id: uid("r"), categoryId: catId, label: label.trim(), needed };
    setSaving(true);
    await api.updatePlan(plan.id, { workload: [...plan.workload, req] });
    setSaving(false);
    setOpen(false);
    setLabel("");
    setNeeded(2);
  };

  const removeReq = async (id: string) => {
    const req = plan.workload.find((w) => w.id === id);
    if (!req) return;
    if (
      !confirm(
        `Remove workload requirement "${req.label}"? Already-assigned slots will stay, but will no longer count toward it.`,
      )
    ) {
      return;
    }
    setRemovingId(id);
    await api.updatePlan(plan.id, { workload: plan.workload.filter((w) => w.id !== id) });
    setRemovingId(null);
    toast.success("Workload requirement removed");
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-bold tracking-tight">Workload status</h2>
          <p className="text-xs font-medium text-muted-foreground">Need vs. assigned per category</p>
        </div>
      </div>

      {plan.workload.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/40 bg-white/30 p-6 text-center text-sm font-medium text-muted-foreground shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-black/10">
          No requirements yet. Add lunch, dinner, etc.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {plan.workload.map((r) => (
            <WorkloadRequirementCard
              key={r.id}
              requirement={r}
              category={categories.find((c) => c.id === r.categoryId)}
              assigned={assignedCounts.get(r.categoryId) ?? 0}
              removing={removingId === r.id}
              onRemove={() => removeReq(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
