import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Send, Calendar as CalendarIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  employees, categories, weeks, days, currentMonth, getAvailability,
} from "@/lib/mock-data";

type Cell = { categoryId?: string; start?: string; end?: string };

export function PlansPage() {
  const [weekId, setWeekId] = useState("w3");
  const week = weeks.find((w) => w.id === weekId)!;
  const active = employees.filter((e) => e.active);

  const [grid, setGrid] = useState<Record<string, Record<number, Cell>>>(() => {
    const g: Record<string, Record<number, Cell>> = {};
    active.forEach((e, i) => {
      g[e.id] = {};
      for (let d = 0; d < 7; d++) {
        const avail = getAvailability(e.id, d);
        if (avail !== "unavailable" && (i + d) % 3 !== 0) {
          g[e.id][d] = {
            categoryId: e.categories[0],
            start: d % 2 === 0 ? "10:00" : "15:00",
            end: d % 2 === 0 ? "15:00" : "23:00",
          };
        }
      }
    });
    return g;
  });

  const violations = useMemo(() => {
    const v: { emp: string; msg: string }[] = [];
    active.forEach((e) => {
      let hours = 0;
      for (let d = 0; d < 7; d++) {
        const c = grid[e.id]?.[d];
        if (c?.start && c?.end) {
          const [sh, sm] = c.start.split(":").map(Number);
          const [eh, em] = c.end.split(":").map(Number);
          hours += (eh + em / 60) - (sh + sm / 60);
        }
      }
      if (hours > 50) v.push({ emp: e.name, msg: `${hours.toFixed(1)} h scheduled — exceeds 50h max` });
    });
    return v;
  }, [grid, active]);

  const setCell = (empId: string, day: number, patch: Partial<Cell>) => {
    setGrid((prev) => ({
      ...prev,
      [empId]: { ...prev[empId], [day]: { ...prev[empId]?.[day], ...patch } },
    }));
  };

  const clearCell = (empId: string, day: number) => {
    setGrid((prev) => {
      const next = { ...prev, [empId]: { ...prev[empId] } };
      delete next[empId][day];
      return next;
    });
  };

  const submitWeek = () => {
    if (violations.length > 0) {
      toast.error(`${violations.length} rule violation(s) must be resolved`);
      return;
    }
    toast.success(`${week.label} submitted — ${active.length} employees notified`);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Manage plans</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900 tracking-tight">Weekly schedule</h1>
          <p className="text-slate-500 mt-1 font-medium">Build week by week. Rules run live on every change.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={currentMonth} onValueChange={() => {}}>
            <SelectTrigger className="w-[180px] rounded-xl font-medium border-slate-200 h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={currentMonth}>{currentMonth}</SelectItem>
              <SelectItem value="December 2026">December 2026</SelectItem>
            </SelectContent>
          </Select>
          <Select value={weekId} onValueChange={setWeekId}>
            <SelectTrigger className="w-[220px] rounded-xl font-medium border-slate-200 h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              {weeks.map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.label} · {w.range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <Tabs defaultValue="week" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl">
          <TabsTrigger value="week" className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">Week grid</TabsTrigger>
          <TabsTrigger value="month" className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">Full month</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-4 mt-6">
          {violations.length > 0 && (
            <Card className="border border-rose-200 bg-rose-50/50 rounded-2xl shadow-sm">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="bg-white rounded-full p-1.5 shadow-sm">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-rose-700 text-base">{violations.length} rule violation{violations.length > 1 ? "s" : ""}</p>
                  <ul className="mt-2 text-sm text-rose-600 space-y-1 bg-white/60 p-3 rounded-xl border border-rose-100">
                    {violations.map((v) => (
                      <li key={v.emp}>• <span className="font-bold">{v.emp}</span> — {v.msg}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex-row items-center justify-between bg-slate-50/50 border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">{week.label} · {week.range}</CardTitle>
                <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Available
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary ml-3" />
                  Wish
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300 ml-3" />
                  Unavailable
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl font-semibold border-slate-200" onClick={() => toast.info("Draft saved")}>Save draft</Button>
                <Button className="rounded-xl font-semibold shadow-md shadow-primary/20" onClick={submitWeek}>
                  <Send className="mr-2 h-4 w-4" /> Submit week
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-slate-50/90 backdrop-blur border-b border-slate-200 p-4 text-left font-bold text-slate-700 min-w-[220px]">Employee</th>
                      {days.map((d, i) => (
                        <th key={d} className="border-b border-slate-200 p-4 text-left font-bold text-slate-700 min-w-[200px] bg-slate-50/50">
                          {d}
                          <span className="block text-xs font-medium text-slate-400 mt-0.5">
                            Nov {17 + i}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {active.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/90 border-b border-r border-slate-100 p-4 shadow-[1px_0_0_0_rgba(241,245,249,1)]">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                              {e.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{e.name}</p>
                              <p className="text-[11px] font-medium text-slate-500 capitalize mt-0.5">
                                {e.contract} · {e.workload}%
                              </p>
                            </div>
                          </div>
                        </td>
                        {days.map((_, d) => {
                          const avail = getAvailability(e.id, d);
                          const cell = grid[e.id]?.[d];
                          const empCategories = categories.filter((c) => e.categories.includes(c.id));
                          return (
                            <td key={d} className="border-b border-slate-100 p-2.5 align-top">
                              <div className={`rounded-xl border p-2.5 space-y-2 transition-all ${
                                avail === "unavailable" ? "bg-slate-50/80 border-slate-200/60" :
                                avail === "wish" ? "bg-primary/5 border-primary/20 hover:border-primary/40" :
                                "bg-emerald-50/50 border-emerald-100 hover:border-emerald-200"
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
                                      <SelectTrigger className="h-8 text-xs rounded-lg font-semibold border-slate-200 bg-white/80 focus:ring-primary/20 shadow-sm">
                                        <SelectValue placeholder="Assign role…" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none" className="text-slate-500 italic">— Day Off —</SelectItem>
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
                                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700"
                                        />
                                        <input
                                          type="time"
                                          value={cell.end ?? "18:00"}
                                          onChange={(ev) => setCell(e.id, d, { end: ev.target.value })}
                                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700"
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
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="mt-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" /> {currentMonth}
              </CardTitle>
              <p className="text-sm font-medium text-slate-500 mt-1">All submitted weeks combined.</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-3 text-sm">
                {days.map((d) => (
                  <div key={d} className="p-2 text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                ))}
                {Array.from({ length: 30 }).map((_, i) => {
                  const w = i < 7 ? "published" : i < 14 ? "submitted" : i < 21 ? "draft" : "draft";
                  const count = w === "draft" ? 0 : 6 + (i % 5);
                  return (
                    <div key={i} className={`aspect-square rounded-xl border p-3 flex flex-col transition-all hover:scale-[1.02] ${
                      w === "published" ? "bg-emerald-50/50 border-emerald-100 shadow-sm" :
                      w === "submitted" ? "bg-amber-50/50 border-amber-100 shadow-sm" :
                      "bg-slate-50/50 border-slate-100"
                    }`}>
                      <span className={`text-sm font-bold ${w === 'draft' ? 'text-slate-400' : 'text-slate-700'}`}>{i + 1}</span>
                      {count > 0 ? (
                        <div className="mt-auto space-y-1">
                          <div className="flex flex-col gap-0.5">
                             <div className="h-1.5 rounded-full bg-emerald-500/80 w-full" />
                             <div className="h-1.5 rounded-full bg-primary/80 w-2/3" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 block mt-1">{count} shifts</span>
                        </div>
                      ) : (
                        <span className="mt-auto text-[11px] font-medium text-slate-400">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Published</span>
                <span className="flex items-center gap-1.5"><Badge variant="outline" className="border-amber-200 text-amber-600 bg-amber-50 h-5 px-2 rounded-md">Submitted</Badge></span>
                <span className="flex items-center gap-1.5"><Badge variant="outline" className="border-slate-200 text-slate-500 bg-white h-5 px-2 rounded-md">Draft</Badge></span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
