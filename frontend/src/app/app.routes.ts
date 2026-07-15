import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/showcase/showcase-page/showcase-page.component').then(
        (m) => m.ShowcasePageComponent
      )
  },
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
  { path: '**', redirectTo: '' }
];
