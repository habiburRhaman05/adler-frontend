import React, { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Violation, Staff, Shift, DailyDemand } from "../api/schedule-api";
import { FN_LABELS, STAFF } from "../api/schedule-api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function GenerateScheduleModal({ open, onOpenChange, onGenerate }: { open: boolean, onOpenChange: (open: boolean) => void, onGenerate: (month: number, week: number) => Promise<void> }) {
  const [month, setMonth] = useState(7); // August
  const [week, setWeek] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(month, week);
      onOpenChange(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Schedule Proposal</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-slate-500">
            Select the month and week to generate a schedule for. The system will match employee availability with your demand and apply L-GAV rules.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Month</label>
              <Select value={String(month)} onValueChange={v => setMonth(Number(v))} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Week Date Range</label>
              <Select value={String(week)} onValueChange={v => setWeek(Number(v))} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">3 Aug – 9 Aug</SelectItem>
                  <SelectItem value="2">10 Aug – 16 Aug</SelectItem>
                  <SelectItem value="3">17 Aug – 23 Aug</SelectItem>
                  <SelectItem value="4">24 Aug – 30 Aug</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isGenerating}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]">
            {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ViolationsPanel({ violations, onApplyFix, onAssignSlot }: { violations: Violation[], onApplyFix: (id: string) => void, onAssignSlot: (id: string) => void }) {
  if (violations.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        Rule check & Issues
        <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{violations.length} total</span>
      </h2>
      <div className="space-y-3">
        {violations.map(v => (
          <div key={v.id} className={`p-4 rounded-xl border flex flex-col gap-2 transition-colors ${v.fixed ? "bg-slate-50 border-slate-200/60 opacity-70" : "bg-white border-slate-200 border-l-4 " + (v.kind === "unfilled" ? "border-l-orange-500" : "border-l-red-500")}`}>
            <div className="flex items-center gap-2 flex-wrap">
              {v.fixed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className={`h-4 w-4 ${v.kind === "unfilled" ? "text-orange-500" : "text-red-500"}`} />
              )}
              <span className="font-bold text-slate-800 text-sm">{v.h}</span>
              {v.fixed ? (
                <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Resolved</span>
              ) : (
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${v.kind === "unfilled" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                  {v.kind === "unfilled" ? "Unfilled" : "L-GAV Violation"}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">{v.why}</p>
            {!v.fixed && (
              <div className="flex flex-wrap gap-2 mt-2">
                {v.fix && (
                  <Button size="sm" onClick={() => onApplyFix(v.id)} className="bg-slate-900 text-white hover:bg-slate-800 h-8">
                    {v.fix}
                  </Button>
                )}
                {v.kind === "unfilled" && (
                  <Button size="sm" onClick={() => onAssignSlot(v.id)} className="bg-blue-600 text-white hover:bg-blue-700 h-8">
                    Assign someone
                  </Button>
                )}
                <Button size="sm" variant="outline" className="h-8" onClick={() => alert("Kept as exception — a written justification would be required and logged in production.")}>
                  Keep with justification
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AssignSlotSheet({ 
  open, 
  onOpenChange, 
  assignData, 
  violations, 
  onAssign 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  assignData: { violId: string | null, dayIdx: number, fnKey?: string, needLabel?: string } | null, 
  violations: Violation[], 
  onAssign: (violId: string | null, staffName: string, dayIdx: number, fnKey: string, tm: string, compOption?: "overtime" | "reduce-future") => void 
}) {
  const [compensationOption, setCompensationOption] = useState<"overtime" | "reduce-future">("overtime");
  
  if (!assignData) return null;

  const fnKey = assignData.fnKey || "service";
  
  // Mock candidates based on role
  const cands = STAFF.filter(s => s.fn.includes(fnKey)).map(s => {
    // Arbitrary mock logic for UI
    const isOk = s.pct > 50 || s.name === "Silvia Marti";
    return {
      n: s.name,
      ok: isOk,
      r: isOk ? `Available ✓ · rest 14 h ✓ · adds 6.5 h ✓` : `Would exceed weekly maximum limit (Requires Overtime)`
    };
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Assign Staff to Shift</SheetTitle>
          <SheetDescription>
            {assignData.needLabel ? `Fill: ${assignData.needLabel}` : `Add a new ${FN_LABELS[fnKey]} shift for Day ${assignData.dayIdx + 1}`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Compensation for exceptions</h4>
            <p className="text-xs text-slate-500">If you assign an employee who exceeds their hours, how should it be handled?</p>
            <Select value={compensationOption} onValueChange={(v: any) => setCompensationOption(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overtime">Pay extra (Overtime)</SelectItem>
                <SelectItem value="reduce-future">Reduce next month's hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Candidates ({FN_LABELS[fnKey]})</h4>
            <p className="text-xs text-slate-500 mb-2">Only qualified staff are shown. The rule check runs before you assign.</p>
            {cands.map(c => (
              <div key={c.n} className={`p-3 rounded-xl border flex flex-col gap-2 ${c.ok ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200 border-l-4 border-l-orange-400"}`}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {c.n.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate text-slate-900">{c.n}</div>
                  </div>
                  <Button size="sm" onClick={() => { 
                    onAssign(assignData.violId, c.n, assignData.dayIdx, fnKey, "17:00–23:30", compensationOption); 
                    onOpenChange(false); 
                  }} className="shrink-0" variant={c.ok ? "default" : "secondary"}>
                    {c.ok ? "Assign" : "Force Assign"}
                  </Button>
                </div>
                <div className={`text-[11px] font-medium leading-tight ml-11 ${c.ok ? "text-emerald-600" : "text-orange-600"}`}>{c.r}</div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ShiftInfoModal({ 
  open, 
  onOpenChange, 
  shiftInfo,
  violations,
  onRemove,
  onEditTime,
  onApplyFix
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  shiftInfo: { staff: Staff, dayIdx: number, shift: Shift } | null,
  violations: Violation[],
  onRemove: (staffId: number, dayIdx: number, shiftId: string) => void,
  onEditTime: (staffId: number, dayIdx: number, shiftId: string, newTm: string) => void,
  onApplyFix: (violId: string) => void
}) {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [newTime, setNewTime] = useState("");

  if (!shiftInfo) return null;
  const { staff, shift, dayIdx } = shiftInfo;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if(!v) setIsEditingTime(false); }}>
      <DialogContent className="sm:max-w-sm">
        <div className="flex justify-between items-start pt-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{staff.name}</h3>
            <p className="text-sm text-slate-500">{shift.label}</p>
          </div>
        </div>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</div>
              {!isEditingTime ? (
                <div className="font-mono text-sm font-medium flex items-center gap-2">
                  {shift.tm}
                  <button onClick={() => { setIsEditingTime(true); setNewTime(shift.tm); }} className="text-blue-600 text-xs hover:underline">Edit</button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Input value={newTime} onChange={e => setNewTime(e.target.value)} className="h-7 text-xs font-mono px-2" />
                  <Button size="sm" className="h-7 px-2" onClick={() => {
                    onEditTime(staff.id, dayIdx, shift.id, newTime);
                    setIsEditingTime(false);
                  }}>Save</Button>
                </div>
              )}
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role</div>
              <div className="text-sm font-medium">{FN_LABELS[shift.fn] || shift.fn}</div>
            </div>
          </div>
          
          {shift.wish && (
            <div className="flex items-start gap-2 bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200">
              <span className="shrink-0">★</span>
              <p className="text-sm font-medium">This shift matches a preference submitted by {staff.name}.</p>
            </div>
          )}
          
          {shift.viol && (() => {
            const activeViol = violations.find(x => !x.fixed && x.kind === shift.viol && (x.who?.includes(staff.name) || x.who?.includes(staff.name.split(" ")[0])));
            return (
              <div className="flex items-start gap-2 bg-red-50 text-red-800 p-3 rounded-lg border border-red-200 flex-col">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">This shift causes a rule violation. Edit the time or remove the shift to resolve.</p>
                </div>
                {activeViol && activeViol.fix && (
                  <div className="mt-2 w-full flex justify-end">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white h-7 text-xs" onClick={() => {
                      onApplyFix(activeViol.id);
                      onOpenChange(false);
                    }}>
                      Apply Fix: {activeViol.fix}
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}

          {shift.status && (
            <div className="flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">
                Status: <span className="uppercase font-bold">{shift.status}</span>
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-start gap-2">
          <Button variant="destructive" onClick={() => { onRemove(staff.id, dayIdx, shift.id); onOpenChange(false); }} className="w-full sm:w-auto">
            Remove Shift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
