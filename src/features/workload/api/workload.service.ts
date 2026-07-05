import { apiClient } from '@/lib/api-client';
import { buildQuery } from '@/types';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface Fulfillment {
  requiredCount: number;
  filledCount: number;
  pendingCount: number;
  openCount: number;
  status: 'OPEN' | 'PARTIAL' | 'MET';
}

export interface ConnectedShift {
  id: string;
  jobTitle: string;
  startTime: string;
  endTime: string;
  notified: boolean;
  approvedCount: number;
  pendingCount: number;
}

export interface StaffingDemand {
  id: string;
  weeklyPlanId: string;
  date: string;
  categoryId: string;
  requiredCount: number;
  startTime: string;
  endTime: string;
  note?: string;
  category: {
    id: string;
    name: string;
  };
  fulfillment: Fulfillment;
  connectedShifts: ConnectedShift[];
}

export interface WorkloadWeek {
  id: string;
  year: number;
  month: number;
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PUBLISHED';
  submittedAt: string | null;
  needsRenotify: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Appended in list
  demandCount?: number;
  totalRequired?: number;
}

// ─── Requests & Responses ───────────────────────────────────────────────────

export interface CreateWeekInput {
  weekStartDate: string;
  weekNumber?: number;
}

export interface WeekListFilters {
  page?: number;
  limit?: number;
  year?: number;
  month?: number;
  status?: 'DRAFT' | 'SUBMITTED' | 'PUBLISHED';
}

export interface WeekListResponse {
  success: boolean;
  data: {
    weeks: WorkloadWeek[];
  };
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface WeekDetailResponse {
  success: boolean;
  data: {
    week: WorkloadWeek;
    totals: {
      demandCount: number;
      totalRequired: number;
      totalFilled: number;
      totalOpen: number;
    };
    categories: {
      category: { id: string; name: string };
      totalRequired: number;
      totalFilled: number;
      demands: StaffingDemand[];
    }[];
    demands: StaffingDemand[];
  };
}

export interface CreateDemandInput {
  date: string;
  categoryId: string;
  requiredCount: number;
  startTime: string;
  endTime: string;
  note?: string;
}

export interface BulkCreateDemandInput {
  demands: CreateDemandInput[];
}

export interface WorkloadSortableViewFilters {
  view?: 'day' | 'week' | 'month';
  date: string; // Required
  categoryId?: string;
}

export interface WorkloadSortableViewResponse {
  success: boolean;
  data: {
    view: 'day' | 'week' | 'month';
    range: { start: string; end: string };
    totals: {
      demandCount: number;
      totalRequired: number;
      totalFilled: number;
      totalOpen: number;
    };
    categories: {
      category: { id: string; name: string };
      totalRequired: number;
      totalFilled: number;
      demands: StaffingDemand[];
    }[];
    demands: StaffingDemand[];
  };
}

// ─── Service ───────────────────────────────────────────────────────────────

export const workloadService = {
  // --- Weeks ---
  
  createWeek: (data: CreateWeekInput): Promise<{ data: { week: WorkloadWeek } }> =>
    apiClient.post('/admin/workload/weeks', data),

  getWeeks: (filters: WeekListFilters = {}): Promise<WeekListResponse> =>
    apiClient.get(`/admin/workload/weeks${buildQuery(filters)}`),

  getWeekById: (planId: string): Promise<WeekDetailResponse> =>
    apiClient.get(`/admin/workload/weeks/${planId}`),

  updateWeek: (planId: string, data: Partial<WorkloadWeek>): Promise<{ data: { week: WorkloadWeek } }> =>
    apiClient.patch(`/admin/workload/weeks/${planId}`, data),

  publishWeek: (planId: string): Promise<{ data: { week: WorkloadWeek } }> =>
    apiClient.post(`/admin/workload/weeks/${planId}/publish`),

  deleteWeek: (planId: string): Promise<{ message: string }> =>
    apiClient.delete(`/admin/workload/weeks/${planId}`),

  // --- Demands ---

  addDemand: (planId: string, data: CreateDemandInput): Promise<{ data: { demand: StaffingDemand } }> =>
    apiClient.post(`/admin/workload/weeks/${planId}/demands`, data),

  addDemandsBulk: (planId: string, data: BulkCreateDemandInput): Promise<{ data: { createdCount: number; skippedCount: number } }> =>
    apiClient.post(`/admin/workload/weeks/${planId}/demands/bulk`, data),

  updateDemand: (demandId: string, data: Partial<CreateDemandInput>): Promise<{ data: { demand: StaffingDemand } }> =>
    apiClient.patch(`/admin/workload/demands/${demandId}`, data),

  deleteDemand: (demandId: string): Promise<{ message: string }> =>
    apiClient.delete(`/admin/workload/demands/${demandId}`),

  // --- Main View ---

  getWorkloadView: (filters: WorkloadSortableViewFilters): Promise<WorkloadSortableViewResponse> =>
    apiClient.get(`/admin/workload${buildQuery(filters)}`),
};
