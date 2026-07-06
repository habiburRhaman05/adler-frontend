import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  workloadService,
  type WorkloadWeek,
  type CreateWeekInput,
  type WeekListFilters,
  type WeekListResponse,
  type WeekDetailResponse,
  type StaffingDemand,
  type CreateDemandInput,
  type WorkloadSortableViewFilters,
  type WorkloadSortableViewResponse
} from '../api/workload.service';

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const workloadKeys = {
  all: ['workload'] as const,
  weeks: () => [...workloadKeys.all, 'weeks'] as const,
  weekList: (filters: WeekListFilters) => [...workloadKeys.weeks(), filters] as const,
  weekDetail: (id: string) => [...workloadKeys.weeks(), id] as const,
  
  views: () => [...workloadKeys.all, 'views'] as const,
  view: (filters: WorkloadSortableViewFilters) => [...workloadKeys.views(), filters] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

export function useWorkloadWeeks(filters: WeekListFilters = {}): UseQueryResult<WeekListResponse> {
  return useQuery({
    queryKey: workloadKeys.weekList(filters),
    queryFn: () => workloadService.getWeeks(filters),
  });
}

export function useWorkloadWeek(id: string): UseQueryResult<WeekDetailResponse> {
  return useQuery({
    queryKey: workloadKeys.weekDetail(id),
    queryFn: () => workloadService.getWeekById(id),
    enabled: !!id,
  });
}

export function useWorkloadView(filters: WorkloadSortableViewFilters): UseQueryResult<WorkloadSortableViewResponse> {
  return useQuery({
    queryKey: workloadKeys.view(filters),
    queryFn: () => workloadService.getWorkloadView(filters),
    enabled: !!filters.date,
  });
}

// ─── Mutations (Weeks) ──────────────────────────────────────────────────────

export function useCreateWeek(): UseMutationResult<{ data: { week: WorkloadWeek } }, Error, CreateWeekInput> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWeekInput) => workloadService.createWeek(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workloadKeys.weeks() });
      toast.success('Workload week created');
    },
    onError: () => toast.error('Failed to create workload week'),
  });
}

export function useUpdateWeek(): UseMutationResult<{ data: { week: WorkloadWeek } }, Error, { planId: string; data: Partial<WorkloadWeek> }> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }) => workloadService.updateWeek(planId, data),
    onSuccess: (_, { planId }) => {
      qc.invalidateQueries({ queryKey: workloadKeys.weeks() });
      qc.invalidateQueries({ queryKey: workloadKeys.weekDetail(planId) });
      toast.success('Week updated');
    },
    onError: () => toast.error('Failed to update week'),
  });
}

export function usePublishWeek(): UseMutationResult<{ data: { week: WorkloadWeek } }, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => workloadService.publishWeek(planId),
    onSuccess: (_, planId) => {
      qc.invalidateQueries({ queryKey: workloadKeys.weeks() });
      qc.invalidateQueries({ queryKey: workloadKeys.weekDetail(planId) });
      toast.success('Workload published successfully!');
    },
    onError: () => toast.error('Failed to publish workload'),
  });
}

export function useDeleteWeek(): UseMutationResult<{ message: string }, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => workloadService.deleteWeek(planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workloadKeys.weeks() });
      toast.success('Week deleted');
    },
    onError: () => toast.error('Failed to delete week'),
  });
}

export function useAddDemand(): UseMutationResult<{ data: { demand: StaffingDemand } }, Error, { planId: string; data: CreateDemandInput }> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }) => workloadService.addDemand(planId, data),
    onSuccess: (_, { planId }) => {
      qc.invalidateQueries({ queryKey: workloadKeys.weekDetail(planId) });
      qc.invalidateQueries({ queryKey: workloadKeys.views() });
      toast.success('Demand added');
    },
    onError: () => toast.error('Failed to add demand'),
  });
}

export function useAddDemandsBulk(): UseMutationResult<{ data: { createdCount: number; skippedCount: number } }, Error, { planId: string; demands: CreateDemandInput[] }> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, demands }) => workloadService.addDemandsBulk(planId, { demands }),
    onSuccess: (res, { planId }) => {
      qc.invalidateQueries({ queryKey: workloadKeys.weekDetail(planId) });
      qc.invalidateQueries({ queryKey: workloadKeys.views() });
      toast.success(`Saved demands. Added: ${res.data.createdCount}, Skipped/Merged: ${res.data.skippedCount}`);
    },
    onError: () => toast.error('Failed to save bulk demands'),
  });
}


export function useUpdateDemand(): UseMutationResult<{ data: { demand: StaffingDemand } }, Error, { planId: string; demandId: string; data: Partial<CreateDemandInput> }> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ demandId, data }) => workloadService.updateDemand(demandId, data),
    onSuccess: (_, { planId }) => {
      qc.invalidateQueries({ queryKey: workloadKeys.weekDetail(planId) });
      qc.invalidateQueries({ queryKey: workloadKeys.views() });
      toast.success('Demand updated');
    },
    onError: () => toast.error('Failed to update demand'),
  });
}

export function useDeleteDemand(): UseMutationResult<{ message: string }, Error, { planId: string; demandId: string }> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ demandId }) => workloadService.deleteDemand(demandId),
    onSuccess: (_, { planId }) => {
      qc.invalidateQueries({ queryKey: workloadKeys.weekDetail(planId) });
      qc.invalidateQueries({ queryKey: workloadKeys.views() });
      toast.success('Demand deleted');
    },
    onError: () => toast.error('Failed to delete demand'),
  });
}
