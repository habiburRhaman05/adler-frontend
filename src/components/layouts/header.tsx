import { Bell, Search } from 'lucide-react';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserDropdown } from './user-dropdown';
import { useAuthStore } from '@/stores/auth.store';

export function Header() {
  const touchActivity = useAuthStore((s) => s.touchActivity);

  const handleInteraction = () => {
    touchActivity();
  };

  return (
    <header
      className="h-14 flex items-center gap-3 border-b border-blue-100/80 bg-white/80 backdrop-blur-xl shadow-sm shadow-blue-100/30 px-3 md:px-5 sticky top-0 z-30"
      onClick={handleInteraction}
      onKeyDown={handleInteraction}
    >
      <SidebarTrigger className="text-slate-500 hover:text-slate-700 transition-colors" />

      {/* Search */}
      <div className="relative hidden md:block max-w-sm flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search employees, shifts…"
          className="pl-8 h-9 bg-slate-50/80 border-slate-200/60 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 transition-all"
        />
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-400 hover:text-slate-700 hover:bg-slate-100/60 transition-all"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white animate-pulse" />
        </Button>

        <UserDropdown />
      </div>
    </header>
  );
}
