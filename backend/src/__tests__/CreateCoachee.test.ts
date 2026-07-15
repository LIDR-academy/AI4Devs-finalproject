import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { env } from "../config/env.js";
import { app } from "../index.js";

function adminToken(): string {
  return jwt.sign({ id: crypto.randomUUID(), role: "ADMIN" }, env.JWT_SECRET, { expiresIn: "1h" });
}

const token = adminToken();

describe("CreateCoachee — password = phone", () => {
  it("creates a coachee whose password is their phone number", async () => {
    const email = `phone-pw-${Date.now()}@example.com`;
    const phone = "+34 600 111 222";

    const res = await request(app)
      .post("/api/v1/coachees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Phone Password Test",
        email,
        phone,
        classTypePreference: "INDIVIDUAL",
      });
    expect(res.status).toBe(201);

    const loginRes = await request(app).post("/api/v1/auth/login").send({ email, password: phone });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("accessToken");
    expect(loginRes.body).toHaveProperty("refreshToken");
  });

  it("returns 400 when phone is missing", async () => {
    const res = await request(app)
      .post("/api/v1/coachees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "No Phone Test",
        email: `no-phone-${Date.now()}@example.com`,
        classTypePreference: "GROUP",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("sets must_change_password to true for new coachees", async () => {
    const email = `must-change-${Date.now()}@example.com`;
    const phone = "+34 600 333 444";

    await request(app).post("/api/v1/coachees").set("Authorization", `Bearer ${token}`).send({
      name: "Must Change Test",
      email,
      phone,
      classTypePreference: "BOTH",
    });

    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({ where: { email } });
    await prisma.$disconnect();
    expect(user).not.toBeNull();
    expect(user?.must_change_password).toBe(true);
  });
});
