import { Outlet } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50/50">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-slate-200 bg-white px-3 md:px-5 sticky top-0 z-30">
            <SidebarTrigger className="text-slate-500" />
            <div className="relative hidden md:block max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search employees, shifts…" className="pl-8 h-9 bg-slate-50 border-slate-200 focus-visible:ring-primary/20" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                MK
              </div>
            </div>
          </header>
          <main className="flex-1 min-w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
