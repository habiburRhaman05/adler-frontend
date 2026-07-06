import React, { useState, useMemo } from "react";
import { addDays, parseISO } from "date-fns";
import { CalendarDays, Settings2, Plus, Mail, DollarSign, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Shift, Staff } from "@/features/schedule/hooks/use-schedule";
import { useSchedulePlanner, STAFF, FN_LABELS } from "@/features/schedule/hooks/use-schedule";
import { ScheduleGrid } from "@/features/schedule/components/schedule-grid";
import { GenerateScheduleModal, ViolationsPanel, AssignSlotSheet, ShiftInfoModal, ViewDemandModal } from "@/features/schedule/components/schedule-modals";
import { toast } from "sonner";

export function SchedulePage() {
  const [currentMonth] = useState(7);
  const [currentWeek] = useState(1);
  const { 
    state,
    isLoading,
    isGenerating,
    generateSchedule, 
    approveSchedule, 
    applyFix, 
    assignSlot,
    removeShift,
    editShiftTime,
    simulateStaffResponse
  } = useSchedulePlanner(currentMonth, currentWeek);

  // For demo: Hardcoded dates for the week of Aug 3-9, 2026
  const baseDate = parseISO("2026-08-03");
  const days = Array.from({ length: 7 }).map((_, i) => addDays(baseDate, i));

  // Modals state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [assignData, setAssignData] = useState<{ violId: string | null, dayIdx: number, fnKey?: string, needLabel?: string } | null>(null);
  const [selectedShift, setSelectedShift] = useState<{ staff: Staff, dayIdx: number, shift: Shift } | null>(null);

  const openViolationsCount = state?.violations?.filter(v => !v.fixed).length || 0;

  const handleApprove = async () => {
    try {
      await approveSchedule();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Compute Cost
  const totalCost = useMemo(() => {
    if (!state?.grid) return 0;
    let cost = 0;
    STAFF.forEach(st => {
      for(let d=0; d<7; d++) {
        const shifts = state.grid[`${st.id}-${d}`] || [];
        shifts.forEach(s => {
          cost += s.durationHours * st.hrSalary;
        });
      }
    });
    return cost;
  }, [state?.grid]);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans pb-24">
      <div className="w-full mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-slate-400" />
              Schedule Planner
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              August 2026 · {state?.published ? <span className="font-semibold text-emerald-600">Published — visible to staff</span> : "Draft — invisible to staff until approved"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {state?.generated && (
              <div className="flex items-center gap-3 mr-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <span className="font-mono text-sm font-semibold text-slate-700">{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1.5 rounded-md border ${openViolationsCount > 0 ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                  {openViolationsCount > 0 ? `${openViolationsCount} open issues` : "All rules pass ✓"}
                </span>
                
                <Button 
                  onClick={handleApprove} 
                  disabled={state.published || openViolationsCount > 0} 
                  className={`gap-2 ${state.published ? "" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                  variant={state.published ? "outline" : "default"}
                >
                  {state.published ? "Published ✓" : "Approve & Publish"}
                </Button>
              </div>
            )}
            
            <Button onClick={() => setShowGenerateModal(true)} variant={state?.generated ? "outline" : "default"} className={!state?.generated ? "bg-blue-600 hover:bg-blue-700" : ""}>
              {state?.generated ? <><Settings2 className="h-4 w-4 mr-2" /> Regenerate</> : "Generate Schedule"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {!state?.generated ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center mt-8">
            <div className="mx-auto w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No proposal yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
              The system combines your demand with the submitted availabilities, applies the L-GAV rules and fairness, and drafts the month. You always keep the last word.
            </p>
            <Button onClick={() => setShowGenerateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Schedule"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Diff UI Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-6 shadow-sm overflow-x-auto">
              <div className="flex items-center gap-2 text-slate-500 shrink-0">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Demand Fill Rate</span>
              </div>
              <div className="flex gap-4 flex-1">
                {Object.keys(FN_LABELS).map(fn => {
                  let totalRequired = 0;
                  let totalAssigned = 0;
                  
                  for(let d=0; d<7; d++) {
                    totalRequired += state.demands?.[d]?.[fn as keyof typeof state.demands[0]] || 0;
                    STAFF.forEach(st => {
                      const shifts = state.grid[`${st.id}-${d}`] || [];
                      totalAssigned += shifts.filter(s => s.fn === fn).length;
                    });
                  }

                  if (totalRequired === 0) return null;
                  const isUnder = totalAssigned < totalRequired;

                  return (
                    <div key={fn} className="flex flex-col gap-1 min-w-[120px]">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">{FN_LABELS[fn]}</span>
                        <span className={`font-mono font-bold ${isUnder ? "text-orange-600" : "text-emerald-600"}`}>
                          {totalAssigned}/{totalRequired}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isUnder ? "bg-orange-500" : "bg-emerald-500"}`} 
                          style={{ width: `${Math.min(100, (totalAssigned/totalRequired)*100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View Demand Button */}
              <div className="shrink-0 ml-auto pl-4 border-l border-slate-200 h-10 flex items-center">
                <Button variant="outline" size="sm" onClick={() => setShowDemandModal(true)} className="text-xs font-semibold h-8 bg-white hover:bg-slate-50 text-slate-700">
                  View Demand
                </Button>
              </div>
            </div>

            <ScheduleGrid 
              days={days}
              staffList={STAFF}
              grid={state.grid}
              violations={state.violations}
              onShiftClick={(staff, dayIdx, shift) => setSelectedShift({ staff, dayIdx, shift })}
              onRemoveShift={(staffId, dayIdx, shiftId) => removeShift({staffId, dayIdx, shiftId})}
              onSlotClick={(violId, dayIdx, fnKey, needLabel) => setAssignData({ violId, dayIdx, fnKey, needLabel })}
              onSimulateStaffResponse={(staffId, dayIdx, shiftId, action) => simulateStaffResponse({staffId, dayIdx, shiftId, action})}
            />
            
            <p className="text-xs text-slate-500 font-medium px-1 flex items-center justify-between">
              <span>★ = matches a staff wish · ⚠ = rule issue · Click any shift for details, click empty cells or red slots to assign.</span>
            </p>

            <ViolationsPanel 
              violations={state.violations}
              onApplyFix={applyFix}
              onAssignSlot={(id) => {
                const v = state.violations.find(x => x.id === id);
                if (v && v.day !== undefined) {
                  setAssignData({ violId: v.id, dayIdx: v.day, fnKey: v.fnKey, needLabel: v.need });
                }
              }}
            />
          </div>
        )}

      </div>

      {/* Modals */}
      <GenerateScheduleModal 
        open={showGenerateModal} 
        onOpenChange={setShowGenerateModal} 
        onGenerate={generateSchedule} 
      />
      
      <AssignSlotSheet
        open={!!assignData} 
        onOpenChange={(open) => !open && setAssignData(null)}
        assignData={assignData}
        violations={state?.violations || []}
        onAssign={(violId, staffName, dayIdx, fnKey, tm, compOption) => assignSlot({ violId, staffName, dayIdx, fnKey, tm, compOption })}
      />

      <ShiftInfoModal
        open={!!selectedShift}
        onOpenChange={(open) => !open && setSelectedShift(null)}
        shiftInfo={selectedShift}
        violations={state?.violations || []}
        onRemove={(staffId, dayIdx, shiftId) => removeShift({ staffId, dayIdx, shiftId })}
        onEditTime={(staffId, dayIdx, shiftId, newTm) => editShiftTime({ staffId, dayIdx, shiftId, newTm })}
        onApplyFix={applyFix}
      />

      {state?.demands && (
        <ViewDemandModal
          open={showDemandModal}
          onOpenChange={setShowDemandModal}
          demands={state.demands}
          days={days}
        />
      )}
    </div>
  );
}
