import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/pages/login.page') },
  { path: 'verify', loadComponent: () => import('./features/auth/pages/verify.page') },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/pages/dashboard.page'), canActivate: [authGuard] },
  { path: 'events/new', loadComponent: () => import('./features/events/onboarding/onboarding.page'), canActivate: [authGuard] },
  { 
    path: 'events/:slug/edit', 
    loadComponent: () => import('./features/events/pages/edit-event.page'), 
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard]
  },
  { 
    path: 'events/:slug/guests', 
    loadComponent: () => import('./features/events/pages/guest-manager.page').then(m => m.GuestManagerPage), 
    canActivate: [authGuard]
  },
  {
    path: 'events/:slug/dashboard',
    loadComponent: () => import('./features/dashboard/pages/control-dashboard.page'),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
