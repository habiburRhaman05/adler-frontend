import { useMemo, useState } from "react";
import { Download, TrendingUp, Clock, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { monthlyReport, categories, currentMonth } from "@/lib/mock-data";

export function ReportsPage() {
  const [cat, setCat] = useState("all");
  const [month, setMonth] = useState(currentMonth);

  const rows = useMemo(() => {
    return monthlyReport.filter((r) => cat === "all" || r.employee.categories.includes(cat));
  }, [cat]);

  const totals = useMemo(() => ({
    worked: rows.reduce((a, r) => a + r.worked, 0),
    overtime: rows.reduce((a, r) => a + r.overtime, 0),
    wage: rows.reduce((a, r) => a + r.wage, 0),
    due: rows.reduce((a, r) => a + r.due, 0),
  }), [rows]);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1400px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Analysis</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900 tracking-tight">Reports</h1>
          <p className="text-slate-500 mt-1 font-medium">Hours, overtime and wage cost per employee.</p>
        </div>
        <div className="flex gap-3">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[180px] rounded-xl font-medium border-slate-200 h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={currentMonth}>{currentMonth}</SelectItem>
              <SelectItem value="October 2026">October 2026</SelectItem>
              <SelectItem value="September 2026">September 2026</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-[180px] rounded-xl font-medium border-slate-200 h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-xl font-semibold border-slate-200 bg-white" onClick={() => toast.success("Report exported (mock)")}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SumCard icon={<Clock />} label="Total worked" value={`${totals.worked} h`} colorClass="bg-primary/10 text-primary" />
        <SumCard icon={<TrendingUp />} label="Overtime" value={`${totals.overtime} h`} accent colorClass="bg-amber-50 text-amber-600" />
        <SumCard icon={<Clock />} label="Hours due" value={`${totals.due} h`} colorClass="bg-rose-50 text-rose-600" />
        <SumCard icon={<Wallet />} label="Wage cost" value={`CHF ${totals.wage.toLocaleString()}`} colorClass="bg-emerald-50 text-emerald-600" />
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900">Per employee</CardTitle>
          <p className="text-sm font-medium text-slate-500 mt-1">{month} · {rows.length} employees</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="text-left py-4 px-6">Employee</th>
                  <th className="text-left py-4 px-4">Contract</th>
                  <th className="text-right py-4 px-4">Scheduled</th>
                  <th className="text-right py-4 px-4">Worked</th>
                  <th className="text-right py-4 px-4">Overtime</th>
                  <th className="text-right py-4 px-4">Due</th>
                  <th className="text-right py-4 px-6">Wage</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const pct = Math.min(100, Math.round((r.worked / Math.max(1, r.scheduled)) * 100));
                  return (
                    <tr key={r.employee.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                            {r.employee.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{r.employee.name}</p>
                            <div className="flex gap-1 mt-1">
                              {r.employee.categories.slice(0, 2).map((cid) => (
                                <Badge key={cid} variant="secondary" className="text-[10px] py-0 px-1.5 bg-primary/5 text-primary border-primary/10">
                                  {categories.find((c) => c.id === cid)?.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 capitalize text-slate-500 font-medium">{r.employee.contract} · {r.employee.workload}%</td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-slate-700">{r.scheduled} h</span>
                        <div className="h-1.5 mt-2 rounded-full bg-slate-100 overflow-hidden w-20 ml-auto">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-900">{r.worked} h</td>
                      <td className="py-4 px-4 text-right">
                        {r.overtime > 0 ? <span className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md">+{r.overtime} h</span> : <span className="text-slate-400 font-medium">—</span>}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {r.due > 0 ? <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-md">{r.due} h</span> : <span className="text-slate-400 font-medium">—</span>}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">CHF {r.wage.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SumCard({ icon, label, value, accent, colorClass }: { icon: React.ReactNode; label: string; value: string; accent?: boolean; colorClass: string }) {
  return (
    <Card className={`rounded-2xl shadow-sm bg-white border ${accent ? "border-amber-200 ring-1 ring-amber-100" : "border-slate-200"}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${colorClass}`}>
            <span className="h-4 w-4">{icon}</span>
          </span>
          {label}
        </div>
        <p className="mt-4 text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
