import { Routes } from '@angular/router';
import { MobileLayoutComponent } from './layout/mobile-layout/mobile-layout.component.js';

export const routes: Routes = [
  {
    path: '',
    component: MobileLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.page.js').then(
            (m) => m.DashboardPageComponent,
          ),
      },
      {
        path: 'customers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/customers/pages/customer-list/customer-list.page.js').then(
                (m) => m.CustomerListPageComponent,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/customers/pages/customer-form/customer-form.page.js').then(
                (m) => m.CustomerFormPageComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/customers/pages/customer-detail/customer-detail.page.js').then(
                (m) => m.CustomerDetailPageComponent,
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/customers/pages/customer-form/customer-form.page.js').then(
                (m) => m.CustomerFormPageComponent,
              ),
          },
        ],
      },
      {
        path: 'services',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/services/pages/service-list/service-list.page.js').then(
                (m) => m.ServiceListPageComponent,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/services/pages/service-form/service-form.page.js').then(
                (m) => m.ServiceFormPageComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/services/pages/service-detail/service-detail.page.js').then(
                (m) => m.ServiceDetailPageComponent,
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/services/pages/service-form/service-form.page.js').then(
                (m) => m.ServiceFormPageComponent,
              ),
          },
        ],
      },
      {
        path: 'finances',
        loadComponent: () =>
          import('./features/finances/pages/finances/finances.page.js').then(
            (m) => m.FinancesPageComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
