<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import {
  BarChart3,
  Boxes,
  Calculator,
  ClipboardList,
  LogOut,
  PackageCheck,
  ReceiptText,
} from '@lucide/vue';
import { useAuthStore } from '@/core/auth.store';
import type { AppRole } from '@/core/auth.types';

const route = useRoute();
const authStore = useAuthStore();

type NavigationItem = {
  label: string;
  to: string;
  icon: typeof Boxes;
  roles: AppRole[];
};

const navigationItems: NavigationItem[] = [
  { label: 'Inventario', to: '/inventario', icon: Boxes, roles: ['Admin', 'Vendedor', 'Almacenista', 'Logistica'] },
  { label: 'Ventas', to: '/ventas', icon: ReceiptText, roles: ['Admin', 'Vendedor'] },
  { label: 'Cotizaciones', to: '/cotizaciones', icon: Calculator, roles: ['Admin', 'Vendedor'] },
  { label: 'Logistica', to: '/logistica', icon: PackageCheck, roles: ['Admin', 'Almacenista', 'Logistica', 'Chofer'] },
  { label: 'Admin', to: '/admin', icon: BarChart3, roles: ['Admin'] },
];

const visibleNavigation = computed(() =>
  navigationItems.filter((item) => authStore.hasAnyRole(item.roles)),
);

const showShell = computed(() => route.name !== 'login');
</script>

<template>
  <RouterView v-if="!showShell" />

  <div v-else class="app-shell">
    <aside class="sidebar" aria-label="Navegacion principal">
      <RouterLink to="/inventario" class="brand">
        <ClipboardList :size="26" aria-hidden="true" />
        <span>TejaFlow</span>
      </RouterLink>

      <nav class="nav-list">
        <RouterLink
          v-for="item in visibleNavigation"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :title="item.label"
        >
          <component :is="item.icon" :size="19" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <button class="logout-button" type="button" title="Cerrar sesion" @click="authStore.logout">
        <LogOut :size="18" aria-hidden="true" />
        <span>Cerrar sesion</span>
      </button>
    </aside>

    <main class="content">
      <header class="topbar">
        <div>
          <p class="eyebrow">Operacion ERP</p>
          <h1>{{ String(route.meta.title ?? 'TejaFlow') }}</h1>
        </div>
        <div class="user-pill">
          <span>{{ authStore.user?.nombre }}</span>
          <strong>{{ authStore.user?.rol }}</strong>
        </div>
      </header>

      <RouterView />
    </main>
  </div>
</template>
