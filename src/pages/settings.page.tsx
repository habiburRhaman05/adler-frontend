import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings, useUpdateSettings } from "@/features/settings/hooks/use-settings";
import type { Settings } from "@/features/settings/api/settings.service";
import { useAuthStore } from "@/stores/auth.store";

export function SettingsPage() {
  const { data, isLoading, isError } = useSettings();
  const updateMut = useUpdateSettings();
  const user = useAuthStore((s) => s.user);

  const [local, setLocal] = useState<Settings | null>(null);

  useEffect(() => {
    if (data) setLocal(data);
  }, [data]);

  const save = () => {
    if (local) updateMut.mutate(local);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[900px]">
      <header>
        <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold">Settings</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900 tracking-tight">Admin settings</h1>
        <p className="text-slate-500 mt-1 font-medium">Profile, rules and notification preferences.</p>
      </header>

      {isError && <div className="py-16 text-center text-red-600 font-medium">Failed to load settings.</div>}

      <Card className="rounded-2xl border-slate-200/80 shadow-md shadow-slate-100/50 bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50/80 to-blue-50/30 border-b border-slate-100 pb-4 pt-5 px-6">
          <CardTitle className="text-lg font-bold text-slate-900">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 p-6">
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold text-sm">Name</Label>
            <Input defaultValue={user?.name ?? ""} className="rounded-xl border-slate-200 bg-slate-50/50 h-11 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 font-medium transition-all" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold text-sm">Email</Label>
            <Input defaultValue={user?.email ?? ""} className="rounded-xl border-slate-200 bg-slate-50/50 h-11 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 font-medium transition-all" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold text-sm">Current password</Label>
            <Input type="password" placeholder="••••••••" className="rounded-xl border-slate-200 bg-slate-50/50 h-11 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 font-medium transition-all" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold text-sm">New password</Label>
            <Input type="password" placeholder="••••••••" className="rounded-xl border-slate-200 bg-slate-50/50 h-11 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 font-medium transition-all" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 shadow-md shadow-slate-100/50 bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50/80 to-blue-50/30 border-b border-slate-100 pb-4 pt-5 px-6">
          <CardTitle className="text-lg font-bold text-slate-900">L-GAV rule values</CardTitle>
          <p className="text-sm font-medium text-slate-500 mt-1">Adjustable without a redeploy.</p>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 p-6">
          {isLoading || !local ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-11 rounded-xl" />)
          ) : (
            <>
              <NumField label="Max daily hours" value={local.maxDailyHours} onChange={(v) => setLocal({ ...local, maxDailyHours: v })} />
              <NumField label="Max weekly hours" value={local.maxWeeklyHours} onChange={(v) => setLocal({ ...local, maxWeeklyHours: v })} />
              <NumField label="Minimum rest between shifts (h)" value={local.minRestHours} onChange={(v) => setLocal({ ...local, minRestHours: v })} />
              <NumField label="Break required after (h)" step="0.5" value={local.breakAfterHours} onChange={(v) => setLocal({ ...local, breakAfterHours: v })} />
              <NumField label="Break length (min)" value={local.breakMinutes} onChange={(v) => setLocal({ ...local, breakMinutes: v })} />
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 shadow-md shadow-slate-100/50 bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50/80 to-blue-50/30 border-b border-slate-100 pb-4 pt-5 px-6">
          <CardTitle className="text-lg font-bold text-slate-900">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {isLoading || !local ? (
            <Skeleton className="h-24 rounded-xl" />
          ) : (
            <>
              <ToggleRow label="Email backup for weekly alerts" hint="Recommended — never miss a shift." checked={local.notifications.email} onChange={(v) => setLocal({ ...local, notifications: { ...local.notifications, email: v } })} />
              <Separator className="bg-slate-100" />
              <ToggleRow label="Push notifications" hint="Sent when a week is submitted." checked={local.notifications.push} onChange={(v) => setLocal({ ...local, notifications: { ...local.notifications, push: v } })} />
              <Separator className="bg-slate-100" />
              <ToggleRow label="Daily admin digest" hint="A morning summary of pending items." checked={local.notifications.digest} onChange={(v) => setLocal({ ...local, notifications: { ...local.notifications, digest: v } })} />
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 shadow-md shadow-slate-100/50 bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50/80 to-blue-50/30 border-b border-slate-100 pb-4 pt-5 px-6">
          <CardTitle className="text-lg font-bold text-slate-900">Security</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 p-6">
          {isLoading || !local ? (
            <Skeleton className="h-11 rounded-xl" />
          ) : (
            <NumField label="Session timeout (minutes)" value={local.sessionTimeoutMinutes} onChange={(v) => setLocal({ ...local, sessionTimeoutMinutes: v })} />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={save} disabled={updateMut.isPending || !local} className="rounded-xl h-12 px-8 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/30 text-base">
          {updateMut.isPending ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Saving…</> : <><Save className="h-5 w-5 mr-2" /> Save changes</>}
        </Button>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-700 font-semibold text-sm">{label}</Label>
      <Input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="rounded-xl border-slate-200 bg-slate-50/50 h-11 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 font-medium transition-all" />
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 rounded-xl hover:bg-slate-50/50 transition-colors px-2 -mx-2">
      <div>
        <p className="font-bold text-slate-900 text-sm">{label}</p>
        <p className="text-sm font-medium text-slate-400 mt-0.5">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-blue-600" />
    </div>
  );
}
