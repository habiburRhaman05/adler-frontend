import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
interface SnapshotCardProps {
  loading?: boolean;
  data?: any; // Accepting the thisMonth object from API
}

function StatSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32 rounded-md" />
      <Skeleton className="h-4 w-10 rounded-md" />
    </div>
  );
}

export function SnapshotCard({ loading, data }: SnapshotCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5 text-sm">
        {loading ? (
          <>
            <StatSkeleton />
            <div className="h-px w-full bg-slate-100" />
            <StatSkeleton />
            <div className="h-px w-full bg-slate-100" />
            <StatSkeleton />
            <div className="h-px w-full bg-slate-100" />
            <StatSkeleton />
          </>
        ) : (
          <>
            <Stat label="Scheduled Hours" value={`${data?.scheduledHours ?? 0}h`} />
            <div className="h-px w-full bg-slate-100" />
            <Stat label="Overtime" value={`${data?.overtime ?? 0}h`} tone="warning" />
            <div className="h-px w-full bg-slate-100" />
            <Stat label="Hours Due" value={`${data?.hoursDue ?? 0}h`} />
            <div className="h-px w-full bg-slate-100" />
            <Stat label="Wage Cost" value={`$${data?.wageCost ?? 0}`} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'warning' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className={`font-bold ${tone === 'warning' ? 'text-amber-600' : 'text-slate-900'}`}>{value}</span>
    </div>
  );
}
