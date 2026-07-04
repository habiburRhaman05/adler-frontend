import { Outlet } from 'react-router-dom';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from './header';
import { useAuthStore } from '@/stores/auth.store';

export function AppLayout() {
  const touchActivity = useAuthStore((s) => s.touchActivity);

  const handleInteraction = () => {
    touchActivity();
  };

  return (
    <SidebarProvider>
      <div
        className="min-h-screen flex w-full bg-[#f0f5ff]"
        onClick={handleInteraction}
        onKeyDown={handleInteraction}
      >
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 min-w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
