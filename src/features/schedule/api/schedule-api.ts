export interface Staff {
  id: number;
  name: string;
  fn: string[];
  pct: number;
  type: string;
  hrSalary: number; // Added hourly rate
}

export interface Shift {
  id: string;
  label: string;
  fn: string;
  tm: string; // e.g. "17:00–23:30"
  durationHours: number; // derived from tm
  wish?: boolean;
  viol?: string | null;
  status?: "pending" | "accepted" | "rejected";
}

export interface Violation {
  id: string;
  kind: "rest" | "week" | "unfilled";
  fixed: boolean;
  who: string | null;
  h: string;
  why: string;
  fix: string | null;
  cells?: number[][];
  day?: number;
  need?: string;
  fnKey?: string;
}

export interface DailyDemand {
  service: number;
  kitchen: number;
  bar: number;
  commande: number;
  dishwashing: number;
}

export interface ScheduleState {
  generated: boolean;
  published: boolean;
  grid: Record<string, Shift[]>;
  violations: Violation[];
  month: number;
  weekRange: number;
  demands: DailyDemand[];
}

export const STAFF: Staff[] = [
  { id: 2, name: "Luca Bernasconi", fn: ["service", "bar"], pct: 100, type: "Monthly", hrSalary: 28 },
  { id: 3, name: "Marta Vidal", fn: ["service"], pct: 80, type: "Monthly", hrSalary: 25 },
  { id: 4, name: "Jonas Frei", fn: ["kitchen"], pct: 100, type: "Monthly", hrSalary: 30 },
  { id: 5, name: "Priya Nair", fn: ["kitchen"], pct: 60, type: "Hourly", hrSalary: 22 },
  { id: 6, name: "Sami Haddad", fn: ["bar", "service"], pct: 0, type: "Casual", hrSalary: 20 },
  { id: 7, name: "Elena Rossi", fn: ["service", "commande"], pct: 50, type: "Hourly", hrSalary: 24 },
  { id: 8, name: "Tobias Lang", fn: ["dishwashing"], pct: 0, type: "Casual", hrSalary: 19 },
  { id: 9, name: "Nadia Camara", fn: ["service"], pct: 100, type: "Monthly", hrSalary: 28 },
  { id: 10, name: "Peter Aebi", fn: ["kitchen", "commande"], pct: 80, type: "Monthly", hrSalary: 27 },
  { id: 11, name: "Silvia Marti", fn: ["dishwashing", "kitchen"], pct: 40, type: "Hourly", hrSalary: 21 },
];

export const FN_LABELS: Record<string, string> = {
  service: "Service",
  kitchen: "Kitchen",
  bar: "Bar",
  office: "Office",
  commande: "Commande",
  dishwashing: "Dishwashing"
};

// Default mock demand pattern for the week (e.g., Aug 3-9)
const DEFAULT_DEMAND: DailyDemand[] = [
  { service: 2, kitchen: 1, bar: 0, commande: 0, dishwashing: 1 }, // Mon
  { service: 2, kitchen: 1, bar: 0, commande: 0, dishwashing: 1 }, // Tue
  { service: 3, kitchen: 2, bar: 1, commande: 0, dishwashing: 1 }, // Wed
  { service: 3, kitchen: 2, bar: 1, commande: 1, dishwashing: 1 }, // Thu
  { service: 4, kitchen: 3, bar: 2, commande: 1, dishwashing: 2 }, // Fri
  { service: 4, kitchen: 3, bar: 2, commande: 1, dishwashing: 2 }, // Sat
  { service: 3, kitchen: 2, bar: 1, commande: 0, dishwashing: 1 }, // Sun
];

// Helper to calculate hours from "HH:MM–HH:MM"
export function parseDuration(tm: string): number {
  try {
    const [start, end] = tm.split("–");
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let duration = (eh + em / 60) - (sh + sm / 60);
    if (duration < 0) duration += 24; // Crosses midnight
    return duration;
  } catch (e) {
    return 6; // Default fallback
  }
}

// Global In-Memory Database for this mock
const globalDb: Record<string, ScheduleState> = {};

// Sleep to simulate network latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ScheduleAPI = {
  
  async getSchedule(month: number, weekRange: number): Promise<ScheduleState | null> {
    await sleep(400);
    const key = `${month}-${weekRange}`;
    return globalDb[key] || null;
  },

  async generateSchedule(month: number, weekRange: number, demands: DailyDemand[] = DEFAULT_DEMAND): Promise<ScheduleState> {
    await sleep(1500);
    const key = `${month}-${weekRange}`;
    
    if (globalDb[key]) {
      throw new Error("A schedule for this week already exists.");
    }

    const grid: Record<string, Shift[]> = {};
    const put = (sid: number, d: number, label: string, fn: string, tm: string, extra?: Partial<Shift>) => {
      const gkey = `${sid}-${d}`;
      if (!grid[gkey]) grid[gkey] = [];
      const durationHours = parseDuration(tm);
      grid[gkey].push({ id: Math.random().toString(36).substring(2, 9), label, fn, tm, durationHours, ...extra });
    };

    // Seed data
    put(2, 1, "Evening · Service", "service", "17:00–23:30");
    put(2, 3, "Lunch · Service", "service", "10:00–14:30", { wish: true });
    put(2, 4, "Evening · Bar", "bar", "17:00–23:30");
    put(2, 5, "Evening · Service", "service", "17:00–23:30", { viol: "rest" });
    put(2, 6, "Lunch · Service", "service", "10:00–14:30", { viol: "rest" });

    put(3, 0, "Lunch · Service", "service", "10:00–14:30");
    put(3, 2, "Evening · Service", "service", "17:00–23:30");
    put(3, 5, "Evening · Service", "service", "17:00–23:30");

    [0, 1, 2, 3, 4, 5].forEach((d) =>
      put(4, d, "Evening · Kitchen", "kitchen", "15:00–23:30", { viol: d > 3 ? "week" : null })
    );

    put(5, 0, "Lunch · Kitchen", "kitchen", "09:00–14:30");
    put(5, 2, "Lunch · Kitchen", "kitchen", "09:00–14:30");
    put(5, 6, "Lunch · Kitchen", "kitchen", "09:00–14:30", { wish: true });

    put(7, 1, "Lunch · Service", "service", "10:00–14:30");
    put(7, 5, "Lunch · Commande", "commande", "09:00–13:00");

    put(9, 0, "Evening · Service", "service", "17:00–23:30");
    put(9, 2, "Evening · Service", "service", "17:00–23:30");
    put(9, 4, "Lunch · Service", "service", "10:00–14:30");
    put(9, 6, "Evening · Service", "service", "17:00–23:30");

    put(10, 1, "Lunch · Kitchen", "kitchen", "09:00–14:30");
    put(10, 3, "Lunch · Commande", "commande", "09:00–13:00");
    put(10, 5, "Lunch · Kitchen", "kitchen", "09:00–14:30");

    put(11, 0, "Evening · Dishwashing", "dishwashing", "18:00–23:30");
    put(11, 2, "Evening · Dishwashing", "dishwashing", "18:00–23:30");
    put(11, 5, "Evening · Dishwashing", "dishwashing", "18:00–23:30");

    const violations: Violation[] = [
      {
        id: "v1",
        kind: "rest",
        fixed: false,
        who: "Luca Bernasconi",
        h: "Rest period too short — Luca Bernasconi",
        why: "Fri 7 Aug evening ends 23:30, Sat 8 Aug lunch starts 10:00 → only 10.5 h rest. L-GAV requires a minimum of 11 h between two shifts.",
        fix: "Remove Sat lunch shift",
        cells: [[2, 5], [2, 6]],
      },
      {
        id: "v2",
        kind: "week",
        fixed: false,
        who: "Jonas Frei",
        h: "Weekly maximum exceeded — Jonas Frei",
        why: "Jonas is scheduled 51 h this week. That exceeds the L-GAV weekly maximum.",
        fix: "Remove Sat evening shift",
        cells: [[4, 5]],
      }
    ];

    // Analyze diffs for unfilled demands
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const dayDemand = demands[dayIdx];
      const counts: Record<string, number> = { service: 0, kitchen: 0, bar: 0, commande: 0, dishwashing: 0 };
      
      STAFF.forEach(st => {
        const key = `${st.id}-${dayIdx}`;
        if (grid[key]) {
          grid[key].forEach(s => {
            if (counts[s.fn] !== undefined) counts[s.fn]++;
          });
        }
      });

      Object.entries(dayDemand).forEach(([fn, required]) => {
        const assigned = counts[fn] || 0;
        if (assigned < required) {
          violations.push({
            id: `v-unf-${dayIdx}-${fn}`,
            kind: "unfilled",
            fixed: false,
            who: null,
            h: `Unfilled demand — ${FN_LABELS[fn]} (Day ${dayIdx+1})`,
            why: `Demand is ${required} staff for ${FN_LABELS[fn]}; only ${assigned} are assigned.`,
            fix: null,
            day: dayIdx,
            need: `Need · ${FN_LABELS[fn]} · 17:00–23:30`, // Simplified time
            fnKey: fn,
          });
        }
      });
    }

    const newState: ScheduleState = {
      generated: true,
      published: false,
      grid,
      violations,
      month,
      weekRange,
      demands
    };

    globalDb[key] = newState;
    return JSON.parse(JSON.stringify(newState)); // Return clone
  },

  async approveSchedule(month: number, weekRange: number): Promise<ScheduleState> {
    await sleep(800);
    const key = `${month}-${weekRange}`;
    const state = globalDb[key];
    if (!state) throw new Error("Schedule not found.");

    const openViolations = state.violations.filter((v) => !v.fixed).length;
    if (openViolations > 0) {
      throw new Error(`${openViolations} issue(s) still open. Resolve them before publishing.`);
    }

    // Publish and mark pending
    state.published = true;
    Object.keys(state.grid).forEach(gkey => {
      state.grid[gkey] = state.grid[gkey].map(shift => ({ ...shift, status: "pending" }));
    });

    globalDb[key] = state;
    return JSON.parse(JSON.stringify(state));
  },

  async removeShift(month: number, weekRange: number, staffId: number, dayIdx: number, shiftId: string): Promise<ScheduleState> {
    await sleep(400);
    const key = `${month}-${weekRange}`;
    const state = globalDb[key];
    if (!state) throw new Error("Schedule not found.");

    const gkey = `${staffId}-${dayIdx}`;
    if (state.grid[gkey]) {
      state.grid[gkey] = state.grid[gkey].filter((s) => s.id !== shiftId);
    }

    // Auto-fix violations
    state.violations = state.violations.map(v => {
      if (!v.fixed) {
        if (v.kind === "rest" && staffId === 2 && (dayIdx === 5 || dayIdx === 6)) return { ...v, fixed: true };
        if (v.kind === "week" && staffId === 4 && dayIdx === 5) return { ...v, fixed: true };
      }
      return v;
    });

    // Re-evaluate demand? In a real app, removing a shift creates an unfilled demand.
    // For simplicity we will manually add an unfilled demand violation if needed.
    globalDb[key] = state;
    return JSON.parse(JSON.stringify(state));
  },

  async editShiftTime(month: number, weekRange: number, staffId: number, dayIdx: number, shiftId: string, newTm: string): Promise<ScheduleState> {
    await sleep(600);
    const key = `${month}-${weekRange}`;
    const state = globalDb[key];
    if (!state) throw new Error("Schedule not found.");

    const gkey = `${staffId}-${dayIdx}`;
    if (state.grid[gkey]) {
      state.grid[gkey] = state.grid[gkey].map(s => {
        if (s.id === shiftId) {
          return { ...s, tm: newTm, durationHours: parseDuration(newTm) };
        }
        return s;
      });
    }

    // Auto-fix if they change Luca's time to fix the rest violation
    state.violations = state.violations.map(v => {
      if (!v.fixed && v.kind === "rest" && staffId === 2) {
        // Mock logic: if they edit it, we assume it's fixed.
        return { ...v, fixed: true };
      }
      return v;
    });

    globalDb[key] = state;
    return JSON.parse(JSON.stringify(state));
  },

  async assignSlot(
    month: number, weekRange: number, 
    violId: string | null, 
    staffName: string, 
    dayIdx: number, 
    fnKey: string, 
    tm: string,
    compensationOption?: "overtime" | "reduce-future"
  ): Promise<ScheduleState> {
    await sleep(600);
    const key = `${month}-${weekRange}`;
    const state = globalDb[key];
    if (!state) throw new Error("Schedule not found.");

    const st = STAFF.find(s => s.name === staffName);
    if (!st) throw new Error("Staff not found");

    const gkey = `${st.id}-${dayIdx}`;
    if (!state.grid[gkey]) state.grid[gkey] = [];

    const label = FN_LABELS[fnKey] || fnKey;
    const durationHours = parseDuration(tm);
    state.grid[gkey].push({
      id: Math.random().toString(36).substring(2, 9),
      label: `Assigned · ${label}`,
      fn: fnKey,
      tm,
      durationHours,
      status: state.published ? "pending" : undefined
    });

    if (violId) {
      const violIdx = state.violations.findIndex(x => x.id === violId);
      if (violIdx >= 0) {
        state.violations[violIdx].fixed = true;
      }
    }

    // Compensation logic simulation - real app would record this
    if (compensationOption === 'overtime') {
      console.log(`[Mock API] Overtime approved for ${st.name}`);
    }

    globalDb[key] = state;
    return JSON.parse(JSON.stringify(state));
  },

  async applyFix(month: number, weekRange: number, violId: string): Promise<ScheduleState> {
    await sleep(400);
    const key = `${month}-${weekRange}`;
    const state = globalDb[key];
    if (!state) throw new Error("Schedule not found.");

    const v = state.violations.find((x) => x.id === violId);
    if (!v) return JSON.parse(JSON.stringify(state));

    if (v.kind === "rest") {
      if (state.grid["2-6"]) state.grid["2-6"] = [];
    }
    if (v.kind === "week") {
      if (state.grid["4-5"]) state.grid["4-5"] = [];
    }
    v.fixed = true;

    globalDb[key] = state;
    return JSON.parse(JSON.stringify(state));
  },

  async simulateStaffResponse(month: number, weekRange: number, staffId: number, dayIdx: number, shiftId: string, action: "accepted" | "rejected"): Promise<ScheduleState> {
    await sleep(300);
    const key = `${month}-${weekRange}`;
    const state = globalDb[key];
    if (!state) throw new Error("Schedule not found.");

    const gkey = `${staffId}-${dayIdx}`;
    if (state.grid[gkey]) {
      state.grid[gkey] = state.grid[gkey].map(s => s.id === shiftId ? { ...s, status: action } : s);
    }
    
    if (action === "rejected") {
      const shift = state.grid[gkey]?.find(s => s.id === shiftId);
      if (shift) {
        state.violations.push({
          id: `v-rej-${Math.random().toString(36).substring(2, 7)}`,
          kind: "unfilled",
          fixed: false,
          who: null,
          h: `Unfilled demand (Rejected) — ${shift.label}`,
          why: `Shift was rejected by staff member. Needs reassignment.`,
          fix: null,
          day: dayIdx,
          need: `${shift.label} · ${shift.tm}`,
          fnKey: shift.fn
        });
        state.grid[gkey] = state.grid[gkey].filter(s => s.id !== shiftId);
      }
    }

    globalDb[key] = state;
    return JSON.parse(JSON.stringify(state));
  }
};
