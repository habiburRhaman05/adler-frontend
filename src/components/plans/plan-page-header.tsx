import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PlanPageHeaderProps {
  backTo: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
}

/** Sticky top bar shared by every plans screen: back link, eyebrow/title, action slot. */
export function PlanPageHeader({ backTo, eyebrow, title, actions }: PlanPageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            to={backTo}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col justify-center">
            {eyebrow && (
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                {eyebrow}
              </div>
            )}
            <h1 className="text-xl font-black leading-tight tracking-tight text-slate-900">{title}</h1>
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
