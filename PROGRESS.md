# 🚧 Adler Frontend — Implementation Progress

> Tracks progress against `implementation.md` / `my-plan.md`. Updated after each step.
> Started: senior-frontend build session.

## Legend
- ✅ Done
- 🚧 In progress
- ⬜ Not started

---

## Phase 0 — Foundation / Backend
- ⬜ Add `json-server` dependency + `dev:server` / `dev:full` npm scripts
- ⬜ Create `db.json` seed (users, employees, categories, plans, approvals, availability, settings)
- ⬜ Add `.env` / `.env.example` with `VITE_API_BASE_URL=http://localhost:3001`
- ⬜ Add `json-server` route/middleware so responses use `{ success, message, data, statusCode }` envelope
- ⬜ Update `axios.ts` interceptor for envelope + `ApiError`
- ⬜ Update `api-client.ts` to unwrap `data`
- ⬜ Update `types/index.ts` shared API types

## Phase 1 — Auth
- ⬜ Clear hardcoded mock user in `auth.store.ts` (logged-out initial state)
- ⬜ Real login flow via JSON DB (`/login` endpoint)
- ⬜ Fix `useLogin`/`useRegister` navigation (`/dashboard` → `/`)
- ⬜ `ProtectedRoute` component + wrap `AppLayout`
- ⬜ Auth layout for `/login` & `/register`
- ⬜ Sidebar footer + header avatar use real auth user
- ⬜ Logout wired to header user menu
- ⬜ Fix not-found page `/dashboard` link → `/`

## Phase 2 — Employees (CRUD)
- ⬜ `employee.service.ts` + hooks
- ⬜ Full Employees table UI (search, filters, skeletons)
- ⬜ Add / Edit modal
- ⬜ Delete confirmation
- ⬜ Wired to JSON DB with error handling

## Phase 3 — Categories (CRUD)
- ⬜ `category.service.ts` + hooks
- ⬜ Category CRUD + sub-categories, skeletons, wired to API

## Phase 4 — Approvals
- ⬜ `approval.service.ts` + hooks
- ⬜ Approve / reject wired to API, skeletons

## Phase 5 — Settings
- ⬜ `settings.service.ts` + hooks
- ⬜ GET/PUT settings, skeletons, form state

## Phase 6 — Plans (new pages)
- ⬜ `plan.service.ts` (rewrite stub `plan.services.ts`) + hooks
- ⬜ Manage-load / Plan Create page: weekly manpower needs within a month
- ⬜ `/plans/manage` list + filters
- ⬜ `/plan/:id` details view + submit/draft + edit
- ⬜ Log "email" notification to users on submit

## Phase 7 — Polish
- ⬜ UI color mismatch audit across pages (design schema)
- ⬜ Loading skeletons everywhere data is fetched
- ⬜ Typecheck (`npm run build`) passes
- ⬜ Lint (`npm run lint`) passes
- ⬜ Code review pass

---

## Change Log
_(entries added as work completes)_
