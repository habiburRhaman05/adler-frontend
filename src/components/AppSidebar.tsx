import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarRange,
  Users,
  Layers,
  ArrowLeftRight,
  BarChart3,
  Settings as SettingsIcon,
  UtensilsCrossed,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";
import { useApprovals } from "@/features/approvals/hooks/use-approvals";
import { initials } from "@/lib/utils";

const items = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Weekly Plan", url: "/plans", icon: CalendarRange },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Categories", url: "/categories", icon: Layers },
  {
    title: "Shift Approvals",
    url: "/approvals",
    icon: ArrowLeftRight,
    approvalsBadge: true,
  },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const user = useAuthStore((s) => s.admin);
  const { data: approvals } = useApprovals({ status: "pending" });
  const pendingCount = approvals?.total ?? 0;

  const isActive = (url: string) =>
    url === "/"
      ? pathname === "/"
      : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-800 bg-[#0f172a]">
      <SidebarHeader className="border-b border-white/10 bg-transparent">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold tracking-tight text-white">
              ADLER
            </span>
            <span className="text-xs text-slate-400">
              Staff Planning
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.url);
                const showBadge = item.approvalsBadge && pendingCount > 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={`rounded-xl transition-all duration-200 font-medium ${
                        active
                          ? "bg-blue-500/20 text-blue-300 shadow-sm"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3 py-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {showBadge && (
                          <Badge className="ml-auto h-5 min-w-5 px-1.5 bg-blue-500 text-white rounded-md text-[10px] font-bold shadow-sm shadow-blue-500/30">
                            {pendingCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 bg-transparent">
        <Link
          to="/profile"
          className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-white/5"
        >
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-bold text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              initials(user?.name)
            )}
          </div>
          <div className="min-w-0 flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold text-white text-sm">
              {user?.name ?? "Account"}
            </span>
            <span className="truncate text-xs capitalize text-slate-400">
              {user?.role ?? "User"}
            </span>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
