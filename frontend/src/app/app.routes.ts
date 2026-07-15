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
    path: 'artistas',
    loadComponent: () =>
      import('./features/artists/artists-page.component').then((m) => m.ArtistsPageComponent)
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
  {
    path: 'reserva',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/booking/booking-summary/booking-summary.component').then(
        (m) => m.BookingSummaryComponent
      )
  },
  {
    path: 'reservas/:bookingId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/booking/payment-return/payment-return.component').then(
        (m) => m.PaymentReturnComponent
      )
  },
  {
    path: 'pago-simulado',
    loadComponent: () =>
      import('./features/booking/mock-checkout/mock-checkout.component').then(
        (m) => m.MockCheckoutComponent
      )
  },
  {
    path: 'artista/:slug',
    loadComponent: () =>
      import('./features/artist-profile/artist-profile.component').then(
        (m) => m.ArtistProfileComponent
      )
  },
  { path: '**', redirectTo: '' }
];
