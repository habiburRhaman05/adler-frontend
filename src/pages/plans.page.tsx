import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Send, Calendar as CalendarIcon, Search, Filter } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEmployees } from "@/features/employees/hooks/use-employees";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useAvailability } from "@/features/plans/hooks/use-availability";
import type { Employee } from "@/features/employees/api/employee.service";
import type { Availability } from "@/features/plans/api/availability.service";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Cell = { categoryId?: string; start?: string; end?: string };

/** Generate ISO weeks for a given year-month (YYYY-MM). */
function getWeeksForMonth(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const weeks: { id: string; label: string; range: string; start: Date; end: Date }[] = [];
  let weekNum = 1;
  let cursor = new Date(firstDay);
  // Align to Monday
  const dow = cursor.getDay();
  if (dow !== 1) cursor.setDate(cursor.getDate() - ((dow + 6) % 7));

  while (cursor <= lastDay) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const fmt = (d: Date) => `${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`;
    weeks.push({
      id: `w${year}-${month}-${weekNum}`,
      label: `Week ${weekNum}`,
      range: `${fmt(weekStart)} - ${fmt(weekEnd)}`,
      start: new Date(weekStart),
      end: new Date(weekEnd),
    });
    weekNum++;
    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getMonthsForYear(year: number) {
  return Array.from({ length: 12 }, (_, i) => ({
    value: `${year}-${String(i + 1).padStart(2, "0")}`,
    label: `${MONTH_NAMES[i]} ${year}`,
    month: i + 1,
  }));
}

/** Look up availability for an employee+day from server data. */
function getAvailForDay(availabilityItems: Availability[], employeeId: string, dayIndex: number): "available" | "unavailable" | "wish" {
  const empAvail = availabilityItems.find((a) => a.employeeId === employeeId);
  if (!empAvail) return "available";
  const slot = empAvail.slots[dayIndex];
  if (!slot) return "available";
  if (!slot.available) return "unavailable";
  // If time range starts after 14:00, treat as "wish" (preferred shift)
  if (slot.timeRange.start && parseInt(slot.timeRange.start) >= 14) return "wish";
  return "available";
}

export function PlansPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  const years = ["2025", "2026", "2027"];
  const yearNum = parseInt(selectedYear);
  const monthNum = parseInt(selectedMonth.split("-")[1] ?? "1");

  const months = useMemo(() => getMonthsForYear(yearNum), [yearNum]);
  const weeks = useMemo(() => getWeeksForMonth(yearNum, monthNum), [yearNum, monthNum]);

  const [weekId, setWeekId] = useState(weeks[0]?.id ?? "");
  // Reset week when month changes
  const currentWeekId = weeks.find((w) => w.id === weekId) ? weekId : weeks[0]?.id ?? "";
  const week = weeks.find((w) => w.id === currentWeekId) ?? weeks[0];

  // Filter state
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Server data
  const { data: employeesData, isLoading: empLoading } = useEmployees({
    status: filterStatus === "all" ? undefined : filterStatus,
    categories: filterCategory === "all" ? undefined : filterCategory,
    q: filterName || undefined,
  });
  const { data: categoriesData, isLoading: catLoading } = useCategories();
  const { data: availData, isLoading: availLoading } = useAvailability();

  const allEmployees = employeesData?.items ?? [];
  const categories = categoriesData?.items ?? [];
  const availabilityItems = availData?.items ?? [];

  // Only show active employees in the grid
  const active = useMemo(
    () => allEmployees.filter((e) => e.status === "Active" || e.status === "Leave"),
    [allEmployees]
  );

  const isLoading = empLoading || catLoading || availLoading;

  // Grid state
  const [grid, setGrid] = useState<Record<string, Record<number, Cell>>>({});

  // Initialize grid from availability when data loads
  const initializedGrid = useMemo(() => {
    const g: Record<string, Record<number, Cell>> = {};
    active.forEach((e) => {
      g[e.id] = {};
      for (let d = 0; d < 7; d++) {
        const avail = getAvailForDay(availabilityItems, e.id, d);
        if (avail !== "unavailable") {
          g[e.id][d] = {
            categoryId: e.categories?.[0],
            start: avail === "wish" ? "15:00" : "10:00",
            end: avail === "wish" ? "23:00" : "18:00",
          };
        }
      }
    });
    return g;
  }, [active, availabilityItems]);

  const mergedGrid = useMemo(() => {
    const merged: Record<string, Record<number, Cell>> = {};
    active.forEach((e) => {
      merged[e.id] = { ...initializedGrid[e.id], ...grid[e.id] };
    });
    return merged;
  }, [active, initializedGrid, grid]);

  const violations = useMemo(() => {
    const v: { emp: string; msg: string }[] = [];
    active.forEach((e) => {
      let hours = 0;
      for (let d = 0; d < 7; d++) {
        const c = mergedGrid[e.id]?.[d];
        if (c?.start && c?.end) {
          const [sh, sm] = c.start.split(":").map(Number);
          const [eh, em] = c.end.split(":").map(Number);
          hours += (eh + em / 60) - (sh + sm / 60);
        }
      }
      if (hours > 50) v.push({ emp: e.name, msg: `${hours.toFixed(1)} h scheduled — exceeds 50h max` });
    });
    return v;
  }, [mergedGrid, active]);

  const setCell = (empId: string, day: number, patch: Partial<Cell>) => {
    setGrid((prev) => ({
      ...prev,
      [empId]: { ...prev[empId], [day]: { ...prev[empId]?.[day], ...patch } },
    }));
  };

  const clearCell = (empId: string, day: number) => {
    setGrid((prev) => {
      const next = { ...prev, [empId]: { ...prev[empId] } };
      delete next[empId]?.[day];
      return next;
    });
  };

  const submitWeek = () => {
    if (violations.length > 0) {
      toast.error(`${violations.length} rule violation(s) must be resolved`);
      return;
    }
    toast.success(`${week?.label} submitted — ${active.length} employees notified`);
  };

  // Date display for column headers
  const weekDates = week ? Array.from({ length: 7 }, (_, i) => {
    const d = new Date(week.start);
    d.setDate(d.getDate() + i);
    return d.getDate();
  }) : Array.from({ length: 7 }, () => 0);

  const monthLabel = months.find((m) => m.value === selectedMonth)?.label ?? selectedMonth;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px]">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">Schedule</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900 tracking-tight">Weekly schedule</h1>
          <p className="text-slate-500 mt-1 font-medium">Build week by week. Rules run live on every change.</p>
        </div>
      </header>

      {/* Filter bar */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Filters</span>

          {/* Year */}
          <Select value={selectedYear} onValueChange={(v) => {
            setSelectedYear(v);
            const newMonths = getMonthsForYear(parseInt(v));
            setSelectedMonth(newMonths[0]?.value ?? `${v}-01`);
            setWeekId("");
          }}>
            <SelectTrigger className="w-[110px] rounded-xl h-10 text-sm font-medium border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
              {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Month */}
          <Select value={selectedMonth} onValueChange={(v) => {
            setSelectedMonth(v);
            setWeekId("");
          }}>
            <SelectTrigger className="w-[180px] rounded-xl h-10 text-sm font-medium border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl max-h-64 overflow-auto">
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Week */}
          <Select value={currentWeekId} onValueChange={setWeekId}>
            <SelectTrigger className="w-[240px] rounded-xl h-10 text-sm font-medium border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
              {weeks.map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.label} · {w.range}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Category filter */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px] rounded-xl h-10 text-sm font-medium border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
              <SelectItem value="all">All categories</SelectItem>
              {categories.filter((c) => c.name).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] rounded-xl h-10 text-sm font-medium border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Leave">On Leave</SelectItem>
            </SelectContent>
          </Select>

          {/* Name search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search employee…"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="pl-9 rounded-xl h-10 text-sm font-medium border-slate-200 bg-white shadow-sm focus-visible:ring-blue-500/20 focus-visible:border-blue-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="week" className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-xl h-auto">
          <TabsTrigger value="week" className="rounded-lg font-semibold px-5 py-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 data-[state=active]:border data-[state=active]:border-blue-200">Week grid</TabsTrigger>
          <TabsTrigger value="month" className="rounded-lg font-semibold px-5 py-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 data-[state=active]:border data-[state=active]:border-blue-200">Full month</TabsTrigger>
        </TabsList>

        {/* ─── WEEK GRID ─────────────────────────────────────── */}
        <TabsContent value="week" className="space-y-4 mt-6">
          {/* Violations */}
          {violations.length > 0 && (
            <Card className="border border-red-200 bg-red-50 rounded-2xl shadow-sm">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="bg-white rounded-full p-2 shadow-sm border border-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-red-700 text-base">{violations.length} rule violation{violations.length > 1 ? "s" : ""}</p>
                  <ul className="mt-2 text-sm text-red-600 space-y-1.5 bg-white p-3 rounded-xl border border-red-100">
                    {violations.map((v) => (
                      <li key={v.emp} className="flex items-start gap-1.5">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span><span className="font-bold text-red-700">{v.emp}</span> — {v.msg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grid card */}
          <Card className="rounded-2xl border-slate-200/80 shadow-md shadow-slate-100/50 bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex-row items-center justify-between bg-gradient-to-r from-slate-50/80 to-blue-50/30 border-b border-slate-100 pb-4 pt-5 px-6">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  {week?.label} · {week?.range}
                </CardTitle>
                <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100" />
                    <span className="text-slate-600">Available</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100" />
                    <span className="text-slate-600">Wish</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300 ring-2 ring-slate-100" />
                    <span className="text-slate-600">Unavailable</span>
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl font-semibold border-slate-200 bg-white hover:bg-slate-50 h-10 px-5 transition-all" onClick={() => toast.info("Draft saved")}>Save draft</Button>
                <Button className="rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 h-10 px-5 transition-all" onClick={submitWeek}>
                  <Send className="mr-2 h-4 w-4" /> Submit week
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                /* Skeleton loading */
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="flex items-center gap-3 w-[220px] shrink-0">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2"><Skeleton className="h-4 w-28 rounded-lg" /><Skeleton className="h-3 w-20 rounded-lg" /></div>
                      </div>
                      {Array.from({ length: 7 }).map((_, d) => (
                        <Skeleton key={d} className="h-[80px] w-[180px] rounded-xl shrink-0" />
                      ))}
                    </div>
                  ))}
                </div>
              ) : active.length === 0 ? (
                <div className="py-16 text-center text-slate-400 font-medium">No employees match your filters.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-10 bg-gradient-to-r from-slate-50/80 to-blue-50/30 border-b border-r border-slate-200 p-4 text-left font-bold text-slate-700 min-w-[220px]">
                          Employee
                          <span className="block text-[10px] font-medium text-slate-400 mt-0.5 normal-case tracking-normal">{active.length} staff</span>
                        </th>
                        {DAYS.map((d, i) => (
                          <th key={d} className="border-b border-slate-200 p-4 text-left font-bold text-slate-700 min-w-[180px] bg-gradient-to-r from-slate-50/80 to-blue-50/30">
                            <span className="text-slate-800">{d}</span>
                            <span className="block text-xs font-medium text-slate-400 mt-0.5">
                              {monthLabel.split(" ")[0]} {weekDates[i]}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {active.map((e) => (
                        <EmployeeRow
                          key={e.id}
                          employee={e}
                          categories={categories}
                          availabilityItems={availabilityItems}
                          grid={mergedGrid}
                          setCell={setCell}
                          clearCell={clearCell}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── MONTH VIEW ────────────────────────────────────── */}
        <TabsContent value="month" className="mt-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-md shadow-slate-100/50 bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50/80 to-blue-50/30 border-b border-slate-100 pb-4 pt-5 px-6">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" /> {monthLabel}
              </CardTitle>
              <p className="text-sm font-medium text-slate-500 mt-1">{weeks.length} weeks in {monthLabel}</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-3 text-sm">
                {DAYS.map((d) => (
                  <div key={d} className="p-2 text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                ))}
                {Array.from({ length: new Date(yearNum, monthNum, 0).getDate() }).map((_, i) => {
                  const date = new Date(yearNum, monthNum - 1, i + 1);
                  const dayOfWeek = (date.getDay() + 6) % 7; // Mon=0
                  const inWeek = week && date >= week.start && date <= week.end;
                  // Count employees available for this day
                  const availCount = active.filter((e) => {
                    const av = getAvailForDay(availabilityItems, e.id, dayOfWeek);
                    return av !== "unavailable";
                  }).length;
                  return (
                    <div key={i} className={`aspect-square rounded-xl border p-3 flex flex-col transition-all hover:scale-[1.02] ${
                      inWeek ? "bg-blue-50 border-blue-300 shadow-md shadow-blue-100/50 ring-2 ring-blue-200" :
                      dayOfWeek >= 5 ? "bg-slate-50 border-slate-200" :
                      "bg-white border-slate-200"
                    }`}>
                      <span className={`text-sm font-bold ${inWeek ? "text-blue-700" : dayOfWeek >= 5 ? "text-slate-400" : "text-slate-700"}`}>{i + 1}</span>
                      {availCount > 0 && dayOfWeek < 5 ? (
                        <div className="mt-auto space-y-1">
                          <div className="h-1.5 rounded-full bg-blue-500 w-full" />
                          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.min(100, availCount / Math.max(1, active.length) * 100)}%` }} />
                          <span className="text-[11px] font-bold text-slate-600 block mt-1">{availCount} available</span>
                        </div>
                      ) : (
                        <span className="mt-auto text-[11px] font-medium text-slate-400">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" /> Selected week
                </span>
                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 font-semibold px-2.5 py-0.5 rounded-md">
                  {active.length} employees
                </Badge>
                <Badge variant="outline" className="border-slate-200 text-slate-500 bg-white font-semibold px-2.5 py-0.5 rounded-md">
                  {availabilityItems.length} availability sets
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Employee Row Component ────────────────────────────────── */
function EmployeeRow({
  employee: e,
  categories,
  availabilityItems,
  grid,
  setCell,
  clearCell,
}: {
  employee: Employee;
  categories: { id: string; name: string }[];
  availabilityItems: Availability[];
  grid: Record<string, Record<number, Cell>>;
  setCell: (empId: string, day: number, patch: Partial<Cell>) => void;
  clearCell: (empId: string, day: number) => void;
}) {
  return (
    <tr className="hover:bg-blue-50/20 transition-all duration-200 group">
      <td className="sticky left-0 z-10 bg-white/90 backdrop-blur-sm border-b border-r border-slate-100 p-4 shadow-[1px_0_0_0_rgba(241,245,249,1)]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60 text-blue-600 flex items-center justify-center text-xs font-bold overflow-hidden shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
            {e.avatar ? <img src={e.avatar} alt={e.name} className="h-full w-full object-cover" /> : e.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{e.name}</p>
            <p className="text-[11px] font-medium text-slate-500 capitalize mt-0.5">
              {e.contract} · {e.workload}%
            </p>
          </div>
        </div>
      </td>
      {DAYS.map((_, d) => {
        const avail = getAvailForDay(availabilityItems, e.id, d);
        const cell = grid[e.id]?.[d];
        const empCategories = categories.filter((c) => e.categories?.includes(c.id));
        return (
          <td key={d} className="border-b border-slate-100 p-2.5 align-top">
            <div className={`rounded-xl border p-2.5 space-y-2 transition-all ${
              avail === "unavailable" ? "bg-slate-50 border-slate-200" :
              avail === "wish" ? "bg-blue-50/60 border-blue-200 hover:border-blue-300" :
              "bg-blue-50/60 border-blue-200 hover:border-blue-300"
            }`}>
              {avail === "unavailable" ? (
                <div className="h-[68px] flex items-center justify-center">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Unavailable</p>
                </div>
              ) : (
                <>
                  <Select
                    value={cell?.categoryId ?? "none"}
                    onValueChange={(v) => v === "none" ? clearCell(e.id, d) : setCell(e.id, d, { categoryId: v })}
                  >
                    <SelectTrigger className="h-8 text-xs rounded-lg font-semibold border-slate-200 bg-white shadow-sm focus:ring-blue-500/20 focus:border-blue-400">
                      <SelectValue placeholder="Assign role…" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-lg rounded-xl">
                      <SelectItem value="none" className="text-slate-400 italic">— Day Off —</SelectItem>
                      {empCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="font-medium">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {cell?.categoryId && (
                    <div className="flex gap-1.5">
                      <input
                        type="time"
                        value={cell.start ?? "10:00"}
                        onChange={(ev) => setCell(e.id, d, { start: ev.target.value })}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-medium text-slate-700 transition-all"
                      />
                      <input
                        type="time"
                        value={cell.end ?? "18:00"}
                        onChange={(ev) => setCell(e.id, d, { end: ev.target.value })}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-medium text-slate-700 transition-all"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
}
