import { useState, useMemo } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';
import { toast } from "sonner";
import {
  MoreVertical,
  Plus,
  Filter,
  Search,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { mockEmployees, departments, designations, type Employee, type EmployeeStatus, type EmployeeType } from '@/lib/mock-data';

const getStatusStyle = (status: EmployeeStatus) => {
  switch (status) {
    case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'Retired': return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'Suspension': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'Sacked':
    case 'Resigned': return 'bg-red-50 text-red-600 border-red-200';
    case 'Leave': return 'bg-blue-50 text-blue-600 border-blue-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

const getTypeStyle = (type: EmployeeType) => {
  switch (type) {
    case 'Full-time': return 'text-purple-600 border-purple-200 bg-purple-50';
    case 'Intern': return 'text-amber-600 border-amber-200 bg-amber-50';
    case 'Part time': return 'text-sky-600 border-sky-200 bg-sky-50';
    case 'Remote': return 'text-teal-600 border-teal-200 bg-teal-50';
    case 'Hybrid': return 'text-fuchsia-600 border-fuchsia-200 bg-fuchsia-50';
    default: return 'text-slate-600 border-slate-200 bg-slate-50';
  }
}

export function DashboardPage() {
  const { data: user } = useCurrentUser();
  const [list, setList] = useState<Employee[]>(mockEmployees);
  const [q, setQ] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return list.filter((e) => {
      if (deptFilter !== "all" && e.department !== deptFilter) return false;
      if (q && !e.name.toLowerCase().includes(q.toLowerCase()) && !e.designation.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [list, q, deptFilter]);

  const toggleStatus = (id: string) => {
    setList((prev) => prev.map((e) => e.id === id ? { ...e, status: e.status === "Active" ? "Suspension" : "Active" } : e));
    const e = list.find((x) => x.id === id)!;
    toast.success(`${e.name} is now ${e.status === "Active" ? "Suspended" : "Active"}`);
  };

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      
  dashboard main content
    </div>
  );
}

