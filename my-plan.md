সব পেজের overview o নতুন পেজ create korte hobe সেটা ও বললাম এখন কাজ বলো আরো কিছু কি improve বা তোমার লাগবে।


নতুন পেজ। example user jabe যেখানে tar weekly koyjon man power লাগবে sheta she choose korte parbe like Monday lunch a 3 bar 5 dinner a 2 etc kore and create man plan click korle week with date to date select korte oarbe snd pore week or month wise indivisual filter korte parbe. 
And all month wise render inside week ly wise oky.


Overview পেজ বতমানে যে ui components গুলো existing আছে ও গুলোই থাকবে but data gula dynamic api fetch hobe data json server thake asbe oky and loding skelectiom animation must be and and current ui try be little bit better oky.


And employees page a admin employ add korte parbe using modal data fill and save with loading animation save data in json server db. And imeditly data re-fetch from json ssrver or store in zustand store যেটা best hoy oky.
And admin employed filter and edit and delete o korte parbe.
And skhane o skelection animation and loading and proparly error handling korte hobe.and আরো ui components কি কি আচে সেগুলও wokring করতে হবে।


category page workfloe smiller like employees page,

And reports page admin jate kicu user ar dynamic data dackte pai (kisu data mock add korbe json server a)  and user data rending eith skelectiom and filer user data by working hours, name, category, and salary etc.

।
and profile page a smiller lime উপরের পেজ গুলোর মতো াand. ui components যাযা আছে তা must br follow korbe.

এর পরে আসো json server এ কিছু fake user data with thair montly plan সাভমিট করছে এমন সেটা রাখতে হবে। কি কি ডেটা রাখবে সেটা ui দেখলই বুঝতে পারবে সো এই ডেটা add koro json server a jate frontrnd thake /user/id/plan সব ডেটা আসে from json db


Plan manage already যে ui view /code গুলো আছে সেগুলো তুমি পড়লেই বুঝতে পারবে কি ভাবে কি হচ্চে।
এটা Manage plan page add korba যাতে admin plan page visit korle example akhon 4 tarik mane monthly first week. So যে যে user avalivality slot book eith timing korce tader data render korbe with admin data filter যেন করতে পারে। and admin a plan মানে কে কোন category তে কাজ করবে সেটা admjn select korar por সাবমিট button a click korle plan submit hobe json db te. And draft korle sheta status draft  as store hobe. 
Plan confirm hobe seprate plan details page nea jabe like /plan/id oktane akta modern plan view ui render korabe jkhane week plan jeta she create korte sheta dakhabe and plan submit ar por আলাদা আলাদা user ke তাদর জন্য admin ki plan করেছে কখন কার কাজ আছে সে টা এটা user ke mail korte hobe akhon just log korle hobe oky.

and pore jate plan edit o korte pate.
And plan create a click korle jate kon  week ও কোন কোন তারিখ থেকে কোন তারিখ পর্যন্ত she ay plan korche sheta ask kora o input নেওয়া.  


/manage/plan page all montly eise plan rendrjng Kora list ewise with filter option oky.










যেকোনো filteri g a somoy just api call and end point a query gula pass korbe json server data deve. মানে যাতে আবার backend api রেডি হলে আবার কোড change করতে না হয় বুঝতে পারছো



Perfect! 100% বুঝেছি। এখন আমি একটি **complete, structured requirement document** তৈরি করব যা Claude Code কে সব কিছু implement করতে পারবে। Let me organize:

---

## 📋 **COMPREHENSIVE IMPLEMENTATION GUIDE**

### **PART 1: Pages Overview & Workflows**

#### **1. Overview Page** (`/`)
```
Current: Skeleton + KPI cards
Task: Make dynamic with JSON server

Data Points:
- Total Employees
- Active Plans
- Pending Approvals
- This Month Schedule Coverage %
- Recent Activity Feed

API Calls:
GET /employees (count)
GET /plans?month=current
GET /approvals?status=pending
GET /activity (recent 5)

Features:
✅ Loading skeleton animation
✅ Chart showing week-wise coverage
✅ Quick action buttons (Add Employee, Create Plan)
export reports page data in csv 
```

#### **2. Employees Page** (`/employees`)
```
Features:
✅ Table/List view with search + filters
✅ Filters: Department, Employment Type, Status
✅ Add Employee Modal
✅ Edit Employee Modal
✅ Delete with confirmation
✅ Bulk actions (if needed)

API Endpoints:
GET /employees?filter=department&name=search
POST /employees (add)
PUT /employees/:id (edit)
DELETE /employees/:id

Modal Fields:
- Name
- Email
- Department
- Designation
- Employment Type (Full-time, Part-time, Remote, Hybrid, Intern)
- Status (Active, Leave, Suspension, etc)
- Salary
- Availability Slots (JSON array)

Loading: Skeleton rows while fetching
Error: Toast notification on failure
Success: Toast + immediate re-fetch
```

#### **3. Categories Page** (`/categories`)
```
Same workflow as Employees

API Endpoints:
GET /categories?filter=search
POST /categories
PUT /categories/:id
DELETE /categories/:id

Fields:
- Category Name
- Description
- Default Pay Rate
- Max Shifts/Week

Loading + Error Handling (same pattern)
```

#### **4. Plan Create Page** (`/plan/create`)
```
Step 1: Select Week & Date Range
- Calendar picker: Start Date to End Date
- Auto-populate week number
- Show selected dates

Step 2: Employee & Manpower Selection
- List all active employees
- For each employee:
  - Checkbox to include in plan
  - Select category (dropdown)
  - For each day:
    - Select shift type (Lunch, Dinner, etc)
    - Time picker (start, end)
    - Or: Choose from availability slots

Step 3: Constraint Review
- Show violations (>50 hrs, conflicting shifts)
- Visual warning badges

Step 4: Submit or Draft
- Draft: Save as status=draft (editable later)
- Submit: Locked after submission

API Endpoints:
POST /plans (create with status=draft)
GET /employees (list all active)
GET /categories (list all)

Data Structure:
{
  planId: "uuid",
  weekNumber: 3,
  dateRange: { start: "2024-07-01", end: "2024-07-07" },
  status: "draft", // draft, submitted, approved
  assignments: [
    {
      employeeId: "emp1",
      category: "cat1",
      shifts: [
        { day: "Monday", shiftType: "Lunch", start: "10:00", end: "15:00" },
        { day: "Monday", shiftType: "Dinner", start: "15:00", end: "23:00" }
      ]
    }
  ],
  createdBy: "admin-id",
  createdAt: "2024-01-15T10:00:00Z"
}
```

#### **5. Manage Plans Page** (`/manage/plans`)
```
View: Calendar + List view toggle

Filters:
- By Status (Draft, Submitted, Approved)
- By Month (calendar selector)
- By Employee Name
- By Category

Each Plan Card Shows:
- Week number + Date range
- Status badge (with color)
- Number of employees assigned
- Last modified date
- Action buttons:
  - View Details (→ /plan/:id)
  - Edit (if draft)
  - Submit (if draft)
  - Archive
  - Delete (if draft)

API Endpoints:
GET /plans?status=status&month=month&employee=name&category=cat
PUT /plans/:id (update status, edit)
DELETE /plans/:id
```

#### **6. Plan Details Page** (`/plan/:id`)
```
Display:
- Week info (dates, week number)
- All assignments in beautiful grid view
- Status badge
- Created by + date

Grid Layout:
Rows: Employees
Columns: Monday to Sunday
Cell Content: Category + Timing (if any)

Actions (if draft):
- Edit Plan (→ /plan/create?id=planId)
- Submit Plan (change status to submitted)
- Delete Plan

Actions (if submitted):
- View-only mode
- Print/Export option

API Endpoints:
GET /plans/:id
PUT /plans/:id (update status)
DELETE /plans/:id
```

#### **7. Reports Page** (`/reports`)
```
Filters:
- Employee Name (dropdown)
- Category (dropdown)
- Date Range (from-to)
- Status (Active, Leave, etc)

Data Display:
- Table showing:
  - Employee Name
  - Category
  - Total Hours (this month)
  - Salary (calculated)
  - Number of Shifts
  - Status

Export Options:
- PDF download
- CSV download

API Endpoints:
GET /reports?employee=id&category=id&dateFrom=&dateTo=&status=

Mock Data:
Add 10-15 employees with month-long schedules
Add various categories
```

#### **8. Profile Page** (`/profile`)
```
Left Panel:
- Profile photo
- Basic info (name, email, role)
- Edit button

Right Panel:
- Tabs:
  1. Personal Information
     - Name, Email, Phone
     - Address
     - Edit form
  
  2. Availability
     - Weekly availability slots
     - Add/Remove slots
     - Each slot: Day + Time range
  
  3. Settings
     - Email notifications
     - Plan reminders
     - Language preference

API Endpoints:
GET /profile (or /users/:id)
PUT /profile (update)
GET /availability (weekly slots)
PUT /availability (update slots)

Form Fields:
- Name
- Email
- Phone
- Address
- Weekly Availability (array of slots)
- Notification preferences
```

#### **9. Approvals Page** (`/approvals`)
```
View: List of pending approvals

Each Item:
- Plan week info
- Submitted by (admin name)
- Submitted date
- Assigned employees count
- Action buttons:
  - Approve (→ status=approved)
  - Request Changes (modal)
  - Reject (modal with reason)

After Action:
- Status updates
- Email notification (mock)
- Disappear from list

API Endpoints:
GET /approvals?status=pending
PUT /approvals/:planId?action=approve
PUT /approvals/:planId?action=reject
```

---

### **PART 2: JSON Server Database Structure**

```json
{
  "users": [
    {
      "id": "admin1",
      "name": "John Admin",
      "email": "admin@example.com",
      "password": "Admin@123", // For login demo
      "role": "admin",
      "avatar": "url",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "emp1",
      "name": "Darlene Robertson",
      "email": "darlene@example.com",
      "password": "Emp@1234",
      "role": "employee",
      "department": "Design",
      "designation": "UI/UX Designer",
      "employmentType": "Full-time",
      "status": "Active",
      "salary": 50000,
      "avatar": "url",
      "phone": "01700000001",
      "address": "123 Main St",
      "createdAt": "2024-01-05T00:00:00Z"
    }
    // 10+ more employees
  ],
  
  "categories": [
    {
      "id": "cat1",
      "name": "Lunch Shift",
      "description": "Lunch service shift",
      "defaultRate": 15,
      "maxShifts": 10,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "cat2",
      "name": "Dinner Shift",
      "description": "Dinner service shift",
      "defaultRate": 20,
      "maxShifts": 10
    }
  ],
  
  "availability": [
    {
      "id": "avail1",
      "employeeId": "emp1",
      "slots": [
        { "day": "Monday", "available": true, "timeRange": { "start": "10:00", "end": "23:00" } },
        { "day": "Tuesday", "available": true, "timeRange": { "start": "10:00", "end": "23:00" } }
      ]
    }
  ],
  
  "plans": [
    {
      "id": "plan1",
      "weekNumber": 3,
      "month": "2024-01",
      "dateRange": {
        "start": "2024-01-15",
        "end": "2024-01-21"
      },
      "status": "submitted", // draft, submitted, approved, rejected
      "assignments": [
        {
          "employeeId": "emp1",
          "categoryId": "cat1",
          "shifts": [
            {
              "day": "Monday",
              "date": "2024-01-15",
              "startTime": "10:00",
              "endTime": "15:00",
              "hours": 5
            },
            {
              "day": "Monday",
              "date": "2024-01-15",
              "startTime": "15:00",
              "endTime": "23:00",
              "hours": 8
            }
          ],
          "totalHours": 13
        }
      ],
      "violations": [],
      "createdBy": "admin1",
      "createdAt": "2024-01-10T10:00:00Z",
      "submittedAt": "2024-01-10T15:00:00Z",
      "approvedBy": null,
      "approvedAt": null
    }
  ],
  
  "approvals": [
    {
      "id": "appr1",
      "planId": "plan1",
      "status": "pending", // pending, approved, rejected
      "submittedBy": "admin1",
      "submittedDate": "2024-01-10T15:00:00Z",
      "reviewedBy": null,
      "reviewDate": null,
      "comments": ""
    }
  ]
}
```

---

### **PART 3: API Service Structure**

```typescript
// src/features/plans/api/plan.service.ts
export const planService = {
  // Create/Draft
  createPlan: (planData) => POST /plans
  draftPlan: (planData) => POST /plans?status=draft
  
  // Read
  getAllPlans: (filters) => GET /plans?month=&status=&employee=
  getPlanById: (id) => GET /plans/:id
  
  // Update
  updatePlan: (id, data) => PUT /plans/:id
  changePlanStatus: (id, status) => PUT /plans/:id?status=status
  
  // Delete
  deletePlan: (id) => DELETE /plans/:id
}

// src/features/employees/api/employee.service.ts
export const employeeService = {
  getAll: (filters) => GET /employees?dept=&name=&status=
  getById: (id) => GET /employees/:id
  create: (data) => POST /employees
  update: (id, data) => PUT /employees/:id
  delete: (id) => DELETE /employees/:id
}

// Same pattern for: categoryService, approvalService, reportService, userService
```

---

### **PART 4: Color Palette (from your image)**

```
Primary Blue: #0052FF (buttons, active states)
Dark Bg: #0F172A (sidebar, dark areas)
Light Bg: #F8F9FB (main content)
Gray: #6B7280 (text, borders)
White: #FFFFFF
Success Green: #10B981
Warning Yellow: #F59E0B
Danger Red: #EF4444
Info Cyan: #06B6D4

Header Bg: White with subtle shadow
Sidebar Bg: #1F2937 (dark gray, glassmorphism)
User Popup: Dark with blue accent
```

---

### **PART 5: Key Technical Details**

#### **API Query Format (for JSON Server compatibility):**
```javascript
// Search
GET /employees?name_like=john

// Filter
GET /plans?status=draft&month=2024-01

// Pagination
GET /employees?_page=1&_limit=10

// Sort
GET /plans?_sort=createdAt&_order=desc

// Relations
GET /plans?_expand=createdBy (with user info)

All filters will work same in real backend - no code change needed!
```

#### **Error Handling:**
```typescript
- Network error → Toast "Connection failed"
- Validation error → Form field errors
- 401 Unauthorized → Redirect to login
- 500 Server error → Toast with retry button
```

#### **Loading States:**
```typescript
- API call → Skeleton/Spinner
- Form submit → Button disabled + spinner
- Page load → Full page skeleton
- Data fetch → Card skeleton
```

---

### **PART 6: Implementation Checklist**

```
📦 Setup:
☐ JSON Server running on :3001
☐ All 6 data tables seeded with realistic data
☐ Axios base URL configured to JSON server

🎨 Design:
☐ Color scheme applied to all pages
☐ Header with user popup
☐ Sidebar with glassmorphism
☐ Consistent button styles
☐ Dark/Light theme toggle ready

📄 Pages (in order):
☐ Profile Page (simplest) 
☐ Overview Page (dynamic data only)
☐ Employees Page (full CRUD)
☐ Categories Page (full CRUD)
☐ Plan Create Page (complex form)
☐ Manage Plans Page (filtering)
☐ Plan Details Page (view only)
☐ Reports Page (data aggregation)
☐ Approvals Page (workflow)

🔐 Auth:
☐ Login redesigned
☐ Protected routes middleware
☐ Logout functionality
☐ Token management

🎯 Features:
☐ All CRUD operations working
☐ Loading skeletons on all data fetches
☐ Error toast notifications
☐ Success confirmations
☐ Query parameter filters
☐ Responsive design
☐ Form validation
```

---

## ⚠️ **কোনো সমস্যা আছে?**

✅ **No** - এটা একেবারে realistic এবং scalable approach  
✅ **Code reusability** - Backend সুইচ করার সময় শুধু URL বদলাবে  
✅ **Professional portfolio** - সব features থাকবে  

---

**এখন Claude Code কে দেওয়ার জন্য প্রস্তুত। এই document টাই সে সব implement করতে পারবে।**

Should I create the **Claude Code prompt** now? 🚀



# 📋 **FULL MASTER IMPLEMENTATION PLAN**

Perfect! এখন একটি complete master plan করব যা:
- ✅ Backend response format: `{ success, message, data, statusCode }`
- ✅ Error handling standardized
- ✅ JSON Server → Real Backend seamless switch
- ✅ All pages, all workflows, all code structure
- ✅ Claude Code দেওয়ার জন্য ready

---

## **PART 1: Response Format Standard**

### **Success Response**
```typescript
// Status: 200-201
{
  success: true,
  message: "Operation successful",
  data: {
    id: "emp1",
    name: "John Doe",
    email: "john@example.com",
    // ... only fields needed by frontend
  },
  statusCode: 200
}
```

### **Error Response**
```typescript
// Status: 400, 401, 403, 500, etc.
{
  success: false,
  message: "Invalid credentials",
  data: null,
  statusCode: 401
}

// Validation Error
{
  success: false,
  message: "Validation failed",
  data: {
    errors: {
      email: "Email already exists",
      name: "Name is required"
    }
  },
  statusCode: 400
}
```

---

## **PART 2: Zod Schema Layer (Response Validation)**

```typescript
// src/types/api.types.ts

import { z } from 'zod';

// Generic API Response wrapper
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema.nullable(),
    statusCode: z.number(),
  });

// Example usage:
export const userDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'employee']),
  avatar: z.string().optional(),
  createdAt: z.string(),
});

export const userResponseSchema = apiResponseSchema(userDataSchema);
export type UserResponse = z.infer<typeof userResponseSchema>;

// For list responses
export const usersListSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    items: z.array(userDataSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }).nullable(),
  statusCode: z.number(),
});

export type UsersListResponse = z.infer<typeof usersListSchema>;

// For error responses with validation
export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  data: z.object({
    errors: z.record(z.string()).optional(),
  }).nullable(),
  statusCode: z.number(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
```

---

## **PART 3: Updated Axios Interceptor**

```typescript
// src/lib/axios.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Attach token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle backend response format
api.interceptors.response.use(
  (response) => {
    const { data } = response;
    
    // Backend always returns { success, message, data, statusCode }
    if (data.success === false) {
      // Error case but HTTP 200 (shouldn't happen, but handle it)
      return Promise.reject(
        new ApiError(
          data.message || 'Operation failed',
          data.statusCode || 400,
          data.data
        )
      );
    }
    
    // Success case
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle 401 - token expired or invalid
      if (status === 401) {
        handleUnauthorized();
        return Promise.reject(
          new ApiError(
            'Please login again',
            401,
            null
          )
        );
      }
      
      // Backend error response
      const message = data?.message || 'An error occurred';
      const statusCode = data?.statusCode || status;
      
      return Promise.reject(
        new ApiError(message, statusCode, data?.data)
      );
    }
    
    if (error.request) {
      return Promise.reject(
        new ApiError('Network error - no response', 0, null)
      );
    }
    
    return Promise.reject(
      new ApiError('Request failed', 0, null)
    );
  }
);

function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.accessToken || null;
    }
  } catch {
    // Silent fail
  }
  return null;
}

function handleUnauthorized(): void {
  localStorage.removeItem('auth-storage');
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });
  
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export default api;
```

---

## **PART 4: Updated API Client with Schema Validation**

```typescript
// src/lib/api-client.ts

import api from './axios';
import type { ZodType } from 'zod';
import { ApiError } from './axios';

interface ApiRequestConfig<T> {
  schema?: ZodType<T>;
}

/**
 * Execute API request with optional Zod response validation
 * Always expects backend format: { success, message, data, statusCode }
 */
async function request<T>(
  method: string,
  url: string,
  data?: unknown,
  config?: ApiRequestConfig<T>
): Promise<T> {
  try {
    const response = await api.request({
      method,
      url,
      data,
    });

    // Response is { success: true, message, data, statusCode }
    const responseData = response.data.data; // Extract actual data

    // Validate with Zod if schema provided
    if (config?.schema) {
      return config.schema.parse(responseData);
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Unknown error', 500, error);
  }
}

export const apiClient = {
  get: <T>(url: string, config?: ApiRequestConfig<T>) =>
    request<T>('GET', url, undefined, config),

  post: <T>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig<T>
  ) => request<T>('POST', url, data, config),

  put: <T>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig<T>
  ) => request<T>('PUT', url, data, config),

  patch: <T>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig<T>
  ) => request<T>('PATCH', url, data, config),

  delete: <T>(url: string, config?: ApiRequestConfig<T>) =>
    request<T>('DELETE', url, undefined, config),
};
```

---

## **PART 5: Service Layer (Example: Employee Service)**

```typescript
// src/features/employees/api/employee.service.ts

import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

// Schemas matching backend response
const employeeDataSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  email: z.string().email(),
  department: z.string(),
  designation: z.string(),
  employmentType: z.enum(['Full-time', 'Part-time', 'Remote', 'Hybrid', 'Intern']),
  status: z.enum(['Active', 'Leave', 'Suspension', 'Sacked', 'Resigned', 'Retired']),
  salary: z.number(),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
  createdAt: z.string(),
});

export type EmployeeData = z.infer<typeof employeeDataSchema>;

const employeeListSchema = z.object({
  items: z.array(employeeDataSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

type EmployeeListData = z.infer<typeof employeeListSchema>;

// Create Employee Input Schema
const createEmployeeSchema = z.object({
  userId: z.string(),
  department: z.string(),
  designation: z.string(),
  employmentType: z.enum(['Full-time', 'Part-time', 'Remote', 'Hybrid', 'Intern']),
  salary: z.number().positive(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

// Service
export const employeeService = {
  // GET /employees?page=1&limit=10&search=name&department=dept&status=Active
  getAll: async (filters?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
  }): Promise<EmployeeListData> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.status) params.append('status', filters.status);

    return apiClient.get<EmployeeListData>(
      `/employees?${params.toString()}`,
      { schema: employeeListSchema }
    );
  },

  // GET /employees/:id
  getById: async (id: string): Promise<EmployeeData> => {
    return apiClient.get<EmployeeData>(
      `/employees/${id}`,
      { schema: employeeDataSchema }
    );
  },

  // POST /employees
  create: async (data: CreateEmployeeInput): Promise<EmployeeData> => {
    return apiClient.post<EmployeeData>(
      '/employees',
      data,
      { schema: employeeDataSchema }
    );
  },

  // PUT /employees/:id
  update: async (id: string, data: Partial<CreateEmployeeInput>): Promise<EmployeeData> => {
    return apiClient.put<EmployeeData>(
      `/employees/${id}`,
      data,
      { schema: employeeDataSchema }
    );
  },

  // DELETE /employees/:id
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(
      `/employees/${id}`,
      { schema: z.object({ message: z.string() }) }
    );
  },
};
```

---

## **PART 6: Protected Routes Middleware**

```typescript
// src/lib/protected-route.tsx

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'employee';
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  // Wait for hydration from localStorage
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

---

## **PART 7: Updated Router**

```typescript
// src/lib/router.tsx

import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { AppLayout } from '@/components/layouts/app-layout';

import { LoginPage } from '@/pages/login.page';
import { RegisterPage } from '@/pages/register.page';
import { OverviewPage } from '@/pages/overview.page';
import { DashboardPage } from '@/pages/dashboard.page';
import { PlansPage } from '@/pages/plans.page';
import { ManagePlansPage } from '@/pages/manage-plans.page';
import { PlanDetailsPage } from '@/pages/plan-details.page';
import { CategoriesPage } from '@/pages/categories.page';
import { ApprovalsPage } from '@/pages/approvals.page';
import { ReportsPage } from '@/pages/reports.page';
import { SettingsPage } from '@/pages/settings.page';
import { ProfilePage } from '@/pages/profile.page';
import { NotFoundPage } from '@/pages/not-found.page';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'employees', element: <DashboardPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'plan/create', element: <PlansPage /> },
      { path: 'plans/manage', element: <ManagePlansPage /> },
      { path: 'plans/:id', element: <PlanDetailsPage /> },
      { path: 'approvals', element: <ApprovalsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
```

---

## **PART 8: Complete Page Structure**

### **Login Page** (`/login`)
```typescript
// src/pages/login.page.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/features/auth/api/auth.service';
import { useAuthStore } from '@/stores/auth.store';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      // response.user, response.accessToken, response.refreshToken
      login(response.user, response.accessToken, response.refreshToken);
      toast.success('Login successful');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Login</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder="admin@example.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              {...register('password')}
              type="password"
              placeholder="••••••"
              disabled={isLoading}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>

        {/* Debug: Demo credentials */}
        <div className="mt-6 p-3 bg-blue-50 rounded text-sm text-gray-700">
          <p className="font-semibold mb-1">Demo Credentials:</p>
          <p>📧 Email: admin@example.com</p>
          <p>🔑 Password: Admin@123</p>
        </div>
      </div>
    </div>
  );
}
```

---

## **PART 9: Complete Implementation Checklist**

```
📦 SETUP
☐ DB Schema confirmed with backend team
☐ Backend API response format: { success, message, data, statusCode }
☐ Zod schemas created for all data types
☐ API client updated to handle response format
☐ Services layer created (employee, plan, category, auth, etc.)

🎨 DESIGN
☐ Color palette applied consistently
☐ Header with user popup (name, email, role, settings, logout)
☐ Sidebar with glassmorphism effect
☐ Loading skeletons for all data fetches
☐ Error toast notifications
☐ Success confirmations

📄 PAGES (Order of Implementation)
☐ 1. Login Page (redesigned + auth flow)
☐ 2. Profile Page (user info + availability)
☐ 3. Overview Page (KPI dashboard, dynamic data)
☐ 4. Employees Page (full CRUD + filters)
☐ 5. Categories Page (full CRUD + filters)
☐ 6. Plan Create Page (multi-step form)
☐ 7. Manage Plans Page (list + filters + status change)
☐ 8. Plan Details Page (view + edit + submit)
☐ 9. Reports Page (data aggregation + filters + export)
☐ 10. Approvals Page (workflow + actions)
☐ 11. Settings Page (user preferences)

🔐 AUTHENTICATION
☐ Login page functional (API call to /auth/login)
☐ Protected routes middleware
☐ Logout functionality
☐ Token persistence in localStorage
☐ Auto-redirect on 401 Unauthorized
☐ Auto-logout on token expiry

🔄 CRUD OPERATIONS
☐ Employees: Create, Read (list + single), Update, Delete
☐ Categories: Create, Read, Update, Delete
☐ Plans: Create (draft), Submit, Read, Update, Delete
☐ Approvals: Read, Approve, Reject
☐ Profile: Read, Update

🎯 DATA FETCHING
☐ All data fetched from API (not hardcoded)
☐ Query parameters for filters (?search=&page=&limit=&status=)
☐ Loading states while fetching
☐ Error handling with toast notifications
☐ Re-fetch on success

📱 RESPONSIVE DESIGN
☐ Mobile-first approach
☐ Sidebar collapse on mobile
☐ Table becomes cards on mobile
☐ Touch-friendly buttons and inputs

🧪 TESTING READY
☐ All services have clear interfaces
☐ Error boundaries where needed
☐ Form validation with clear messages
☐ API error responses handled properly

🚀 DEPLOYMENT READY
☐ .env file for API base URL
☐ Easy switch from JSON Server to real backend (just change URL)
☐ Response schema validation (catches format mismatches)
☐ Production-ready error handling
```

---

## **PART 10: File Structure (Complete)**

```
adler-frontend/
├── src/
│   ├── components/
│   │   ├── ui/                          # 46x shadcn/ui components
│   │   ├── layouts/
│   │   │   ├── app-layout.tsx           # Main layout with sidebar
│   │   │   └── auth-layout.tsx          # Login/Register layout
│   │   ├── AppSidebar.tsx               # Sidebar navigation
│   │   ├── AppHeader.tsx                # Header with user popup
│   │   └── UserPopover.tsx              # User menu popup
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   └── auth.service.ts      # Login, register, logout
│   │   │   ├── hooks/
│   │   │   │   ├── use-auth.ts
│   │   │   │   └── use-mobile.tsx
│   │   │   └── schemas/
│   │   │       └── auth.schema.ts       # Zod validation
│   │   │
│   │   ├── employees/
│   │   │   ├── api/
│   │   │   │   └── employee.service.ts  # CRUD endpoints
│   │   │   └── components/
│   │   │       ├── EmployeeModal.tsx    # Add/Edit modal
│   │   │       └── EmployeeTable.tsx    # List table
│   │   │
│   │   ├── categories/
│   │   │   ├── api/
│   │   │   │   └── category.service.ts
│   │   │   └── components/
│   │   │       ├── CategoryModal.tsx
│   │   │       └── CategoryTable.tsx
│   │   │
│   │   ├── plans/
│   │   │   ├── api/
│   │   │   │   └── plan.service.ts      # Plan CRUD + status changes
│   │   │   ├── components/
│   │   │   │   ├── PlanForm.tsx         # Multi-step form
│   │   │   │   ├── PlanGrid.tsx         # Weekly grid view
│   │   │   │   ├── PlanList.tsx         # Plan list
│   │   │   │   └── ViolationAlert.tsx   # Constraint violations
│   │   │   └── hooks/
│   │   │       └── use-plan-constraints.ts
│   │   │
│   │   ├── reports/
│   │   │   ├── api/
│   │   │   │   └── report.service.ts    # Aggregation logic
│   │   │   └── components/
│   │   │       ├── ReportChart.tsx
│   │   │       └── ReportTable.tsx
│   │   │
│   │   ├── approvals/
│   │   │   ├── api/
│   │   │   │   └── approval.service.ts
│   │   │   └── components/
│   │   │       └── ApprovalCard.tsx
│   │   │
│   │   └── profile/
│   │       ├── api/
│   │       │   └── profile.service.ts
│   │       └── components/
│   │           ├── PersonalInfo.tsx
│   │           ├── AvailabilitySlots.tsx
│   │           └── Settings.tsx
│   │
│   ├── pages/
│   │   ├── login.page.tsx
│   │   ├── register.page.tsx
│   │   ├── overview.page.tsx
│   │   ├── dashboard.page.tsx            # Employees page
│   │   ├── categories.page.tsx
│   │   ├── plans.page.tsx                # Plan create
│   │   ├── manage-plans.page.tsx         # Plan list + manage
│   │   ├── plan-details.page.tsx         # Single plan view
│   │   ├── reports.page.tsx
│   │   ├── approvals.page.tsx
│   │   ├── profile.page.tsx
│   │   ├── settings.page.tsx
│   │   └── not-found.page.tsx
│   │
│   ├── stores/
│   │   ├── auth.store.ts                 # User + tokens
│   │   ├── employee.store.ts             # (optional) cache
│   │   ├── plan.store.ts                 # (optional) cache
│   │   └── ui.store.ts                   # (optional) modal state
│   │
│   ├── types/
│   │   ├── api.types.ts                  # Response schemas
│   │   ├── employee.types.ts
│   │   ├── plan.types.ts
│   │   ├── category.types.ts
│   │   ├── user.types.ts
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── api-client.ts                 # HTTP wrapper
│   │   ├── axios.ts                      # Axios + interceptors
│   │   ├── router.tsx                    # React Router config
│   │   ├── query-client.ts               # TanStack Query setup
│   │   ├── protected-route.tsx           # Auth middleware
│   │   ├── utils.ts                      # Helper functions
│   │   └── mock-data.ts                  # (for JSON Server seeding)
│   │
│   ├── hooks/
│   │   ├── use-employees.ts              # TanStack Query hooks
│   │   ├── use-plans.ts
│   │   ├── use-categories.ts
│   │   └── use-api-error.ts              # Error handler hook
│   │
│   ├── utils/
│   │   ├── format.ts                     # Date, number formatting
│   │   ├── validation.ts                 # Validators
│   │   └── constants.ts                  # Enums, constants
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── .env.example
├── .env.local                            # Add VITE_API_BASE_URL
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .oxlintrc.json
├── components.json
└── README.md
```

---

## **PART 11: Service Examples**

### **Auth Service**
```typescript
// src/features/auth/api/auth.service.ts

import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(['admin', 'employee']),
    avatar: z.string().optional(),
    createdAt: z.string(),
  }),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});

type AuthResponse = z.infer<typeof authResponseSchema>;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginInput = z.infer<typeof loginSchema>;

export const authService = {
  login: async (credentials: LoginInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(
      '/auth/login',
      credentials,
      { schema: authResponseSchema }
    );
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(
      '/auth/register',
      data,
      { schema: authResponseSchema }
    );
  },

  me: async (): Promise<AuthResponse['user']> => {
    return apiClient.get<AuthResponse['user']>(
      '/auth/me',
      {
        schema: authResponseSchema.shape.user,
      }
    );
  },

  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },
};
```

### **Plan Service**
```typescript
// src/features/plans/api/plan.service.ts

import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

const planDataSchema = z.object({
  id: z.string(),
  weekNumber: z.number(),
  month: z.string(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']),
  assignments: z.array(z.object({
    employeeId: z.string(),
    categoryId: z.string(),
    shifts: z.array(z.object({
      day: z.string(),
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      hours: z.number(),
    })),
    totalHours: z.number(),
  })),
  violations: z.array(z.any()).optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  submittedAt: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
});

type PlanData = z.infer<typeof planDataSchema>;

export const planService = {
  // GET /plans?page=1&limit=10&status=draft&month=2024-01
  getAll: async (filters?: {
    page?: number;
    limit?: number;
    status?: string;
    month?: string;
    search?: string;
  }): Promise<{
    items: PlanData[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.month) params.append('month', filters.month);
    if (filters?.search) params.append('search', filters.search);

    return apiClient.get(
      `/plans?${params.toString()}`,
      {
        schema: z.object({
          items: z.array(planDataSchema),
          total: z.number(),
          page: z.number(),
          limit: z.number(),
        }),
      }
    );
  },

  // GET /plans/:id
  getById: async (id: string): Promise<PlanData> => {
    return apiClient.get<PlanData>(
      `/plans/${id}`,
      { schema: planDataSchema }
    );
  },

  // POST /plans (save as draft)
  create: async (data: Partial<PlanData>): Promise<PlanData> => {
    return apiClient.post<PlanData>(
      '/plans',
      data,
      { schema: planDataSchema }
    );
  },

  // PUT /plans/:id (update draft)
  update: async (id: string, data: Partial<PlanData>): Promise<PlanData> => {
    return apiClient.put<PlanData>(
      `/plans/${id}`,
      data,
      { schema: planDataSchema }
    );
  },

  // PUT /plans/:id/status?action=submit
  changeStatus: async (id: string, action: 'submit' | 'approve' | 'reject'): Promise<PlanData> => {
    return apiClient.put<PlanData>(
      `/plans/${id}/status?action=${action}`,
      {},
      { schema: planDataSchema }
    );
  },

  // DELETE /plans/:id
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(
      `/plans/${id}`,
      { schema: z.object({ message: z.string() }) }
    );
  },
};
```

---

## **PART 12: JSON Server for Testing**

```bash
# Install
npm install -g json-server

# Create db.json with your schemas

# Run
json-server --watch db.json --port 3001

# Your API will be:
GET    http://localhost:3001/employees
POST   http://localhost:3001/employees
PUT    http://localhost:3001/employees/1
DELETE http://localhost:3001/employees/1
```

**Backend URL setup** (`.env.local`):
```
VITE_API_BASE_URL=http://localhost:3001
```

**When backend is ready**, just change to:
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## **PART 13: Migration Steps (JSON Server → Real Backend)**

**Step 1:** Confirm backend response format matches
```typescript
// Backend must return:
{
  success: true/false,
  message: "...",
  data: { ... } or null,
  statusCode: 200/400/500
}
```

**Step 2:** Update `.env`
```
VITE_API_BASE_URL=https://your-api.com
```

**Step 3:** If response schema different, update Zod schemas
```typescript
// Example: If backend returns user object differently
const userSchema = z.object({
  // Update fields here
});
```

**Step 4:** No other code changes needed! ✅

---

## **Summary**

```
✅ Backend Response Format: { success, message, data, statusCode }
✅ Frontend handles all errors gracefully
✅ Services layer abstracts API calls
✅ Zod validates all responses
✅ Interceptors handle 401, retries, token refresh
✅ Protected routes prevent unauthorized access
✅ Easy migration: Just change .env URL
✅ All 11 pages fully structured
✅ Full CRUD on all resources
✅ Loading states + error handling everywhere
✅ Production-ready code
```

---

**এখন আপনার DB Schema শেয়ার করুন, আমি Claude Code এর জন্য final comprehensive prompt তৈরি করব। ✅**