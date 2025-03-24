import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Login - Easy Reader'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
]; 