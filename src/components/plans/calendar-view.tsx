import { useState, useMemo } from "react";
import { Maximize, Minimize, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DAYS, type Worker, type Category, type AssignedSlot, type Plan } from "../../lib/plan-data";
import { MonthViewGrid } from "./month-view-grid";

interface CalendarViewProps {
  workers: Worker[];
  plan: Plan;
  categories: Category[];
  onOpenAssign: (day: number, start: string, existing?: AssignedSlot) => void;
}

export function CalendarView({ workers, plan, categories, onOpenAssign }: CalendarViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  
  // Config: Calendar goes from 6 AM to 11 PM
  const START_HOUR = 6;
  const END_HOUR = 23;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  const filteredWorkers = useMemo(
    () =>
      workers.filter(
        (w) =>
          (catFilter === "all" || w.categoryId === catFilter) &&
          (q ? w.name.toLowerCase().includes(q.toLowerCase()) : true),
      ),
    [workers, q, catFilter],
  );

  const visibleWorkerIds = new Set(filteredWorkers.map(w => w.id));
  const visibleSlots = plan.slots.filter(s => visibleWorkerIds.has(s.workerId) || visibleWorkerIds.has((s as any).overrideRowWorkerId || ""));

  const getSlotStyle = (startStr: string, endStr: string) => {
    const parseTime = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h + m / 60;
    };
    const s = parseTime(startStr);
    const e = parseTime(endStr);
    
    const startY = Math.max(0, s - START_HOUR);
    const duration = Math.min(e, END_HOUR) - Math.max(s, START_HOUR);

    return {
      top: `${(startY / TOTAL_HOURS) * 100}%`,
      height: `${(duration / TOTAL_HOURS) * 100}%`,
    };
  };

  const getDaySlots = (dayIdx: number) => {
    const daySlots = visibleSlots.filter(s => s.day === dayIdx).sort((a, b) => {
       const [ah, am] = a.start.split(":").map(Number);
       const [bh, bm] = b.start.split(":").map(Number);
       return (ah * 60 + am) - (bh * 60 + bm);
    });

    const columns: AssignedSlot[][] = [];
    for (const slot of daySlots) {
      let placed = false;
      for (const col of columns) {
         const last = col[col.length - 1];
         const [s1h, s1m] = slot.start.split(":").map(Number);
         const [e2h, e2m] = last.end.split(":").map(Number);
         
         const s1 = s1h * 60 + s1m;
         const e2 = e2h * 60 + e2m;
         
         if (s1 >= e2) { 
            col.push(slot);
            placed = true;
            break;
         }
      }
      if (!placed) {
        columns.push([slot]);
      }
    }

    const positionedSlots = [];
    const numCols = columns.length || 1;
    for (let c = 0; c < columns.length; c++) {
      for (const slot of columns[c]) {
        positionedSlots.push({
           ...slot,
           style: {
             ...getSlotStyle(slot.start, slot.end),
             width: `${90 / numCols}%`,
             left: `${(c * (100 / numCols)) + 2}%`
           }
        });
      }
    }
    return positionedSlots;
  };

  return (
    <>
      {isFullscreen && <div className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm transition-all" onClick={() => setIsFullscreen(false)} />}
      <div className={`w-full overflow-hidden rounded-3xl border border-slate-200 bg-white flex flex-col transition-all duration-500 ease-in-out ${isFullscreen ? "fixed inset-4 z-50 shadow-2xl h-[calc(100vh-32px)]" : "shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] h-full min-h-[800px] relative"}`}>
        
        {/* Top Control Bar */}
        <div className="flex flex-col gap-3 p-4 border-b border-slate-200 bg-white z-40 sticky top-0 shrink-0 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search workers to filter..."
                className="pl-9 h-11 rounded-xl bg-white border-slate-200 shadow-sm"
              />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-56 h-11 rounded-xl bg-white border-slate-200 shadow-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as "week" | "month")}>
                <SelectTrigger className="w-36 h-11 rounded-xl bg-white border-slate-200 shadow-sm font-bold text-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week view</SelectItem>
                  <SelectItem value="month">Month view</SelectItem>
                </SelectContent>
              </Select>
              
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2.5 bg-white hover:bg-slate-100 rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
        </div>

        {viewMode === "week" ? (
          <>
            {/* Header */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50/80 backdrop-blur-md z-20 sticky top-[77px]">
              <div className="p-4 border-r border-slate-200 text-[9px] font-black text-slate-400 uppercase text-center flex items-center justify-center">
                GMT
              </div>
              {DAYS.map((d) => (
                <div key={d} className="py-4 border-r border-slate-100 last:border-0 text-center">
                  <div className="text-sm font-black text-slate-900 tracking-tight">{d}</div>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto relative bg-slate-50/30">
              <div className="grid grid-cols-[60px_repeat(7,1fr)] relative" style={{ height: `${TOTAL_HOURS * 200}px` }}>
                
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between ml-[60px] z-0">
                  {hours.slice(0, -1).map((h, i) => (
                    <div 
                      key={h} 
                      className="border-t border-slate-200/60 w-full"
                      style={{ position: 'absolute', top: `${(i / TOTAL_HOURS) * 100}%` }}
                    />
                  ))}
                </div>

                {/* Time Labels Column */}
                <div className="border-r border-slate-200 bg-white relative z-10">
                  {hours.slice(0, -1).map((h, i) => (
                    <div 
                      key={h} 
                      className="absolute w-full text-right pr-3 text-[10px] font-bold text-slate-400/80"
                      style={{ top: `${(i / TOTAL_HOURS) * 100}%`, transform: 'translateY(-50%)' }}
                    >
                      {h === 12 ? "12PM" : h > 12 ? `${h-12}PM` : `${h}AM`}
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {DAYS.map((_, dayIdx) => {
                  const positionedSlots = getDaySlots(dayIdx);
                  
                  return (
                    <div 
                      key={dayIdx} 
                      className="relative border-r border-slate-100 last:border-0 group cursor-pointer z-10 hover:bg-primary/5 transition-colors"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const y = e.clientY - rect.top;
                          const percent = Math.max(0, Math.min(1, y / rect.height));
                          const clickedHour = Math.floor(percent * TOTAL_HOURS) + START_HOUR;
                          const startStr = `${clickedHour.toString().padStart(2, '0')}:00`;
                          onOpenAssign(dayIdx, startStr);
                        }
                      }}
                    >
                      {/* Slots */}
                      {positionedSlots.map(slot => {
                        const cat = categories.find(c => c.id === slot.categoryId);
                        const worker = workers.find(w => w.id === slot.workerId) || { name: 'Unknown' };
                        
                        return (
                          <div
                            key={slot.id}
                            onClick={(e) => { e.stopPropagation(); onOpenAssign(dayIdx, slot.start, slot); }}
                            className="absolute rounded-xl shadow-sm border border-slate-200/60 p-5 flex flex-col overflow-hidden transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer hover:z-20 bg-white min-h-[110px]"
                            style={{ ...slot.style, zIndex: 10 }}
                          >
                            {cat && <div className={`absolute inset-y-0 left-0 w-1.5 ${cat.color}`} />}
                            <div className="pl-1 flex flex-col h-full text-left">
                              <span className="text-[12px] font-black leading-tight text-slate-800 line-clamp-1">{worker.name}</span>
                              <span className="text-[11px] font-bold text-slate-400 mt-1">{slot.start} - {slot.end}</span>
                              {cat && (
                                <div className="mt-auto pt-2 flex items-center gap-1.5 overflow-hidden">
                                   <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${cat.color}`} />
                                   <span className="text-[10px] font-black text-slate-500 truncate uppercase tracking-widest">{cat.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <MonthViewGrid 
            workers={filteredWorkers}
            plan={plan}
            categories={categories}
            visibleSlots={visibleSlots}
            onOpenAssign={onOpenAssign}
          />
        )}
      </div>
    </>
  );
}