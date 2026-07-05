import React, { useState, useEffect } from "react";
import { Save, Send, Loader2 } from "lucide-react";
import { format, addDays, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useWorkloadWeek, useUpdateWeek, usePublishWeek, useAddDemandsBulk } from "@/features/workload/hooks/use-workload";
import { useCategoryTree } from "@/features/categories/hooks/use-categories";
import type { WorkloadWeek, StaffingDemand, Fulfillment } from "@/features/workload/api/workload.service";

interface SheetEditorGridProps {
  sheet: WorkloadWeek;
}

// ─── Constants ──────────────────────────────────────────────────────────────

// Map shift types to times for bulk creation
const SHIFT_TIMES: Record<string, { start: string; end: string }> = {
  Lunch: { start: "11:00:00.000Z", end: "15:00:00.000Z" },
  Dinner: { start: "17:00:00.000Z", end: "23:00:00.000Z" },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function SheetEditorGrid({ sheet }: SheetEditorGridProps) {
  const { data: categoriesData } = useCategoryTree();
  const categories = categoriesData?.data?.categories ?? [];
  
  const { data: weekDetailData, isLoading: isWeekLoading } = useWorkloadWeek(sheet.id);
  const weekTotals = weekDetailData?.data?.totals;
  const dbDemands = weekDetailData?.data?.demands ?? [];

  // Fulfillment (filled/open counts from connected shifts) looked up per grid cell
  const fulfillmentByKey = new Map<string, StaffingDemand["fulfillment"]>();
  dbDemands.forEach((d) => {
    let shiftType = "Unknown";
    if (d.startTime.includes("11:00:00")) shiftType = "Lunch";
    else if (d.startTime.includes("17:00:00")) shiftType = "Dinner";
    const dateStr = d.date.split("T")[0];
    fulfillmentByKey.set(`${dateStr}|${shiftType}|${d.categoryId}`, d.fulfillment);
  });

  const updateMut = useUpdateWeek();
  const publishMut = usePublishWeek();
  const addDemandsBulkMut = useAddDemandsBulk(); // Needs to be created in hooks

  // Local state grid: Map<"YYYY-MM-DD|ShiftName|CategoryId", requiredCount>
  const [gridState, setGridState] = useState<Map<string, number>>(new Map());
  const [isDirty, setIsDirty] = useState(false);

  // Initialize grid from db
  useEffect(() => {
    if (!isWeekLoading && dbDemands.length > 0) {
      const newGrid = new Map<string, number>();
      dbDemands.forEach((d) => {
        // Detect if it's lunch or dinner based on start time
        let shiftType = "Unknown";
        if (d.startTime.includes("11:00:00")) shiftType = "Lunch";
        else if (d.startTime.includes("17:00:00")) shiftType = "Dinner";
        
        const dateStr = d.date.split("T")[0];
        const key = `${dateStr}|${shiftType}|${d.categoryId}`;
        newGrid.set(key, d.requiredCount);
      });
      setGridState(newGrid);
      setIsDirty(false);
    }
  }, [isWeekLoading, dbDemands]);

  // Derive columns
  const startDate = sheet.weekStartDate ? parseISO(sheet.weekStartDate) : new Date();
  const columns = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(startDate, i);
    return {
      dateObj: d,
      dateStr: format(d, "yyyy-MM-dd"),
      label: format(d, "EEE dd"),
    };
  });

  const getKey = (dateStr: string, shiftType: string, catId: string) =>
    `${dateStr}|${shiftType}|${catId}`;

  const getValue = (dateStr: string, shiftType: string, catId: string): number => {
    return gridState.get(getKey(dateStr, shiftType, catId)) ?? 0;
  };

  const setValue = (dateStr: string, shiftType: string, catId: string, val: number) => {
    setGridState((prev) => {
      const next = new Map(prev);
      if (val <= 0) next.delete(getKey(dateStr, shiftType, catId));
      else next.set(getKey(dateStr, shiftType, catId), val);
      return next;
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    const payloadDemands: any[] = [];
    gridState.forEach((requiredCount, key) => {
      const [dateStr, shiftType, categoryId] = key.split("|");
      const times = SHIFT_TIMES[shiftType];
      if (times && requiredCount > 0) {
        payloadDemands.push({
          date: dateStr,
          categoryId,
          requiredCount,
          startTime: `${dateStr}T${times.start}`,
          endTime: `${dateStr}T${times.end}`,
          note: `${shiftType} service`,
        });
      }
    });

    addDemandsBulkMut.mutate(
      { planId: sheet.id, demands: payloadDemands },
      {
        onSuccess: () => {
          setIsDirty(false);
          // If status was DRAFT, maybe set it to SUBMITTED? 
          if (sheet.status === "DRAFT") {
            updateMut.mutate({ planId: sheet.id, data: { status: "SUBMITTED" } });
          }
        },
      }
    );
  };

  const handlePublish = () => {
    if (gridState.size === 0) {
      toast.error("Add at least one demand entry before publishing");
      return;
    }
    // Automatically save then publish
    handleSave();
    publishMut.mutate(sheet.id);
  };

  const totalStaffNeeded = Array.from(gridState.values()).reduce((sum, val) => sum + val, 0);

  if (isWeekLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats + actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100">
            <UsersIcon className="h-4 w-4 text-blue-600" />
            <div>
              <span className="text-sm font-bold text-blue-700">{totalStaffNeeded}</span>
              <span className="text-xs text-blue-500 ml-1.5 font-medium">total staff needed</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
            <LayersIcon className="h-4 w-4 text-slate-500" />
            <div>
              <span className="text-sm font-bold text-slate-700">{categories.length}</span>
              <span className="text-xs text-slate-400 ml-1.5 font-medium">categories</span>
            </div>
          </div>
          {weekTotals && (
            <>
              <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-sm font-bold text-emerald-700">{weekTotals.totalFilled}</span>
                  <span className="text-xs text-emerald-500 ml-1.5 font-medium">filled by shifts</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100">
                <div>
                  <span className="text-sm font-bold text-amber-700">{weekTotals.totalOpen}</span>
                  <span className="text-xs text-amber-500 ml-1.5 font-medium">still open</span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-semibold">
              Unsaved changes
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={!isDirty || addDemandsBulkMut.isPending}
            className="rounded-xl h-10 font-semibold border-slate-200 shadow-sm"
          >
            <Save className="mr-2 h-4 w-4" />
            {addDemandsBulkMut.isPending ? "Saving…" : "Save Demands"}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishMut.isPending || sheet.status === 'PUBLISHED'}
            className="rounded-xl h-10 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
          >
            <Send className="mr-2 h-4 w-4" />
            {sheet.status === 'PUBLISHED' ? "Published" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Unified 7-Day Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-slate-50/80 backdrop-blur-md border-b border-r border-slate-200 p-4 text-left font-bold text-slate-600 min-w-[200px]">
                  <span className="text-xs uppercase tracking-wider">Function / shift</span>
                </th>
                {columns.map((col) => (
                  <th
                    key={col.dateStr}
                    className="border-b border-slate-200 p-4 text-center font-bold text-slate-600 bg-slate-50/80 backdrop-blur-md min-w-[120px]"
                  >
                    <span className="text-xs capitalize">{col.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No categories available. Create categories first to start assigning staff.
                  </td>
                </tr>
              )}
              {categories.map((cat) => (
                <React.Fragment key={cat.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="border-b border-r border-slate-100 p-4 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors">
                      <span className="font-semibold text-slate-700 text-sm">{cat.name} · Lunch</span>
                    </td>
                    {columns.map((col) => (
                      <td key={`${col.dateStr}-Lunch`} className="border-b border-slate-100 p-2 text-center">
                        <Stepper
                          value={getValue(col.dateStr, "Lunch", cat.id)}
                          onChange={(val) => setValue(col.dateStr, "Lunch", cat.id, val)}
                          fulfillment={fulfillmentByKey.get(getKey(col.dateStr, "Lunch", cat.id))}
                        />
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="border-b border-r border-slate-100 p-4 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors">
                      <span className="font-semibold text-slate-700 text-sm">{cat.name} · Dinner</span>
                    </td>
                    {columns.map((col) => (
                      <td key={`${col.dateStr}-Dinner`} className="border-b border-slate-100 p-2 text-center">
                        <Stepper
                          value={getValue(col.dateStr, "Dinner", cat.id)}
                          onChange={(val) => setValue(col.dateStr, "Dinner", cat.id, val)}
                          fulfillment={fulfillmentByKey.get(getKey(col.dateStr, "Dinner", cat.id))}
                        />
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const FULFILLMENT_META: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "open", cls: "text-slate-400" },
  PARTIAL: { label: "partial", cls: "text-amber-600" },
  MET: { label: "filled", cls: "text-emerald-600" },
};

function Stepper({
  value,
  onChange,
  fulfillment,
}: {
  value: number;
  onChange: (val: number) => void;
  fulfillment?: Fulfillment;
}) {
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-sm">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors font-mono text-lg leading-none"
        >
          -
        </button>
        <span className="w-5 text-center text-sm font-bold text-slate-700">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors font-mono text-lg leading-none"
        >
          +
        </button>
      </div>
      {fulfillment && fulfillment.requiredCount > 0 && (
        <span className={`text-[10px] font-semibold ${FULFILLMENT_META[fulfillment.status].cls}`}>
          {fulfillment.filledCount}/{fulfillment.requiredCount} {FULFILLMENT_META[fulfillment.status].label}
        </span>
      )}
    </div>
  );
}

// Inline icon components
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}
