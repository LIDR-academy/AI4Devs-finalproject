import { PrismaClient, UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { env } from "../config/env.js";
import { app } from "../index.js";

const prisma = new PrismaClient();

function token(role: string, userId: string): string {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

let adminId: string;
let coacheeId: string;
let adminT: string;
let coacheeT: string;

const longToken = "A".repeat(64);

beforeAll(async () => {
  const admin = await prisma.user.create({
    data: {
      email: `test-admin-${crypto.randomUUID()}@test.com`,
      password_hash: "not-used",
      name: "Test Admin",
      phone: "+34 600 000 000",
      role: UserRole.ADMIN,
    },
  });
  adminId = admin.id;
  adminT = token("ADMIN", adminId);

  const coachee = await prisma.user.create({
    data: {
      email: `test-coachee-${crypto.randomUUID()}@test.com`,
      password_hash: "not-used",
      name: "Test Coachee",
      phone: "+34 600 000 001",
      role: UserRole.COACHEE,
    },
  });
  coacheeId = coachee.id;
  coacheeT = token("COACHEE", coacheeId);
});

afterAll(async () => {
  if (adminId) {
    await prisma.deviceToken.deleteMany({ where: { user_id: adminId } });
    await prisma.user.delete({ where: { id: adminId } });
  }
  if (coacheeId) {
    await prisma.deviceToken.deleteMany({ where: { user_id: coacheeId } });
    await prisma.user.delete({ where: { id: coacheeId } });
  }
  await prisma.$disconnect();
});

describe("POST /api/v1/notifications/device-token", () => {
  it("returns 200 with resource on valid token", async () => {
    const res = await request(app)
      .post("/api/v1/notifications/device-token")
      .set("Authorization", `Bearer ${adminT}`)
      .send({ token: longToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("platform", "WEB");
    expect(res.body).toHaveProperty("createdAt");
  });

  it("is idempotent — same token same user returns 200 with same id", async () => {
    const res1 = await request(app)
      .post("/api/v1/notifications/device-token")
      .set("Authorization", `Bearer ${adminT}`)
      .send({ token: longToken });

    expect(res1.status).toBe(200);

    const res2 = await request(app)
      .post("/api/v1/notifications/device-token")
      .set("Authorization", `Bearer ${adminT}`)
      .send({ token: longToken });

    expect(res2.status).toBe(200);
    expect(res2.body.id).toBe(res1.body.id);
  });

  it("reassigns same token to a different user (latecomer wins)", async () => {
    const differentUserToken = token("COACHEE", coacheeId);
    const res = await request(app)
      .post("/api/v1/notifications/device-token")
      .set("Authorization", `Bearer ${differentUserToken}`)
      .send({ token: longToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
  });

  it("returns 400 on short token", async () => {
    const res = await request(app)
      .post("/api/v1/notifications/device-token")
      .set("Authorization", `Bearer ${coacheeT}`)
      .send({ token: "short" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 on unknown fields (strict mode)", async () => {
    const res = await request(app)
      .post("/api/v1/notifications/device-token")
      .set("Authorization", `Bearer ${coacheeT}`)
      .send({ token: longToken, unknown: "field" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 401 on malformed authorization header", async () => {
    const res = await request(app)
      .post("/api/v1/notifications/device-token")
      .set("Authorization", "Bearer INVALID_SIGNATURE")
      .send({ token: longToken });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "UNAUTHORIZED");
  });
});
