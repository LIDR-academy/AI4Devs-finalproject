import { PrismaClient, type UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { env } from "../config/env.js";
import { app } from "../index.js";

function token(userId: string, role: string): string {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

function futureHour(hours: number): Date {
  const d = new Date();
  d.setUTCHours(d.getUTCHours() + hours);
  d.setUTCMinutes(0, 0, 0);
  return d;
}

describe("GET /api/v1/coachee/dashboard", () => {
  const prisma = new PrismaClient();
  const createdUserIds: string[] = [];
  const createdClassIds: string[] = [];

  let levelOkId: string;
  let farLevelId: string;
  let coachId: string;
  let adminId: string;

  let coacheeHappyId: string;
  let coacheeNoNextId: string;
  let coacheeNoLevelId: string;
  let coacheeZeroWlId: string;
  let coacheeDiscoverId: string;
  let coacheeLeaveId: string;

  let nextHappyId: string;
  let joinHappyId: string;
  let nextZeroWlId: string;

  let wlAppearId: string;
  let wlJoinId: string;
  let wlEnrolledFullId: string;
  let wlWaitlistedFullId: string;
  let wlListFullId: string;
  let wlFarId: string;
  let wlCanceledId: string;
  let wlIndividualId: string;

  async function makeLevel(name: string, sortOrder: number): Promise<string> {
    const level = await prisma.level.create({
      data: { name, color: "#123456", sort_order: sortOrder },
    });
    return level.id;
  }

  async function makeUser(name: string, role: string, levelId: string | null): Promise<string> {
    const user = await prisma.user.create({
      data: {
        email: `${name}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}@example.com`,
        password_hash: "not-used",
        name,
        phone: "+34 600 000 222",
        role: role as UserRole,
        status: "ACTIVE",
        level_id: levelId,
      },
    });
    createdUserIds.push(user.id);
    return user.id;
  }

  async function makeClass(options: {
    classType: "INDIVIDUAL" | "GROUP";
    levelId: string | null;
    start: Date;
    status?: "ACTIVE" | "CANCELED";
    enrolled?: string[];
    waiting?: string[];
  }): Promise<string> {
    const trainingClass = await prisma.trainingClass.create({
      data: {
        class_type: options.classType,
        assigned_coach_id: coachId,
        level_id: options.levelId,
        start_time: options.start,
        duration_minutes: 60,
        status: options.status ?? "ACTIVE",
        description: null,
        created_by: coachId,
      },
    });
    createdClassIds.push(trainingClass.id);
    if (options.enrolled && options.enrolled.length > 0) {
      await prisma.classEnrollment.createMany({
        data: options.enrolled.map((coacheeId) => ({
          class_id: trainingClass.id,
          coachee_id: coacheeId,
        })),
      });
    }
    if (options.waiting && options.waiting.length > 0) {
      await prisma.waitingList.createMany({
        data: options.waiting.map((coacheeId) => ({
          class_id: trainingClass.id,
          coachee_id: coacheeId,
        })),
      });
    }
    return trainingClass.id;
  }

  beforeAll(async () => {
    levelOkId = await makeLevel(`dash-ok-${Date.now()}`, 3);
    farLevelId = await makeLevel(`dash-far-${Date.now()}`, 6);
    coachId = await makeUser("Dash Coach", "COACH", null);
    adminId = await makeUser("Dash Admin", "ADMIN", null);

    coacheeHappyId = await makeUser("Dash Happy", "COACHEE", levelOkId);
    coacheeNoNextId = await makeUser("Dash NoNext", "COACHEE", levelOkId);
    coacheeNoLevelId = await makeUser("Dash NoLevel", "COACHEE", null);
    coacheeZeroWlId = await makeUser("Dash ZeroWl", "COACHEE", levelOkId);
    coacheeDiscoverId = await makeUser("Dash Discover", "COACHEE", levelOkId);
    coacheeLeaveId = await makeUser("Dash Leave", "COACHEE", levelOkId);

    const fillerOne = await makeUser("Dash Filler One", "COACHEE", levelOkId);
    const fillerTwo = await makeUser("Dash Filler Two", "COACHEE", levelOkId);
    const fillerThree = await makeUser("Dash Filler Three", "COACHEE", levelOkId);
    const fillerFour = await makeUser("Dash Filler Four", "COACHEE", levelOkId);
    const fillerFive = await makeUser("Dash Filler Five", "COACHEE", levelOkId);

    // Happy scenario: next class + a joinable open group + one active waiting list
    nextHappyId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(24),
      enrolled: [coacheeHappyId],
    });
    joinHappyId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(36),
      enrolled: [fillerOne, fillerTwo],
    });
    await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(48),
      waiting: [coacheeHappyId],
    });

    // No-next scenario: only a past ACTIVE enrollment
    await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(-2),
      enrolled: [coacheeNoNextId],
    });
    await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(30),
      waiting: [coacheeNoNextId],
    });

    // Zero-waiting-list scenario: has a next class, no waiting list at all
    nextZeroWlId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(24),
      enrolled: [coacheeZeroWlId],
    });

    // Discovery scenarios (US1-014): full in-reach groups with free/list-full slots, exclusions
    wlAppearId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(60),
      enrolled: [fillerOne, fillerTwo, fillerThree, fillerFour],
    });
    wlJoinId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(54),
      enrolled: [fillerOne, fillerTwo, fillerThree, fillerFive],
      waiting: [coacheeLeaveId],
    });
    wlEnrolledFullId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(66),
      enrolled: [coacheeDiscoverId, fillerOne, fillerTwo, fillerThree],
    });
    wlWaitlistedFullId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(72),
      enrolled: [fillerOne, fillerTwo, fillerThree, fillerFour],
      waiting: [coacheeDiscoverId],
    });
    wlListFullId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(78),
      enrolled: [fillerOne, fillerTwo, fillerThree, fillerFour],
      waiting: [fillerOne, fillerTwo, fillerThree, fillerFour],
    });
    wlFarId = await makeClass({
      classType: "GROUP",
      levelId: farLevelId,
      start: futureHour(84),
      enrolled: [fillerOne, fillerTwo, fillerThree, fillerFour],
    });
    wlCanceledId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(90),
      status: "CANCELED",
      enrolled: [fillerOne, fillerTwo, fillerThree, fillerFour],
    });
    wlIndividualId = await makeClass({
      classType: "INDIVIDUAL",
      levelId: levelOkId,
      start: futureHour(96),
      enrolled: [fillerOne],
    });
  });

  afterAll(async () => {
    if (createdClassIds.length > 0) {
      await prisma.classEnrollment.deleteMany({ where: { class_id: { in: createdClassIds } } });
      await prisma.waitingList.deleteMany({ where: { class_id: { in: createdClassIds } } });
      await prisma.trainingClass.deleteMany({ where: { id: { in: createdClassIds } } });
    }
    await prisma.notification.deleteMany({ where: { recipient_id: { in: createdUserIds } } });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.level.deleteMany({ where: { id: { in: [levelOkId, farLevelId] } } });
    await prisma.$disconnect();
  });

  it("returns the full documented dashboard shape for a Coachee", async () => {
    const res = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(coacheeHappyId, "COACHEE")}`);

    expect(res.status).toBe(200);
    expect(res.body.nextClass).toMatchObject({
      id: nextHappyId,
      classType: "GROUP",
      status: "ACTIVE",
    });
    expect(new Date(res.body.nextClass.startTime).getTime()).not.toBeNaN();
    expect(res.body.nextClass.assignedCoach).toMatchObject({ id: coachId });
    expect(res.body.nextClass.assignedCoach.name).toBeTruthy();
    expect(res.body.nextClass.level).toMatchObject({ id: levelOkId });

    expect(Array.isArray(res.body.joinableClasses)).toBe(true);
    const joinEntry = res.body.joinableClasses.find((c: { id: string }) => c.id === joinHappyId);
    expect(joinEntry).toBeTruthy();
    expect(joinEntry).toMatchObject({
      id: joinHappyId,
      classType: "GROUP",
      enrollmentCount: 2,
      capacity: 4,
      isWithinReach: true,
      hasOpenSpots: true,
    });
    expect(joinEntry.assignedCoach).toMatchObject({ id: coachId });
    expect(joinEntry.level).toMatchObject({ id: levelOkId });

    expect(res.body.activeWaitingListCount).toBe(1);

    expect(Array.isArray(res.body.waitlistEligibleClasses)).toBe(true);
  });

  it("returns nextClass null when the Coachee has no upcoming scheduled class", async () => {
    const res = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(coacheeNoNextId, "COACHEE")}`);

    expect(res.status).toBe(200);
    expect(res.body.nextClass).toBeNull();
    expect(Array.isArray(res.body.joinableClasses)).toBe(true);
    expect(res.body.joinableClasses.length).toBeGreaterThan(0);
    expect(res.body.activeWaitingListCount).toBe(1);
  });

  it("returns an empty joinable list for a Coachee without a level", async () => {
    const res = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(coacheeNoLevelId, "COACHEE")}`);

    expect(res.status).toBe(200);
    expect(res.body.nextClass).toBeNull();
    expect(res.body.joinableClasses).toEqual([]);
    expect(res.body.waitlistEligibleClasses).toEqual([]);
  });

  it("returns zero for the active waiting-list count when the Coachee has no waiting lists", async () => {
    const res = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(coacheeZeroWlId, "COACHEE")}`);

    expect(res.status).toBe(200);
    expect(res.body.nextClass).toMatchObject({ id: nextZeroWlId });
    expect(res.body.activeWaitingListCount).toBe(0);
  });

  it("rejects a Coach with 403 FORBIDDEN", async () => {
    const res = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(coachId, "COACH")}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects an Admin with 403 FORBIDDEN", async () => {
    const res = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(adminId, "ADMIN")}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects an invalid token with 401 UNAUTHORIZED", async () => {
    const res = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", "Bearer not-a-valid-token");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("lists eligible full group classes in waitlistEligibleClasses with the exact documented shape", async () => {
    const res = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(coacheeDiscoverId, "COACHEE")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.waitlistEligibleClasses)).toBe(true);
    const appear = res.body.waitlistEligibleClasses.find(
      (c: { id: string }) => c.id === wlAppearId,
    );
    expect(appear).toBeTruthy();
    expect(Object.keys(appear).sort()).toEqual(
      [
        "assignedCoach",
        "capacity",
        "classType",
        "enrollmentCount",
        "id",
        "isOnWaitingList",
        "isWithinReach",
        "level",
        "startTime",
      ].sort(),
    );
    expect(appear).toMatchObject({
      id: wlAppearId,
      classType: "GROUP",
      enrollmentCount: 4,
      capacity: 4,
      isWithinReach: true,
      isOnWaitingList: false,
    });
    expect(new Date(appear.startTime).getTime()).not.toBeNaN();
    expect(appear.assignedCoach).toMatchObject({ id: coachId });
    expect(appear.assignedCoach.name).toBeTruthy();
    expect(appear.level).toMatchObject({ id: levelOkId });
    const serialized = JSON.stringify(appear);
    expect(serialized.toLowerCase()).not.toMatch(/coachee|position|waitingListCount|joinedAt/);
  });

  it("excludes ineligible classes and stays mutually exclusive with joinableClasses", async () => {
    const res = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(coacheeDiscoverId, "COACHEE")}`);

    expect(res.status).toBe(200);
    const wlIds = res.body.waitlistEligibleClasses.map((c: { id: string }) => c.id);
    const joinIds = res.body.joinableClasses.map((c: { id: string }) => c.id);

    expect(wlIds).not.toContain(wlEnrolledFullId);
    expect(wlIds).not.toContain(wlWaitlistedFullId);
    expect(wlIds).not.toContain(wlListFullId);
    expect(wlIds).not.toContain(wlFarId);
    expect(wlIds).not.toContain(wlCanceledId);
    expect(wlIds).not.toContain(wlIndividualId);

    expect(wlIds).not.toContain(joinHappyId);
    expect(joinIds).toContain(joinHappyId);
    expect(joinIds).not.toContain(wlAppearId);
    expect(wlIds).toContain(wlAppearId);
  });

  it("orders waitlistEligibleClasses ascending by startTime", async () => {
    const res = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(coacheeDiscoverId, "COACHEE")}`);

    expect(res.status).toBe(200);
    const ids = res.body.waitlistEligibleClasses.map((c: { id: string }) => c.id);
    expect(ids).toContain(wlAppearId);
    expect(ids).toContain(wlJoinId);
    const times = res.body.waitlistEligibleClasses.map((c: { startTime: string }) =>
      new Date(c.startTime).getTime(),
    );
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("removes a class from discovery after a successful join and refuses a duplicate", async () => {
    const before = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(coacheeDiscoverId, "COACHEE")}`);
    const beforeCount = before.body.activeWaitingListCount;
    expect(before.body.waitlistEligibleClasses.map((c: { id: string }) => c.id)).toContain(
      wlJoinId,
    );

    const join = await request(app)
      .post(`/api/v1/classes/${wlJoinId}/waiting-list`)
      .set("Authorization", `Bearer ${token(coacheeDiscoverId, "COACHEE")}`);
    expect(join.status).toBe(201);

    const after = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(coacheeDiscoverId, "COACHEE")}`);
    expect(after.body.waitlistEligibleClasses.map((c: { id: string }) => c.id)).not.toContain(
      wlJoinId,
    );
    expect(after.body.joinableClasses.map((c: { id: string }) => c.id)).not.toContain(wlJoinId);
    expect(after.body.activeWaitingListCount).toBe(beforeCount + 1);

    const again = await request(app)
      .post(`/api/v1/classes/${wlJoinId}/waiting-list`)
      .set("Authorization", `Bearer ${token(coacheeDiscoverId, "COACHEE")}`);
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe("ALREADY_ON_WAITING_LIST");
  });

  it("brings a class back into discovery after leaving its waiting list", async () => {
    const before = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(coacheeLeaveId, "COACHEE")}`);
    expect(before.body.waitlistEligibleClasses.map((c: { id: string }) => c.id)).not.toContain(
      wlJoinId,
    );
    const beforeCount = before.body.activeWaitingListCount;

    const leave = await request(app)
      .delete(`/api/v1/classes/${wlJoinId}/waiting-list`)
      .set("Authorization", `Bearer ${token(coacheeLeaveId, "COACHEE")}`);
    expect(leave.status).toBe(200);

    const after = await request(app)
      .get("/api/v1/coachee/dashboard")
      .set("Authorization", `Bearer ${token(coacheeLeaveId, "COACHEE")}`);
    expect(after.body.waitlistEligibleClasses.map((c: { id: string }) => c.id)).toContain(wlJoinId);
    expect(after.body.activeWaitingListCount).toBe(beforeCount - 1);
  });
});
