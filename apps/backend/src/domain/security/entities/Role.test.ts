import { describe, it, expect } from 'vitest';
import { Role } from './Role.js';
import { Permission } from './Permission.js';

describe('Role Domain Entity — Matriz de Permisos (Dynamic RBAC)', () => {
  it('hasPermission debe devolver true cuando el rol tiene asignado el codigo de permiso', () => {
    const permission = new Permission({ id: 'perm-1', code: 'STOCK_WRITE', name: 'Escribir Stock', module: 'stock' });
    const role = new Role({ id: 'role-1', name: 'ADMIN', permissions: [permission] });

    expect(role.hasPermission('STOCK_WRITE')).toBe(true);
  });

  it('hasPermission debe devolver false cuando el codigo de permiso no esta asignado al rol', () => {
    const role = new Role({ id: 'role-1', name: 'KITCHEN_STAFF', permissions: [] });

    expect(role.hasPermission('STOCK_WRITE')).toBe(false);
  });

  it('permissions debe devolver un arreglo vacio por defecto cuando no se proveen permisos', () => {
    const role = new Role({ id: 'role-1', name: 'KITCHEN_STAFF' });

    expect(role.permissions).toEqual([]);
  });
});
