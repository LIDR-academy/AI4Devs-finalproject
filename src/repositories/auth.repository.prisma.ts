import { prisma } from "@/db/prisma";
import type {
  AuthRepository,
  AuthUser,
  AuthUserWithSecret,
  StoredSession,
} from "@/repositories/auth.repository";

/** Adaptador Prisma del puerto `AuthRepository`. */

const USER_FIELDS = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  status: true,
} as const;

const SESSION_FIELDS = { id: true, userId: true, expiresAt: true } as const;

export const prismaAuthRepository: AuthRepository = {
  async findUserByEmail(email) {
    const user = await prisma.user.findUnique({
      // El email se normaliza en el caso de uso; aquí se busca tal cual llega.
      where: { email },
      select: { ...USER_FIELDS, passwordHash: true },
    });
    return user as AuthUserWithSecret | null;
  },

  async createSession({ userId, tokenHash, expiresAt, userAgent, ipAddress }) {
    const session = await prisma.session.create({
      data: { userId, tokenHash, expiresAt, userAgent, ipAddress },
      select: SESSION_FIELDS,
    });
    return session;
  },

  async findSessionByTokenHash(tokenHash) {
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      select: { ...SESSION_FIELDS, user: { select: USER_FIELDS } },
    });
    if (!session) return null;
    const { user, ...rest } = session;
    return { session: rest as StoredSession, user: user as AuthUser };
  },

  async deleteSessionByTokenHash(tokenHash) {
    // `deleteMany` y no `delete`: borrar una sesión ya inexistente (doble logout,
    // barrido concurrente) no es un error que deba propagarse.
    await prisma.session.deleteMany({ where: { tokenHash } });
  },

  async deleteSessionsForUser(userId) {
    const { count } = await prisma.session.deleteMany({ where: { userId } });
    return count;
  },

  async touchSession(sessionId, at) {
    await prisma.session.updateMany({
      where: { id: sessionId },
      data: { lastSeenAt: at },
    });
  },

  async deleteExpiredSessions(now) {
    const { count } = await prisma.session.deleteMany({
      where: { expiresAt: { lte: now } },
    });
    return count;
  },
};
