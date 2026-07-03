import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, ChefHat, Wine, Utensils, Briefcase, ClipboardList, Droplets } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { categories as seed, employees, type Category } from "@/lib/mock-data";

const icons: Record<string, React.ElementType> = {
  service: Utensils, kitchen: ChefHat, bar: Wine, office: Briefcase, commande: ClipboardList, dishwashing: Droplets,
};

export function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>(seed);
  const [newName, setNewName] = useState("");
  const [subInput, setSubInput] = useState<Record<string, string>>({});

  const addCat = () => {
    if (!newName.trim()) return;
    setCats((prev) => [...prev, { id: newName.toLowerCase().replace(/\s+/g, "-"), name: newName.trim() }]);
    setNewName("");
    toast.success("Category added");
  };

  const addSub = (id: string) => {
    const v = subInput[id]?.trim();
    if (!v) return;
    setCats((prev) => prev.map((c) => c.id === id ? { ...c, sub: [...(c.sub ?? []), v] } : c));
    setSubInput((s) => ({ ...s, [id]: "" }));
    toast.success("Sub-category added");
  };

  const removeSub = (id: string, sub: string) => {
    setCats((prev) => prev.map((c) => c.id === id ? { ...c, sub: c.sub?.filter((s) => s !== sub) } : c));
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1200px]">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Categories of work</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-1 text-slate-900 tracking-tight">Categories</h1>
        <p className="text-slate-500 mt-1 font-medium">Define what roles staff can be scheduled for. Sub-categories are optional.</p>
      </header>

      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900">Add category</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 p-5">
          <Input
            placeholder="e.g. Reception"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCat()}
            className="max-w-sm rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20 bg-slate-50 font-medium"
          />
          <Button onClick={addCat} className="rounded-xl h-11 px-6 font-semibold shadow-md shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {cats.map((c) => {
          const Icon = icons[c.id] ?? Utensils;
          const staffCount = employees.filter((e) => e.categories.includes(c.id)).length;
          return (
            <Card key={c.id} className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden transition-all hover:border-primary/30">
              <CardHeader className="flex-row items-center gap-4 bg-slate-50/50 border-b border-slate-100 pb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">{c.name}</CardTitle>
                  <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{staffCount} qualified · {c.sub?.length ?? 0} sub-categories</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap gap-2 min-h-[28px]">
                  {c.sub?.length ? c.sub.map((s) => (
                    <Badge key={s} variant="secondary" className="pl-3 pr-1.5 py-1 gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">
                      {s}
                      <button onClick={() => removeSub(c.id, s)} className="hover:bg-slate-300 rounded-md p-0.5 transition-colors text-slate-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  )) : <span className="text-xs font-medium text-slate-400 italic">No sub-categories</span>}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add sub-category"
                    value={subInput[c.id] ?? ""}
                    onChange={(e) => setSubInput((s) => ({ ...s, [c.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addSub(c.id)}
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 focus-visible:ring-primary/20 text-sm font-medium"
                  />
                  <Button size="sm" variant="outline" onClick={() => addSub(c.id)} className="rounded-lg h-10 border-slate-200 font-semibold hover:bg-slate-50">
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
