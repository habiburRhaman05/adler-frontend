import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeftRight, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { employees, swapRequests as seed, type SwapRequest } from "@/lib/mock-data";

export function ApprovalsPage() {
  const [list, setList] = useState<SwapRequest[]>(seed);
  const [rejectTarget, setRejectTarget] = useState<SwapRequest | null>(null);
  const [reason, setReason] = useState("");

  const pending = list.filter((s) => s.status === "pending");
  const done = list.filter((s) => s.status !== "pending");

  const approve = (s: SwapRequest) => {
    if (s.ruleCheck === "fail") {
      toast.error("Cannot approve — rule check fails. Adjust the schedule first.");
      return;
    }
    setList((prev) => prev.map((x) => x.id === s.id ? { ...x, status: "approved" } : x));
    toast.success("Swap approved — both employees notified");
  };

  const reject = () => {
    if (!rejectTarget) return;
    setList((prev) => prev.map((x) => x.id === rejectTarget.id ? { ...x, status: "rejected" } : x));
    toast.info(`Swap rejected: ${reason || "no reason"}`);
    setRejectTarget(null);
    setReason("");
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1200px]">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Shift approvals</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900 tracking-tight">Swap requests</h1>
        <p className="text-slate-500 mt-1 font-medium">Only shift swaps between two employees. Regular accept/reject stays with the employee.</p>
      </header>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl">
          <TabsTrigger value="pending" className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">
            Pending <Badge className="ml-2 h-5 min-w-5 px-1.5 bg-primary text-white">{pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pending.length === 0 ? (
            <Card className="rounded-2xl border-slate-200 bg-slate-50/50 border-dashed">
              <CardContent className="py-16 text-center text-slate-500 font-medium">All caught up.</CardContent>
            </Card>
          ) : pending.map((s) => (
            <SwapCard key={s.id} swap={s} onApprove={() => approve(s)} onReject={() => setRejectTarget(s)} />
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          {done.length === 0 ? (
            <Card className="rounded-2xl border-slate-200 bg-slate-50/50 border-dashed">
              <CardContent className="py-16 text-center text-slate-500 font-medium">No history yet.</CardContent>
            </Card>
          ) : done.map((s) => (
            <SwapCard key={s.id} swap={s} readOnly />
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent className="max-w-md rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Reject swap</DialogTitle>
          </DialogHeader>
          <p className="text-sm font-medium text-slate-500 mt-1">The employees will be notified with your reason.</p>
          <div className="py-4">
            <Textarea 
              placeholder="e.g. Not enough coverage on Sunday morning" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              className="rounded-xl border-slate-200 focus-visible:ring-primary/20 min-h-[100px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl font-semibold border-slate-200" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="destructive" className="rounded-xl font-semibold bg-rose-600 hover:bg-rose-700 shadow-sm" onClick={reject}>Reject swap</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SwapCard({ swap, onApprove, onReject, readOnly }: {
  swap: SwapRequest;
  onApprove?: () => void;
  onReject?: () => void;
  readOnly?: boolean;
}) {
  const from = employees.find((e) => e.id === swap.fromEmployeeId)!;
  const to = employees.find((e) => e.id === swap.toEmployeeId)!;
  return (
    <Card className={`rounded-2xl shadow-sm bg-white border ${swap.ruleCheck === "fail" ? "border-rose-200 ring-1 ring-rose-100" : "border-slate-200"}`}>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" /> Requested {swap.requestedAt}
          </div>
          {swap.status === "pending" ? (
            <Badge variant="outline" className={`px-3 py-1 ${swap.ruleCheck === "pass" ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-rose-200 text-rose-600 bg-rose-50"}`}>
              {swap.ruleCheck === "pass" ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Rules OK</> : <><AlertTriangle className="h-3.5 w-3.5 mr-1.5" />Rule fail</>}
            </Badge>
          ) : (
            <Badge variant="outline" className={`px-3 py-1 ${swap.status === "approved" ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-rose-200 text-rose-600 bg-rose-50"}`}>
              {swap.status === "approved" ? "Approved" : "Rejected"}
            </Badge>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] items-center">
          <ShiftBlock emp={from} shift={swap.fromShift} label="Offers" />
          <div className="hidden md:flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shadow-sm">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
          </div>
          <ShiftBlock emp={to} shift={swap.toShift} label="Takes" />
        </div>

        {swap.ruleNote && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm font-medium text-rose-600">
            {swap.ruleNote}
          </div>
        )}

        {!readOnly && (
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" className="rounded-xl font-semibold border-slate-200" onClick={onReject}><XCircle className="h-4 w-4 mr-2 text-rose-500" /> Reject</Button>
            <Button className="rounded-xl font-semibold shadow-md shadow-primary/20" onClick={onApprove} disabled={swap.ruleCheck === "fail"}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ShiftBlock({ emp, shift, label }: { emp: typeof employees[number]; shift: { day: string; time: string; category: string }; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shadow-sm">
          {emp.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="font-bold text-slate-900 truncate mt-0.5">{emp.name}</p>
        </div>
      </div>
      <div className="mt-4 space-y-1 text-sm bg-white p-3 rounded-lg border border-slate-100">
        <p className="font-bold text-slate-900">{shift.day}</p>
        <p className="text-slate-500 font-medium">{shift.time}</p>
        <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary font-semibold border-0 hover:bg-primary/20">{shift.category}</Badge>
      </div>
    </div>
  );
}
