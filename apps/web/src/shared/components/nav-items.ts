import type { UserRole } from '@/features/auth/types/auth.types';

export type NavItem = { href: string; label: string };

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin/dashboard', label: 'Panel' },
  { href: '/work-orders/in-progress', label: 'En curso' },
  { href: '/admin/reminders', label: 'Recordatorios' },
  { href: '/admin/users', label: 'Usuarios' },
  { href: '/admin/delivery', label: 'Listos para entrega' },
  { href: '/clients', label: 'Clientes' },
  { href: '/vehicles', label: 'Vehículos' },
  { href: '/work-orders/new', label: 'Nueva OT' },
];

export const MECHANIC_NAV: NavItem[] = [
  { href: '/mechanic/dashboard', label: 'Panel' },
  { href: '/work-orders/in-progress', label: 'En curso' },
  { href: '/clients', label: 'Clientes' },
  { href: '/vehicles', label: 'Vehículos' },
  { href: '/work-orders/new', label: 'Nueva OT' },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return role === 'ADMIN' ? ADMIN_NAV : MECHANIC_NAV;
}

export function getNavAriaLabel(role: UserRole): string {
  return role === 'ADMIN' ? 'Administración' : 'Mecánico';
}

export function getShellMaxWidthClassName(role: UserRole): string {
  return role === 'ADMIN' ? 'max-w-6xl' : 'max-w-5xl';
}
