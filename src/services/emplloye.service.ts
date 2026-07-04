/**
 * Consolidated AppService - All API operations in one class
 * Better organization, easier testing, single source of truth
 */

import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { buildQuery, type ListResponse } from '@/types';

// ─────────────────────────────────────────────────────────────
// SCHEMAS & TYPES
// ─────────────────────────────────────────────────────────────

export const EMPLOYMENT_TYPES = ['Full-time', 'Part time', 'Intern', 'Remote', 'Hybrid'] as const;
export const EMPLOYEE_STATUSES = ['Active', 'Leave', 'Suspension', 'Sacked', 'Resigned', 'Retired'] as const;

export const employeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  department: z.string(),
  designation: z.string(),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  status: z.enum(EMPLOYEE_STATUSES),
  salary: z.number().min(0),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  avatar: z.string().url().optional().default(''),
  categories: z.array(z.string()).optional().default([]),
  contract: z.string().optional().default('monthly'),
  workload: z.number().min(0).max(100).optional().default(100),
  createdAt: z.string().datetime().optional().default(''),
});

export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeInput = Omit<Employee, 'id' | 'createdAt'>;

const listResponseSchema = z.object({
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
  categories?: string;
  _page?: number;
  _limit?: number;
  _sort?: string;
  _order?: 'asc' | 'desc';
}

// ─────────────────────────────────────────────────────────────
// CONSOLIDATED SERVICE CLASS
// ─────────────────────────────────────────────────────────────

class AppService {
  // ─────────────────── EMPLOYEES ────────────────
  
  /**
   * Fetch all employees with optional filters
   * Supports pagination, search, filtering, sorting
   */
  async getEmployees(filters: EmployeeFilters = {}): Promise<ListResponse<Employee>> {
    console.log("apu calling");
    
    const queryString = buildQuery(filters);
   try {
    console.log("called");
    
     const res = apiClient.get<ListResponse<Employee>>(
      `/employees${queryString}`,
      { schema: listResponseSchema }
    );
    return res
   } catch (error) {
    alert()
    console.log(error);
    
   }
  }

  /**
   * Get single employee by ID
   */
  async getEmployee(id: string): Promise<Employee> {
    return apiClient.get<Employee>(
      `/employees/${id}`,
      { schema: employeeSchema }
    );
  }

  /**
   * Create new employee
   */
  async createEmployee(data: EmployeeInput): Promise<Employee> {
    return apiClient.post<Employee>(
      '/employees',
      data,
      { schema: employeeSchema }
    );
  }

  /**
   * Update existing employee
   * Partial updates allowed
   */
  async updateEmployee(id: string, data: Partial<EmployeeInput>): Promise<Employee> {
    return apiClient.patch<Employee>(
      `/employees/${id}`,
      data,
      { schema: employeeSchema }
    );
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/employees/${id}`);
  }

  /**
   * Batch update employee status (for quick actions)
   */
  async updateEmployeeStatus(id: string, status: Employee['status']): Promise<Employee> {
    return this.updateEmployee(id, { status });
  }

  /**
   * Get employee statistics
   */
  getEmployeeStats(employees: Employee[]) {
    return {
      total: employees.length,
      active: employees.filter(e => e.status === 'Active').length,
      suspended: employees.filter(e => e.status === 'Suspension').length,
      onLeave: employees.filter(e => e.status === 'Leave').length,
      byDepartment: this.groupBy(employees, 'department'),
      byType: this.groupBy(employees, 'employmentType'),
    };
  }

  // ─────────────────── UTILITIES ────────────────

  /**
   * Group array by key
   */
  private groupBy<T extends Record<string, any>>(
    arr: T[],
    key: keyof T
  ): Record<string, number> {
    return arr.reduce((acc, item) => {
      const groupKey = String(item[key]);
      acc[groupKey] = (acc[groupKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Filter employees by multiple criteria
   */
  filterEmployees(
    employees: Employee[],
    filters: {
      search?: string;
      department?: string;
      status?: string;
      type?: string;
    }
  ): Employee[] {
    return employees.filter(e => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match = e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filters.department && e.department !== filters.department) return false;
      if (filters.status && e.status !== filters.status) return false;
      if (filters.type && e.employmentType !== filters.type) return false;
      return true;
    });
  }
}

// ─────────────────────────────────────────────────────────────
// SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────

export const appService = new AppService();

// Export for testing/di patterns
export default appService;
