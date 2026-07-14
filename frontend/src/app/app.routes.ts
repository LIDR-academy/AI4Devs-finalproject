import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'mi-cuenta',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/account.component').then((m) => m.AccountComponent)
  },
  // Home will become the public showcase (US0003); until then it redirects to login
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
