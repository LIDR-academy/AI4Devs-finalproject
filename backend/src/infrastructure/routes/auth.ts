import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env.js";
import { UnauthorizedError } from "../errors.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

function signAccessToken(userId: string, role: string): string {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, { expiresIn: 900 } as jwt.SignOptions);
}

function signRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: 604800 } as jwt.SignOptions);
}

router.post("/auth/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
      data: { token_hash: tokenHash, user_id: user.id, expires_at: expiresAt },
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        mustChangePassword: user.must_change_password,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/refresh", validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const payload = jwt.verify(refreshToken, env.JWT_SECRET) as { id: string };

    const tokens = await prisma.refreshToken.findMany({
      where: { user_id: payload.id, revoked_at: null, expires_at: { gt: new Date() } },
    });

    let matchedToken = null;
    for (const t of tokens) {
      const valid = await bcrypt.compare(refreshToken, t.token_hash);
      if (valid) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    await prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revoked_at: new Date() },
    });

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const newAccessToken = signAccessToken(user.id, user.role);
    const newRefreshToken = signRefreshToken(user.id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tokenHash = await bcrypt.hash(newRefreshToken, 10);
    await prisma.refreshToken.create({
      data: { token_hash: tokenHash, user_id: user.id, expires_at: expiresAt },
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        mustChangePassword: user.must_change_password,
      },
    });
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid or expired refresh token"));
    } else {
      next(err);
    }
  }
});

router.post("/auth/logout", authenticate, async (req, res, next) => {
  try {
    const userId = (req.user as { id: string }).id;
    await prisma.refreshToken.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

router.post(
  "/auth/change-password",
  authenticate,
  validate(changePasswordSchema),
  async (req, res, next) => {
    try {
      const userId = (req.user as { id: string }).id;
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        throw new UnauthorizedError("Invalid credentials");
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: userId },
        data: { password_hash: newHash, must_change_password: false },
      });

      res.json({ message: "Password changed successfully" });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/auth/me", authenticate, async (req, res, next) => {
  try {
    const userId = (req.user as { id: string }).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        level_id: true,
        must_change_password: true,
      },
    });
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    const level = user.level_id ? { id: user.level_id } : null;
    res.json({ ...user, level });
  } catch (err) {
    next(err);
  }
});

export default router;
