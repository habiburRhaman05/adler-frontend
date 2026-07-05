import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  CalendarRange,
  Trash2,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

/* ============================================================================
 * Local data layer — localStorage-backed "database" with a mock API delay.
 * Self-contained on purpose: no external store import required.
 * ==========================================================================*/
const DB_KEY = "shift-planner:db:v1";
const NETWORK_DELAY = 400;

export type SlotStatus = "pending" | "accepted" | "rejected";

export interface Availability {
  day: number; // 0=Sun..6=Sat
  start: string;
  end: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // tailwind bg-* class
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
  async createPlan(input: Omit<Plan, "id" | "createdAt" | "slots">) {
    const db = readDB();
    const plan: Plan = { ...input, id: uid("plan"), slots: [], createdAt: Date.now() };
    db.plans = [plan, ...db.plans];
    writeDB(db);
    await delay(null);
    return plan;
  },
  async deletePlan(id: string) {
    const db = readDB();
    db.plans = db.plans.filter((p) => p.id !== id);
    writeDB(db);
    return delay(true);
  },
};
/* ========================================================================== */

function PlansIndexPage() {
  const db = useDB();
  const plans = db.plans;
  const now = new Date();
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [weekFilter, setWeekFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    document.title = "Plans — Shift Planner";
  }, []);

  const filtered = useMemo(() => {
    return plans
      .filter((p) => (monthFilter === "all" ? true : p.month === Number(monthFilter)))
      .filter((p) => (weekFilter === "all" ? true : p.week === Number(weekFilter)))
      .filter((p) => (q ? p.name.toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [plans, monthFilter, weekFilter, q]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b border-border/70 bg-card/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link to="/" className="text-xs uppercase tracking-widest text-muted-foreground">
              Shift Planner
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Plans</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/workers">
              <Button variant="outline" size="sm">
                Worker approvals
              </Button>
            </Link>
            <CreatePlanDialog now={now} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border/70 bg-card/50 p-3 backdrop-blur sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search plans…"
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={weekFilter} onValueChange={setWeekFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All weeks</SelectItem>
                {[1, 2, 3, 4, 5].map((w) => (
                  <SelectItem key={w} value={String(w)}>
                    Week {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState now={now} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PlanCard key={p.id} plan={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
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
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-gradient-to-b from-primary/10 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarRange className="h-3.5 w-3.5" />
            {MONTHS[plan.month]} · Week {plan.week} · {plan.year}
          </div>
          <h3 className="mt-1.5 text-lg font-semibold leading-tight">{plan.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {plan.description || "No description."}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:opacity-50"
          aria-label="Delete plan"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Slots" value={plan.slots.length} />
        <Stat label="Accepted" value={accepted} tone="emerald" />
        <Stat label="Rejected" value={rejected} tone="rose" />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-muted-foreground">Cost </span>
          <span className="font-semibold">${totalCost.toFixed(0)}</span>
        </div>
        <div className="flex gap-2">
          <Link to={`/plans/${plan.id}/summary`}>
            <Button variant="ghost" size="sm">
              Details
            </Button>
          </Link>
          <Link to={`/dashboard/plans/${plan.id}`}>
            <Button size="sm" className="gap-1">
              Open <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "emerald" | "rose" }) {
  const color =
    tone === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "rose"
      ? "text-rose-600 dark:text-rose-400"
      : "text-foreground";
  return (
    <div className="rounded-lg bg-muted/50 py-2">
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function EmptyState({ now }: { now: Date }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center">
      <div className="rounded-full bg-primary/10 p-4">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">No plans yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create your first weekly plan to start assigning workers into shifts.
      </p>
      <div className="mt-5">
        <CreatePlanDialog now={now} />
      </div>
    </div>
  );
}

function CreatePlanDialog({ now }: { now: Date }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [month, setMonth] = useState(now.getMonth());
  const [week, setWeek] = useState(currentWeekOfMonth(now));
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const plan = await api.createPlan({
      name: name.trim(),
      description: desc.trim(),
      month,
      week,
      year: now.getFullYear(),
      workload: [],
    });
    setSaving(false);
    setOpen(false);
    setName("");
    setDesc("");
    navigate(`/plans/${plan.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="pname">Plan name</Label>
            <Input
              id="pname"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Downtown location — Week 2"
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Month</Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Week</Label>
              <Select value={String(week)} onValueChange={(v) => setWeek(Number(v))}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((w) => (
                    <SelectItem key={w} value={String(w)}>
                      Week {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="pdesc">Description</Label>
            <Textarea
              id="pdesc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's this plan for?"
              className="mt-1.5"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim() || saving} className="gap-1.5">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Create plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PlansIndexPage;