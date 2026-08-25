import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient, type User } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { env, resolveCalendarId } from "../config/env.js";
import { app } from "../index.js";

const realKeyPath = env.GOOGLE_CALENDAR_SA_KEY_PATH
  ? resolve(process.cwd(), env.GOOGLE_CALENDAR_SA_KEY_PATH)
  : null;
const hasCredentials = !!(
  env.GOOGLE_CALENDAR_SA_EMAIL &&
  env.GOOGLE_CALENDAR_SA_KEY_PATH &&
  resolveCalendarId() &&
  realKeyPath &&
  existsSync(realKeyPath)
);

describe.runIf(hasCredentials)("POST /api/v1/blocks calendar sync", () => {
  const prisma = new PrismaClient();

  let admin: User;
  let coach: User;
  let createdUserIds: string[] = [];

  function future(hoursFromNow: number): Date {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  }

  const tokenFor = (id: string, role: string): string =>
    jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: "1h" });

  beforeAll(async () => {
    admin = await prisma.user.create({
      data: {
        email: `blocks-int-admin-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Blocks Int Admin",
        phone: "+34 600 000 020",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    coach = await prisma.user.create({
      data: {
        email: `blocks-int-coach-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Blocks Int Coach",
        phone: "+34 600 000 021",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    createdUserIds = [admin.id, coach.id];
  });

  beforeEach(async () => {
    await prisma.block.deleteMany({ where: { created_by: { in: createdUserIds } } });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
  });

  afterAll(async () => {
    const blocks = await prisma.block.findMany({ where: { created_by: { in: createdUserIds } } });
    for (const block of blocks) {
      if (block.google_event_id) {
        await request(app)
          .delete(`/api/v1/blocks/${block.id}`)
          .set("Authorization", `Bearer ${tokenFor(admin.id, "ADMIN")}`);
      }
    }
    await prisma.block.deleteMany({ where: { created_by: { in: createdUserIds } } });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  it("creates a personal block with a matching Google Calendar event", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${tokenFor(coach.id, "COACH")}`)
      .send({
        blockType: "PERSONAL",
        startDateTime: future(24).toISOString(),
        endDateTime: future(120).toISOString(),
        description: "HTTP int block — safe to delete",
      });

    expect(res.status).toBe(201);
    const stored = await prisma.block.findUnique({ where: { id: res.body.id } });
    expect(stored?.google_event_id).not.toBeNull();

    await prisma.block.delete({ where: { id: res.body.id } });
  }, 30000);

  it("removes the Google event reference when a created block is canceled", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${tokenFor(coach.id, "COACH")}`)
      .send({
        blockType: "PERSONAL",
        startDateTime: future(120).toISOString(),
        endDateTime: future(168).toISOString(),
        description: "HTTP int block cancel — safe to delete",
      });

    expect(res.status).toBe(201);
    const eventId = (await prisma.block.findUnique({ where: { id: res.body.id } }))
      ?.google_event_id;
    expect(eventId).not.toBeNull();

    const cancelRes = await request(app)
      .delete(`/api/v1/blocks/${res.body.id}`)
      .set("Authorization", `Bearer ${tokenFor(coach.id, "COACH")}`);
    expect(cancelRes.status).toBe(200);

    const stored = await prisma.block.findUnique({ where: { id: res.body.id } });
    expect(stored?.status).toBe("CANCELED");
    expect(stored?.google_event_id).toBeNull();

    await prisma.block.delete({ where: { id: res.body.id } });
  }, 30000);
});
