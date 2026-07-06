import { AppLayout } from '@/components/layouts/app-layout';
import { ProtectedRoute } from '@/lib/protected-route';
import { createBrowserRouter } from 'react-router-dom';

import { ApprovalsPage } from '@/pages/approvals.page';
import { CategoriesPage } from '@/pages/categories-page';
import { EmployeesPage } from '@/pages/employees-page';
import { LandingPage } from '@/pages/landing.page';
import { LoginPage } from '@/pages/login.page';
import { NotFoundPage } from '@/pages/not-found.page';
import { OverviewPage } from '@/pages/overview.page';
import PlanDetailsPage from '@/pages/plan-details.page';
import PlanSummary from '@/pages/plan-summary.page';
import { PlansPage } from '@/pages/plans.page';
import { ProfilePage } from '@/pages/profile.page';
import { ReportsPage } from '@/pages/reports.page';
import { SettingsPage } from '@/pages/settings.page';
import { WorkloadPage } from '@/pages/workload.page';
import DemandPage from '@/pages/DemandPage';
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
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      {
        path: 'plans',
        element: <PlansPage />,
      },
      {
        path: 'plans/:planId',
        element: <PlanDetailsPage />,
      },
      {
        path: 'plans/:planId/summary',
        element: <PlanSummary />,
      },
      { path: 'approvals', element: <ApprovalsPage /> },
      { path: 'workload', element: <WorkloadPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'demands', element: <DemandPage /> },
      
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
