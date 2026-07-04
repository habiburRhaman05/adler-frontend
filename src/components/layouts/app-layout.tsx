import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Bell, Search, User as UserIcon, Settings as SettingsIcon, LogOut } from 'lucide-react';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/features/auth/hooks/use-auth';
import { initials } from '@/lib/utils';

export function AppLayout() {
  const user = useAuthStore((s) => s.admin);
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#f0f5ff]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-blue-100/80 bg-white/80 backdrop-blur-xl shadow-sm shadow-blue-100/30 px-3 md:px-5 sticky top-0 z-30">
            <SidebarTrigger className="text-slate-500 hover:text-slate-700 transition-colors" />
            <div className="relative hidden md:block max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search employees, shifts…" className="pl-8 h-9 bg-slate-50/80 border-slate-200/60 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 transition-all" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-700 hover:bg-slate-100/60 transition-all">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white animate-pulse" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-600/25 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:shadow-blue-600/40 hover:scale-105 transition-all duration-200 cursor-pointer">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      initials(user?.name)
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-blue-100/80 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 p-1.5">
                  <DropdownMenuLabel className="px-2 py-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 truncate">{user?.name ?? 'Account'}</span>
                      <span className="text-xs font-normal text-slate-400 truncate">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-slate-100" />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg mx-0.5 my-0.5">
                    <Link to="/profile"><UserIcon className="mr-2 h-4 w-4 text-slate-500" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg mx-0.5 my-0.5">
                    <Link to="/settings"><SettingsIcon className="mr-2 h-4 w-4 text-slate-500" /> Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-slate-100" />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg mx-0.5 my-0.5 hover:bg-red-50"
                    onClick={() => logout(undefined, { onSettled: () => navigate('/login', { replace: true }) })}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
