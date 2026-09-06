/**
 * Siembra una sesión en `localStorage` tal como lo haría `AuthService` tras un login
 * real: un JWT cuyo payload lleva `role` y (desde TK-121) `permissions`.
 *
 * La firma es un relleno: el frontend NUNCA la verifica — decodifica el payload solo
 * para saber qué ofrecer en la interfaz, y la autorización real la impone el backend
 * en cada petición (ver `usePermissions`).
 */
export function seedSession(options: { role?: string; permissions?: string[] } = {}): void {
  const { role = 'ADMIN', permissions } = options;
  const payload = { sub: 'usr-test', name: 'Usuario de Prueba', role, ...(permissions ? { permissions } : {}) };
  const encode = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.firma-de-prueba`;

  localStorage.setItem('restostock_jwt_token', token);
  localStorage.setItem('restostock_user_info', JSON.stringify({ id: 'usr-test', name: 'Usuario de Prueba', role }));
}

export function clearSession(): void {
  localStorage.removeItem('restostock_jwt_token');
  localStorage.removeItem('restostock_user_info');
}

/** Los 8 permisos del rol ADMIN en el seed real (`prisma/seed.ts`). */
export const ALL_PERMISSIONS = [
  'stock:extract',
  'stock:restock',
  'stock:read',
  'kitchen:recipe_prepare',
  'kitchen:remanente_consume',
  'reports:view',
  'users:manage',
  'roles:manage',
];

/** Los 5 permisos de KITCHEN_STAFF en el seed real: sin reports:view, users:manage ni roles:manage. */
export const KITCHEN_STAFF_PERMISSIONS = [
  'stock:extract',
  'stock:restock',
  'stock:read',
  'kitchen:recipe_prepare',
  'kitchen:remanente_consume',
];
