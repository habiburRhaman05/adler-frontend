/**
 * Features/Employees Index
 * Central export point for all employees feature components, hooks, and services
 * Usage: import { EmployeesPage, useEmployees } from '@/features/employees'
 */

// ─────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────

export {
  useEmployees,
  useEmployee,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useUpdateEmployeeStatus,
  useMutatingIds,
  useEmployeeStats,
  employeeQueryKeys,
} from '@/hooks/use-employee';

// ─────────────────────────────────────────────────────────────
// API & SERVICES
// ─────────────────────────────────────────────────────────────

export {
  appService,
  employeeSchema,
  EMPLOYMENT_TYPES,
  EMPLOYEE_STATUSES,
  type Employee,
  type EmployeeInput,
  type EmployeeFilters,
} from '@/services/emplloye.service';

// ─────────────────────────────────────────────────────────────
// UTILITIES & CONSTANTS
// ─────────────────────────────────────────────────────────────

export {
  useDebouncedValue,
  validateEmployeeForm,
  DEPARTMENTS,
  type ValidationError,
} from '@/lib/employee-utilits';
