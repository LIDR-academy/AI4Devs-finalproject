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
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
