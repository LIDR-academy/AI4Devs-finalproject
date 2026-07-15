import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { env } from "../config/env.js";
import { app } from "../index.js";

const prisma = new PrismaClient();

function token(role: string): string {
  return jwt.sign({ id: crypto.randomUUID(), role }, env.JWT_SECRET, { expiresIn: "1h" });
}

describe("POST /api/v1/auth/login — mustChangePassword", () => {
  it("includes mustChangePassword in the login response", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "admin@coacher.com",
      password: "Admin123!",
    });
    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty("mustChangePassword");
  });
});

describe("POST /api/v1/auth/change-password", () => {
  it("returns 401 without auth token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/change-password")
      .send({ currentPassword: "test", newPassword: "newpass123" });
    expect(res.status).toBe(401);
  });

  it("returns 400 with missing fields", async () => {
    const res = await request(app)
      .post("/api/v1/auth/change-password")
      .set("Authorization", `Bearer ${token("ADMIN")}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 with short new password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/change-password")
      .set("Authorization", `Bearer ${token("ADMIN")}`)
      .send({ currentPassword: "test", newPassword: "ab" });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 401 with wrong current password", async () => {
    const user = await prisma.user.findFirst({ where: { email: "admin@coacher.com" } });
    if (!user) throw new Error("Admin user not found");
    const adminToken = jwt.sign({ id: user.id, role: "ADMIN" }, env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .post("/api/v1/auth/change-password")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ currentPassword: "wrongpassword", newPassword: "NewPass123!" });
    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty("code", "UNAUTHORIZED");
  });

  it("changes password successfully (happy path)", async () => {
    const email = `change-pw-${Date.now()}@example.com`;
    const phone = "+34 600 555 666";
    const adminTokenVal = token("ADMIN");

    await request(app)
      .post("/api/v1/coachees")
      .set("Authorization", `Bearer ${adminTokenVal}`)
      .send({ name: "Change PW Test", email, phone, classTypePreference: "INDIVIDUAL" });

    const loginRes = await request(app).post("/api/v1/auth/login").send({ email, password: phone });
    expect(loginRes.status).toBe(200);

    const changeRes = await request(app)
      .post("/api/v1/auth/change-password")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ currentPassword: phone, newPassword: "MyNewPass123!" });
    expect(changeRes.status).toBe(200);
    expect(changeRes.body).toHaveProperty("message", "Password changed successfully");

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user?.must_change_password).toBe(false);

    const oldLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: phone });
    expect(oldLoginRes.status).toBe(401);

    const newLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: "MyNewPass123!" });
    expect(newLoginRes.status).toBe(200);
    expect(newLoginRes.body.user.mustChangePassword).toBe(false);
  });
});
