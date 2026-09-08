import { PrismaClient, type User } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { JoinTrainingClass } from "../application/use-cases/JoinTrainingClass.js";
import { EnrollmentPolicy } from "../domain/services/EnrollmentPolicy.js";
import { AuditLogger } from "../infrastructure/logging/AuditLogger.js";

describe("JoinTrainingClass", () => {
  const prisma = new PrismaClient();
  const policy = new EnrollmentPolicy();
  const auditLogger = new AuditLogger(prisma);
  const join = new JoinTrainingClass(prisma, policy, auditLogger);

  let levelOkId: string;
  let levelFarId: string;
  let coach: User;
  let coachee: User;
  let coacheeNoLevel: User;
  let otherCoachee: User;
  let coachUser: User;
  const createdUserIds: string[] = [];
  const ids: string[] = [];

  function future(hoursFromNow: number): Date {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  }

  async function makeLevel(name: string, sortOrder: number): Promise<string> {
    const level = await prisma.level.create({
      data: { name, color: "#112233", sort_order: sortOrder },
    });
    return level.id;
  }

  async function makeUser(name: string, role: string, levelId: string | null): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: `${name}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}@example.com`,
        password_hash: "not-used",
        name,
        phone: "+34 600 000 021",
        role: role as "COACH" | "COACHEE",
        status: "ACTIVE",
        level_id: levelId,
      },
    });
    createdUserIds.push(user.id);
    return user;
  }

  async function makeClass(options: {
    classType: "INDIVIDUAL" | "GROUP";
    levelId: string | null;
    start: Date;
    status?: "ACTIVE" | "CANCELED";
    enrolled: string[];
  }): Promise<string> {
    const trainingClass = await prisma.trainingClass.create({
      data: {
        class_type: options.classType,
        assigned_coach_id: coach.id,
        level_id: options.levelId,
        start_time: options.start,
        duration_minutes: 60,
        status: options.status ?? "ACTIVE",
        created_by: coach.id,
      },
    });
    ids.push(trainingClass.id);
    if (options.enrolled.length > 0) {
      await prisma.classEnrollment.createMany({
        data: options.enrolled.map((coacheeId) => ({
          class_id: trainingClass.id,
          coachee_id: coacheeId,
        })),
      });
    }
    return trainingClass.id;
  }

  beforeAll(async () => {
    levelOkId = await makeLevel(`join-ok-${Date.now()}`, 1);
    levelFarId = await makeLevel(`join-far-${Date.now()}`, 5);
    coach = await makeUser("Join Coach", "COACH", null);
    coachee = await makeUser("Join Coachee", "COACHEE", levelOkId);
    coacheeNoLevel = await makeUser("Join Coachee NoLevel", "COACHEE", null);
    otherCoachee = await makeUser("Join Other Coachee", "COACHEE", levelOkId);
    coachUser = await makeUser("Join Coach User", "COACH", null);
  });

  beforeEach(async () => {
    await prisma.classEnrollment.deleteMany();
    if (ids.length) {
      await prisma.trainingClass.deleteMany({ where: { id: { in: ids } } });
      ids.length = 0;
    }
    await prisma.securityAuditLog.deleteMany({
      where: { action: "class.enroll", actor_id: { in: createdUserIds } },
    });
  });

  afterAll(async () => {
    await prisma.classEnrollment.deleteMany();
    if (ids.length) {
      await prisma.trainingClass.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.level.deleteMany({
      where: { id: { in: [levelOkId, levelFarId] } },
    });
    await prisma.$disconnect();
  });

  it("joins a Coachee to an ACTIVE group class (happy path) and persists the enrollment", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [],
    });

    const result = await join.execute({ classId, coacheeId: coachee.id });

    expect(result).toMatchObject({
      classId,
      coacheeId: coachee.id,
    });
    expect(result.id).toBeTruthy();
    expect(new Date(result.joinedAt).getTime()).not.toBeNaN();

    const stored = await prisma.classEnrollment.findUnique({
      where: { class_id_coachee_id: { class_id: classId, coachee_id: coachee.id } },
    });
    expect(stored).not.toBeNull();

    const audit = await prisma.securityAuditLog.findFirst({
      where: { action: "class.enroll", outcome: "SUCCESS", resource_id: classId },
    });
    expect(audit?.actor_id).toBe(coachee.id);
  });

  it("rejects with 409 ALREADY_ENROLLED when the Coachee is already enrolled", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [coachee.id],
    });

    await expect(join.execute({ classId, coacheeId: coachee.id })).rejects.toMatchObject({
      statusCode: 409,
      code: "ALREADY_ENROLLED",
    });
  });

  it("rejects with 409 CLASS_FULL when the class has no free spots", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [coachee.id, otherCoachee.id],
    });
    await prisma.classEnrollment.create({
      data: {
        class_id: classId,
        coachee_id: (await makeUser("Join Seat Full 3", "COACHEE", levelOkId)).id,
      },
    });
    await prisma.classEnrollment.create({
      data: {
        class_id: classId,
        coachee_id: (await makeUser("Join Seat Full 4", "COACHEE", levelOkId)).id,
      },
    });
    const bystander = await makeUser("Join Bystander", "COACHEE", levelOkId);

    await expect(join.execute({ classId, coacheeId: bystander.id })).rejects.toMatchObject({
      statusCode: 409,
      code: "CLASS_FULL",
    });
  });

  it("rejects with 409 LEVEL_MISMATCH when the Coachee has no level", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [],
    });

    await expect(join.execute({ classId, coacheeId: coacheeNoLevel.id })).rejects.toMatchObject({
      statusCode: 409,
      code: "LEVEL_MISMATCH",
    });
  });

  it("rejects with 409 LEVEL_MISMATCH when the class is out of reach", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelFarId,
      start: future(24),
      enrolled: [],
    });

    await expect(join.execute({ classId, coacheeId: coachee.id })).rejects.toMatchObject({
      statusCode: 409,
      code: "LEVEL_MISMATCH",
    });
  });

  it("rejects with 409 OVERLAP_DETECTED when the Coachee has a simultaneous class", async () => {
    const slot = future(24);
    await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: slot,
      enrolled: [coachee.id],
    });
    const target = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: new Date(slot.getTime() + 10 * 60 * 1000),
      enrolled: [],
    });

    await expect(join.execute({ classId: target, coacheeId: coachee.id })).rejects.toMatchObject({
      statusCode: 409,
      code: "OVERLAP_DETECTED",
    });
  });

  it("rejects with 400 VALIDATION_ERROR for an individual class", async () => {
    const classId = await makeClass({
      classType: "INDIVIDUAL",
      levelId: null,
      start: future(24),
      enrolled: [],
    });

    await expect(join.execute({ classId, coacheeId: coachee.id })).rejects.toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  });

  it("rejects with 400 VALIDATION_ERROR for a canceled class", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      status: "CANCELED",
      enrolled: [],
    });

    await expect(join.execute({ classId, coacheeId: coachee.id })).rejects.toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  });

  it("returns 404 for a non-existent class", async () => {
    await expect(
      join.execute({
        classId: "00000000-0000-0000-0000-000000000000",
        coacheeId: coachee.id,
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });

  it("rejects with 403 when the actor is not a Coachee", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [],
    });

    await expect(join.execute({ classId, coacheeId: coachUser.id })).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
  });

  it("writes a DENIED audit log when enrollment is refused", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [],
    });

    await expect(join.execute({ classId, coacheeId: coacheeNoLevel.id })).rejects.toMatchObject({
      statusCode: 409,
    });

    const audit = await prisma.securityAuditLog.findFirst({
      where: { action: "class.enroll", outcome: "DENIED", resource_id: classId },
    });
    expect(audit?.actor_id).toBe(coacheeNoLevel.id);
  });

  it("does not create an enrollment when joining is refused", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [coachee.id, otherCoachee.id],
    });

    await expect(join.execute({ classId, coacheeId: otherCoachee.id })).rejects.toMatchObject({
      statusCode: 409,
      code: "ALREADY_ENROLLED",
    });

    const count = await prisma.classEnrollment.count({ where: { class_id: classId } });
    expect(count).toBe(2);
  });
});
