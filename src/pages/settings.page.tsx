import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function SettingsPage() {
  const [rules, setRules] = useState({
    maxDaily: 10,
    maxWeekly: 50,
    minRest: 11,
    breakAfter: 5.5,
    breakMinutes: 30,
  });
  const [notif, setNotif] = useState({ email: true, push: true, digest: false });
  const [session, setSession] = useState(30);

  const save = () => toast.success("Settings saved");

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[900px]">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Settings</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900 tracking-tight">Admin settings</h1>
        <p className="text-slate-500 mt-1 font-medium">Profile, rules and notification preferences.</p>
      </header>

      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 p-6">
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Name</Label>
            <Input defaultValue="Martin Keller" className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20 bg-slate-50 font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Email</Label>
            <Input defaultValue="martin@adler.ch" className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20 bg-slate-50 font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Current password</Label>
            <Input type="password" placeholder="••••••••" className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20 bg-slate-50 font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">New password</Label>
            <Input type="password" placeholder="••••••••" className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20 bg-slate-50 font-medium" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900">L-GAV rule values</CardTitle>
          <p className="text-sm font-medium text-slate-500 mt-1">Kept as settings so they can be adjusted without a redeploy.</p>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 p-6">
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Max daily hours</Label>
            <Input type="number" value={rules.maxDaily} onChange={(e) => setRules({ ...rules, maxDaily: Number(e.target.value) })} className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20 font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Max weekly hours</Label>
            <Input type="number" value={rules.maxWeekly} onChange={(e) => setRules({ ...rules, maxWeekly: Number(e.target.value) })} className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20 font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Minimum rest between shifts (h)</Label>
            <Input type="number" value={rules.minRest} onChange={(e) => setRules({ ...rules, minRest: Number(e.target.value) })} className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20 font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Break required after (h)</Label>
            <Input type="number" step="0.5" value={rules.breakAfter} onChange={(e) => setRules({ ...rules, breakAfter: Number(e.target.value) })} className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20 font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Break length (min)</Label>
            <Input type="number" value={rules.breakMinutes} onChange={(e) => setRules({ ...rules, breakMinutes: Number(e.target.value) })} className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20 font-medium" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <ToggleRow label="Email backup for weekly alerts" hint="Recommended — never miss a shift." checked={notif.email} onChange={(v) => setNotif({ ...notif, email: v })} />
          <Separator className="bg-slate-100" />
          <ToggleRow label="Push notifications" hint="Sent when a week is submitted." checked={notif.push} onChange={(v) => setNotif({ ...notif, push: v })} />
          <Separator className="bg-slate-100" />
          <ToggleRow label="Daily admin digest" hint="A morning summary of pending items." checked={notif.digest} onChange={(v) => setNotif({ ...notif, digest: v })} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900">Security</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 p-6">
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Session timeout (minutes)</Label>
            <Input type="number" value={session} onChange={(e) => setSession(Number(e.target.value))} className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20 font-medium" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={save} className="rounded-xl h-12 px-8 font-semibold shadow-md shadow-primary/20 text-base"><Save className="h-5 w-5 mr-2" /> Save changes</Button>
      </div>
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="font-bold text-slate-900 text-sm">{label}</p>
        <p className="text-sm font-medium text-slate-500 mt-0.5">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-primary" />
    </div>
  );
}
