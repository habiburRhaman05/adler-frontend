import { AppLayout } from '@/components/layouts/app-layout';
import { ProtectedRoute } from '@/lib/protected-route';
import { createBrowserRouter } from 'react-router-dom';

import { ApprovalsPage } from '@/pages/approvals.page';
import { CategoriesPage } from '@/pages/categories-page';
import { EmployeesPage } from '@/pages/employees-page';
import { LandingPage } from '@/pages/landing.page';
import { LoginPage } from '@/pages/login.page';
import { ManagePlansPage } from '@/pages/manage-plans.page';
import { NotFoundPage } from '@/pages/not-found.page';
import { OverviewPage } from '@/pages/overview.page';
import { PlanCreatePage } from '@/pages/plan-create.page';
import { PlanDetailsPage } from '@/pages/plan-details.page';
// import { PlansPage } from '@/pages/plans.page';
import { ProfilePage } from '@/pages/profile.page';
import { ReportsPage } from '@/pages/reports.page';
import { WorkloadPage } from '@/pages/workload.page';
import { SettingsPage } from '@/pages/settings.page';
import PlanBuilder from '@/components/plans/plans';
import PlanSummary from '@/components/plans/plans.summary';
import PlansPage from '@/components/plans/plans.index';

export const router = createBrowserRouter([
  {
    // Public landing page
    path: '/',
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
  },
  {
    // Authenticated dashboard
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <OverviewPage /> },
      // { path: 'plans', element: <PlansPage /> },
      // { path: 'plans/manage', element: <ManagePlansPage /> },
      // { path: 'plan/create', element: <PlanCreatePage /> },
      // { path: 'plan/:id', element: <PlanDetailsPage /> },
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'approvals', element: <ApprovalsPage /> },
      { path: 'workload', element: <WorkloadPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile', element: <ProfilePage /> },
       { path:"plans", element: <PlansPage />},
        { path:"plans/:id", element: <PlanBuilder />},
         {path:"plans/:id/summary", element: <PlanSummary />}
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
