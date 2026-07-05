import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, AlertCircle } from "lucide-react";
import { DAYS, type Worker, type Category, type AssignedSlot, type Plan } from "../../lib/plan-data";

export interface AssignSheetData {
  day: number;
  start: string;
  end: string;
  workerId?: string;
  categoryId?: string;
  existing?: AssignedSlot;
}

interface AssignSheetProps {
  data: AssignSheetData | null;
  workers: Worker[];
  categories: Category[];
  plan: Plan;
  onClose: () => void;
  onAssign: (workerId: string, categoryId: string, start: string, end: string, existing?: AssignedSlot) => void;
  onDelete: (slotId: string) => void;
}

export function AssignSheet({ data, workers, categories, plan, onClose, onAssign, onDelete }: AssignSheetProps) {
  const [workerId, setWorkerId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setWorkerId(data.workerId || "");
      setCategoryId(data.categoryId || "");
      setStart(data.start || "09:00");
      setError(null);
      
      // Default to 8 hour shift if no existing end time
      if (data.end) {
        setEnd(data.end);
      } else {
        const startHour = parseInt((data.start || "09:00").split(":")[0]);
        const defaultEndHour = Math.min(23, startHour + 8);
        setEnd(`${defaultEndHour.toString().padStart(2, '0')}:00`);
      }
    }
  }, [data]);

  // Check for conflicts
  useEffect(() => {
    if (!data || !workerId || !start || !end) {
      setError(null);
      return;
    }
    const day = data.day;
    const conflictingSlot = plan.slots.find(s => {
      // Don't conflict with itself if we are editing
      if (data.existing && s.id === data.existing.id) return false;
      // Must be same day and same worker
      if (s.day !== day || s.workerId !== workerId) return false;
      
      // Check time overlap: (StartA < EndB) and (EndA > StartB)
      return start < s.end && end > s.start;
    });

    if (conflictingSlot) {
      setError(`Worker is already assigned to a shift from ${conflictingSlot.start} to ${conflictingSlot.end}`);
    } else {
      setError(null);
    }
  }, [workerId, start, end, data, plan.slots]);

  const handleSave = () => {
    if (error) return; // Prevent saving if there's an error
    if (workerId && categoryId && start && end) {
      onAssign(workerId, categoryId, start, end, data?.existing);
      onClose();
    }
  };

  if (!data) return null;

  return (
    <Sheet open={!!data} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex flex-col h-full bg-white sm:max-w-md border-l border-slate-200">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-black text-slate-900">{data.existing ? "Edit Shift" : "Assign Shift"}</SheetTitle>
          <SheetDescription className="font-bold text-slate-500 uppercase tracking-widest text-xs">
            {DAYS[data.day]}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-7">
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Worker</label>
            <Select value={workerId} onValueChange={setWorkerId}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20 transition-all font-semibold shadow-sm">
                <SelectValue placeholder="Select worker..." />
              </SelectTrigger>
              <SelectContent>
                {workers.map(w => (
                  <SelectItem key={w.id} value={w.id} className="font-semibold">{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20 transition-all font-semibold shadow-sm">
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id} className="font-semibold">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Start Time</label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black text-slate-700 shadow-sm" />
            </div>
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">End Time</label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black text-slate-700 shadow-sm" />
            </div>
          </div>
          
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 mt-4">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <p className="text-sm font-bold text-rose-700 leading-tight">{error}</p>
            </div>
          )}
        </div>

        <SheetFooter className="flex flex-row items-center justify-between mt-auto pt-6 border-t border-slate-100">
          {data.existing ? (
            <Button 
              variant="ghost" 
              onClick={() => { onDelete(data.existing!.id); onClose(); }} 
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold rounded-xl h-11 px-4"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl h-11 font-bold border-slate-200">Cancel</Button>
            <Button onClick={handleSave} disabled={!workerId || !categoryId || !start || !end || !!error} className="rounded-xl h-11 px-6 font-bold shadow-md shadow-primary/20">
              Save Shift
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
