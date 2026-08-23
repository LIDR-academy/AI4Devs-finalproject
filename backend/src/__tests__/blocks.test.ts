import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient, type User } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { env, resolveCalendarId } from "../config/env.js";
import { app } from "../index.js";

function token(id: string, role: string): string {
  return jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

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

describe("POST /api/v1/blocks (contract guards)", () => {
  const prisma = new PrismaClient();

  let admin: User;
  let coach: User;
  let coachee: User;
  let createdUserIds: string[] = [];

  function future(hoursFromNow: number): Date {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  }

  beforeAll(async () => {
    admin = await prisma.user.create({
      data: {
        email: `blocks-api-admin-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Blocks API Admin",
        phone: "+34 600 000 001",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    coach = await prisma.user.create({
      data: {
        email: `blocks-api-coach-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Blocks API Coach",
        phone: "+34 600 000 002",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    coachee = await prisma.user.create({
      data: {
        email: `blocks-api-coachee-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Blocks API Coachee",
        phone: "+34 600 000 003",
        role: "COACHEE",
        status: "ACTIVE",
      },
    });
    createdUserIds = [admin.id, coach.id, coachee.id];
  });

  beforeEach(async () => {
    await prisma.block.deleteMany({ where: { created_by: { in: createdUserIds } } });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
  });

  afterAll(async () => {
    await prisma.block.deleteMany({ where: { created_by: { in: createdUserIds } } });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  it("returns 400 when the body contains unknown fields (strict schema)", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
      .send({
        blockType: "PERSONAL",
        coachId: coach.id,
        startDateTime: future(24).toISOString(),
        endDateTime: future(120).toISOString(),
        unexpectedField: "should be rejected",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 when blockType is missing", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
      .send({
        coachId: coach.id,
        startDateTime: future(24).toISOString(),
        endDateTime: future(120).toISOString(),
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 when startDateTime is not an ISO datetime", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
      .send({
        blockType: "PERSONAL",
        coachId: coach.id,
        startDateTime: "not-a-date",
        endDateTime: future(120).toISOString(),
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 403 when the user is a Coachee", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(coachee.id, "COACHEE")}`)
      .send({
        blockType: "PERSONAL",
        coachId: coach.id,
        startDateTime: future(24).toISOString(),
        endDateTime: future(120).toISOString(),
      });
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });

  it("returns 403 when a Coachee lists blocks", async () => {
    const start = future(24).toISOString();
    const end = future(120).toISOString();
    const res = await request(app)
      .get(`/api/v1/blocks?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
      .set("Authorization", `Bearer ${token(coachee.id, "COACHEE")}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });

  it("returns 400 for GET /blocks without a start query param", async () => {
    const res = await request(app)
      .get(`/api/v1/blocks?end=${encodeURIComponent(future(120).toISOString())}`)
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 for GET /blocks without an end query param", async () => {
    const res = await request(app)
      .get(`/api/v1/blocks?start=${encodeURIComponent(future(24).toISOString())}`)
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 for GET /blocks with a malformed start", async () => {
    const res = await request(app)
      .get(`/api/v1/blocks?start=not-a-date&end=${encodeURIComponent(future(120).toISOString())}`)
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 for GET /blocks with an inverted range", async () => {
    const res = await request(app)
      .get(
        `/api/v1/blocks?start=${encodeURIComponent(future(120).toISOString())}&end=${encodeURIComponent(
          future(24).toISOString(),
        )}`,
      )
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 for GET /blocks with an invalid blockType", async () => {
    const res = await request(app)
      .get(
        `/api/v1/blocks?start=${encodeURIComponent(future(24).toISOString())}&end=${encodeURIComponent(
          future(120).toISOString(),
        )}&blockType=WEEKLY`,
      )
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 for GET /blocks with a non-UUID blockType filter", async () => {
    const res = await request(app)
      .get(
        `/api/v1/blocks?start=${encodeURIComponent(future(24).toISOString())}&end=${encodeURIComponent(
          future(120).toISOString(),
        )}&page=not-a-number`,
      )
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 403 when a Coachee tries to cancel a block", async () => {
    const res = await request(app)
      .delete(`/api/v1/blocks/${crypto.randomUUID()}`)
      .set("Authorization", `Bearer ${token(coachee.id, "COACHEE")}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });

  describe.runIf(!hasCredentials)("without calendar credentials", () => {
    it("returns 503 when the calendar service is not configured", async () => {
      const res = await request(app)
        .post("/api/v1/blocks")
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
        .send({
          blockType: "PERSONAL",
          coachId: coach.id,
          startDateTime: future(24).toISOString(),
          endDateTime: future(120).toISOString(),
        });
      expect(res.status).toBe(503);
      expect(res.body.error).toHaveProperty("code", "SERVICE_UNAVAILABLE");
    });
  });
});

describe.runIf(hasCredentials)("POST /api/v1/blocks personal branch", () => {
  const prisma = new PrismaClient();

  let admin: User;
  let coach: User;
  let otherCoach: User;
  let coachee: User;
  let inactiveCoach: User;
  let createdUserIds: string[] = [];
  let createdBlockIds: string[] = [];

  function future(hoursFromNow: number): Date {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  }

  beforeAll(async () => {
    admin = await prisma.user.create({
      data: {
        email: `blocks-api2-admin-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Blocks API2 Admin",
        phone: "+34 600 000 010",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    coach = await prisma.user.create({
      data: {
        email: `blocks-api2-coach-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Blocks API2 Coach",
        phone: "+34 600 000 011",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    otherCoach = await prisma.user.create({
      data: {
        email: `blocks-api2-coach2-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Blocks API2 Coach 2",
        phone: "+34 600 000 012",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    coachee = await prisma.user.create({
      data: {
        email: `blocks-api2-coachee-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Blocks API2 Coachee",
        phone: "+34 600 000 013",
        role: "COACHEE",
        status: "ACTIVE",
      },
    });
    inactiveCoach = await prisma.user.create({
      data: {
        email: `blocks-api2-inactive-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Blocks API2 Inactive",
        phone: "+34 600 000 014",
        role: "COACH",
        status: "INACTIVE",
      },
    });
    createdUserIds = [admin.id, coach.id, otherCoach.id, coachee.id, inactiveCoach.id];
  });

  beforeEach(async () => {
    await prisma.block.deleteMany({ where: { created_by: { in: createdUserIds } } });
    await prisma.trainingClass.deleteMany({
      where: { assigned_coach_id: { in: [coach.id, otherCoach.id] } },
    });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    createdBlockIds = [];
  });

  afterAll(async () => {
    await prisma.block.deleteMany({ where: { created_by: { in: createdUserIds } } });
    await prisma.trainingClass.deleteMany({
      where: { assigned_coach_id: { in: [coach.id, otherCoach.id] } },
    });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  it("creates a personal block for the actor coach (201)", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(coach.id, "COACH")}`)
      .send({
        blockType: "PERSONAL",
        startDateTime: future(24).toISOString(),
        endDateTime: future(120).toISOString(),
        description: "HTTP personal block",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      blockType: "PERSONAL",
      coach: { id: coach.id, name: coach.name },
      startTime: future(24).toISOString(),
      endTime: future(120).toISOString(),
      description: "HTTP personal block",
    });
    expect(res.body).toHaveProperty("id");
    expect(res.body.createdBy.id).toBe(coach.id);

    const stored = await prisma.block.findUnique({ where: { id: res.body.id } });
    expect(stored?.status).toBe("ACTIVE");
    expect(stored?.google_event_id).not.toBeNull();
    createdBlockIds.push(res.body.id);

    await prisma.block.deleteMany({ where: { id: { in: createdBlockIds } } });
    createdBlockIds = [];
  });

  it("creates a personal block as an Admin for another coach (201)", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
      .send({
        blockType: "PERSONAL",
        coachId: otherCoach.id,
        startDateTime: future(24).toISOString(),
        endDateTime: future(120).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.coach).toEqual({ id: otherCoach.id, name: otherCoach.name });
    createdBlockIds.push(res.body.id);

    await prisma.block.deleteMany({ where: { id: { in: createdBlockIds } } });
    createdBlockIds = [];
  });

  it("returns 403 when a COACH creates a personal block for another coach", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(coach.id, "COACH")}`)
      .send({
        blockType: "PERSONAL",
        coachId: otherCoach.id,
        startDateTime: future(24).toISOString(),
        endDateTime: future(120).toISOString(),
      });
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });

  it("returns 404 when the personal target coach does not exist", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
      .send({
        blockType: "PERSONAL",
        coachId: "00000000-0000-0000-0000-000000000000",
        startDateTime: future(24).toISOString(),
        endDateTime: future(120).toISOString(),
      });
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("returns 404 when the personal target coach is inactive", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
      .send({
        blockType: "PERSONAL",
        coachId: inactiveCoach.id,
        startDateTime: future(24).toISOString(),
        endDateTime: future(120).toISOString(),
      });
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("returns 400 for a misaligned window", async () => {
    const start = future(24);
    start.setUTCMinutes(30, 0, 0);
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
      .send({
        blockType: "PERSONAL",
        coachId: coach.id,
        startDateTime: start.toISOString(),
        endDateTime: future(120).toISOString(),
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 for a past start", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
      .send({
        blockType: "PERSONAL",
        coachId: coach.id,
        startDateTime: future(-24).toISOString(),
        endDateTime: future(120).toISOString(),
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 409 when the window overlaps an existing class of the target coach", async () => {
    const start = future(24);
    await prisma.trainingClass.create({
      data: {
        class_type: "INDIVIDUAL",
        assigned_coach_id: coach.id,
        level_id: null,
        start_time: new Date(start.getTime() + 60 * 60 * 1000),
        duration_minutes: 60,
        status: "ACTIVE",
        description: null,
        google_event_id: `cal-${crypto.randomUUID()}`,
        created_by: coach.id,
      },
    });

    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
      .send({
        blockType: "PERSONAL",
        coachId: coach.id,
        startDateTime: start.toISOString(),
        endDateTime: future(120).toISOString(),
      });
    expect(res.status).toBe(409);
    expect(res.body.error).toHaveProperty("code", "OVERLAP_DETECTED");
  });

  it("returns 409 when the window overlaps an existing block of the target coach", async () => {
    const start = future(24);
    const existing = await prisma.block.create({
      data: {
        block_type: "PERSONAL",
        coach_id: coach.id,
        start_time: new Date(start.getTime() + 60 * 60 * 1000),
        end_time: new Date(start.getTime() + 120 * 60 * 1000),
        status: "ACTIVE",
        description: null,
        google_event_id: `cal-${crypto.randomUUID()}`,
        created_by: otherCoach.id,
      },
    });
    createdBlockIds.push(existing.id);

    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
      .send({
        blockType: "PERSONAL",
        coachId: coach.id,
        startDateTime: start.toISOString(),
        endDateTime: future(120).toISOString(),
      });
    expect(res.status).toBe(409);
    expect(res.body.error).toHaveProperty("code", "OVERLAP_DETECTED");

    await prisma.block.deleteMany({ where: { id: { in: createdBlockIds } } });
    createdBlockIds = [];
  });

  it("creates a gym-wide block as an Admin (201)", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
      .send({
        blockType: "GYM_WIDE",
        startDateTime: future(24).toISOString(),
        endDateTime: future(120).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      blockType: "GYM_WIDE",
      coach: null,
      startTime: future(24).toISOString(),
      endTime: future(120).toISOString(),
    });
    createdBlockIds.push(res.body.id);

    await prisma.block.deleteMany({ where: { id: { in: createdBlockIds } } });
    createdBlockIds = [];
  });

  it("returns 403 when a COACH creates a gym-wide block", async () => {
    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(coach.id, "COACH")}`)
      .send({
        blockType: "GYM_WIDE",
        startDateTime: future(24).toISOString(),
        endDateTime: future(120).toISOString(),
      });
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });

  it("returns 409 when a gym-wide block overlaps any class", async () => {
    const start = future(24);
    await prisma.trainingClass.create({
      data: {
        class_type: "INDIVIDUAL",
        assigned_coach_id: coach.id,
        level_id: null,
        start_time: new Date(start.getTime() + 60 * 60 * 1000),
        duration_minutes: 60,
        status: "ACTIVE",
        description: null,
        google_event_id: `cal-${crypto.randomUUID()}`,
        created_by: coach.id,
      },
    });

    const res = await request(app)
      .post("/api/v1/blocks")
      .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
      .send({
        blockType: "GYM_WIDE",
        startDateTime: start.toISOString(),
        endDateTime: future(120).toISOString(),
      });
    expect(res.status).toBe(409);
    expect(res.body.error).toHaveProperty("code", "OVERLAP_DETECTED");
  });

  describe("GET /blocks", () => {
    function seedBlock(overrides: {
      blockType?: "PERSONAL" | "GYM_WIDE";
      coachId?: string | null;
      startTime?: Date;
      endTime?: Date;
      status?: "ACTIVE" | "CANCELED";
      createdBy?: string;
    }): Promise<string> {
      return prisma.block
        .create({
          data: {
            block_type: overrides.blockType ?? "PERSONAL",
            coach_id: overrides.coachId ?? undefined,
            start_time: overrides.startTime ?? future(24),
            end_time: overrides.endTime ?? future(120),
            status: overrides.status ?? "ACTIVE",
            description: null,
            google_event_id: `cal-${crypto.randomUUID()}`,
            created_by: overrides.createdBy ?? coach.id,
          },
        })
        .then((block) => {
          createdBlockIds.push(block.id);
          return block.id;
        });
    }

    it("returns only ACTIVE blocks overlapping the range, ordered by start_time", async () => {
      const windowStart = future(24);
      const overlap = await seedBlock({ startTime: windowStart, endTime: future(120) });
      await seedBlock({
        startTime: future(240),
        endTime: future(360),
      });

      const res = await request(app)
        .get(
          `/api/v1/blocks?start=${encodeURIComponent(
            future(-1).toISOString(),
          )}&end=${encodeURIComponent(future(168).toISOString())}`,
        )
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);

      expect(res.status).toBe(200);
      expect(res.body.data.map((b: { id: string }) => b.id)).toEqual([overlap]);
      expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 20, totalPages: 1 });
    });

    it("excludes blocks ending before the range start", async () => {
      await seedBlock({ startTime: future(0), endTime: future(12) });

      const res = await request(app)
        .get(
          `/api/v1/blocks?start=${encodeURIComponent(
            future(24).toISOString(),
          )}&end=${encodeURIComponent(future(120).toISOString())}`,
        )
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it("excludes blocks starting after the range end", async () => {
      await seedBlock({ startTime: future(240), endTime: future(360) });

      const res = await request(app)
        .get(
          `/api/v1/blocks?start=${encodeURIComponent(
            future(24).toISOString(),
          )}&end=${encodeURIComponent(future(120).toISOString())}`,
        )
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it("never returns canceled blocks", async () => {
      await seedBlock({
        startTime: future(24),
        endTime: future(120),
        status: "CANCELED",
      });

      const res = await request(app)
        .get(
          `/api/v1/blocks?start=${encodeURIComponent(
            future(-1).toISOString(),
          )}&end=${encodeURIComponent(future(168).toISOString())}`,
        )
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it("filters by blockType", async () => {
      const personal = await seedBlock({
        blockType: "PERSONAL",
        coachId: coach.id,
        startTime: future(24),
        endTime: future(120),
      });
      await seedBlock({ blockType: "GYM_WIDE", startTime: future(24), endTime: future(120) });

      const res = await request(app)
        .get(
          `/api/v1/blocks?start=${encodeURIComponent(
            future(-1).toISOString(),
          )}&end=${encodeURIComponent(future(168).toISOString())}&blockType=PERSONAL`,
        )
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);

      expect(res.status).toBe(200);
      expect(res.body.data.map((b: { id: string }) => b.id)).toEqual([personal]);
    });

    it("returns the same set for a Coach as for an Admin", async () => {
      await seedBlock({ blockType: "GYM_WIDE", startTime: future(24), endTime: future(120) });

      const adminRes = await request(app)
        .get(
          `/api/v1/blocks?start=${encodeURIComponent(
            future(-1).toISOString(),
          )}&end=${encodeURIComponent(future(168).toISOString())}`,
        )
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);
      const coachRes = await request(app)
        .get(
          `/api/v1/blocks?start=${encodeURIComponent(
            future(-1).toISOString(),
          )}&end=${encodeURIComponent(future(168).toISOString())}`,
        )
        .set("Authorization", `Bearer ${token(coach.id, "COACH")}`);

      expect(coachRes.status).toBe(200);
      expect(coachRes.body.data).toEqual(adminRes.body.data);
      expect(coachRes.body.meta).toEqual(adminRes.body.meta);
    });

    it("reports accurate pagination meta with limit", async () => {
      const first = await seedBlock({ startTime: future(24), endTime: future(120) });
      await seedBlock({
        blockType: "GYM_WIDE",
        startTime: future(26),
        endTime: future(120),
      });

      const res = await request(app)
        .get(
          `/api/v1/blocks?start=${encodeURIComponent(
            future(-1).toISOString(),
          )}&end=${encodeURIComponent(future(168).toISOString())}&page=1&limit=1`,
        )
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe(first);
      expect(res.body.meta).toEqual({ page: 1, limit: 1, total: 2, totalPages: 2 });
    });
  });

  describe("DELETE /blocks/:id", () => {
    it("soft-cancels a block and returns { id, status: CANCELED }", async () => {
      const created = await request(app)
        .post("/api/v1/blocks")
        .set("Authorization", `Bearer ${token(coach.id, "COACH")}`)
        .send({
          blockType: "PERSONAL",
          startDateTime: future(48).toISOString(),
          endDateTime: future(120).toISOString(),
        });
      expect(created.status).toBe(201);
      createdBlockIds.push(created.body.id);

      const res = await request(app)
        .delete(`/api/v1/blocks/${created.body.id}`)
        .set("Authorization", `Bearer ${token(coach.id, "COACH")}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: created.body.id, status: "CANCELED" });

      const stored = await prisma.block.findUnique({ where: { id: created.body.id } });
      expect(stored?.status).toBe("CANCELED");
      expect(stored?.google_event_id).toBeNull();

      await prisma.block.deleteMany({ where: { id: { in: createdBlockIds } } });
      createdBlockIds = [];
    });

    it("returns 403 for a coach canceling another coach's personal block", async () => {
      const created = await request(app)
        .post("/api/v1/blocks")
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
        .send({
          blockType: "PERSONAL",
          coachId: otherCoach.id,
          startDateTime: future(48).toISOString(),
          endDateTime: future(120).toISOString(),
        });
      expect(created.status).toBe(201);
      createdBlockIds.push(created.body.id);

      const res = await request(app)
        .delete(`/api/v1/blocks/${created.body.id}`)
        .set("Authorization", `Bearer ${token(coach.id, "COACH")}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toHaveProperty("code", "FORBIDDEN");

      await prisma.block.deleteMany({ where: { id: { in: createdBlockIds } } });
      createdBlockIds = [];
    });

    it("returns 403 for a coach canceling a gym-wide block", async () => {
      const created = await request(app)
        .post("/api/v1/blocks")
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
        .send({
          blockType: "GYM_WIDE",
          startDateTime: future(48).toISOString(),
          endDateTime: future(120).toISOString(),
        });
      expect(created.status).toBe(201);
      createdBlockIds.push(created.body.id);

      const res = await request(app)
        .delete(`/api/v1/blocks/${created.body.id}`)
        .set("Authorization", `Bearer ${token(coach.id, "COACH")}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toHaveProperty("code", "FORBIDDEN");

      await prisma.block.deleteMany({ where: { id: { in: createdBlockIds } } });
      createdBlockIds = [];
    });

    it("returns 404 for a non-existent block", async () => {
      const res = await request(app)
        .delete("/api/v1/blocks/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
    });

    it("returns 409 for an already-canceled block", async () => {
      const created = await request(app)
        .post("/api/v1/blocks")
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`)
        .send({
          blockType: "PERSONAL",
          coachId: coach.id,
          startDateTime: future(48).toISOString(),
          endDateTime: future(120).toISOString(),
        });
      expect(created.status).toBe(201);
      createdBlockIds.push(created.body.id);

      const first = await request(app)
        .delete(`/api/v1/blocks/${created.body.id}`)
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);
      expect(first.status).toBe(200);

      const second = await request(app)
        .delete(`/api/v1/blocks/${created.body.id}`)
        .set("Authorization", `Bearer ${token(admin.id, "ADMIN")}`);
      expect(second.status).toBe(409);
      expect(second.body.error).toHaveProperty("code", "CONFLICT");

      await prisma.block.deleteMany({ where: { id: { in: createdBlockIds } } });
      createdBlockIds = [];
    });
  });
});
