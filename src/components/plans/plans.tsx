import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  DollarSign,
  Save,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ============================================================================
 * Local data layer — localStorage-backed "database" with a mock API delay.
 * Self-contained on purpose: no external store import required.
 * ==========================================================================*/
const DB_KEY = "shift-planner:db:v1";
const NETWORK_DELAY = 400;

export type SlotStatus = "pending" | "accepted" | "rejected";

export interface Availability {
  day: number;
  start: string;
  end: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  hourlyRate: number;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  categoryId: string;
  availability: Availability[];
}

export interface WorkloadRequirement {
  id: string;
  categoryId: string;
  label: string;
  needed: number;
}

export interface AssignedSlot {
  id: string;
  workerId: string;
  categoryId: string;
  day: number;
  start: string;
  end: string;
  hours: number;
  cost: number;
  status: SlotStatus;
  reassignedFrom?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  month: number;
  week: number;
  year: number;
  workload: WorkloadRequirement[];
  slots: AssignedSlot[];
  createdAt: number;
}

interface DB {
  plans: Plan[];
  categories: Category[];
  workers: Worker[];
}

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function hoursBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
}

export function currentWeekOfMonth(d: Date) {
  return Math.min(5, Math.ceil(d.getDate() / 7));
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function seedDB(): DB {
  const categories: Category[] = [
    { id: "cat_kitchen", name: "Kitchen", color: "bg-amber-500", hourlyRate: 14 },
    { id: "cat_service", name: "Service", color: "bg-emerald-500", hourlyRate: 12 },
    { id: "cat_cashier", name: "Cashier", color: "bg-sky-500", hourlyRate: 13 },
  ];
  const mkAvail = (days: number[], start: string, end: string): Availability[] =>
    days.map((day) => ({ day, start, end }));
  const workers: Worker[] = [
    { id: "w1", name: "Amina Rahman", email: "amina.rahman@example.com", categoryId: "cat_kitchen", availability: mkAvail([1, 2, 3, 4, 5], "09:00", "17:00") },
    { id: "w2", name: "Tariq Islam", email: "tariq.islam@example.com", categoryId: "cat_kitchen", availability: mkAvail([0, 2, 4, 6], "12:00", "20:00") },
    { id: "w3", name: "Nusrat Jahan", email: "nusrat.jahan@example.com", categoryId: "cat_service", availability: mkAvail([1, 3, 5], "10:00", "18:00") },
    { id: "w4", name: "Rafiul Karim", email: "rafiul.karim@example.com", categoryId: "cat_service", availability: mkAvail([0, 1, 2, 3, 4], "16:00", "23:00") },
    { id: "w5", name: "Sadia Akter", email: "sadia.akter@example.com", categoryId: "cat_cashier", availability: mkAvail([2, 3, 4, 5, 6], "08:00", "14:00") },
    { id: "w6", name: "Imran Hossain", email: "imran.hossain@example.com", categoryId: "cat_cashier", availability: mkAvail([0, 1, 5, 6], "14:00", "22:00") },
  ];
  const now = new Date();
  const demoSlots: AssignedSlot[] = [
    { id: uid("s"), workerId: "w1", categoryId: "cat_kitchen", day: 1, start: "09:00", end: "17:00", hours: 8, cost: 112, status: "accepted" },
    { id: uid("s"), workerId: "w3", categoryId: "cat_service", day: 1, start: "10:00", end: "18:00", hours: 8, cost: 96, status: "pending" },
    { id: uid("s"), workerId: "w5", categoryId: "cat_cashier", day: 2, start: "08:00", end: "14:00", hours: 6, cost: 78, status: "rejected" },
    { id: uid("s"), workerId: "w4", categoryId: "cat_service", day: 0, start: "16:00", end: "23:00", hours: 7, cost: 84, status: "accepted" },
  ];
  const plans: Plan[] = [
    {
      id: "plan_demo",
      name: `Downtown Location — Week ${currentWeekOfMonth(now)}`,
      description: "Sample staffing plan to explore the builder.",
      month: now.getMonth(),
      week: currentWeekOfMonth(now),
      year: now.getFullYear(),
      workload: [
        { id: uid("r"), categoryId: "cat_kitchen", label: "Lunch prep", needed: 2 },
        { id: uid("r"), categoryId: "cat_service", label: "Floor service", needed: 2 },
        { id: uid("r"), categoryId: "cat_cashier", label: "Register", needed: 1 },
      ],
      slots: demoSlots,
      createdAt: Date.now(),
    },
  ];
  return { plans, categories, workers };
}

function readDB(): DB {
  if (typeof window === "undefined") return seedDB();
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) {
      const seeded = seedDB();
      window.localStorage.setItem(DB_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as DB;
  } catch {
    return seedDB();
  }
}

function writeDB(db: DB) {
  window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("shift-planner:sync"));
}

function delay<T>(value: T, ms = NETWORK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function useDB() {
  const [db, setDb] = useState<DB>(() => readDB());
  useEffect(() => {
    const sync = () => setDb(readDB());
    window.addEventListener("shift-planner:sync", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("shift-planner:sync", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return db;
}

export const api = {
  async updatePlan(id: string, patch: Partial<Plan>) {
    const db = readDB();
    db.plans = db.plans.map((p) => (p.id === id ? { ...p, ...patch } : p));
    writeDB(db);
    return delay(true);
  },
  async addCategory(input: Omit<Category, "id">) {
    const db = readDB();
    const cat: Category = { ...input, id: uid("cat") };
    db.categories = [...db.categories, cat];
    writeDB(db);
    return delay(cat);
  },
  async removeCategory(id: string) {
    const db = readDB();
    db.categories = db.categories.filter((c) => c.id !== id);
    writeDB(db);
    return delay(true);
  },
};
/* ========================================================================== */

/** Counts assigned slots per category, optionally excluding one slot id (used while editing). */
function countByCategory(slots: AssignedSlot[], excludeSlotId?: string) {
  const map = new Map<string, number>();
  slots.forEach((s) => {
    if (s.id === excludeSlotId) return;
    map.set(s.categoryId, (map.get(s.categoryId) ?? 0) + 1);
  });
  return map;
}

interface PendingAssignment {
  worker: Worker;
  day: number;
  start: string;
  end: string;
  existing?: AssignedSlot;
  categoryId: string;
  requirement: WorkloadRequirement;
  willBeCount: number;
}

function PlanBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const db = useDB();
  const plan = db.plans.find((p) => p.id === id);
  const categories = db.categories;
  const workers = db.workers;

  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [pendingAssignment, setPendingAssignment] = useState<PendingAssignment | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = plan ? `${plan.name} — Plan builder` : "Plan builder";
  }, [plan]);

  const filteredWorkers = useMemo(
    () =>
      workers.filter(
        (w) =>
          (catFilter === "all" || w.categoryId === catFilter) &&
          (q ? w.name.toLowerCase().includes(q.toLowerCase()) : true),
      ),
    [workers, q, catFilter],
  );

  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Plan not found.</p>
          <Link to="/plans" className="text-primary underline">
            Back to plans
          </Link>
        </div>
      </div>
    );
  }

  const totalCost = plan.slots.reduce((s, x) => s + x.cost, 0);
  const assignedCounts = countByCategory(plan.slots);
  const overstaffed = plan.workload.filter(
    (r) => (assignedCounts.get(r.categoryId) ?? 0) > r.needed,
  );

  /** Central entry point for assigning a worker/day/slot to a category.
   *  If it would push the category over its workload requirement, ask for
   *  confirmation via a warning modal instead of assigning immediately. */
  const requestAssign = (
    worker: Worker,
    day: number,
    start: string,
    end: string,
    existing: AssignedSlot | undefined,
    categoryId: string,
  ) => {
    const requirement = plan.workload.find((r) => r.categoryId === categoryId);
    const counts = countByCategory(plan.slots, existing?.id);
    const willBeCount = (counts.get(categoryId) ?? 0) + 1;

    if (requirement && willBeCount > requirement.needed) {
      setPendingAssignment({ worker, day, start, end, existing, categoryId, requirement, willBeCount });
      return;
    }
    void commitAssign(worker, day, start, end, existing, categoryId);
  };

  const commitAssign = async (
    worker: Worker,
    day: number,
    start: string,
    end: string,
    existing: AssignedSlot | undefined,
    categoryId: string,
  ) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    const hours = hoursBetween(start, end);
    const cost = +(cat.hourlyRate * hours).toFixed(2);
    const newSlot: AssignedSlot = existing
      ? { ...existing, categoryId, cost, hours }
      : {
          id: uid("s"),
          workerId: worker.id,
          categoryId,
          day,
          start,
          end,
          hours,
          cost,
          status: "pending",
        };
    const nextSlots = existing
      ? plan.slots.map((s) => (s.id === existing.id ? newSlot : s))
      : [...plan.slots, newSlot];
    setSaving(true);
    await api.updatePlan(plan.id, { slots: nextSlots });
    setSaving(false);
  };

  const clearSlot = async (slotId: string) => {
    setSaving(true);
    await api.updatePlan(plan.id, { slots: plan.slots.filter((s) => s.id !== slotId) });
    setSaving(false);
  };

  const confirmPendingAssignment = async () => {
    if (!pendingAssignment) return;
    const { worker, day, start, end, existing, categoryId } = pendingAssignment;
    setPendingAssignment(null);
    await commitAssign(worker, day, start, end, existing, categoryId);
    toast.warning("Assigned above the workload requirement.");
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/plans" className="rounded-md p-1.5 text-muted-foreground transition hover:bg-accent">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                {MONTHS[plan.month]} · Week {plan.week}
              </div>
              <h1 className="text-xl font-semibold leading-tight">{plan.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
              </span>
            )}
            <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm sm:flex">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Cost</span>
              <span className="font-semibold">${totalCost.toFixed(0)}</span>
            </div>
            <ManageCategoriesDialog categories={categories} />
            <Link to={`/plans/${plan.id}/summary`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Submit / details
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] space-y-4 px-6 py-6">
        {/* Overstaffed banner */}
        {overstaffed.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                Over workload in {overstaffed.length} categor{overstaffed.length === 1 ? "y" : "ies"}
              </div>
              <div className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-300/80">
                {overstaffed
                  .map((r) => {
                    const cat = categories.find((c) => c.id === r.categoryId);
                    return `${r.label} (${cat?.name ?? "—"}): ${assignedCounts.get(r.categoryId) ?? 0}/${r.needed}`;
                  })
                  .join(" · ")}
              </div>
            </div>
          </div>
        )}

        {/* TOP: Workload requirements — full-width horizontal bar */}
        <WorkloadBar plan={plan} categories={categories} assignedCounts={assignedCounts} />

        {/* Search / filter */}
        <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/50 p-3 backdrop-blur sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search workers…"
              className="pl-9"
            />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Worker schedule grid — full screen width */}
        <div className="w-full overflow-hidden rounded-2xl border border-border/70 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="sticky left-0 z-10 bg-muted/40 px-4 py-3 text-left">Worker</th>
                  {DAYS.map((d) => (
                    <th key={d} className="px-3 py-3 text-left font-medium">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((w) => (
                  <WorkerRow
                    key={w.id}
                    worker={w}
                    plan={plan}
                    categories={categories}
                    onRequestAssign={requestAssign}
                    onClear={clearSlot}
                  />
                ))}
                {filteredWorkers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                      No workers match filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Over-workload warning modal */}
      <Dialog open={!!pendingAssignment} onOpenChange={(o) => !o && setPendingAssignment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Exceeds workload requirement
            </DialogTitle>
          </DialogHeader>
          {pendingAssignment && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Assigning <span className="font-medium text-foreground">{pendingAssignment.worker.name}</span> here
                will bring{" "}
                <span className="font-medium text-foreground">{pendingAssignment.requirement.label}</span> to{" "}
                <span className="font-semibold text-amber-600">
                  {pendingAssignment.willBeCount}/{pendingAssignment.requirement.needed}
                </span>{" "}
                — above the required workload.
              </p>
              <p className="text-xs text-muted-foreground">
                You can still assign this worker, but consider raising the workload requirement instead.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingAssignment(null)}>
              Cancel
            </Button>
            <Button onClick={confirmPendingAssignment} className="gap-1.5 bg-amber-600 hover:bg-amber-600/90">
              Assign anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WorkerRow({
  worker,
  plan,
  categories,
  onRequestAssign,
  onClear,
}: {
  worker: Worker;
  plan: Plan;
  categories: Category[];
  onRequestAssign: (
    worker: Worker,
    day: number,
    start: string,
    end: string,
    existing: AssignedSlot | undefined,
    categoryId: string,
  ) => void;
  onClear: (slotId: string) => void;
}) {
  const workerCat = categories.find((c) => c.id === worker.categoryId);
  return (
    <tr className="border-b border-border/60 last:border-0 hover:bg-muted/20">
      <td className="sticky left-0 z-10 bg-card px-4 py-3 align-top">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${
              workerCat?.color ?? "bg-slate-500"
            }`}
          >
            {worker.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
          </div>
          <div>
            <div className="font-medium leading-tight">{worker.name}</div>
            <div className="text-xs text-muted-foreground">
              {workerCat?.name} · ${workerCat?.hourlyRate}/hr
            </div>
          </div>
        </div>
      </td>
      {DAYS.map((_, dayIdx) => {
        const availability = worker.availability.filter((a) => a.day === dayIdx);
        const assigned = plan.slots.filter((s) => s.workerId === worker.id && s.day === dayIdx);
        return (
          <td key={dayIdx} className="min-w-[150px] px-2 py-2 align-top">
            <div className="space-y-1.5">
              {availability.length === 0 && (
                <div className="rounded-md border border-dashed border-border/60 px-2 py-3 text-center text-[11px] text-muted-foreground">
                  Unavailable
                </div>
              )}
              {availability.map((slot, i) => {
                const existing = assigned.find((a) => a.start === slot.start && a.end === slot.end);
                return (
                  <SlotCell
                    key={i}
                    worker={worker}
                    day={dayIdx}
                    start={slot.start}
                    end={slot.end}
                    existing={existing}
                    categories={categories}
                    onRequestAssign={onRequestAssign}
                    onClear={onClear}
                  />
                );
              })}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

function SlotCell({
  worker,
  day,
  start,
  end,
  existing,
  categories,
  onRequestAssign,
  onClear,
}: {
  worker: Worker;
  day: number;
  start: string;
  end: string;
  existing?: AssignedSlot;
  categories: Category[];
  onRequestAssign: (
    worker: Worker,
    day: number,
    start: string,
    end: string,
    existing: AssignedSlot | undefined,
    categoryId: string,
  ) => void;
  onClear: (slotId: string) => void;
}) {
  const hours = hoursBetween(start, end);
  const value = existing?.categoryId ?? "";
  const assignedCat = existing ? categories.find((c) => c.id === existing.categoryId) : null;

  return (
    <div
      className={`rounded-lg border p-2 transition ${
        existing ? "border-primary/40 bg-primary/5" : "border-border/70 bg-background"
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium">
        <span>
          {start} – {end}
        </span>
        {existing && (
          <button
            onClick={() => onClear(existing.id)}
            className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Clear"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
      <Select value={value} onValueChange={(catId) => onRequestAssign(worker, day, start, end, existing, catId)}>
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder="Assign…" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${c.color}`} />
                {c.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {existing && assignedCat && (
        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{hours.toFixed(1)}h</span>
          <span className="font-semibold text-foreground">${existing.cost.toFixed(0)}</span>
        </div>
      )}
    </div>
  );
}

/** Horizontal, top-level workload status bar (replaces the old left sidebar). */
function WorkloadBar({
  plan,
  categories,
  assignedCounts,
}: {
  plan: Plan;
  categories: Category[];
  assignedCounts: Map<string, number>;
}) {
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
    if (!confirm(`Remove workload requirement "${req.label}"? Already-assigned slots will stay, but will no longer count toward it.`)) {
      return;
    }
    setRemovingId(id);
    await api.updatePlan(plan.id, { workload: plan.workload.filter((w) => w.id !== id) });
    setRemovingId(null);
    toast.success("Workload requirement removed");
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Workload status</h2>
          <p className="text-xs text-muted-foreground">Need vs. assigned per category</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add workload requirement</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Label</Label>
                <Input
                  className="mt-1.5"
                  placeholder="e.g. Lunch service"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={catId} onValueChange={setCatId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Workers needed</Label>
                <Input
                  type="number"
                  min={1}
                  className="mt-1.5"
                  value={needed}
                  onChange={(e) => setNeeded(Number(e.target.value) || 1)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addReq} disabled={saving} className="gap-1.5">
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {plan.workload.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          No requirements yet. Add lunch, dinner, etc.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {plan.workload.map((r) => {
            const cat = categories.find((c) => c.id === r.categoryId);
            const assigned = assignedCounts.get(r.categoryId) ?? 0;
            const pct = Math.min(100, (assigned / r.needed) * 100);
            const short = assigned < r.needed;
            const over = assigned > r.needed;
            return (
              <div
                key={r.id}
                className="w-64 shrink-0 rounded-lg border border-border/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${cat?.color}`} />
                    <span className="truncate text-sm font-medium">{r.label}</span>
                  </div>
                  <button
                    onClick={() => removeReq(r.id)}
                    disabled={removingId === r.id}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    {removingId === r.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{cat?.name}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all ${
                        over ? "bg-rose-500" : short ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {assigned}/{r.needed}
                  </span>
                </div>
                {short && (
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    Need {r.needed - assigned} more
                  </div>
                )}
                {over && (
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400">
                    <ShieldAlert className="h-3 w-3" />
                    {assigned - r.needed} over workload
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ManageCategoriesDialog({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rate, setRate] = useState(15);
  const colors = [
    "bg-amber-500", "bg-emerald-500", "bg-violet-500", "bg-sky-500",
    "bg-rose-500", "bg-lime-500", "bg-indigo-500",
  ];
  const [color, setColor] = useState(colors[0]);
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await api.addCategory({ name: name.trim(), color, hourlyRate: rate });
    setSaving(false);
    setName("");
    setRate(15);
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this category?")) return;
    await api.removeCategory(id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Work categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${c.color}`} />
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">${c.hourlyRate}/hr</span>
              </div>
              <button
                onClick={() => remove(c.id)}
                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 space-y-2 rounded-lg border border-dashed border-border p-3">
          <div className="text-xs font-medium text-muted-foreground">Add new</div>
          <Input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              className="w-28"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value) || 1)}
            />
            <div className="flex flex-wrap gap-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full ${c} ring-offset-2 ring-offset-background transition ${
                    color === c ? "ring-2 ring-foreground" : ""
                  }`}
                />
              ))}
            </div>
          </div>
          <Button size="sm" onClick={add} disabled={saving} className="w-full gap-1.5">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Add category
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PlanBuilderPage;