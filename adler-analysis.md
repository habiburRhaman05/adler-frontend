# 🔍 ADLER-FRONTEND: Depth Analysis

**Date:** July 4, 2026 | **Status:** Bootstrap + UI Framework Setup Complete | **Commits:** 1

---

## 📊 PROJECT OVERVIEW

**Project Name:** `adler-frontend` (likely "Adler" = Employee/Staff Management System)  
**Stage:** Early development—Vite + React 19 scaffold with **full shadcn/ui component library** pre-configured  
**Tech Stack:** React 19.2.7 | TypeScript 6.0 | Vite 8.1 | Zustand | TanStack Query | Zod  
**Lines of Code (Rough):** ~200-250 lines actual app code, ~3000+ lines UI component library  

---

## 🏗️ ARCHITECTURE OVERVIEW

```
adler-frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # 46x shadcn/ui primitives (accordion, button, etc.)
│   │   ├── layouts/
│   │   │   └── app-layout.tsx     # Main authenticated layout wrapper
│   │   └── AppSidebar.tsx         # Left navigation sidebar
│   │
│   ├── pages/                      # 10x route pages (page per feature)
│   │   ├── dashboard.page.tsx     # Employee list w/ filtering, CRUD
│   │   ├── plans.page.tsx         # Scheduling grid + constraints
│   │   ├── categories.page.tsx    # Resource categories
│   │   ├── approvals.page.tsx     # Workflow approvals
│   │   ├── reports.page.tsx       # Analytics/charts
│   │   ├── overview.page.tsx      # Dashboard home
│   │   ├── settings.page.tsx      # User settings
│   │   ├── login.page.tsx         # Auth login
│   │   ├── register.page.tsx      # Auth signup
│   │   └── not-found.page.tsx     # 404 fallback
│   │
│   ├── features/auth/
│   │   ├── api/
│   │   │   ├── auth.service.ts    # POST /auth/{login,register,logout}, GET /auth/me
│   │   │   └── plan.services.ts   # (stub)
│   │   ├── hooks/
│   │   │   ├── use-auth.ts        # useCurrentUser() hook
│   │   │   └── use-mobile.tsx     # Responsive breakpoint hook
│   │   └── schemas/
│   │       └── auth.schema.ts     # Zod schemas: loginSchema, registerSchema, etc.
│   │
│   ├── stores/                     # Zustand persistent state
│   │   ├── auth.store.ts          # User + tokens (localStorage-persisted)
│   │   ├── plan.store.ts          # (stub)
│   │   └── employes.store.ts      # (stub)
│   │
│   ├── types/
│   │   └── index.ts               # ApiResponse<T>, PaginatedResponse<T>, SelectOption
│   │
│   ├── lib/
│   │   ├── api-client.ts          # Type-safe HTTP client w/ Zod validation
│   │   ├── axios.ts               # Axios instance + interceptors (auth, errors)
│   │   ├── router.tsx             # React Router v7 config
│   │   ├── query-client.ts        # TanStack Query setup
│   │   ├── mock-data.ts           # Dummy employees, categories, weeks for demo
│   │   └── utils.ts               # Utility helpers
│   │
│   ├── App.tsx                     # Root wrapper: QueryClientProvider → Router
│   ├── main.tsx                    # React 19 createRoot entry
│   └── index.css                   # Tailwind base
│
├── public/
│   ├── favicon.svg
│   ├── icons.svg                   # Icon sprite
│   └── (static assets)
│
├── vite.config.ts                  # Vite + React plugin config
├── tsconfig.json                   # TypeScript 6.0 config
├── tsconfig.app.json               # App-specific TS config
├── tsconfig.node.json              # Node-specific TS config
├── .oxlintrc.json                  # Oxlint (ESLint replacement) config
├── components.json                 # shadcn/ui metadata
├── .env.example
├── package.json
└── README.md                        # Default Vite template README
```

---

## 🎯 KEY FEATURES & PAGES

### **1. Dashboard (Employees Management)**
- **Route:** `/employees` → `DashboardPage`
- **Features:**
  - List of employees with search + department filter
  - Status badges: Active, Retired, Suspension, Sacked, Resigned, Leave
  - Employee type badges: Full-time, Intern, Part time, Remote, Hybrid
  - CRUD operations via dialog modals (Add/Edit/Delete)
  - Mock data: `mockEmployees` array
- **Key UI:** DataTable-like with dropdown menus, custom badges

### **2. Planning (Scheduling Grid)**
- **Route:** `/plans` → `PlansPage`
- **Features:**
  - Weekly scheduling grid (employees × 7 days)
  - Time slot assignment with start/end times
  - Category-based shifts
  - Constraint violations detection (e.g., >50 hrs/week)
  - Toast notifications for violations
- **Key Logic:** 
  - State: `grid[empId][dayIndex] = { categoryId, start, end }`
  - Computed: `violations` array identifies schedule conflicts
- **Mock Data:** `employees`, `categories`, `weeks`, `getAvailability()`

### **3. Categories Management**
- **Route:** `/categories` → `CategoriesPage`
- **Purpose:** Define resource/shift categories
- *Currently stub implementation*

### **4. Approvals Workflow**
- **Route:** `/approvals` → `ApprovalsPage`
- **Purpose:** Workflow state transitions (pending → approved/rejected)
- *Currently stub implementation*

### **5. Reports & Analytics**
- **Route:** `/reports` → `ReportsPage`
- **Features:** Likely chart/export views
- **Dependencies:** `recharts` library available
- *Currently stub implementation*

### **6. Settings**
- **Route:** `/settings` → `SettingsPage`
- **Purpose:** User profile, preferences, etc.
- *Currently stub implementation*

### **7. Overview / Home**
- **Route:** `/` → `OverviewPage`
- **Purpose:** Dashboard landing page with KPIs
- *Currently stub implementation*

### **8. Auth Pages**
- **Login** → `/login` → `LoginPage`
  - Form: email + password
  - Schema validation via `loginSchema` (Zod)
  - Service: `authService.login()`
  
- **Register** → `/register` → `RegisterPage`
  - Form: name, email, password, confirmPassword
  - Strong validation: uppercase + lowercase + number
  - Service: `authService.register()`

---

## 🔐 STATE MANAGEMENT

### **Zustand - Auth Store** (`src/stores/auth.store.ts`)
```typescript
useAuthStore = {
  user: User | null,
  accessToken: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean,
  isHydrated: boolean,
  // actions
  login(), logout(), setUser(), setTokens(), setHydrated()
}
```
- **Persistence:** localStorage (key: `auth-storage`)
- **Initial State:** Hardcoded mock user (John Doe, admin role)
- **Hydration:** Handles localStorage sync on mount

### **TanStack Query** (`src/lib/query-client.ts`)
- Cache invalidation on window focus
- 30 min stale time
- Used for server state (API calls via `authService`)

### **React Router v7**
- Nested routes under `AppLayout` (protected routes)
- Error boundary: `NotFoundPage`
- Lazy-load ready (structure supports it)

---

## 📡 API INTEGRATION

### **Type-Safe HTTP Client** (`src/lib/api-client.ts`)
```typescript
apiClient = {
  get<T>(url, { schema? }),    // GET with Zod validation
  post<T>(url, data, { schema? }),  // POST
  put<T>(url, data, { schema? }),   // PUT
  patch<T>(url, data, { schema? }),  // PATCH
  delete<T>(url, { schema? })      // DELETE
}
```
- **Runtime Validation:** Zod schema parsing on responses
- **Type Inference:** Generic `<T>` returns validated type

### **Axios Instance** (`src/lib/axios.ts`)
- **Base URL:** `VITE_API_BASE_URL` (default: `http://localhost:3000/api`)
- **Timeout:** 15 seconds
- **Request Interceptor:** Auto-attach Bearer token from `auth-storage`
- **Response Interceptor:** 
  - 401 → Clear auth, redirect to `/login`
  - Error handling via custom `ApiError` class
  - Network error fallback

### **Auth Service** (`src/features/auth/api/auth.service.ts`)
```typescript
authService = {
  login(credentials: LoginInput) → POST /auth/login
  register(data: RegisterInput) → POST /auth/register
  me() → GET /auth/me
  logout() → POST /auth/logout
}
```

### **Validation Schemas** (`src/features/auth/schemas/auth.schema.ts`)
- `loginSchema`: email + password (min 6 chars)
- `registerSchema`: name + email + password (strong) + confirm
- `userSchema`: id, name, email, avatar?, role, createdAt
- `authResponseSchema`: user + accessToken + refreshToken?

---

## 🎨 UI COMPONENT LIBRARY

**46x shadcn/ui components** pre-configured + customized:

| Category | Components |
|----------|-----------|
| **Forms** | Form, Input, Label, Textarea, Checkbox, Radio, Select, Toggle, Switch, Combobox (cmdk) |
| **Layout** | Sidebar, Breadcrumb, Pagination, Separator, Card, AspectRatio |
| **Dialogs** | Dialog, AlertDialog, Drawer, Sheet |
| **Menus** | DropdownMenu, ContextMenu, MenuBar, NavigationMenu |
| **Data** | Table, Tabs, Accordion, Collapsible |
| **Feedback** | Badge, Alert, Progress, Toast (sonner), Skeleton |
| **Visual** | Avatar, HoverCard, PopOver, Carousel, ScrollArea, ResizablePanels |
| **Input** | InputOTP, DatePicker (calendar), Slider |
| **Misc** | Tooltip |

**Design System:**
- **Color Palette:** Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Theming:** `next-themes` (dark mode support)
- **Icons:** Lucide React (24/7 SVG icons)
- **Animations:** `tailwindcss-animate`
- **Utilities:** `clsx`, `class-variance-authority`, `tailwind-merge`

---

## 📦 DEPENDENCIES

### **Core**
- `react` 19.2.7
- `react-dom` 19.2.7
- `react-router-dom` 7.18.1
- `typescript` 6.0.2
- `vite` 8.1.1

### **State & Data**
- `zustand` 5.0.14 (state store)
- `@tanstack/react-query` 5.101.2 (server state)
- `@tanstack/react-query-devtools` 5.101.2 (debug)
- `axios` 1.18.1 (HTTP)
- `zod` 4.4.3 (validation)
- `react-hook-form` 7.80.0 (form handling)
- `@hookform/resolvers` 5.4.0 (form + Zod)

### **UI/UX**
- `@radix-ui/*` (46 primitives)
- `lucide-react` 1.23.0 (icons)
- `sonner` 2.0.7 (toast notifications)
- `recharts` 3.9.1 (charts)
- `next-themes` 0.4.6 (dark mode)
- `tailwindcss` 4.3.2 + `@tailwindcss/vite` 4.3.2
- `tailwindcss-animate` 1.0.7
- `tailwind-merge` 3.6.0
- `class-variance-authority` 0.7.1
- `cmdk` 1.1.1 (command palette)
- `embla-carousel-react` 8.6.0 (carousel)
- `react-day-picker` 10.0.1 (date picker)
- `react-resizable-panels` 4.12.0 (layout)
- `react-social-icons` 6.26.0
- `input-otp` 1.4.2
- `vaul` 1.1.2 (drawer/sheet)

### **Dev Tools**
- `oxlint` 1.71.0 (fast linter, replaces ESLint)
- `@vitejs/plugin-react` 6.0.3
- `@types/react`, `@types/react-dom`, `@types/node`

---

## 📐 ROUTING STRUCTURE

```
/                          → AppLayout (protected)
├── /                      → OverviewPage (home)
├── /plans                 → PlansPage (scheduling)
├── /employees             → DashboardPage (staff list)
├── /categories            → CategoriesPage
├── /approvals             → ApprovalsPage
├── /reports               → ReportsPage
├── /settings              → SettingsPage
└── * (not found)          → NotFoundPage

/login                     → LoginPage (public)
/register                  → RegisterPage (public)
```

---

## 💡 DATA FLOW

```
User Input (Login Form)
    ↓
authService.login(credentials)
    ↓
axios.post('/auth/login', credentials)
    ↓
Response + Zod validation via apiClient
    ↓
useAuthStore.login(user, token, refreshToken)
    ↓
localStorage.setItem('auth-storage', state)
    ↓
Router redirects to /overview
    ↓
useCurrentUser() hook fetches GET /auth/me (TanStack Query)
```

---

## 🚨 CURRENT STATUS & GAPS

### ✅ **Completed**
- Vite + React 19 bootstrap
- TypeScript strict config
- Full shadcn/ui library setup (46 components)
- Zustand + localStorage persistence
- Axios + TanStack Query integration
- Auth flow structure (login, register schemas)
- Router setup with 10 pages
- Mock data generator
- Form validation (Zod + react-hook-form)
- Dark mode support (next-themes)
- Oxlint linting

### ⚠️ **Stub/Incomplete**
- **Plan Store** (`src/stores/plan.store.ts`) — empty file
- **Employee Store** (`src/stores/employes.store.ts`) — empty file
- **Plan Services** (`src/features/auth/api/plan.services.ts`) — likely empty
- **Categories, Approvals, Reports Pages** — structure exists, no logic
- **Settings Page** — structure exists, no logic
- **Overview Page** — structure exists, no logic
- **API Integration** — currently uses mock data only
  - `mockEmployees` (hardcoded array)
  - `getAvailability()` (hardcoded function)
- **Protected Routes** — no auth guard middleware (all routes accessible without login)
- **Error Handling** — API errors defined but not displayed in UI
- **Responsive Design** — structure exists (`use-mobile` hook) but not fully tested

### 📝 **Next Steps (Obvious)**
1. **Wire up backend:** Replace mock data with real API calls
2. **Implement missing stores:** Plan + Employee stores for CRUD
3. **Add route guards:** ProtectedRoute wrapper, redirect to /login if !authenticated
4. **Complete stub pages:** Reports (recharts), Approvals workflow, Settings
5. **Error handling:** Toast UI for API errors, retry logic
6. **Testing:** Unit tests (Vitest) + E2E (Playwright)
7. **Performance:** Code splitting, lazy routes, image optimization
8. **Deployment:** Docker config, CI/CD pipeline, env management

---

## 🔧 DEVELOPMENT SETUP

```bash
npm install
VITE_API_BASE_URL=http://localhost:3000/api npm run dev   # Dev server on :5173
npm run build    # Production build
npm run lint     # Oxlint check
npm run preview  # Preview build output
```

**Environment:**
- `.env.example` provides `VITE_API_BASE_URL`
- Copy to `.env.local` to override

---

## 📊 CODEBASE METRICS

| Metric | Value |
|--------|-------|
| **Total Files** | ~65 |
| **Component Files** | 1 (App.tsx) |
| **UI Library Files** | 46 (shadcn/ui) |
| **Page Files** | 10 |
| **Store Files** | 3 (1 implemented, 2 stub) |
| **Service Files** | 2 |
| **Hook Files** | 2 |
| **Schema Files** | 1 |
| **Type Files** | 1 |
| **Config Files** | 6 |
| **Language Breakdown** | TS 98.5% | CSS 1.4% |
| **Git Commits** | 1 (bootstrap) |

---

## 🎓 ARCHITECTURE ASSESSMENT

### **Strengths**
✅ Modern React 19 + TypeScript 6.0  
✅ Type-safe API layer (Zod runtime validation)  
✅ Clean folder structure (pages, features, stores, lib)  
✅ Comprehensive UI library (shadcn/ui)  
✅ Good auth flow pattern (Zustand + localStorage)  
✅ Form validation best practices (react-hook-form + Zod)  
✅ Fast linter (Oxlint vs ESLint)  
✅ Responsive hooks ready (`use-mobile`)  

### **Weaknesses**
⚠️ No protected routes middleware (security risk)  
⚠️ Mock data hardcoded (prevents real API testing)  
⚠️ No error boundary components  
⚠️ No request/response logging  
⚠️ Interceptor auth token stored in localStorage (XSS risk, consider httpOnly cookies)  
⚠️ No loading states in components  
⚠️ No pagination UI (structure exists in types, not used)  

### **Opportunities**
💡 Add React Compiler for auto memoization  
💡 Implement E2E tests (Playwright)  
💡 Add Storybook for component docs  
💡 Setup GitHub Actions CI/CD  
💡 Add performance monitoring (Sentry)  
💡 Implement feature flags  

---

## 🎯 PROJECT SUMMARY

**Adler** is a **frontend skeleton for an Employee Scheduling/HR Management SaaS** built with cutting-edge React 19 + TypeScript. The UI layer is feature-complete (46 shadcn/ui components), auth flow is well-structured, and the API layer is ready for backend integration. 

**Development Stage:** Alpha scaffold  
**Time to Production-Ready:** 4-6 weeks (with backend + testing)  
**Complexity:** Medium (multi-page CRUD + scheduling logic)  

---

*Analysis Generated: July 4, 2026*
