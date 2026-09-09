import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/core/auth.store';
import type { AppRole } from '@/core/auth.types';
import AdminView from '@/features/admin/AdminView.vue';
import CotizacionesView from '@/features/cotizaciones/CotizacionesView.vue';
import InventarioView from '@/features/inventario/InventarioView.vue';
import LogisticaView from '@/features/logistica/LogisticaView.vue';
import VentasView from '@/features/ventas/VentasView.vue';
import LoginView from '@/views/LoginView.vue';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    roles?: AppRole[];
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/inventario',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Iniciar sesion' },
  },
  {
    path: '/inventario',
    name: 'inventario',
    component: InventarioView,
    meta: {
      title: 'Inventario',
      roles: ['Admin', 'Vendedor', 'Almacenista', 'Logistica'],
    },
  },
  {
    path: '/ventas',
    name: 'ventas',
    component: VentasView,
    meta: {
      title: 'Ventas',
      roles: ['Admin', 'Vendedor'],
    },
  },
  {
    path: '/cotizaciones',
    name: 'cotizaciones',
    component: CotizacionesView,
    meta: {
      title: 'Cotizaciones',
      roles: ['Admin', 'Vendedor'],
    },
  },
  {
    path: '/logistica',
    name: 'logistica',
    component: LogisticaView,
    meta: {
      title: 'Logistica',
      roles: ['Admin', 'Almacenista', 'Logistica', 'Chofer'],
    },
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: {
      title: 'Administracion',
      roles: ['Admin'],
    },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.name === 'login') {
    return authStore.isAuthenticated ? { name: 'inventario' } : true;
  }

  if (!authStore.isAuthenticated) {
    return { name: 'login' };
  }

  if (to.meta.roles && !authStore.hasAnyRole(to.meta.roles)) {
    return { name: 'inventario' };
  }

  return true;
});

