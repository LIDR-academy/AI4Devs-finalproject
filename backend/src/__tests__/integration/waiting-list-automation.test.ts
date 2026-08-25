import { PrismaClient, type UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { env } from "../../config/env.js";
import { app } from "../../index.js";

function token(userId: string, role: string): string {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

describe("Waiting List Automation", () => {
  const prisma = new PrismaClient();
  const createdUserIds: string[] = [];
  const createdClassIds: string[] = [];

  let levelId: string;
  let coachId: string;
  let coacheeEnrolled: string;
  let coacheeWaiting1: string;
  let coacheeWaiting2: string;
  let coacheeExtra1: string;
  let coacheeExtra2: string;

  let claimClassId: string;
  let claimTakenClassId: string;
  let claimCanceledClassId: string;
  let claimNotOnListClassId: string;
  let claimAlreadyEnrolledClassId: string;

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
        phone: "+34 600 000 501",
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
    enrolled: string[];
    waitingList?: string[];
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
    if (options.enrolled.length > 0) {
      await prisma.classEnrollment.createMany({
        data: options.enrolled.map((coacheeId) => ({
          class_id: trainingClass.id,
          coachee_id: coacheeId,
        })),
      });
    }
    for (const coacheeId of options.waitingList ?? []) {
      await prisma.waitingList.create({
        data: { class_id: trainingClass.id, coachee_id: coacheeId },
      });
    }
    return trainingClass.id;
  }

  const futureHour = (hoursFromNow: number): Date => {
    const d = new Date();
    d.setHours(d.getHours() + hoursFromNow, 0, 0, 0);
    return d;
  };

  beforeAll(async () => {
    levelId = await makeLevel(`WL-Auto Level ${Date.now()}`, 10);
    coachId = await makeUser("Claim Coach", "COACH", null);
    coacheeEnrolled = await makeUser("Claim Enrolled", "COACHEE", levelId);
    coacheeWaiting1 = await makeUser("Claim Waiting 1", "COACHEE", levelId);
    coacheeWaiting2 = await makeUser("Claim Waiting 2", "COACHEE", levelId);
    coacheeExtra1 = await makeUser("Claim Extra 1", "COACHEE", levelId);
    coacheeExtra2 = await makeUser("Claim Extra 2", "COACHEE", levelId);

    // Class with 1 enrollment + 1 waiting list entry — spot open for claim
    claimClassId = await makeClass({
      classType: "GROUP",
      levelId,
      start: futureHour(60),
      enrolled: [coacheeEnrolled],
      waitingList: [coacheeWaiting1],
    });

    // Class full (4 enrollments at GROUP_MAX_COACHEES) + 1 waiting — claim should fail
    claimTakenClassId = await makeClass({
      classType: "GROUP",
      levelId,
      start: futureHour(61),
      enrolled: [coacheeEnrolled, coacheeWaiting2, coacheeExtra1, coacheeExtra2],
      waitingList: [coacheeWaiting1],
    });

    // Canceled class + 1 waiting — claim should fail
    claimCanceledClassId = await makeClass({
      classType: "GROUP",
      levelId,
      start: futureHour(62),
      status: "CANCELED",
      enrolled: [coacheeEnrolled],
      waitingList: [coacheeWaiting1],
    });

    // Class with no waiting list entry for this coachee
    claimNotOnListClassId = await makeClass({
      classType: "GROUP",
      levelId,
      start: futureHour(63),
      enrolled: [coacheeEnrolled],
      waitingList: [],
    });

    // Class where coachee is already enrolled AND on the waiting list
    claimAlreadyEnrolledClassId = await makeClass({
      classType: "GROUP",
      levelId,
      start: futureHour(64),
      enrolled: [coacheeWaiting1],
      waitingList: [coacheeWaiting1],
    });
  }, 30000);

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.classEnrollment.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.waitingList.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.trainingClass.deleteMany({ where: { id: { in: createdClassIds } } });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  describe("POST /api/v1/classes/:id/waiting-list/claim", () => {
    it("claims a spot: enrollment created + waiting list entry removed", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${claimClassId}/waiting-list/claim`)
        .set("Authorization", `Bearer ${token(coacheeWaiting1, "COACHEE")}`);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("enrollmentId");
      expect(res.body.data.classId).toBe(claimClassId);
      expect(res.body.data.coacheeId).toBe(coacheeWaiting1);

      const enrollment = await prisma.classEnrollment.findUnique({
        where: {
          class_id_coachee_id: { class_id: claimClassId, coachee_id: coacheeWaiting1 },
        },
      });
      expect(enrollment).not.toBeNull();

      const waitingListEntry = await prisma.waitingList.findUnique({
        where: {
          class_id_coachee_id: { class_id: claimClassId, coachee_id: coacheeWaiting1 },
        },
      });
      expect(waitingListEntry).toBeNull();
    });

    it("returns 409 when spot is already taken (class at capacity)", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${claimTakenClassId}/waiting-list/claim`)
        .set("Authorization", `Bearer ${token(coacheeWaiting1, "COACHEE")}`);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("SPOT_TAKEN");
    });

    it("returns 400 when class is canceled", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${claimCanceledClassId}/waiting-list/claim`)
        .set("Authorization", `Bearer ${token(coacheeWaiting1, "COACHEE")}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 409 when coachee is not on the waiting list", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${claimNotOnListClassId}/waiting-list/claim`)
        .set("Authorization", `Bearer ${token(coacheeWaiting1, "COACHEE")}`);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("NOT_ON_WAITING_LIST");
    });

    it("returns 409 when coachee is already enrolled", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${claimAlreadyEnrolledClassId}/waiting-list/claim`)
        .set("Authorization", `Bearer ${token(coacheeWaiting1, "COACHEE")}`);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("ALREADY_ENROLLED");
    });

    it("returns 403 for a non-Coachee role", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${claimClassId}/waiting-list/claim`)
        .set("Authorization", `Bearer ${token(coachId, "COACH")}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
    });

    it("bypasses auth in test env and uses admin role (403 FORBIDDEN)", async () => {
      const res = await request(app).post(`/api/v1/classes/${claimClassId}/waiting-list/claim`);

      // In test env, no auth header => BYPASS_USER with ADMIN role => requireRole fails with 403
      expect(res.status).toBe(403);
      expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
    });
  });

  describe("Audit trail (T023)", () => {
    let auditClassId: string;
    let auditCoacheeEnrolled: string;
    let auditCoacheeWaiting: string;

    beforeAll(async () => {
      auditCoacheeEnrolled = await makeUser("Audit Enrolled", "COACHEE", levelId);
      auditCoacheeWaiting = await makeUser("Audit Waiting", "COACHEE", levelId);

      auditClassId = await makeClass({
        classType: "GROUP",
        levelId,
        start: futureHour(70),
        enrolled: [auditCoacheeEnrolled],
        waitingList: [auditCoacheeWaiting],
      });
    });

    it("creates audit log entry after successful claim", async () => {
      await request(app)
        .post(`/api/v1/classes/${auditClassId}/waiting-list/claim`)
        .set("Authorization", `Bearer ${token(auditCoacheeWaiting, "COACHEE")}`);

      const auditLog = await prisma.securityAuditLog.findFirst({
        where: {
          actor_id: auditCoacheeWaiting,
          action: "waiting-list.claim-spot",
          resource: "CLASS_ENROLLMENT",
          resource_id: auditClassId,
        },
      });
      expect(auditLog).not.toBeNull();
      expect(auditLog?.outcome).toBe("SUCCESS");
    });

    it("creates audit log entry after denial (not on waiting list)", async () => {
      const otherClassId = await makeClass({
        classType: "GROUP",
        levelId,
        start: futureHour(71),
        enrolled: [auditCoacheeEnrolled],
        waitingList: [],
      });

      await request(app)
        .post(`/api/v1/classes/${otherClassId}/waiting-list/claim`)
        .set("Authorization", `Bearer ${token(auditCoacheeWaiting, "COACHEE")}`);

      const auditLog = await prisma.securityAuditLog.findFirst({
        where: {
          actor_id: auditCoacheeWaiting,
          action: "waiting-list.claim-spot",
          resource: "CLASS_ENROLLMENT",
          resource_id: otherClassId,
        },
      });
      expect(auditLog).not.toBeNull();
      expect(auditLog?.outcome).toBe("DENIED");
    });
  });

  describe("Edge cases (T024)", () => {
    it("cancellation with empty waiting list sends coach notification #5 only", async () => {
      const edgeCoachee = await makeUser("Edge Enrolled", "COACHEE", levelId);

      const edgeClassId = await makeClass({
        classType: "GROUP",
        levelId,
        start: futureHour(72),
        enrolled: [edgeCoachee],
        waitingList: [],
      });

      const res = await request(app)
        .delete(`/api/v1/classes/${edgeClassId}/enrollment`)
        .set("Authorization", `Bearer ${token(edgeCoachee, "COACHEE")}`);

      expect(res.status).toBe(200);
      expect(res.body.waitingListProcessed).toBe(false);
      expect(res.body.notificationsSent).toBe(1);
      expect(res.body.waitingListMembersNotified).toBe(0);

      const notification = await prisma.notification.findFirst({
        where: { class_id: edgeClassId, recipient_id: coachId },
      });
      expect(notification?.notification_type).toBe(5);
    });

    it("claim on canceled class returns 400", async () => {
      const edgeCoachee = await makeUser("Edge Cancel Enrolled", "COACHEE", levelId);
      const edgeWaiting = await makeUser("Edge Cancel Waiting", "COACHEE", levelId);

      const edgeClassId = await makeClass({
        classType: "GROUP",
        levelId,
        start: futureHour(73),
        status: "CANCELED",
        enrolled: [edgeCoachee],
        waitingList: [edgeWaiting],
      });

      const res = await request(app)
        .post(`/api/v1/classes/${edgeClassId}/waiting-list/claim`)
        .set("Authorization", `Bearer ${token(edgeWaiting, "COACHEE")}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("single waitlisted coachee gets enrolled after cancellation", async () => {
      const edgeCoachee = await makeUser("Single WL Enrolled", "COACHEE", levelId);
      const edgeWaiting = await makeUser("Single WL Waiting", "COACHEE", levelId);

      const edgeClassId = await makeClass({
        classType: "GROUP",
        levelId,
        start: futureHour(74),
        enrolled: [edgeCoachee],
        waitingList: [edgeWaiting],
      });

      const cancelRes = await request(app)
        .delete(`/api/v1/classes/${edgeClassId}/enrollment`)
        .set("Authorization", `Bearer ${token(edgeCoachee, "COACHEE")}`);
      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.waitingListProcessed).toBe(true);

      const claimRes = await request(app)
        .post(`/api/v1/classes/${edgeClassId}/waiting-list/claim`)
        .set("Authorization", `Bearer ${token(edgeWaiting, "COACHEE")}`);
      expect(claimRes.status).toBe(201);
      expect(claimRes.body.data.coacheeId).toBe(edgeWaiting);

      const enrollment = await prisma.classEnrollment.findUnique({
        where: {
          class_id_coachee_id: { class_id: edgeClassId, coachee_id: edgeWaiting },
        },
      });
      expect(enrollment).not.toBeNull();
    });
  });
});
