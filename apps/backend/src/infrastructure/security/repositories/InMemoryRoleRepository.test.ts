import { describe, it, expect } from 'vitest';
import { InMemoryRoleRepository } from './InMemoryRoleRepository.js';

describe('TK-117: InMemoryRoleRepository — seed espejo de prisma/seed.ts', () => {
  it('siembra KITCHEN_STAFF (no solo ADMIN) con los mismos 5 permisos que el seed real', async () => {
    const repo = new InMemoryRoleRepository();
    const role = await repo.findRoleByName('KITCHEN_STAFF');

    expect(role).not.toBeNull();
    const codes = role!.permissions.map((p) => p.code).sort();
    expect(codes).toEqual(
      ['kitchen:recipe_prepare', 'kitchen:remanente_consume', 'stock:extract', 'stock:read', 'stock:restock'].sort()
    );
  });

  it('KITCHEN_STAFF no tiene permisos de administración (reports:view, users:manage, roles:manage)', async () => {
    const repo = new InMemoryRoleRepository();
    const role = await repo.findRoleByName('KITCHEN_STAFF');

    const codes = role!.permissions.map((p) => p.code);
    expect(codes).not.toContain('reports:view');
    expect(codes).not.toContain('users:manage');
    expect(codes).not.toContain('roles:manage');
  });

  it('ADMIN sigue con los 8 permisos completos', async () => {
    const repo = new InMemoryRoleRepository();
    const role = await repo.findRoleByName('ADMIN');
    expect(role!.permissions).toHaveLength(8);
  });
});
