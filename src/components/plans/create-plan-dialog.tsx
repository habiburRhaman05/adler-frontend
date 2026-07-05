import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Loader2, Plus, PenLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, currentWeekOfMonth } from "../../lib/plan-data";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface CreatePlanDialogProps {
  now: Date;
}

export function CreatePlanDialog({ now }: CreatePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [month, setMonth] = useState(now.getMonth()); // 0-11
  const [week, setWeek] = useState(currentWeekOfMonth(now));
  const [year, setYear] = useState(now.getFullYear());
  const [saving, setSaving] = useState(false);
  
  const navigate = useNavigate();

  const resetForm = () => {
    setName("");
    setDescription("");
    setMonth(now.getMonth());
    setWeek(currentWeekOfMonth(now));
    setYear(now.getFullYear());
  };

  const handleOpenChange = (next: boolean) => {
    if (saving) return;
    setOpen(next);
    if (!next) {
      setTimeout(resetForm, 200);
    }
  };

  const submit = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      const res = await api.createPlan({
        name: name.trim(),
        description: description.trim(),
        month,
        week,
        year,
        workload: [],
      });
      setOpen(false);
      resetForm();
      navigate(`/dashboard/plans/${res.id}`);
    } catch {
      toast.error("Failed to create plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 rounded-xl font-semibold shadow-lg bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:shadow-primary/25 transition-all">
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="border-b border-slate-100 px-6 pt-6 pb-5 space-y-1.5 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground">
            Create a New Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div>
            <Label className="text-foreground/80 font-semibold text-sm">Plan Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Downtown Location - Week 1" 
              className="mt-1.5 rounded-xl border-slate-200" 
              disabled={saving}
            />
          </div>

          <div>
            <Label className="text-foreground/80 font-semibold text-sm flex items-center gap-1.5">
              <PenLine className="h-3.5 w-3.5 text-muted-foreground" /> Description (optional)
            </Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Any details about this plan..." 
              className="mt-1.5 rounded-xl border-slate-200 min-h-[80px]" 
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground/80 font-semibold text-sm flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /> Month
              </Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))} disabled={saving}>
                <SelectTrigger className="mt-1.5 rounded-xl h-11 bg-slate-50 border-slate-200 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground/80 font-semibold text-sm">Week Number</Label>
              <Select value={String(week)} onValueChange={(v) => setWeek(Number(v))} disabled={saving}>
                <SelectTrigger className="mt-1.5 rounded-xl h-11 bg-slate-50 border-slate-200 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 53 }).map((_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      Week {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-foreground/80 font-semibold text-sm">Year</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))} disabled={saving}>
                <SelectTrigger className="mt-1.5 rounded-xl h-11 bg-slate-50 border-slate-200 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-1 gap-2 border-t border-slate-100 mt-4 bg-slate-50/50">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={saving}
            className="rounded-xl bg-slate-200 hover:bg-slate-300 font-semibold text-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={saving || !name.trim()}
            variant="default"
            className="gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-6 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Create
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}