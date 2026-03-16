import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'reader',
    children: [
      {
        path: '',
        loadComponent: () => 
          import('./features/reader/pages/home/home.component')
            .then(m => m.HomeComponent)
      },
      {
        path: 'pdf',
        loadComponent: () => 
          import('./features/reader/pages/pdf-viewer/pdf-viewer.component')
            .then(m => m.PdfViewerComponent)
      },
      {
        path: 'web',
        loadComponent: () => 
          import('./features/reader/pages/web-viewer/web-viewer.component')
            .then(m => m.WebViewerComponent)
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth' }
];
