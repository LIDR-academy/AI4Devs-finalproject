import { PrismaClient } from '../../../generated/prisma/client.js';
import { User, UserRole, UserStatusType } from '../../../domain/auth/entities/User.js';
import { Pin } from '../../../domain/auth/value-objects/Pin.js';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

// TK-092 (AUDIT-SEC-001 F-1b): rol centinela para una fila sin rol resoluble.
// NUNCA coincide con un `requireRole(...)` → el usuario queda sin acceso privilegiado
// (mínimo privilegio) pero sigue siendo visible en la pantalla admin para corregirlo.
// El fallback anterior era `'ADMIN'` (escalada de privilegios).
export const UNASSIGNED_ROLE = 'UNASSIGNED';

interface PrismaUserRaw {
  id: string;
  name: string;
  pinHash: string;
  status: string;
  mustChangePin?: boolean;
  failedAttempts: number;
  email?: string | null;
  resetTokenHash?: string | null;
  resetTokenExpires?: Date | null;
  createdAt: Date;
  role?: { name: string } | null;
}

function toDomain(raw: PrismaUserRaw): User {
  const resolvedRole = raw.role?.name ?? UNASSIGNED_ROLE;
  if (resolvedRole === UNASSIGNED_ROLE) {
    console.warn(
      `[PrismaUserRepository] Usuario ${raw.id} sin rol resoluble — se asigna el rol centinela "${UNASSIGNED_ROLE}" (sin privilegios). Reasignar desde Gestión de Personal.`
    );
  }
  return new User({
    id: raw.id,
    name: raw.name,
    role: resolvedRole as UserRole,
    pin: Pin.createFromHash(raw.pinHash),
    status: raw.status as UserStatusType,
    mustChangePin: raw.mustChangePin ?? true,
    failedAttempts: raw.failedAttempts,
    email: raw.email ?? undefined,
    resetTokenHash: raw.resetTokenHash ?? undefined,
    resetTokenExpires: raw.resetTokenExpires ?? undefined,
    createdAt: raw.createdAt,
  });
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // TK-092 (AUDIT-SEC-001 F-1a / F-2): el `User` de dominio modela `role` por nombre;
  // la fila Prisma guarda `roleId`. Resolvemos contra el catálogo `Role` (fuente de
  // verdad cerrada — alineado con US-015, sin hardcodear un enum). Un nombre que no
  // existe en el catálogo se rechaza en vez de persistirse en silencio.
  private async resolveRoleId(roleName: string): Promise<string> {
    const role = await this.prisma.role.findFirst({
      where: { name: { equals: roleName, mode: 'insensitive' } },
      select: { id: true },
    });
    if (!role) {
      throw new EntityNotFoundException('Rol', roleName);
    }
    return role.id;
  }

  // TK-092 (AUDIT-DEV-005 D-1): un usuario huérfano (Role borrado vía onDelete: SetNull)
  // porta el rol centinela `UNASSIGNED`. En ese caso NO se toca `roleId` en la escritura:
  // la mutación debe pasar igual (persistir intentos fallidos de login, BLOCK como acción
  // de contención, edición de nombre/PIN por un admin). El `roleId` real (NULL) se preserva
  // y un admin lo corrige con un PUT que trae un rol válido explícito → `resolveRoleId`.
  private async roleIdPatchForWrite(user: User): Promise<{ roleId?: string }> {
    if (user.role === UNASSIGNED_ROLE) {
      return {};
    }
    return { roleId: await this.resolveRoleId(user.role) };
  }

  public async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    return raw ? toDomain(raw) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const raw = await this.prisma.user.findUnique({
      where: { email: normalized },
      include: { role: true },
    });
    return raw ? toDomain(raw) : null;
  }

  public async findByResetTokenHash(tokenHash: string): Promise<User | null> {
    const raw = await this.prisma.user.findFirst({
      where: { resetTokenHash: tokenHash },
      include: { role: true },
    });
    return raw ? toDomain(raw) : null;
  }

  public async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      include: { role: true },
    });
    return rows.map(toDomain);
  }

  public async save(user: User): Promise<void> {
    const rolePatch = await this.roleIdPatchForWrite(user);
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        ...rolePatch,
        pinHash: user.pin.getHash(),
        status: user.status,
        mustChangePin: user.mustChangePin,
        failedAttempts: user.failedAttempts,
        email: user.email ?? null,
        resetTokenHash: user.resetTokenHash ?? null,
        resetTokenExpires: user.resetTokenExpires ?? null,
      },
      create: {
        id: user.id,
        name: user.name,
        ...rolePatch,
        pinHash: user.pin.getHash(),
        status: user.status,
        mustChangePin: user.mustChangePin,
        failedAttempts: user.failedAttempts,
        email: user.email ?? null,
        resetTokenHash: user.resetTokenHash ?? null,
        resetTokenExpires: user.resetTokenExpires ?? null,
      },
    });
  }

  public async update(user: User): Promise<void> {
    const rolePatch = await this.roleIdPatchForWrite(user);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        ...rolePatch,
        pinHash: user.pin.getHash(),
        status: user.status,
        mustChangePin: user.mustChangePin,
        failedAttempts: user.failedAttempts,
        email: user.email ?? null,
        resetTokenHash: user.resetTokenHash ?? null,
        resetTokenExpires: user.resetTokenExpires ?? null,
      },
    });
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
