# 📋 ADLER FRONTEND — COMPLETE IMPLEMENTATION GUIDE

> **Project:** Adler Frontend (Staff Planning / HR Management SaaS)
> **Last Updated:** July 4, 2026
> **Status:** Alpha scaffold — UI library complete, pages partially implemented with mock data
> **Purpose:** This document fully describes every feature, page, data structure, API contract, and implementation step so that any AI agent can understand and continue building this project.

---

## Table of Contents
read 
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Routing](#4-routing)
5. [State Management](#5-state-management)
6. [API Layer](#6-api-layer)
7. [Design System](#7-design-system)
8. [Pages — Detailed Breakdown](#8-pages--detailed-breakdown)
9. [JSON Server Database Schema](#9-json-server-database-schema)
10. [API Service Layer](#10-api-service-layer)
11. [Implementation Checklist](#11-implementation-checklist)
12. [Migration Path (Mock → Real Backend)](#12-migration-path-mock--real-backend)

---

## 1. Project Overview

**Adler** is a front-end application for managing restaurant/hospitality staff scheduling. Admins can:

- Manage employees (CRUD)
- Define work categories (Service, Kitchen, Bar, Office, etc.)
- Create weekly/monthly shift plans for employees
- Review and approve shift swap requests between employees
- View reports on hours worked, overtime, and wage costs
- Manage L-GAV (labor law) rule constraints

**Application Name (in sidebar):** BOMACH OS — Staff planning

---

## 2. Tech Stack & Dependencies

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2.7 |
| Language | TypeScript | 6.0.2 |
| Build Tool | Vite | 8.1.1 |
| Styling | Tailwind CSS | 4.3.2 |
| UI Components | shadcn/ui (46 components) | — |
| State (Client) | Zustand | 5.0.14 |
| State (Server) | TanStack React Query | 5.101.2 |
| HTTP Client | Axios | 1.18.1 |
| Validation | Zod | 4.4.3 |
| Forms | React Hook Form + Zod Resolver | 7.80.0 |
| Routing | React Router DOM | 7.18.1 |
| Toasts | Sonner | 2.0.7 |
| Charts | Recharts | 3.9.1 |
| Icons | Lucide React | 1.23.0 |
| Dark Mode | Next Themes | 0.4.6 |
| Linter | Oxlint | 1.71.0 |

### Key Dev Commands

```bash
npm run dev       # Vite dev server (port 5173)
npm run build     # TypeScript check + Vite build
npm run lint      # Oxlint
npm run preview   # Preview production build
```

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3001   # JSON Server (dev)
# VITE_API_BASE_URL=https://api.adler.ch  # Production
```

---

## 3. Project Structure

```
adler-frontend/
├── src/
│   ├── components/
│   │   ├── ui/                          # 46 shadcn/ui primitives
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── tooltip.tsx
│   │   ├── layouts/
│   │   │   └── app-layout.tsx           # Main layout: sidebar + header + outlet
│   │   └── AppSidebar.tsx               # Left nav sidebar
│   │
│   ├── features/
│   │   └── auth/
│   │       ├── api/
│   │       │   ├── auth.service.ts      # Login, register, me, logout
│   │       │   └── plan.services.ts     # STUB — needs rewrite
│   │       ├── hooks/
│   │       │   ├── use-auth.ts          # useLogin, useRegister, useLogout, useCurrentUser
│   │       │   └── use-mobile.tsx       # Responsive breakpoint hook
│   │       └── schemas/
│   │           └── auth.schema.ts       # Zod: loginSchema, registerSchema, userSchema, authResponseSchema
│   │
│   ├── pages/
│   │   ├── overview.page.tsx            # ✅ Implemented — KPIs, weekly status, swaps, missing submissions
│   │   ├── dashboard.page.tsx           # ⚠️ Partial — imports mock data, returns bare string
│   │   ├── plans.page.tsx               # ✅ Implemented — full weekly grid + month view + violations
│   │   ├── categories.page.tsx          # ✅ Implemented — CRUD categories + sub-categories (local state)
│   │   ├── approvals.page.tsx           # ✅ Implemented — swap request approval workflow
│   │   ├── reports.page.tsx             # ✅ Implemented — monthly report table + filters + totals
│   │   ├── settings.page.tsx            # ✅ Implemented — profile, L-GAV rules, notifications
│   │   ├── login.page.tsx               # ✅ Implemented — full form with validation + useLogin hook
│   │   ├── register.page.tsx            # ✅ Implemented — full form with validation + useRegister hook
│   │   └── not-found.page.tsx           # ✅ Implemented — 404 page
│   │
│   ├── stores/
│   │   ├── auth.store.ts                # ✅ Implemented — user + tokens + persistence
│   │   ├── employes.store.ts            # ❌ EMPTY — needs implementation
│   │   └── plan.store.ts               # ❌ EMPTY — needs implementation
│   │
│   ├── types/
│   │   └── index.ts                     # ApiResponse<T>, PaginatedResponse<T>, SelectOption
│   │
│   ├── lib/
│   │   ├── api-client.ts                # ✅ Type-safe HTTP client with Zod validation
│   │   ├── axios.ts                     # ✅ Axios instance + interceptors + ApiError class
│   │   ├── mock-data.ts                 # ✅ Mock employees, categories, weeks, swap requests, reports
│   │   ├── query-client.ts             # ✅ TanStack Query config + error handling
│   │   ├── router.tsx                   # ✅ React Router config (NO protected routes yet)
│   │   └── utils.ts                     # cn() helper (clsx + tailwind-merge)
│   │
│   ├── App.tsx                          # Root: QueryClientProvider → RouterProvider → Toaster
│   ├── main.tsx                         # createRoot entry point
│   ├── App.css                          # (likely empty/unused)
│   └── index.css                        # Tailwind base styles
│
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── .oxlintrc.json
├── components.json                      # shadcn/ui config
├── my-plan.md                           # Original requirements (Bengali/English)
├── adler-analysis.md                    # Codebase analysis document
└── implementation.md                    # THIS FILE
```

---

## 4. Routing

### Current Routes (`src/lib/router.tsx`)

```
/                           → AppLayout → OverviewPage (index route)
/plans                      → AppLayout → PlansPage
/employees                  → AppLayout → DashboardPage
/categories                 → AppLayout → CategoriesPage
/approvals                  → AppLayout → ApprovalsPage
/reports                    → AppLayout → ReportsPage
/settings                   → AppLayout → SettingsPage

/login                      → LoginPage (public, no layout)
/register                   → RegisterPage (public, no layout)
*                           → NotFoundPage
```

### Routes TO ADD

```
/profile                    → AppLayout → ProfilePage (NEW)
/plan/create                → AppLayout → PlanCreatePage (NEW — multi-step form)
/plans/manage               → AppLayout → ManagePlansPage (NEW — list/filter view)
/plans/:id                  → AppLayout → PlanDetailsPage (NEW — single plan view)
```

### Protected Routes

**Currently:** No auth guard — all pages are accessible without login.

**To Implement:** Wrap `AppLayout` route with a `<ProtectedRoute>` component:
- Check `isAuthenticated` from auth store
- Wait for `isHydrated` (localStorage rehydration)
- Redirect to `/login` if not authenticated
- Optionally check `requiredRole` (admin vs employee)

---

## 5. State Management

### Auth Store (`src/stores/auth.store.ts`)

```typescript
interface AuthState {
  user: User | null;          // { id, name, email, avatar?, role, createdAt }
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;        // true after localStorage rehydration
}

interface AuthActions {
  login(user, accessToken, refreshToken?) => void;
  logout() => void;
  setUser(user) => void;
  setTokens(accessToken, refreshToken?) => void;
  setHydrated() => void;
}
```

- **Persistence:** `localStorage` (key: `auth-storage`)
- **Current State:** Hardcoded mock admin user (Jhon Doe, role: admin) with fake JWT tokens
- **Hydration:** `onRehydrateStorage` calls `setHydrated()`

### Employee Store (`src/stores/employes.store.ts`) — EMPTY

Needs: employee list cache, selected employee, CRUD optimistic updates.

### Plan Store (`src/stores/plan.store.ts`) — EMPTY

Needs: current plan state, grid data, week/month selection, violation tracking.

### TanStack Query

- Configured in `src/lib/query-client.ts`
- Stale time: 5 min, GC time: 10 min
- No retry for 4xx errors
- Refetch on reconnect: yes, on window focus: no
- Global mutation error handler: shows toast via Sonner

### Data Flow Pattern

```
Component → useQuery/useMutation → Service Function → apiClient → axios → Backend
                  ↓
         Zustand Store (for auth tokens, UI state)
```

---

## 6. API Layer

### Axios Instance (`src/lib/axios.ts`)

- **Base URL:** `VITE_API_BASE_URL` (default: `http://localhost:3000/api`)
- **Timeout:** 15 seconds
- **Request Interceptor:** Reads token from `localStorage('auth-storage')` → sets `Authorization: Bearer <token>`
- **Response Interceptor:**
  - 401 → Clears auth, redirects to `/login`
  - Other errors → Wraps in `ApiError` class

### ApiError Class

```typescript
class ApiError extends Error {
  status: number;      // HTTP status code (0 for network errors)
  statusText: string;
  data: unknown;       // Response body
}
```

### API Client (`src/lib/api-client.ts`)

```typescript
apiClient = {
  get<T>(url, { schema? }),       // GET with optional Zod validation
  post<T>(url, data, { schema? }), // POST
  put<T>(url, data, { schema? }),  // PUT
  patch<T>(url, data, { schema? }),// PATCH
  delete<T>(url, { schema? })      // DELETE
}
```

- If `schema` is provided, response is Zod-parsed at runtime
- Generic `<T>` return type inferred from schema

### Backend Response Format

The target backend (and JSON Server) should return:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "statusCode": 200
}
```

**Note:** The current `apiClient` does NOT unwrap the `{ success, message, data, statusCode }` envelope — it returns `response.data` directly. When switching to a backend with this envelope, the apiClient needs to be updated to extract `response.data.data`.

### Auth Service (`src/features/auth/api/auth.service.ts`)

```typescript
authService = {
  login(credentials: LoginInput)     → POST /auth/login     → AuthResponse
  register(data: RegisterInput)      → POST /auth/register  → AuthResponse
  me()                               → GET  /auth/me        → UserResponse
  logout()                           → POST /auth/logout    → void
}
```

### Plan Services (`src/features/auth/api/plan.services.ts`) — STUB

Currently contains placeholder code that reuses auth schemas. **Needs complete rewrite** into a proper plan service.

### Auth Schemas (`src/features/auth/schemas/auth.schema.ts`)

```typescript
loginSchema = { email: string (email), password: string (min 6) }
registerSchema = { name: string (2-50), email: string, password: string (min 8, uppercase+lowercase+number), confirmPassword: string (must match) }
userSchema = { id: string, name: string, email: string, avatar?: string, role: string, createdAt: string }
authResponseSchema = { user: userSchema, accessToken: string, refreshToken?: string }
```

### Auth Hooks (`src/features/auth/hooks/use-auth.ts`)

```typescript
useLogin()       → useMutation → authService.login → stores user+tokens → navigates to /dashboard
useRegister()    → useMutation → authService.register → stores user+tokens → navigates to /dashboard
useLogout()      → useMutation → authService.logout → clears store → navigates to /login
useCurrentUser() → useQuery → authService.me → sets user in store (10min stale time)
```

**Bug:** `useLogin` and `useRegister` navigate to `/dashboard` but the route is `/employees`. Should be fixed.

---

## 7. Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | shadcn `primary` | Buttons, active states, accents |
| Background | `slate-50` | Page background |
| Surface | `white` | Cards, modals |
| Border | `slate-200` | Default borders |
| Text Primary | `slate-900` | Headings, bold text |
| Text Secondary | `slate-500` | Descriptions, labels |
| Success | `emerald-500` / `emerald-50` | Active status, approvals |
| Warning | `amber-500` / `amber-50` | Overtime, pending, suspensions |
| Danger | `rose-600` / `rose-50` | Violations, rejections, errors |
| Info | `sky-500` / `sky-50` | Information badges |

### Status Badge Colors

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Active | `emerald-50` | `emerald-600` | `emerald-200` |
| Leave | `blue-50` | `blue-600` | `blue-200` |
| Suspension | `amber-50` | `amber-600` | `amber-200` |
| Sacked/Resigned | `red-50` | `red-600` | `red-200` |
| Retired | `slate-50` | `slate-600` | `slate-200` |

### Employee Type Badge Colors

| Type | Colors |
|------|--------|
| Full-time | `purple-50/600/200` |
| Intern | `amber-50/600/200` |
| Part time | `sky-50/600/200` |
| Remote | `teal-50/600/200` |
| Hybrid | `fuchsia-50/600/200` |

### Component Patterns

- **Cards:** `rounded-2xl border-slate-200 shadow-sm bg-white`
- **Card Headers:** `bg-slate-50/50 border-b border-slate-100 pb-4`
- **Buttons:** `rounded-xl font-semibold` with `shadow-md shadow-primary/20` for primary
- **Inputs:** `rounded-xl border-slate-200 h-11 focus-visible:ring-primary/20 bg-slate-50 font-medium`
- **Tables:** Sticky first column, `border-separate border-spacing-0`
- **Page Layout:** `p-4 md:p-8 space-y-6 max-w-[1600px]` or `max-w-[900px]` for settings

### Typography

- Page title: `text-3xl md:text-4xl font-bold tracking-tight text-slate-900`
- Page subtitle: `text-xs uppercase tracking-widest text-slate-500 font-semibold`
- Section title: `text-lg font-bold text-slate-900`

---

## 8. Pages — Detailed Breakdown

### 8.1 Overview Page (`/`) — ✅ IMPLEMENTED

**File:** `src/pages/overview.page.tsx`

**Data Source:** Mock data (hardcoded imports)

**Features:**
- KPI cards: Availability submitted (with progress bar), Active employees, Pending swaps, Rule violations
- Weekly plan status grid (4 cards: Week 1-4 with status badges)
- Missing submissions list with "Nudge" button (toast)
- Pending shift swap preview (2 items) with rule check badges
- Monthly insights sidebar (Scheduled hours, Overtime, Wage cost, Rejected shifts)
- Quick action buttons: "Open weekly plan", "Review swaps"

**To Improve:**
- Wire to API: `GET /employees`, `GET /plans?month=current`, `GET /approvals?status=pending`
- Add loading skeletons while fetching
- Make dynamic (currently all mock data)

---

### 8.2 Dashboard/Employees Page (`/employees`) — ⚠️ PARTIAL

**File:** `src/pages/dashboard.page.tsx`

**Current State:** Imports mock data and hooks, defines helper functions, but the `return` statement only renders a bare string `dashboard main content`. **The actual UI is NOT rendered.**

**Planned Features:**
- Employee table with search + department filter
- Status badges (Active, Retired, Suspension, Sacked, Resigned, Leave)
- Type badges (Full-time, Intern, Part time, Remote, Hybrid)
- Add Employee modal (dialog with form fields)
- Edit Employee modal
- Delete with confirmation
- Dropdown menu per row (Edit, Suspend, Delete)
- Toggle status functionality (currently in `toggleStatus` function)

**Modal Fields:**
- Name, Email, Department, Designation, Employment Type, Status, Salary

**To Implement:**
- Build the full table UI with `<Table>` component
- Add search input and department filter
- Build Add/Edit/Delete dialogs
- Wire to API: `GET /employees`, `POST /employees`, `PUT /employees/:id`, `DELETE /employees/:id`
- Add loading skeletons
- Move mock data logic to API calls

---

### 8.3 Plans Page (`/plans`) — ✅ IMPLEMENTED

**File:** `src/pages/plans.page.tsx`

**Features:**
- Month selector (dropdown)
- Week selector (dropdown with date ranges)
- Two tabs: "Week grid" and "Full month"
- **Week Grid:**
  - Employee × 7-day table
  - Per-cell: category select + start/end time inputs
  - Availability indicator (Available/Wish/Unavailable with colors)
  - Violation detection: warns if employee exceeds 50h/week
  - "Save draft" button (toast only)
  - "Submit week" button (blocks if violations exist)
- **Full Month:**
  - Calendar grid showing all 30 days
  - Color-coded by status (Published/Submitted/Draft)
  - Shift count per day

**Data Source:** Mock employees, categories, weeks, `getAvailability()` function

**To Improve:**
- Wire to API for employee/category data
- Save draft should persist to backend
- Submit should call `POST /plans` or `PUT /plans/:id`
- Add loading states
- Connect violation detection to real L-GAV rules

---

### 8.4 Categories Page (`/categories`) — ✅ IMPLEMENTED

**File:** `src/pages/categories.page.tsx`

**Features:**
- Grid of category cards (2 columns)
- Each card: icon, name, staff count, sub-categories
- Add new category (input + button)
- Add/remove sub-categories per category (input + badge with X)
- Auto-generated icons based on category ID

**Categories (from mock data):**
1. Service — Runner, Chef de Rang, Commis
2. Kitchen — Grill, Entremetier, Garde Manger
3. Bar — Cocktails, Service Bar
4. Office — Admin, Reception
5. Commande — (no sub-categories)
6. Dishwashing — (no sub-categories)

**To Improve:**
- Wire to API: `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
- Add edit/delete functionality for categories
- Add description and default pay rate fields
- Loading skeletons

---

### 8.5 Approvals Page (`/approvals`) — ✅ IMPLEMENTED

**File:** `src/pages/approvals.page.tsx`

**Features:**
- Two tabs: "Pending" (with count badge) and "History"
- Each swap request shows:
  - Request timestamp
  - Rule check status (Rules OK / Rule fail)
  - From employee block (name, day, time, category)
  - To employee block (name, day, time, category)
  - Arrow icon between blocks
  - Rule violation note (if applicable)
  - Approve / Reject buttons
- Reject modal with reason textarea
- Cannot approve if rule check fails
- History shows approved/rejected items in read-only mode

**Mock Swap Requests:** 3 items (2 pending, 1 approved)

**To Improve:**
- Wire to API: `GET /approvals?status=pending`, `PUT /approvals/:id?action=approve|reject`
- Add more approval types (not just swaps)
- Add email notification mock
- Loading skeletons

---

### 8.6 Reports Page (`/reports`) — ✅ IMPLEMENTED

**File:** `src/pages/reports.page.tsx`

**Features:**
- Summary cards: Total worked, Overtime, Hours due, Wage cost
- Month selector, Category filter
- "Export CSV" button (mock — shows toast)
- Per-employee table: Name, Contract, Scheduled (with progress bar), Worked, Overtime, Due, Wage
- Auto-calculated totals from filtered data

**Data Source:** `monthlyReport` from mock-data.ts (5 employees with monthly stats)

**To Improve:**
- Wire to API: `GET /reports?employee=&category=&dateFrom=&dateTo=&status=`
- Implement actual CSV export
- Add date range filter
- Add employee name filter
- Add chart visualization (Recharts available)
- Loading skeletons

---

### 8.7 Settings Page (`/settings`) — ✅ IMPLEMENTED

**File:** `src/pages/settings.page.tsx`

**Features:**
- **Profile section:** Name, Email, Current password, New password (inputs)
- **L-GAV Rule Values:** Max daily hours (10), Max weekly hours (50), Min rest between shifts (11h), Break required after (5.5h), Break length (30 min)
- **Notifications:** Email backup, Push notifications, Daily admin digest (toggle switches)
- **Security:** Session timeout (minutes)
- "Save changes" button (toast only)

**To Improve:**
- Wire to API: `GET /settings`, `PUT /settings`
- Actually persist changes
- Form validation
- Loading state

---

### 8.8 Login Page (`/login`) — ✅ IMPLEMENTED

**File:** `src/pages/login.page.tsx`

**Features:**
- Email + Password form
- Zod validation (loginSchema)
- Password visibility toggle
- "Forgot password?" link (not functional)
- Loading spinner on submit
- "Create an account" link to register
- Uses `useLogin()` hook

---

### 8.9 Register Page (`/register`) — ✅ IMPLEMENTED

**File:** `src/pages/register.page.tsx`

**Features:**
- Name + Email + Password + Confirm Password form
- Zod validation (registerSchema — strong password rules)
- Password visibility toggles
- Loading spinner on submit
- "Sign in instead" link to login
- Uses `useRegister()` hook

---

### 8.10 Not Found Page (`*`) — ✅ IMPLEMENTED

- Gradient 404 number
- "Go back" button + "Dashboard" link
- Dark background (slate-950)

---

## 9. JSON Server Database Schema

For development, use JSON Server (`json-server --watch db.json --port 3001`).

### Collections & Schemas

#### `users`

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "admin | employee",
  "avatar": "string (URL)",
  "department": "string",
  "designation": "string",
  "employmentType": "Full-time | Part-time | Remote | Hybrid | Intern",
  "status": "Active | Leave | Suspension | Sacked | Resigned | Retired",
  "salary": "number",
  "phone": "string",
  "address": "string",
  "createdAt": "ISO date string"
}
```

**Seed data:** 1 admin + 10-15 employees with realistic restaurant/hospitality data.

#### `categories`

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "defaultRate": "number (CHF/hour)",
  "maxShifts": "number",
  "subCategories": ["string"],
  "createdAt": "ISO date string"
}
```

**Seed data:** Service, Kitchen, Bar, Office, Commande, Dishwashing (with sub-categories from mock data).

#### `availability`

```json
{
  "id": "string",
  "employeeId": "string (FK → users)",
  "slots": [
    {
      "day": "Monday | Tuesday | ... | Sunday",
      "available": "boolean",
      "timeRange": { "start": "HH:MM", "end": "HH:MM" }
    }
  ]
}
```

#### `plans`

```json
{
  "id": "string",
  "weekNumber": "number (1-5)",
  "month": "string (YYYY-MM)",
  "dateRange": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "status": "draft | submitted | approved | rejected",
  "assignments": [
    {
      "employeeId": "string (FK → users)",
      "categoryId": "string (FK → categories)",
      "shifts": [
        {
          "day": "string",
          "date": "YYYY-MM-DD",
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "hours": "number"
        }
      ],
      "totalHours": "number"
    }
  ],
  "violations": ["string"],
  "createdBy": "string (FK → users)",
  "createdAt": "ISO date string",
  "submittedAt": "ISO date string | null",
  "approvedBy": "string | null",
  "approvedAt": "ISO date string | null"
}
```

#### `approvals`

```json
{
  "id": "string",
  "planId": "string (FK → plans)",
  "type": "plan_submit | swap_request",
  "status": "pending | approved | rejected",
  "submittedBy": "string (FK → users)",
  "submittedDate": "ISO date string",
  "reviewedBy": "string | null",
  "reviewDate": "ISO date string | null",
  "comments": "string",
  "swapData": {
    "fromEmployeeId": "string",
    "toEmployeeId": "string",
    "fromShift": { "day": "string", "time": "string", "category": "string" },
    "toShift": { "day": "string", "time": "string", "category": "string" },
    "ruleCheck": "pass | fail",
    "ruleNote": "string | null"
  }
}
```

#### `settings`

```json
{
  "id": "string",
  "maxDailyHours": 10,
  "maxWeeklyHours": 50,
  "minRestHours": 11,
  "breakAfterHours": 5.5,
  "breakMinutes": 30,
  "notifications": {
    "email": true,
    "push": true,
    "digest": false
  },
  "sessionTimeoutMinutes": 30
}
```

---

## 10. API Service Layer

### Endpoint Map

| Resource | Method | Endpoint | Query Params | Description |
|----------|--------|----------|-------------|-------------|
| **Auth** | POST | `/auth/login` | — | Login |
| | POST | `/auth/register` | — | Register |
| | GET | `/auth/me` | — | Current user |
| | POST | `/auth/logout` | — | Logout |
| **Employees** | GET | `/employees` | `?search=&department=&status=&_page=&_limit=` | List employees |
| | GET | `/employees/:id` | — | Get single employee |
| | POST | `/employees` | — | Create employee |
| | PUT | `/employees/:id` | — | Update employee |
| | DELETE | `/employees/:id` | — | Delete employee |
| **Categories** | GET | `/categories` | `?search=` | List categories |
| | POST | `/categories` | — | Create category |
| | PUT | `/categories/:id` | — | Update category |
| | DELETE | `/categories/:id` | — | Delete category |
| **Plans** | GET | `/plans` | `?status=&month=&employee=&_page=&_limit=&_sort=&_order=` | List plans |
| | GET | `/plans/:id` | `?_expand=createdBy` | Get single plan |
| | POST | `/plans` | — | Create plan (draft) |
| | PUT | `/plans/:id` | — | Update plan |
| | PUT | `/plans/:id/status` | `?action=submit\|approve\|reject` | Change plan status |
| | DELETE | `/plans/:id` | — | Delete plan |
| **Approvals** | GET | `/approvals` | `?status=pending` | List approvals |
| | PUT | `/approvals/:id` | `?action=approve\|reject` | Approve/reject |
| **Reports** | GET | `/reports` | `?employee=&category=&dateFrom=&dateTo=&status=` | Report data |
| **Settings** | GET | `/settings` | — | Get settings |
| | PUT | `/settings` | — | Update settings |
| **Availability** | GET | `/availability` | `?employeeId=` | Get availability |
| | PUT | `/availability/:id` | — | Update availability |

### JSON Server Specific

```bash
# Search (partial match)
GET /employees?name_like=john

# Filter
GET /plans?status=draft&month=2024-01

# Pagination
GET /employees?_page=1&_limit=10

# Sort
GET /plans?_sort=createdAt&_order=desc

# Relations (with _expand)
GET /plans?_expand=createdBy

# Count
GET /employees → X-Total-Count header
```

### Service Files TO CREATE

```
src/features/employees/
  api/employee.service.ts
  components/EmployeeModal.tsx
  components/EmployeeTable.tsx

src/features/categories/
  api/category.service.ts
  components/CategoryModal.tsx

src/features/plans/
  api/plan.service.ts
  components/PlanForm.tsx
  components/PlanGrid.tsx
  components/PlanList.tsx
  components/ViolationAlert.tsx
  hooks/use-plan-constraints.ts

src/features/approvals/
  api/approval.service.ts
  components/ApprovalCard.tsx

src/features/reports/
  api/report.service.ts
  components/ReportChart.tsx
  components/ReportTable.tsx

src/features/profile/
  api/profile.service.ts
  components/PersonalInfo.tsx
  components/AvailabilitySlots.tsx
```

---

## 11. Implementation Checklist

### Phase 1: Foundation (HIGH PRIORITY)

```
☐ Fix useLogin/useRegister navigation (currently goes to /dashboard, should be / or /employees)
☐ Create ProtectedRoute component (auth guard)
☐ Update router.tsx to wrap AppLayout with ProtectedRoute
☐ Add ProfilePage route and placeholder
☐ Add PlanCreatePage route
☐ Add ManagePlansPage route
☐ Add PlanDetailsPage route
```

### Phase 2: Employee Management (HIGH PRIORITY)

```
☐ Create src/features/employees/api/employee.service.ts
☐ Build full DashboardPage UI (table, search, filters, modals)
☐ Create EmployeeModal component (Add/Edit)
☐ Add loading skeletons while fetching
☐ Wire to JSON Server API
☐ Implement filter by department, status, name search
☐ Implement Add/Edit/Delete with confirmation dialog
```

### Phase 3: Category Management

```
☐ Create src/features/categories/api/category.service.ts
☐ Add edit/delete functionality to CategoriesPage
☐ Add description and default pay rate fields
☐ Wire to JSON Server API
☐ Add loading skeletons
```

### Phase 4: Plan Management

```
☐ Create src/features/plans/api/plan.service.ts
☐ Create plan store (src/stores/plan.store.ts)
☐ Implement PlanCreatePage (multi-step form)
  - Step 1: Select week & date range
  - Step 2: Employee & manpower selection per day
  - Step 3: Constraint review (violations)
  - Step 4: Submit or Draft
☐ Implement ManagePlansPage (list + filter by status/month/employee)
☐ Implement PlanDetailsPage (grid view + status actions)
☐ Wire to JSON Server API
☐ Add loading skeletons
```

### Phase 5: Reports & Analytics

```
☐ Create src/features/reports/api/report.service.ts
☐ Add date range filter to ReportsPage
☐ Add employee name filter
☐ Implement actual CSV export
☐ Add Recharts visualizations
☐ Wire to JSON Server API
☐ Add loading skeletons
```

### Phase 6: Approvals Enhancement

```
☐ Create src/features/approvals/api/approval.service.ts
☐ Wire to JSON Server API
☐ Add more approval types beyond swap requests
☐ Add email notification mock (console.log)
☐ Add loading skeletons
```

### Phase 7: Settings & Profile

```
☐ Wire SettingsPage to API (GET/PUT /settings)
☐ Create ProfilePage with:
  - Left panel: photo, name, email, role, edit button
  - Right panel tabs: Personal Info, Availability, Settings
☐ Create src/features/profile/api/profile.service.ts
☐ Implement availability slot management
```

### Phase 8: Polish & Production

```
☐ Add loading skeletons to ALL data-fetching pages
☐ Ensure error handling on all API calls (toast notifications)
☐ Add form validation on all forms (Zod + react-hook-form)
☐ Responsive design audit (mobile sidebar, table → cards)
☐ Add error boundaries
☐ Code splitting / lazy loading for routes
☐ Remove all hardcoded mock data references
☐ Clean up unused imports and variables
☐ TypeScript strict mode — fix all type errors
☐ Run `npm run build` successfully
```

---

## 12. Migration Path (Mock → Real Backend)

When the real backend is ready:

1. **Update `.env`**
   ```env
   VITE_API_BASE_URL=https://api.adler.ch
   ```

2. **Update `apiClient`** to unwrap envelope response
   ```typescript
   // If backend returns { success, message, data, statusCode }
   const responseData = response.data.data; // Extract actual data
   ```

3. **Update Zod schemas** if backend field names differ

4. **Update Axios interceptor** if auth token format changes

5. **No other code changes needed** — services layer abstracts all API calls

---

## Key Bugs / Issues Found

1. **`useLogin` / `useRegister` navigate to `/dashboard`** — but the route path is `/employees` or should be `/` (overview). Needs fix.
2. **`dashboard.page.tsx` returns bare string** — The actual employee table UI is not rendered. All the logic (filter, toggle status, imports) exists but `return` only has `dashboard main content`.
3. **`plan.services.ts`** — Contains placeholder code using auth schemas. Needs complete rewrite.
4. **No ProtectedRoute** — All pages are accessible without authentication.
5. **Auth store initial state** has hardcoded mock user with fake JWT — needs to be empty for production.
6. **Sidebar footer** shows "Martin Keller" hardcoded — should come from auth store.

---

## Quick Reference: File Locations

| What | Path |
|------|------|
| Entry point | `src/main.tsx` |
| Root component | `src/App.tsx` |
| Router | `src/lib/router.tsx` |
| Layout | `src/components/layouts/app-layout.tsx` |
| Sidebar | `src/components/AppSidebar.tsx` |
| Auth store | `src/stores/auth.store.ts` |
| Auth service | `src/features/auth/api/auth.service.ts` |
| Auth hooks | `src/features/auth/hooks/use-auth.ts` |
| Auth schemas | `src/features/auth/schemas/auth.schema.ts` |
| API client | `src/lib/api-client.ts` |
| Axios config | `src/lib/axios.ts` |
| Mock data | `src/lib/mock-data.ts` |
| Query client | `src/lib/query-client.ts` |
| Types | `src/types/index.ts` |
| Utils | `src/lib/utils.ts` |

---

*This document is the single source of truth for the Adler Frontend project. Any AI agent should read this file first before making changes.*
