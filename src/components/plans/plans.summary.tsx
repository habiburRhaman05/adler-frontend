import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Mail,
  Send,
  Users,
  DollarSign,
  CalendarDays,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  /** Mock bulk email dispatch — simulates network latency, no real email sent. */
  async sendBulkEmail(recipients: string[]) {
    await delay(null, 1100);
    return { sentAt: Date.now(), recipients };
  },
};
/* ========================================================================== */

function PlanSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const db = useDB();
  const plan = db.plans.find((p) => p.id === id);
  const workers = db.workers;
  const categories = db.categories;
  const [reassign, setReassign] = useState<AssignedSlot | null>(null);
  const [filter, setFilter] = useState<"all" | AssignedSlot["status"]>("all");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = plan ? `${plan.name} — Details` : "Plan details";
  }, [plan]);

  const stats = useMemo(() => {
    if (!plan) return null;
    const total = plan.slots.length;
    const accepted = plan.slots.filter((s) => s.status === "accepted").length;
    const rejected = plan.slots.filter((s) => s.status === "rejected").length;
    const pending = plan.slots.filter((s) => s.status === "pending").length;
    const cost = plan.slots.reduce((s, x) => s + x.cost, 0);
    const hours = plan.slots.reduce((s, x) => s + x.hours, 0);
    const uniqueWorkers = new Set(plan.slots.map((s) => s.workerId)).size;
    return { total, accepted, rejected, pending, cost, hours, uniqueWorkers };
  }, [plan]);

  if (!plan || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <div className="text-center">
          <p className="text-muted-foreground">Plan not found.</p>
          <Link to="/plans" className="text-primary underline">
            Back to plans
          </Link>
        </div>
      </div>
    );
  }

  const days = DAYS.map((_, i) => ({
    day: i,
    slots: plan.slots
      .filter((s) => s.day === i && (filter === "all" || s.status === filter))
      .sort((a, b) => a.start.localeCompare(b.start)),
  }));

  const setStatus = async (slotId: string, status: AssignedSlot["status"]) => {
    await api.updatePlan(plan.id, {
      slots: plan.slots.map((s) => (s.id === slotId ? { ...s, status } : s)),
    });
    toast.success(`Marked as ${status}`);
  };

  const sendPlanToAll = async () => {
    const emails = Array.from(
      new Set(
        plan.slots
          .map((s) => workers.find((w) => w.id === s.workerId)?.email)
          .filter(Boolean) as string[],
      ),
    );
    if (emails.length === 0) {
      toast.error("No assigned workers to email yet.");
      return;
    }
    setSending(true);
    await api.sendBulkEmail(emails);
    setSending(false);
    toast.success(
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 font-medium">
          <Mail className="h-4 w-4" />
          Sent to {emails.length} worker{emails.length === 1 ? "" : "s"}
        </div>
        <div className="text-xs text-muted-foreground">{emails.slice(0, 3).join(", ")}{emails.length > 3 ? "…" : ""}</div>
      </div>,
    );
  };

  const rejectedSlots = plan.slots.filter((s) => s.status === "rejected");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/plans" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {MONTHS[plan.month]} · Week {plan.week} · {plan.year}
              </div>
              <h1 className="text-xl font-semibold leading-tight">{plan.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/plans/${plan.id}`}>
              <Button variant="outline" size="sm">
                Edit plan
              </Button>
            </Link>
            <Button size="sm" onClick={sendPlanToAll} disabled={sending} className="gap-1.5">
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {sending ? "Sending…" : "Send to workers"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {plan.description && (
          <p className="mb-6 max-w-2xl text-muted-foreground">{plan.description}</p>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <StatCard label="Slots" value={stats.total} icon={<CalendarDays className="h-4 w-4" />} />
          <StatCard label="Workers" value={stats.uniqueWorkers} icon={<Users className="h-4 w-4" />} />
          <StatCard label="Hours" value={stats.hours.toFixed(1)} icon={<Clock className="h-4 w-4" />} />
          <StatCard label="Cost" value={`$${stats.cost.toFixed(0)}`} icon={<DollarSign className="h-4 w-4" />} />
          <StatCard label="Confirmed" value={stats.accepted} tone="emerald" icon={<CheckCircle2 className="h-4 w-4" />} />
          <StatCard label="Unconfirmed" value={stats.total - stats.accepted} tone="rose" icon={<XCircle className="h-4 w-4" />} />
        </div>

        {/* Progress */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Confirmation progress</h3>
              <p className="text-xs text-muted-foreground">
                {stats.accepted} of {stats.total} slots confirmed by workers
              </p>
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {stats.total ? Math.round((stats.accepted / stats.total) * 100) : 0}%
            </div>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${stats.total ? (stats.accepted / stats.total) * 100 : 0}%` }}
            />
            <div
              className="bg-rose-500 transition-all"
              style={{ width: `${stats.total ? ((stats.total - stats.accepted) / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Rejected alert */}
        {rejectedSlots.length > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {rejectedSlots.length} slot{rejectedSlots.length === 1 ? "" : "s"} rejected — assign another worker
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {rejectedSlots.map((s) => {
                  const w = workers.find((x) => x.id === s.workerId);
                  return (
                    <button
                      key={s.id}
                      onClick={() => setReassign(s)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-background px-2.5 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-500/10 dark:text-rose-300"
                    >
                      <RefreshCw className="h-3 w-3" />
                      {DAYS[s.day]} {s.start} · {w?.name?.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="mb-4 inline-flex rounded-full border border-border/70 bg-card p-1 text-xs shadow-sm">
          {(["all", "accepted", "pending", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 font-medium capitalize transition ${
                filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Week board */}
        {plan.slots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center text-muted-foreground">
            No slots assigned yet.{" "}
            <Link to={`/plans/${plan.id}`} className="text-primary underline">
              Go to builder
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
            {days.map((g) => (
              <DayColumn
                key={g.day}
                day={g.day}
                slots={g.slots}
                workers={workers}
                categories={categories}
                onAccept={(sid) => setStatus(sid, "accepted")}
                onReject={(sid) => setStatus(sid, "rejected")}
                onReassign={(s) => setReassign(s)}
              />
            ))}
          </div>
        )}
      </div>

      {reassign && (
        <ReassignDialog slot={reassign} onClose={() => setReassign(null)} planId={plan.id} />
      )}
    </div>
  );
}

function DayColumn({
  day,
  slots,
  workers,
  categories,
  onAccept,
  onReject,
  onReassign,
}: {
  day: number;
  slots: AssignedSlot[];
  workers: Worker[];
  categories: Category[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onReassign: (s: AssignedSlot) => void;
}) {
  const dayFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
  const totalHours = slots.reduce((s, x) => s + x.hours, 0);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="border-b border-border/60 bg-gradient-to-br from-muted/40 to-transparent px-4 py-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">{dayFull}</h2>
          <span className="text-[11px] font-medium text-muted-foreground">
            {slots.length} · {totalHours.toFixed(1)}h
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-2 p-3">
        {slots.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 py-6 text-center text-[11px] text-muted-foreground">
            No slots
          </div>
        ) : (
          slots.map((s) => {
            const w = workers.find((x) => x.id === s.workerId);
            const c = categories.find((x) => x.id === s.categoryId);
            // Confirmation color: green once the worker has accepted, red otherwise (pending or rejected).
            const confirmed = s.status === "accepted";
            const accent = confirmed
              ? "ring-emerald-500/50 bg-emerald-500/5"
              : "ring-rose-500/50 bg-rose-500/5";
            return (
              <div
                key={s.id}
                className={`group relative rounded-xl border border-border/60 p-3 ring-1 transition hover:shadow-md ${accent}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${
                      c?.color ?? "bg-slate-500"
                    }`}
                  >
                    {w?.name?.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold">{w?.name}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{c?.name}</div>
                  </div>
                  <ConfirmBadge confirmed={confirmed} status={s.status} />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="tabular-nums font-medium">
                    {s.start} – {s.end}
                  </span>
                  <span className="text-muted-foreground">
                    ${s.cost.toFixed(0)} · {s.hours.toFixed(1)}h
                  </span>
                </div>
                {s.reassignedFrom && (
                  <div className="mt-1.5 inline-block rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                    reassigned
                  </div>
                )}
                <div className="mt-2 flex gap-1 border-t border-border/50 pt-2">
                  <button
                    onClick={() => onAccept(s.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-[11px] font-medium text-emerald-600 transition hover:bg-emerald-500/10"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Confirm
                  </button>
                  <button
                    onClick={() => onReject(s.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-[11px] font-medium text-rose-600 transition hover:bg-rose-500/10"
                  >
                    <XCircle className="h-3 w-3" />
                    Reject
                  </button>
                  <button
                    onClick={() => onReassign(s)}
                    className="flex items-center justify-center rounded-md px-2 py-1 text-muted-foreground transition hover:bg-accent"
                    aria-label="Reassign"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/** Binary confirm/unconfirmed badge — green if the worker accepted, red otherwise. */
function ConfirmBadge({ confirmed, status }: { confirmed: boolean; status: AssignedSlot["status"] }) {
  return (
    <span
      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[9px] font-bold text-white ${
        confirmed ? "bg-emerald-500" : "bg-rose-500"
      }`}
      title={status}
    >
      {confirmed ? "OK" : status === "rejected" ? "NO" : "…"}
    </span>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number | string;
  tone?: "emerald" | "amber" | "rose";
  icon?: React.ReactNode;
}) {
  const color =
    tone === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : tone === "rose"
      ? "text-rose-600 dark:text-rose-400"
      : "text-foreground";
  return (
    <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm transition hover:shadow-md">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function ReassignDialog({
  slot,
  onClose,
  planId,
}: {
  slot: AssignedSlot;
  onClose: () => void;
  planId: string;
}) {
  const db = useDB();
  const workers = db.workers;
  const plan = db.plans.find((p) => p.id === planId);
  const candidates = workers.filter(
    (w) =>
      w.id !== slot.workerId &&
      w.availability.some((a) => a.day === slot.day && a.start <= slot.start && a.end >= slot.end),
  );
  const [pick, setPick] = useState<string>(candidates[0]?.id ?? "");
  const [sending, setSending] = useState(false);

  if (!plan) return null;

  const confirm = async () => {
    if (!pick) return;
    const target = workers.find((w) => w.id === pick);
    setSending(true);
    await api.updatePlan(planId, {
      slots: plan.slots.map((s) =>
        s.id === slot.id ? { ...s, workerId: pick, status: "pending", reassignedFrom: s.workerId } : s,
      ),
    });
    await api.sendBulkEmail(target?.email ? [target.email] : []);
    setSending(false);
    toast.success(
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        Email sent to {target?.name}
      </div>,
    );
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign slot</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
            <div className="font-medium">
              {DAYS[slot.day]} · {slot.start} – {slot.end}
            </div>
            <div className="text-xs text-muted-foreground">
              {slot.hours.toFixed(1)}h · ${slot.cost.toFixed(0)}
            </div>
          </div>
          {candidates.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              No other workers available for this time.
            </p>
          ) : (
            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">Choose a replacement</div>
              <Select value={pick} onValueChange={setPick}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={!pick || sending} className="gap-1.5">
            {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Reassign & notify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PlanSummaryPage;