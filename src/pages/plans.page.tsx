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
import { CalendarView } from "@/components/plans/calendar-view";

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


      <CalendarView
        week={week as any}
        employees={active}
        categories={categories as any}
        grid={grid}
        setCell={setCell}
        clearCell={clearCell}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {violations.length > 0 && (
            <Badge variant="destructive" className="gap-2 rounded-xl px-3 py-2 font-medium text-sm">
              <AlertTriangle className="h-4 w-4" />
              {violations.length} rule violation(s)
            </Badge>
          )}
          {violations.map((v, i) => (
            <Badge key={i} variant="outline" className="gap-2 rounded-xl px-3 py-2 font-medium text-sm">
              <CheckCircle2 className="h-4 w-4" />
              {v.emp}: {v.msg}
            </Badge>
          ))}
        </div>
        <Button
          onClick={submitWeek}
          className="rounded-xl h-11 px-6 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
        >
          <Send className="mr-2 h-4 w-4" />
          Submit week
        </Button>
      </div>
    </div>
  );
}     
   