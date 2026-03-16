import { Routes } from '@angular/router';
import { ClienListComponent } from './view/view.component';

/**
 * Rutas del módulo de Gestión de Clientes
 */
export default [
  {
    path: '',
    title: 'Gestión de Clientes',
    component: ClienListComponent,
  },
  {
    path: 'nuevo',
    title: 'Registrar Cliente',
    loadComponent: () => import('./create/create.component').then(m => m.ClienCreateComponent),
  },
  {
    path: ':id',
    title: 'Detalle del Cliente',
    loadComponent: () => import('./detail/detail.component').then(m => m.ClienDetailComponent),
  },
  {
    path: ':id/editar',
    title: 'Editar Cliente',
    loadComponent: () => import('./edit/edit.component').then(m => m.ClienEditComponent),
  },
] as Routes;

