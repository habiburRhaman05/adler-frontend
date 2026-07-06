import React, { useState, useMemo, useCallback } from "react";
import { Plus, Minus, X, ChevronDown, CalendarDays } from "lucide-react";
import { useCategoryTree } from "@/features/categories/hooks/use-categories";

/* =========================================================================
   Helper functions
   ========================================================================= */

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MS_DAY = 86400000;

function startOfWeek(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function formatRange(start: Date) {
  const end = new Date(start.getTime() + 6 * MS_DAY);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const year = end.getFullYear();
  return `${start.toLocaleDateString("en-US", opts)} \u2013 ${end.toLocaleDateString("en-US", opts)}, ${year}`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function buildDays(start: Date) {
  return DAY_LABELS.map((label, i) => {
    const date = new Date(start.getTime() + i * MS_DAY);
    return { key: date.toISOString().slice(0, 10), label, dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
  });
}

function cloneValues(values: any) {
  const copy: any = {};
  Object.keys(values).forEach((catId) => {
    copy[catId] = { ...values[catId] };
  });
  return copy;
}

function createEmptyValues(categories: any[], days: any[]) {
  const values: any = {};
  categories.forEach((cat) => {
    values[cat.id] = {};
    days.forEach((day) => {
      values[cat.id][day.key] = 0;
    });
  });
  return values;
}

/* =========================================================================
   Custom Hook for state
   ========================================================================= */

function useDemand() {
  const [weeks, setWeeks] = useState<any[]>([]);
  const [filter, setFilter] = useState("upcoming"); // 'upcoming' | 'month' | 'all'
  const [selectedMonth, setSelectedMonth] = useState(() => monthKey(new Date()));

  const currentWeekObj = useMemo(() => {
    const currentStart = startOfWeek(new Date()).getTime();
    return weeks.find(w => w.start.getTime() === currentStart);
  }, [weeks]);

  const upcomingWeekObj = useMemo(() => {
    const nextStart = startOfWeek(new Date()).getTime() + 7 * MS_DAY;
    return weeks.find(w => w.start.getTime() === nextStart);
  }, [weeks]);

  // Months available to filter by, derived from the week list itself.
  const availableMonths = useMemo(() => {
    const seen = new Map();
    weeks.forEach((w) => {
      if (!seen.has(w.monthKey)) seen.set(w.monthKey, monthLabel(w.start));
    });
    return Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
  }, [weeks]);

  const filteredWeeks = useMemo(() => {
    if (filter === "upcoming") return upcomingWeekObj ? [upcomingWeekObj] : [];
    if (filter === "month") return weeks.filter((w) => w.monthKey === selectedMonth);
    return weeks;
  }, [filter, weeks, upcomingWeekObj, selectedMonth]);

  const saveWeek = useCallback((weekId: string, newValues: any, weekData?: any) => {
    setWeeks((prev) => {
      const exists = prev.find(w => w.id === weekId);
      if (exists) {
        return prev.map((w) => (w.id === weekId ? { ...w, values: newValues } : w));
      } else if (weekData) {
        return [...prev, { ...weekData, values: newValues }].sort((a, b) => a.start.getTime() - b.start.getTime());
      }
      return prev;
    });
  }, []);

  return {
    weeks,
    currentWeek: currentWeekObj,
    upcomingWeek: upcomingWeekObj,
    availableMonths,
    filter,
    setFilter,
    selectedMonth,
    setSelectedMonth,
    filteredWeeks,
    saveWeek,
  };
}

/* =========================================================================
   Shared table body
   ========================================================================= */

function DemandTable({ days, categories, draft, onStep }: any) {
  return (
    <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
      <thead>
        <tr>
          <th className="text-left text-xs font-medium text-gray-500 pb-2 pr-2 w-32">Category</th>
          {days.map((day: any) => (
            <th key={day.key} className="pb-2 px-1">
              <div className="text-xs font-semibold text-gray-900">{day.label}</div>
              <div className="text-[11px] text-gray-400">{day.dateLabel}</div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {categories.map((cat: any, i: number) => (
          <tr key={cat.id} className={i !== 0 ? "border-t border-gray-100" : ""}>
            <td className="py-2.5 pr-2 text-sm font-medium text-gray-800">{cat.name}</td>
            {days.map((day: any) => {
              const value = draft[cat.id]?.[day.key] || 0;
              return (
                <td key={day.key} className="py-2.5 px-1">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      aria-label={`Decrease ${cat.name} on ${day.label}`}
                      onClick={() => onStep(cat.id, day.key, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-gray-900 tabular-nums">
                      {value}
                    </span>
                    <button
                      aria-label={`Increase ${cat.name} on ${day.label}`}
                      onClick={() => onStep(cat.id, day.key, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* =========================================================================
   WeekCardView
   ========================================================================= */

function WeekCardView({ week, categories, tone = "default", onSave }: any) {
  const [draft, setDraft] = useState(() => cloneValues(week.values));
  const [dirty, setDirty] = useState(false);

  const handleStep = (catId: string, dayKey: string, delta: number) => {
    setDraft((prev: any) => {
      const next = cloneValues(prev);
      if (!next[catId]) next[catId] = {};
      next[catId][dayKey] = Math.max(0, (next[catId][dayKey] || 0) + delta);
      return next;
    });
    setDirty(true);
  };

  const handleSave = () => {
    onSave(week.id, draft);
    setDirty(false);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{week.label}</span>
          </div>
          {tone === "upcoming" && (
            <span className="inline-block mt-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              Upcoming plan
            </span>
          )}
          {tone === "current" && (
            <span className="inline-block mt-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              Current week
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty}
          className={`shrink-0 text-sm font-medium rounded-lg px-4 py-2 text-white transition-colors ${
            dirty ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          Save
        </button>
      </div>

      <div className="overflow-x-auto">
        <DemandTable days={week.days} categories={categories} draft={draft} onStep={handleStep} />
      </div>
    </div>
  );
}

/* =========================================================================
   WeekPlanModal
   ========================================================================= */

function WeekPlanModal({ nextTargetStart, categories, allWeeks, onClose, onSave }: any) {
  const targetStart = nextTargetStart;
  const targetId = `week-${targetStart.getTime()}`;
  const targetDays = buildDays(targetStart);
  const targetLabel = formatRange(targetStart);

  const [usePrev, setUsePrev] = useState(true);

  // The most recent week to use as default if checked
  const mostRecentWeek = allWeeks.length > 0 ? allWeeks[allWeeks.length - 1] : null;

  // Initialize draft depending on the checkbox and previous week data
  const [draft, setDraft] = useState(() => {
    if (usePrev && mostRecentWeek) {
      // Map previous week's values to the new days
      const newDraft = createEmptyValues(categories, targetDays);
      categories.forEach((cat: any) => {
        targetDays.forEach((day: any, i: number) => {
          // copy from the same day index of the previous week
          const prevDay = mostRecentWeek.days[i];
          if (prevDay && mostRecentWeek.values[cat.id]) {
            newDraft[cat.id][day.key] = mostRecentWeek.values[cat.id][prevDay.key] || 0;
          }
        });
      });
      return newDraft;
    }
    return createEmptyValues(categories, targetDays);
  });

  const handleCheckboxChange = (checked: boolean) => {
    setUsePrev(checked);
    if (checked && mostRecentWeek) {
      const newDraft = createEmptyValues(categories, targetDays);
      categories.forEach((cat: any) => {
        targetDays.forEach((day: any, i: number) => {
          const prevDay = mostRecentWeek.days[i];
          if (prevDay && mostRecentWeek.values[cat.id]) {
            newDraft[cat.id][day.key] = mostRecentWeek.values[cat.id][prevDay.key] || 0;
          }
        });
      });
      setDraft(newDraft);
    } else {
      setDraft(createEmptyValues(categories, targetDays));
    }
  };

  const handleStep = (catId: string, dayKey: string, delta: number) => {
    setDraft((prev: any) => {
      const next = cloneValues(prev);
      if (!next[catId]) next[catId] = {};
      next[catId][dayKey] = Math.max(0, (next[catId][dayKey] || 0) + delta);
      return next;
    });
  };

  const handleSave = () => {
    const newWeek = {
      id: targetId,
      start: targetStart,
      label: targetLabel,
      monthKey: monthKey(targetStart),
      days: targetDays,
    };
    onSave(targetId, draft, newWeek);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-6xl max-h-[100vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Create week plan</h2>
            <p className="text-sm text-gray-500 mt-1">{targetLabel}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pt-4 pb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={usePrev}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            Use previous week's data as default
          </label>
        </div>

        <div className="px-6 pb-2 pt-2 overflow-x-auto">
          <DemandTable days={targetDays} categories={categories} draft={draft} onStep={handleStep} />
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="text-sm font-medium rounded-lg px-4 py-2 text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   DemandPage
   ========================================================================= */

const FILTER_OPTIONS = [
  { value: "upcoming", label: "Upcoming week" },
  { value: "month", label: "Specific month" },
  { value: "all", label: "All weeks" },
];

export default function DemandPage() {
  const {
    currentWeek,
    upcomingWeek,
    weeks,
    availableMonths,
    filter,
    setFilter,
    selectedMonth,
    setSelectedMonth,
    filteredWeeks,
    saveWeek,
  } = useDemand();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: categoryData, isLoading: isLoadingCategories, isError: isErrorCategories } = useCategoryTree();
  
  const categories = categoryData?.data?.categories ?? [];
  const upcomingPlanExists = !!upcomingWeek;

  // Determine what week the "Create" button should target
  // If we have weeks, we target the week *after* the most recently created week.
  // If we have NO weeks, we target the *current* week (startOfWeek(Date.now())).
  const nextTargetStart = useMemo(() => {
    if (weeks.length === 0) {
      return startOfWeek(new Date());
    } else {
      const lastWeek = weeks[weeks.length - 1];
      return new Date(lastWeek.start.getTime() + 7 * MS_DAY);
    }
  }, [weeks]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-8">
      <div className="w-full mx-auto flex flex-col gap-6">
  
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Weekly demand</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Plan and update how much of each category your kitchen needs, week by week.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                >
                  {FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {filter === "month" && (
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  >
                    {availableMonths.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-white rounded-lg px-3.5 py-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={15} />
              Create week plan
            </button>
          </div>
        </div>

        {isLoadingCategories ? (
          <div className="py-16 flex justify-center">
             <div className="flex flex-col items-center gap-3">
               <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
               <p className="text-gray-500 font-medium animate-pulse">Loading categories...</p>
             </div>
          </div>
        ) : isErrorCategories || categories.length === 0 ? (
          <div className="py-16 flex justify-center">
            <div className="rounded-xl border border-dashed border-red-300 bg-red-50 p-8 text-center max-w-md">
              <p className="text-sm font-medium text-red-900">Failed to load categories or no categories exist.</p>
              <p className="text-sm text-red-700 mt-1">Please ensure categories are configured before planning demand.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Current week — always visible, always inline-editable */}
            {currentWeek && <WeekCardView week={currentWeek} categories={categories} tone="current" onSave={saveWeek} />}

            {/* Filtered listing */}
            {filter === "upcoming" ? (
              upcomingPlanExists ? (
                <WeekCardView week={upcomingWeek} categories={categories} tone="upcoming" onSave={saveWeek} />
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                  <p className="text-sm font-medium text-gray-900">No upcoming plan available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Create next week's demand so your team knows what to prep.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3.5 py-2"
                  >
                    <Plus size={15} />
                    Create upcoming plan
                  </button>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-6">
                {weeks.length === 0 ? (
                   <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                     <p className="text-sm font-medium text-gray-900">No plans created yet</p>
                     <p className="text-sm text-gray-500 mt-1">Start by creating your first weekly demand plan.</p>
                     <button
                       onClick={() => setShowCreateModal(true)}
                       className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3.5 py-2"
                     >
                       <Plus size={15} />
                       Create first plan
                     </button>
                   </div>
                ) : filteredWeeks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                    <p className="text-sm font-medium text-gray-900">No plans in this range</p>
                    <p className="text-sm text-gray-500 mt-1">Try a different filter or month.</p>
                  </div>
                ) : (
                  filteredWeeks.map((w) => (
                    <WeekCardView
                      key={w.id}
                      week={w}
                      categories={categories}
                      tone={w.id === currentWeek?.id ? "current" : w.id === upcomingWeek?.id ? "upcoming" : "default"}
                      onSave={saveWeek}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal — creation only */}
      {showCreateModal && (
        <WeekPlanModal
          nextTargetStart={nextTargetStart}
          categories={categories}
          allWeeks={weeks}
          onClose={() => setShowCreateModal(false)}
          onSave={saveWeek}
        />
      )}
    </div>
  );
}