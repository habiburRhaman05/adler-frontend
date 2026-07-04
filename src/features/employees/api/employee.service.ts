import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { buildQuery, type ListResponse } from '@/types';

export const EMPLOYMENT_TYPES = ['Full-time', 'Part time', 'Intern', 'Remote', 'Hybrid'] as const;
export const EMPLOYEE_STATUSES = [
  'Active',
  'Leave',
  'Suspension',
  'Sacked',
  'Resigned',
  'Retired',
] as const;

export const employeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  department: z.string(),
  designation: z.string(),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  status: z.enum(EMPLOYEE_STATUSES),
  salary: z.number(),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  avatar: z.string().optional().default(''),
  categories: z.array(z.string()).optional().default([]),
  contract: z.string().optional().default('monthly'),
  workload: z.number().optional().default(100),
  createdAt: z.string().optional().default(''),
});

export type Employee = z.infer<typeof employeeSchema>;

const listSchema = z.object({
  items: z.array(employeeSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export interface EmployeeFilters {
  q?: string;
  department?: string;
  status?: string;
  employmentType?: string;
  _page?: number;
  _limit?: number;
}

export type EmployeeInput = Omit<Employee, 'id' | 'createdAt'>;

export const employeeService = {
  getAll: (filters: EmployeeFilters = {}): Promise<ListResponse<Employee>> =>
    apiClient.get(`/employees${buildQuery(filters)}`, { schema: listSchema }),

  getById: (id: string): Promise<Employee> =>
    apiClient.get(`/employees/${id}`, { schema: employeeSchema }),

  create: (data: EmployeeInput): Promise<Employee> =>
    apiClient.post('/employees', data, { schema: employeeSchema }),

  update: (id: string, data: Partial<EmployeeInput>): Promise<Employee> =>
    apiClient.patch(`/employees/${id}`, data, { schema: employeeSchema }),

  remove: (id: string): Promise<{ id: string }> =>
    apiClient.delete(`/employees/${id}`),
};
