import { prisma } from "@/db/prisma";
import type {
  PasswordResetRepository,
  StoredResetToken,
} from "@/repositories/password-reset.repository";

/** Adaptador Prisma del puerto `PasswordResetRepository`. */

const TOKEN_FIELDS = {
  id: true,
  userId: true,
  expiresAt: true,
  usedAt: true,
} as const;

export const prismaPasswordResetRepository: PasswordResetRepository = {
  async create({ userId, tokenHash, expiresAt, at, requestedIp }) {
    const token = await prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt, createdAt: at, requestedIp },
      select: TOKEN_FIELDS,
    });
    return token as StoredResetToken;
  },

  async invalidateForUser({ userId, at }) {
    const { count } = await prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: at },
    });
    return count;
  },

  async findByTokenHash(tokenHash) {
    const token = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: TOKEN_FIELDS,
    });
    return (token as StoredResetToken | null) ?? null;
  },

  async consume({ tokenId, at }) {
    // El `usedAt: null` va en el WHERE, no en una comprobación previa: es lo que hace
    // que de dos peticiones simultáneas con el mismo enlace solo una lo gaste.
    const { count } = await prisma.passwordResetToken.updateMany({
      where: { id: tokenId, usedAt: null },
      data: { usedAt: at },
    });
    return count > 0;
  },

  async updatePassword({ userId, passwordHash }) {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },
};
