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

const items = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Manage Plans", url: "/plans", icon: CalendarRange },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Categories", url: "/categories", icon: Layers },
  { title: "Shift Approvals", url: "/approvals", icon: ArrowLeftRight, badge: 3 },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white">
      <SidebarHeader className="border-b border-slate-100">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/20">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-slate-900 text-lg leading-none tracking-tight">BOMACH OS</span>
            <span className="text-xs text-slate-500 font-medium mt-1">Staff planning</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active} 
                      tooltip={item.title}
                      className={`font-medium transition-colors ${active ? "bg-primary/5 text-primary" : "text-slate-600 hover:text-primary hover:bg-slate-50"}`}
                    >
                      <Link to={item.url} className="flex items-center gap-3 py-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge ? (
                          <Badge className={`ml-auto h-5 min-w-5 px-1.5 ${active ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`}>
                            {item.badge}
                          </Badge>
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 bg-white">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-bold border border-slate-200">
            MK
          </div>
          <div className="flex flex-col text-xs group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-slate-900">Martin Keller</span>
            <span className="text-slate-500">Administrator</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
