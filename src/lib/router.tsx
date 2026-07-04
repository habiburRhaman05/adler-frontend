import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProtectedRoute } from '@/lib/protected-route';

import { OverviewPage } from '@/pages/overview.page';
import { DashboardPage } from '@/pages/employes'; // Employee page
import { PlansPage } from '@/pages/plans.page';
import { PlanCreatePage } from '@/pages/plan-create.page';
import { ManagePlansPage } from '@/pages/manage-plans.page';
import { PlanDetailsPage } from '@/pages/plan-details.page';
import { ApprovalsPage } from '@/pages/approvals.page';
import { ReportsPage } from '@/pages/reports.page';
import { SettingsPage } from '@/pages/settings.page';
import { ProfilePage } from '@/pages/profile.page';
import { LoginPage } from '@/pages/login.page';
import { RegisterPage } from '@/pages/register.page';
import { NotFoundPage } from '@/pages/not-found.page';
import { CategoriesPage } from '@/pages/categories-page';
import { EmployeesPage } from '@/pages/employees-page';

export const router = createBrowserRouter([
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
      { path: 'plans', element: <PlansPage /> },
      { path: 'plans/manage', element: <ManagePlansPage /> },
      { path: 'plan/create', element: <PlanCreatePage /> },
      { path: 'plan/:id', element: <PlanDetailsPage /> },
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'approvals', element: <ApprovalsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
