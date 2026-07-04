import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  employeeService,
  type EmployeeFilters,
  type EmployeeInput,
} from '../api/employee.service';

export const employeeKeys = {
  all: ['employees'] as const,
  list: (filters: EmployeeFilters) => [...employeeKeys.all, 'list', filters] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
};

export function useEmployees(filters: EmployeeFilters = {}) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeeService.getAll(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeInput) => employeeService.create(data),
    onSuccess: (emp) => {
      qc.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success('Employee added', { description: emp.name });
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeInput> }) =>
      employeeService.update(id, data),
    onSuccess: (emp) => {
      qc.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success('Employee updated', { description: emp.name });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success('Employee removed');
    },
  });
}
