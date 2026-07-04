/**
 * Employee Feature Hooks
 * Organized by feature with better query strategies to prevent full-page re-renders
 */

import { useCallback, useMemo } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  appService,
  type Employee,
  type EmployeeFilters,
  type EmployeeInput,
} from '@/services/emplloye.service';

// ─────────────────────────────────────────────────────────────
// QUERY KEY FACTORY
// ─────────────────────────────────────────────────────────────

export const employeeQueryKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeQueryKeys.all, 'list'] as const,
  list: (filters: EmployeeFilters) => [...employeeQueryKeys.lists(), filters] as const,
  details: () => [...employeeQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeQueryKeys.details(), id] as const,
  stats: () => [...employeeQueryKeys.all, 'stats'] as const,
};

// ─────────────────────────────────────────────────────────────
// QUERY HOOKS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch employees with filters
 * Uses keepPreviousData for better UX during filter changes
 */
export function useEmployees(
  filters: EmployeeFilters = {}
): UseQueryResult<{ items: Employee[]; total: number; page: number; limit: number; totalPages: number }> {
  return useQuery({
    queryKey: employeeQueryKeys.list(filters),
    queryFn: () => appService.getEmployees(filters),
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes,
    
  });
}

/**
 * Get single employee by ID
 */
export function useEmployee(id: string): UseQueryResult<Employee> {
  return useQuery({
    queryKey: employeeQueryKeys.detail(id),
    queryFn: () => appService.getEmployee(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ─────────────────────────────────────────────────────────────
// MUTATION HOOKS
// ─────────────────────────────────────────────────────────────

/**
 * Create employee mutation
 * Only invalidates list queries, not full page
 */
export function useCreateEmployee(): UseMutationResult<
  Employee,
  Error,
  EmployeeInput
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployeeInput) => appService.createEmployee(data),
    onMutate: async (newEmployee) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: employeeQueryKeys.lists() });

      // Snapshot previous state
      const previousLists = qc.getQueriesData({
        queryKey: employeeQueryKeys.lists(),
      });

      // Optimistically update all list caches
      qc.setQueriesData(
        { queryKey: employeeQueryKeys.lists() },
        (old: any) => ({
          ...old,
          items: old?.items ? [{ id: '__temp__', ...newEmployee }, ...old.items] : [],
          total: (old?.total ?? 0) + 1,
        })
      );

      return { previousLists };
    },
    onError: (error, variables, context: any) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]: any) => {
          qc.setQueryData(key, data);
        });
      }
      toast.error('Failed to create employee');
    },
    onSuccess: (emp) => {
      // Invalidate lists to refetch fresh data
      qc.invalidateQueries({ queryKey: employeeQueryKeys.lists() });
      toast.success(`✓ ${emp.name} added successfully`);
    },
  });
}

/**
 * Update employee mutation
 * Only updates specific employee cache, not full list
 */
export function useUpdateEmployee(): UseMutationResult<
  Employee,
  Error,
  { id: string; data: Partial<EmployeeInput> }
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => appService.updateEmployee(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches for this employee
      await qc.cancelQueries({ queryKey: employeeQueryKeys.detail(id) });

      // Snapshot previous state
      const previousEmployee = qc.getQueryData<Employee>(
        employeeQueryKeys.detail(id)
      );

      // Optimistically update
      if (previousEmployee) {
        qc.setQueryData(employeeQueryKeys.detail(id), {
          ...previousEmployee,
          ...data,
        });
      }

      return { previousEmployee };
    },
    onError: (error, variables, context: any) => {
      if (context?.previousEmployee) {
        qc.setQueryData(
          employeeQueryKeys.detail(variables.id),
          context.previousEmployee
        );
      }
      toast.error('Failed to update employee');
    },
    onSuccess: (emp) => {
      // Update detail cache
      qc.setQueryData(employeeQueryKeys.detail(emp.id), emp);
      // Invalidate lists to sync
      qc.invalidateQueries({ queryKey: employeeQueryKeys.lists() });
      toast.success(`✓ ${emp.name} updated`);
    },
  });
}

/**
 * Delete employee mutation
 * Removes from cache directly without full refetch
 */
export function useDeleteEmployee(): UseMutationResult<
  { id: string },
  Error,
  string
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appService.deleteEmployee(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: employeeQueryKeys.lists() });

      // Snapshot previous lists
      const previousLists = qc.getQueriesData({
        queryKey: employeeQueryKeys.lists(),
      });

      // Remove from all list caches
      qc.setQueriesData(
        { queryKey: employeeQueryKeys.lists() },
        (old: any) => ({
          ...old,
          items: old?.items ? old.items.filter((e: Employee) => e.id !== id) : [],
          total: Math.max(0, (old?.total ?? 0) - 1),
        })
      );

      return { previousLists, deletedId: id };
    },
    onError: (error, id, context: any) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]: any) => {
          qc.setQueryData(key, data);
        });
      }
      toast.error('Failed to delete employee');
    },
    onSuccess: (_, id) => {
      // Remove from detail cache
      qc.removeQueries({ queryKey: employeeQueryKeys.detail(id) });
      toast.success('✓ Employee removed');
    },
  });
}

/**
 * Batch status update hook
 * For quick status toggles without full form
 */
export function useUpdateEmployeeStatus(): UseMutationResult<
  Employee,
  Error,
  { id: string; status: Employee['status'] }
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => appService.updateEmployeeStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: employeeQueryKeys.detail(id) });

      const previousEmployee = qc.getQueryData<Employee>(
        employeeQueryKeys.detail(id)
      );

      if (previousEmployee) {
        qc.setQueryData(employeeQueryKeys.detail(id), {
          ...previousEmployee,
          status,
        });
      }

      return { previousEmployee };
    },
    onError: (error, variables, context: any) => {
      if (context?.previousEmployee) {
        qc.setQueryData(
          employeeQueryKeys.detail(variables.id),
          context.previousEmployee
        );
      }
    },
    onSuccess: (emp) => {
      qc.setQueryData(employeeQueryKeys.detail(emp.id), emp);
      qc.invalidateQueries({ queryKey: employeeQueryKeys.lists() });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// UTILITY HOOKS
// ─────────────────────────────────────────────────────────────

/**
 * Compute muted action IDs to prevent duplicate operations
 */
export function useMutatingIds(
  createMut: UseMutationResult<Employee, Error, EmployeeInput>,
  updateMut: UseMutationResult<Employee, Error, { id: string; data: Partial<EmployeeInput> }>,
  deleteMut: UseMutationResult<{ id: string }, Error, string>
): string | null {
  return useMemo(() => {
    if (createMut.isPending) return '__creating__';
    if (updateMut.isPending && updateMut.variables?.id) return updateMut.variables.id;
    if (deleteMut.isPending && deleteMut.variables) return deleteMut.variables;
    return null;
  }, [
    createMut.isPending,
    updateMut.isPending,
    updateMut.variables?.id,
    deleteMut.isPending,
    deleteMut.variables,
  ]);
}

/**
 * Get computed employee statistics
 */
export function useEmployeeStats(employees: Employee[]) {
  return useMemo(() => appService.getEmployeeStats(employees), [employees]);
}