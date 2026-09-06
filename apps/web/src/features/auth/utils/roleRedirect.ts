import type { UserRole } from '../types/auth.types';

export function getDashboardPath(role: UserRole): string {
  return role === 'ADMIN' ? '/admin/dashboard' : '/mechanic/dashboard';
}
