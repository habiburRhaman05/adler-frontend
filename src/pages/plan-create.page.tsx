import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CalendarRange, Plus, X, Send, Save, ChevronRight, ChevronLeft, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useEmployees } from "@/features/employees/hooks/use-employees";
import { useCategories } from "@/hooks/use-categories";
import { useCreatePlan } from "@/features/plans/hooks/use-plans";
import type { Assignment, ManpowerNeed, PlanInput } from "@/features/plans/api/plan.service";
import { computeHours, initials } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHIFT_TYPES = ["Lunch", "Dinner", "Breakfast", "All-day"];

type CellShift = { start: string; end: string; shiftType: string; categoryId: string };
type Grid = Record<string, Record<string, CellShift>>; // employeeId -> day -> shift

export function PlanCreatePage() {
  const navigate = useNavigate();
  const { data: employeesData } = useEmployees({ status: "Active" });
  const { data: categoriesData } = useCategories();
  const createMut = useCreatePlan();

  const employees = (employeesData?.items ?? []).filter((e) => e.status === "Active");
  const categories = categoriesData?.items ?? [];
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  const [step, setStep] = useState(1);

  // Step 1 — week/date
  const [weekNumber, setWeekNumber] = useState(1);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const month = start ? start.slice(0, 7) : "";

  // Step 2 — manpower needs
  const [manpower, setManpower] = useState<ManpowerNeed[]>([]);
  const [mpDay, setMpDay] = useState("Monday");
  const [mpShift, setMpShift] = useState("Lunch");
  const [mpCat, setMpCat] = useState("");
  const [mpReq, setMpReq] = useState(1);

  // Step 3 — assignments
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [empCategory, setEmpCategory] = useState<Record<string, string>>({});
  const [grid, setGrid] = useState<Grid>({});

  const addManpower = () => {
    if (!mpCat) { toast.error("Pick a category"); return; }
    setManpower((prev) => [...prev, { day: mpDay, shiftType: mpShift, categoryId: mpCat, required: mpReq }]);
  };
  const removeManpower = (i: number) => setManpower((prev) => prev.filter((_, idx) => idx !== i));

  const toggleEmp = (id: string, defaultCat: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
    setEmpCategory((c) => (c[id] ? c : { ...c, [id]: defaultCat }));
  };

  const setCell = (empId: string, day: string, patch: Partial<CellShift>) => {
    const defaults: CellShift = { start: "10:00", end: "18:00", shiftType: "Lunch", categoryId: empCategory[empId] ?? "" };
    setGrid((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [day]: {
          ...defaults,
          ...prev[empId]?.[day],
          ...patch,
        },
      },
    }));
  };
  const clearCell = (empId: string, day: string) => {
    setGrid((prev) => {
      const next = { ...prev, [empId]: { ...prev[empId] } };
      delete next[empId][day];
      return next;
    });
  };

  const assignments: Assignment[] = useMemo(() => {
    return Object.keys(selected)
      .filter((id) => selected[id])
      .map((empId) => {
        const cells = grid[empId] ?? {};
        const shifts = Object.entries(cells).map(([day, c]) => ({
          day, date: "", shiftType: c.shiftType, startTime: c.start, endTime: c.end,
          hours: computeHours(c.start, c.end),
        }));
        return {
          employeeId: empId,
          categoryId: empCategory[empId] ?? "",
          shifts,
          totalHours: Math.round(shifts.reduce((a, s) => a + s.hours, 0) * 100) / 100,
        };
      })
      .filter((a) => a.shifts.length > 0);
  }, [selected, grid, empCategory]);

  const canNext1 = weekNumber > 0 && start && end;

  const buildPayload = (status: "draft" | "submitted"): PlanInput => ({
    weekNumber,
    month,
    dateRange: { start, end },
    status,
    manpower,
    assignments,
    violations: [],
    createdBy: "admin1",
    createdAt: new Date().toISOString(),
    submittedAt: status === "submitted" ? new Date().toISOString() : null,
  });

  const save = (status: "draft" | "submitted") => {
    if (!canNext1) { toast.error("Complete week and dates first"); setStep(1); return; }
    createMut.mutate(buildPayload(status), { onSuccess: (plan) => navigate(`/plan/${plan.id}`) });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1400px]">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Manage plans</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900 tracking-tight">Create plan</h1>
        <p className="text-slate-500 mt-1 font-medium">Set the week, define manpower needs, then assign employees.</p>
      </header>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button onClick={() => setStep(s)} className={`h-8 w-8 rounded-full text-sm font-bold flex items-center justify-center transition-colors ${step === s ? "bg-primary text-white" : step > s ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-400"}`}>{s}</button>
            <span className={`text-sm font-semibold ${step === s ? "text-slate-900" : "text-slate-400"}`}>
              {s === 1 ? "Week & dates" : s === 2 ? "Manpower needs" : "Assign staff"}
            </span>
            {s < 3 && <ChevronRight className="h-4 w-4 text-slate-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4"><CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2"><CalendarRange className="h-5 w-5 text-primary" /> Which week?</CardTitle></CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-3 p-6">
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Week number</Label>
              <Select value={String(weekNumber)} onValueChange={(v) => setWeekNumber(Number(v))}>
                <SelectTrigger className="rounded-xl h-11 border-slate-200"><SelectValue /></SelectTrigger>
                <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>Week {n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Start date</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl h-11 border-slate-200 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">End date</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-xl h-11 border-slate-200 bg-slate-50" />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!canNext1} className="rounded-xl font-semibold shadow-md shadow-primary/20">Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4"><CardTitle className="text-lg font-bold text-slate-900">Manpower needs</CardTitle><p className="text-sm font-medium text-slate-500 mt-1">e.g. Monday lunch needs 3 service, dinner needs 2.</p></CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto_auto] items-end">
              <div className="space-y-2"><Label className="font-semibold text-slate-700 text-sm">Day</Label>
                <Select value={mpDay} onValueChange={setMpDay}><SelectTrigger className="rounded-xl h-11 border-slate-200"><SelectValue /></SelectTrigger><SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2"><Label className="font-semibold text-slate-700 text-sm">Shift</Label>
                <Select value={mpShift} onValueChange={setMpShift}><SelectTrigger className="rounded-xl h-11 border-slate-200"><SelectValue /></SelectTrigger><SelectContent>{SHIFT_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2"><Label className="font-semibold text-slate-700 text-sm">Category</Label>
                <Select value={mpCat} onValueChange={setMpCat}><SelectTrigger className="rounded-xl h-11 border-slate-200"><SelectValue placeholder="Pick…" /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2"><Label className="font-semibold text-slate-700 text-sm">Needed</Label>
                <Input type="number" min={1} value={mpReq} onChange={(e) => setMpReq(Number(e.target.value))} className="rounded-xl h-11 border-slate-200 bg-slate-50 w-24" />
              </div>
              <Button onClick={addManpower} className="rounded-xl h-11 font-semibold shadow-md shadow-primary/20"><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {manpower.length === 0 && <span className="text-sm text-slate-400 italic">No manpower needs added yet.</span>}
              {manpower.map((m, i) => (
                <Badge key={i} variant="secondary" className="pl-3 pr-1.5 py-1.5 gap-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                  {m.day} · {m.shiftType} · {catName(m.categoryId)} · {m.required}
                  <button onClick={() => removeManpower(i)} className="hover:bg-slate-300 rounded-md p-0.5 text-slate-500"><X className="h-3.5 w-3.5" /></button>
                </Badge>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl font-semibold border-slate-200"><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              <Button onClick={() => setStep(3)} className="rounded-xl font-semibold shadow-md shadow-primary/20">Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4"><CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Assign staff</CardTitle><p className="text-sm font-medium text-slate-500 mt-1">Tick employees, pick their category and set shift times per day.</p></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-slate-50/90 border-b border-slate-200 p-4 text-left font-bold text-slate-700 min-w-[240px]">Employee</th>
                    {DAYS.map((d) => <th key={d} className="border-b border-slate-200 p-3 text-left font-bold text-slate-700 min-w-[150px] bg-slate-50/50">{d.slice(0, 3)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => {
                    const isSel = !!selected[e.id];
                    const empCats = categories.filter((c) => (e.categories ?? []).includes(c.id));
                    return (
                      <tr key={e.id} className="hover:bg-slate-50/40">
                        <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-100 p-3">
                          <div className="flex items-center gap-3">
                            <Checkbox checked={isSel} onCheckedChange={() => toggleEmp(e.id, e.categories?.[0] ?? "")} />
                            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">{initials(e.name)}</div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{e.name}</p>
                              {isSel ? (
                                <Select value={empCategory[e.id] ?? ""} onValueChange={(v) => setEmpCategory((c) => ({ ...c, [e.id]: v }))}>
                                  <SelectTrigger className="h-7 mt-1 text-xs rounded-lg border-slate-200"><SelectValue placeholder="Category" /></SelectTrigger>
                                  <SelectContent>{(empCats.length ? empCats : categories).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                              ) : (
                                <p className="text-[11px] text-slate-500 font-medium">{e.designation}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        {DAYS.map((d) => {
                          const cell = grid[e.id]?.[d];
                          return (
                            <td key={d} className="border-b border-slate-100 p-2 align-top">
                              {!isSel ? (
                                <span className="text-slate-300 text-xs flex justify-center">—</span>
                              ) : cell ? (
                                <div className="rounded-lg border border-primary/20 bg-primary/5 p-1.5 space-y-1">
                                  <div className="flex gap-1">
                                    <input type="time" value={cell.start} onChange={(ev) => setCell(e.id, d, { start: ev.target.value })} className="w-full text-[11px] px-1 py-1 rounded border border-slate-200 bg-white" />
                                    <input type="time" value={cell.end} onChange={(ev) => setCell(e.id, d, { end: ev.target.value })} className="w-full text-[11px] px-1 py-1 rounded border border-slate-200 bg-white" />
                                  </div>
                                  <button onClick={() => clearCell(e.id, d)} className="text-[10px] text-rose-500 font-semibold hover:underline w-full text-center">remove</button>
                                </div>
                              ) : (
                                <button onClick={() => setCell(e.id, d, {})} className="w-full text-[11px] text-slate-400 hover:text-primary border border-dashed border-slate-200 rounded-lg py-2 font-medium hover:border-primary/40 transition-colors">+ shift</button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-between gap-3 p-6 border-t border-slate-100 bg-slate-50/30">
              <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl font-semibold border-slate-200"><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => save("draft")} disabled={createMut.isPending} className="rounded-xl font-semibold border-slate-200"><Save className="h-4 w-4 mr-2" /> Save draft</Button>
                <Button onClick={() => save("submitted")} disabled={createMut.isPending} className="rounded-xl font-semibold shadow-md shadow-primary/20"><Send className="h-4 w-4 mr-2" /> Submit plan</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
