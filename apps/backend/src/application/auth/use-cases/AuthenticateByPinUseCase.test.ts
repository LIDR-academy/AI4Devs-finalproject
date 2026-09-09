import { describe, it, expect, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { AuthenticateByPinUseCase } from './AuthenticateByPinUseCase.js';
import { InMemoryUserRepository } from '../../../infrastructure/auth/repositories/InMemoryUserRepository.js';
import { InMemoryRoleRepository } from '../../../infrastructure/security/repositories/InMemoryRoleRepository.js';
import { User } from '../../../domain/auth/entities/User.js';
import { Pin } from '../../../domain/auth/value-objects/Pin.js';

const SECRET = 'test-secret-permissions-in-jwt-12345';

function buildUser(id: string, name: string, role: string, pin: string): User {
  return new User({ id, name, role, pin: Pin.createFromRaw(pin), status: 'ACTIVE', failedAttempts: 0 });
}

describe('TK-121 (US-015 Escenario 2): el JWT de login incluye la lista de permisos', () => {
  let userRepo: InMemoryUserRepository;
  let roleRepo: InMemoryRoleRepository;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    roleRepo = new InMemoryRoleRepository();
    userRepo.seedUser(buildUser('usr-cocinero', 'Cocinero', 'KITCHEN_STAFF', '4321'));
    userRepo.seedUser(buildUser('usr-admin', 'Admin', 'ADMIN', '1234'));
  });

  function decode(token: string): { role: string; permissions?: string[] } {
    return jwt.verify(token, SECRET) as { role: string; permissions?: string[] };
  }

  it('emite los 5 permisos de KITCHEN_STAFF, sin los que no tiene', async () => {
    const useCase = new AuthenticateByPinUseCase(userRepo, SECRET, roleRepo);

    const result = await useCase.execute({ userId: 'usr-cocinero', pin: '4321' });
    const payload = decode(result.accessToken);

    expect(payload.permissions).toEqual(
      expect.arrayContaining(['stock:extract', 'stock:restock', 'stock:read', 'kitchen:recipe_prepare', 'kitchen:remanente_consume'])
    );
    expect(payload.permissions).toHaveLength(5);
    expect(payload.permissions).not.toContain('roles:manage');
    expect(payload.permissions).not.toContain('reports:view');
  });

  it('ADMIN no se trata como caso especial: emite sus 8 permisos reales', async () => {
    const useCase = new AuthenticateByPinUseCase(userRepo, SECRET, roleRepo);

    const payload = decode((await useCase.execute({ userId: 'usr-admin', pin: '1234' })).accessToken);

    expect(payload.permissions).toHaveLength(8);
    expect(payload.permissions).toContain('roles:manage');
  });

  it('sin repositorio de roles inyectado, el login sigue funcionando y omite permissions (no lo fabrica vacío)', async () => {
    const useCase = new AuthenticateByPinUseCase(userRepo, SECRET);

    const payload = decode((await useCase.execute({ userId: 'usr-cocinero', pin: '4321' })).accessToken);

    expect(payload.role).toBe('KITCHEN_STAFF');
    expect(payload.permissions).toBeUndefined();
  });

  it('un rol inexistente en el repositorio no rompe el login (permissions vacío, nunca excepción)', async () => {
    userRepo.seedUser(buildUser('usr-raro', 'Rol Huérfano', 'ROL_INEXISTENTE', '9999'));
    const useCase = new AuthenticateByPinUseCase(userRepo, SECRET, roleRepo);

    const payload = decode((await useCase.execute({ userId: 'usr-raro', pin: '9999' })).accessToken);

    expect(payload.permissions).toEqual([]);
  });
});
