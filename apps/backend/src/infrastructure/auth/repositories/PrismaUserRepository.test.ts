import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '../../../generated/prisma/client.js';
import { PrismaUserRepository, UNASSIGNED_ROLE } from './PrismaUserRepository.js';
import { User } from '../../../domain/auth/entities/User.js';
import { Pin } from '../../../domain/auth/value-objects/Pin.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

/**
 * TK-092 / AUDIT-SEC-001 F-1: antes del fix, un usuario creado por la API se
 * persistía sin `roleId` y `toDomain` lo resolvía a 'ADMIN' (escalada de privilegios).
 */
describe('PrismaUserRepository — resolución fail-safe de rol (TK-092 / AUDIT-SEC-001 F-1/F-2)', () => {
  const roleFindFirst = vi.fn();
  const userUpsert = vi.fn();
  const userUpdate = vi.fn();
  const userFindUnique = vi.fn();

  const prisma = {
    role: { findFirst: roleFindFirst },
    user: { upsert: userUpsert, update: userUpdate, findUnique: userFindUnique },
  } as unknown as PrismaClient;

  const repo = new PrismaUserRepository(prisma);

  const buildUser = (role: string): User =>
    new User({
      id: 'usr-test-1',
      name: 'Operario de Prueba',
      role,
      pin: Pin.createFromHash('salt:hash'),
      status: 'ACTIVE',
      failedAttempts: 0,
    });

  beforeEach(() => {
    roleFindFirst.mockReset();
    userUpsert.mockReset();
    userUpdate.mockReset();
    userFindUnique.mockReset();
  });

  it('F-1a: save() resuelve el nombre de rol y persiste roleId en create y update', async () => {
    roleFindFirst.mockResolvedValue({ id: 'role-kitchen' });

    await repo.save(buildUser('KITCHEN_STAFF'));

    expect(roleFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: { equals: 'KITCHEN_STAFF', mode: 'insensitive' } } })
    );
    const arg = userUpsert.mock.calls[0][0];
    expect(arg.create.roleId).toBe('role-kitchen');
    expect(arg.update.roleId).toBe('role-kitchen');
  });

  it('F-1a: update() persiste roleId', async () => {
    roleFindFirst.mockResolvedValue({ id: 'role-admin' });

    await repo.update(buildUser('ADMIN'));

    expect(userUpdate.mock.calls[0][0].data.roleId).toBe('role-admin');
  });

  it('F-2: un rol que no existe en el catálogo Role se rechaza — no se persiste nada', async () => {
    roleFindFirst.mockResolvedValue(null);

    await expect(repo.save(buildUser('ROL_INEXISTENTE'))).rejects.toBeInstanceOf(EntityNotFoundException);
    expect(userUpsert).not.toHaveBeenCalled();
  });

  it('D-1: save() de un usuario con rol centinela UNASSIGNED NO resuelve rol y NO toca roleId — la mutación pasa igual', async () => {
    await repo.save(buildUser(UNASSIGNED_ROLE));

    expect(roleFindFirst).not.toHaveBeenCalled();
    const arg = userUpsert.mock.calls[0][0];
    expect(arg.create).not.toHaveProperty('roleId');
    expect(arg.update).not.toHaveProperty('roleId');
  });

  it('D-1: un admin puede BLOQUEAR (update) a un usuario huérfano UNASSIGNED sin 404', async () => {
    const orphan = buildUser(UNASSIGNED_ROLE);
    orphan.block();

    await expect(repo.update(orphan)).resolves.toBeUndefined();

    expect(roleFindFirst).not.toHaveBeenCalled();
    const data = userUpdate.mock.calls[0][0].data;
    expect(data.status).toBe('BLOCKED');
    expect(data).not.toHaveProperty('roleId');
  });

  it('F-1b: una fila sin rol resoluble se mapea al centinela sin privilegios, NUNCA a ADMIN', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    userFindUnique.mockResolvedValue({
      id: 'usr-orphan',
      name: 'Huérfano',
      pinHash: 'salt:hash',
      status: 'ACTIVE',
      mustChangePin: false,
      failedAttempts: 0,
      email: null,
      resetTokenHash: null,
      resetTokenExpires: null,
      createdAt: new Date(),
      role: null,
    });

    const user = await repo.findById('usr-orphan');

    expect(user?.role).toBe(UNASSIGNED_ROLE);
    expect(user?.role).not.toBe('ADMIN');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
