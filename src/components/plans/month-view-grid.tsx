import { MONTHS, type Worker, type Category, type AssignedSlot, type Plan } from "../../lib/plan-data";

interface MonthViewGridProps {
  workers: Worker[];
  plan: Plan;
  categories: Category[];
  visibleSlots: AssignedSlot[];
  onOpenAssign: (day: number, start: string, existing?: AssignedSlot) => void;
}

export function MonthViewGrid({ workers, plan, categories, visibleSlots, onOpenAssign }: MonthViewGridProps) {
  // Render 5 weeks.
  const firstDayOfMonth = new Date(plan.year, plan.month, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  // The first Sunday of the calendar grid
  const calendarStart = new Date(plan.year, plan.month, 1 - firstDayOfWeek);
  
  const weeks = [];
  for (let w = 0; w < 5; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(calendarStart.getTime() + (w * 7 + d) * 24 * 60 * 60 * 1000);
      
      const isPlanWeek = w === (plan.week - 1);
      
      const daySlots = isPlanWeek 
        ? visibleSlots.filter(s => s.day === d).sort((a,b) => a.start.localeCompare(b.start))
        : [];

      days.push({
        date,
        isCurrentMonth: date.getMonth() === plan.month,
        isPlanWeek,
        dayIdx: d,
        slots: daySlots
      });
    }
    weeks.push(days);
  }
  
  return (
    <div className="flex-1 flex flex-col bg-slate-50/30 overflow-y-auto min-h-0">
      {weeks.map((week, wIdx) => (
        <div key={wIdx} className="grid grid-cols-7 flex-1 min-h-[150px] border-b border-slate-200 last:border-0">
          {week.map((day, dIdx) => (
             <div 
               key={dIdx} 
               className={`border-r border-slate-200 last:border-0 p-1.5 flex flex-col gap-1 ${day.isCurrentMonth ? 'bg-white' : 'bg-slate-50'} ${day.isPlanWeek ? 'cursor-pointer hover:bg-primary/5 transition-colors' : 'opacity-60 cursor-not-allowed'}`}
               onClick={() => {
                 if (day.isPlanWeek) {
                   onOpenAssign(day.dayIdx, "09:00");
                 }
               }}
             >
               <span className={`text-[11px] font-bold px-1.5 py-0.5 ${day.isPlanWeek ? 'text-slate-700' : 'text-slate-400'}`}>
                 {day.date.getDate()} {day.date.getDate() === 1 ? MONTHS[day.date.getMonth()].slice(0,3) : ""}
               </span>
               
               <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 px-1 custom-scrollbar pb-1">
                 {day.slots.map(slot => {
                   const cat = categories.find(c => c.id === slot.categoryId);
                   const worker = workers.find(w => w.id === slot.workerId) || { name: 'Unknown' };
                   return (
                     <div 
                       key={slot.id}
                       onClick={(e) => { e.stopPropagation(); onOpenAssign(day.dayIdx, slot.start, slot); }}
                       className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-white text-[10px] font-black shadow-sm hover:-translate-y-0.5 transition-transform cursor-pointer ${cat?.color || 'bg-slate-400'}`}
                     >
                        <span className="truncate">{worker.name}</span>
                        <span className="ml-auto opacity-70 text-[9px] whitespace-nowrap">{slot.start}</span>
                     </div>
                   );
                 })}
               </div>
             </div>
          ))}
        </div>
      ))}
    </div>
  );
}