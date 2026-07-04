import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';

import { OverviewPage } from '@/pages/overview.page';
import { DashboardPage } from '@/pages/dashboard.page'; // Employee page
import { PlansPage } from '@/pages/plans.page';
import { CategoriesPage } from '@/pages/categories.page';
import { ApprovalsPage } from '@/pages/approvals.page';
import { ReportsPage } from '@/pages/reports.page';
import { SettingsPage } from '@/pages/settings.page';
import { LoginPage } from '@/pages/login.page';
import { RegisterPage } from '@/pages/register.page';
import { NotFoundPage } from '@/pages/not-found.page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'plans', element: <PlansPage /> },
      { path: 'employees', element: <DashboardPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'approvals', element: <ApprovalsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
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
]);
