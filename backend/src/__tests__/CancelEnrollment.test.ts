import { PrismaClient, type User } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CancelEnrollment } from "../application/use-cases/CancelEnrollment.js";
import type { DeviceTokenRepository } from "../domain/ports/DeviceTokenRepository.js";
import type { NotificationSender } from "../domain/ports/NotificationSender.js";
import { EnrollmentPolicy } from "../domain/services/EnrollmentPolicy.js";
import { AuditLogger } from "../infrastructure/logging/AuditLogger.js";

describe("CancelEnrollment", () => {
  const prisma = new PrismaClient();
  const policy = new EnrollmentPolicy();
  const auditLogger = new AuditLogger(prisma);
  const cancel = new CancelEnrollment(prisma, policy, auditLogger);

  function makePushHarness() {
    const send = vi.fn<NotificationSender["send"]>(async () => ({ succeeded: [], failed: [] }));
    const listActiveTokens = vi.fn<DeviceTokenRepository["listActiveTokens"]>(async () => [
      "coach-device-token",
    ]);
    const deactivate = vi.fn<DeviceTokenRepository["deactivate"]>(async () => {});
    const deviceTokenRepo: DeviceTokenRepository = {
      upsert: vi.fn<DeviceTokenRepository["upsert"]>(async () => ({ id: "device-row" })),
      listActiveTokens,
      deactivate,
    };
    const cancelWithPush = new CancelEnrollment(
      prisma,
      policy,
      auditLogger,
      undefined,
      deviceTokenRepo,
      {
        send,
      },
    );
    return { cancelWithPush, send, listActiveTokens, deactivate };
  }

  let levelId: string;
  let coach: User;
  let coachee: User;
  let waitingCoachee: User;
  const createdUserIds: string[] = [];
  const ids: string[] = [];

  function future(hoursFromNow: number): Date {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  }

  async function makeClass(options: {
    classType: "INDIVIDUAL" | "GROUP";
    start: Date;
    status?: "ACTIVE" | "CANCELED";
    enrolled: string[];
    waitingList?: string[];
  }): Promise<string> {
    const trainingClass = await prisma.trainingClass.create({
      data: {
        class_type: options.classType,
        assigned_coach_id: coach.id,
        level_id: levelId,
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
    if (options.waitingList && options.waitingList.length > 0) {
      await prisma.waitingList.createMany({
        data: options.waitingList.map((coacheeId) => ({
          class_id: trainingClass.id,
          coachee_id: coacheeId,
        })),
      });
    }
    return trainingClass.id;
  }

  beforeAll(async () => {
    levelId = (
      await prisma.level.create({
        data: { name: `cancel-enroll-level-${Date.now()}`, color: "#445566", sort_order: 1 },
      })
    ).id;
    coach = await prisma.user.create({
      data: {
        email: `cancel-enroll-coach-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Cancel Enroll Coach",
        phone: "+34 600 000 022",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    coachee = await prisma.user.create({
      data: {
        email: `cancel-enroll-coachee-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Cancel Enroll Coachee",
        phone: "+34 600 000 023",
        role: "COACHEE",
        status: "ACTIVE",
        level_id: levelId,
      },
    });
    waitingCoachee = await prisma.user.create({
      data: {
        email: `cancel-enroll-waiting-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Cancel Enroll Waiting",
        phone: "+34 600 000 024",
        role: "COACHEE",
        status: "ACTIVE",
        level_id: levelId,
      },
    });
    createdUserIds.push(coach.id, coachee.id, waitingCoachee.id);
  });

  beforeEach(async () => {
    await prisma.waitingList.deleteMany();
    await prisma.classEnrollment.deleteMany();
    if (ids.length) {
      await prisma.notification.deleteMany({ where: { class_id: { in: ids } } });
      await prisma.trainingClass.deleteMany({ where: { id: { in: ids } } });
      ids.length = 0;
    }
    await prisma.securityAuditLog.deleteMany({
      where: { action: "class.cancel-enrollment", actor_id: { in: createdUserIds } },
    });
  });

  afterAll(async () => {
    await prisma.waitingList.deleteMany();
    await prisma.classEnrollment.deleteMany();
    if (ids.length) {
      await prisma.notification.deleteMany({ where: { class_id: { in: ids } } });
      await prisma.trainingClass.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.level.deleteMany({ where: { id: levelId } });
    await prisma.$disconnect();
  });

  it("cancels a group enrollment with no waiting list (200 path)", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      start: future(24),
      enrolled: [coachee.id],
    });

    const result = await cancel.execute({ classId, coacheeId: coachee.id });

    expect(result).toEqual({
      message: "Enrollment canceled.",
      waitingListProcessed: false,
      claimedByCoachee: null,
      notificationsSent: 1,
      waitingListMembersNotified: 0,
    });

    const stored = await prisma.classEnrollment.findUnique({
      where: { class_id_coachee_id: { class_id: classId, coachee_id: coachee.id } },
    });
    expect(stored).toBeNull();

    const notifications = await prisma.notification.findMany({ where: { class_id: classId } });
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      notification_type: 5,
      recipient_id: coach.id,
    });

    const audit = await prisma.securityAuditLog.findFirst({
      where: { action: "class.cancel-enrollment", outcome: "SUCCESS", resource_id: classId },
    });
    expect(audit?.actor_id).toBe(coachee.id);
  });

  it("reports a waiting list was processed when people are waiting", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      start: future(24),
      enrolled: [coachee.id],
      waitingList: [waitingCoachee.id],
    });

    const result = await cancel.execute({ classId, coacheeId: coachee.id });

    expect(result).toEqual({
      message: "Enrollment canceled.",
      waitingListProcessed: true,
      claimedByCoachee: null,
      notificationsSent: 1,
      waitingListMembersNotified: 0,
    });

    const notifications = await prisma.notification.findMany({ where: { class_id: classId } });
    expect(notifications[0]).toMatchObject({ notification_type: 4, recipient_id: coach.id });
  });

  it("notifies the coach with type 3 when an individual class enrollment is canceled", async () => {
    const classId = await makeClass({
      classType: "INDIVIDUAL",
      start: future(24),
      enrolled: [coachee.id],
    });

    const result = await cancel.execute({ classId, coacheeId: coachee.id });

    expect(result.waitingListProcessed).toBe(false);

    const notifications = await prisma.notification.findMany({ where: { class_id: classId } });
    expect(notifications[0]).toMatchObject({ notification_type: 3, recipient_id: coach.id });
  });

  it("returns 404 when the Coachee is not enrolled", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      start: future(24),
      enrolled: [],
    });

    await expect(cancel.execute({ classId, coacheeId: coachee.id })).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("returns 404 for a non-existent class", async () => {
    await expect(
      cancel.execute({
        classId: "00000000-0000-0000-0000-000000000000",
        coacheeId: coachee.id,
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });

  it("rejects with 400 VALIDATION_ERROR for a canceled class", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      start: future(24),
      status: "CANCELED",
      enrolled: [coachee.id],
    });

    await expect(cancel.execute({ classId, coacheeId: coachee.id })).rejects.toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  });

  it("writes a DENIED audit log when cancellation is refused", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      start: future(24),
      enrolled: [],
    });

    await expect(cancel.execute({ classId, coacheeId: coachee.id })).rejects.toMatchObject({
      statusCode: 404,
    });

    const audit = await prisma.securityAuditLog.findFirst({
      where: { action: "class.cancel-enrollment", outcome: "DENIED", resource_id: classId },
    });
    expect(audit?.actor_id).toBe(coachee.id);
  });

  it("dispatches a push to the coach when a group enrollment without a waiting list is canceled", async () => {
    const { cancelWithPush, send, listActiveTokens } = makePushHarness();
    const classId = await makeClass({
      classType: "GROUP",
      start: future(24),
      enrolled: [coachee.id],
    });

    const result = await cancelWithPush.execute({ classId, coacheeId: coachee.id });
    expect(result.notificationsSent).toBe(1);

    expect(listActiveTokens).toHaveBeenCalledWith(coach.id);
    expect(send).toHaveBeenCalledTimes(1);
    const [push, tokens] = send.mock.calls[0];
    expect(tokens).toEqual(["coach-device-token"]);
    expect(push.data).toMatchObject({
      notificationId: expect.any(String),
      type: "5",
      classId,
    });
  });

  it("dispatches a push with type 3 when an individual class enrollment is canceled", async () => {
    const { cancelWithPush, send } = makePushHarness();
    const classId = await makeClass({
      classType: "INDIVIDUAL",
      start: future(24),
      enrolled: [coachee.id],
    });

    await cancelWithPush.execute({ classId, coacheeId: coachee.id });

    expect(send).toHaveBeenCalledTimes(1);
    const [push] = send.mock.calls[0];
    expect(push.data.type).toBe("3");
  });

  it("deactivates permanently failed device tokens after the coach push", async () => {
    const { cancelWithPush, send, deactivate } = makePushHarness();
    send.mockResolvedValueOnce({
      succeeded: [],
      failed: [{ token: "coach-device-token", reason: "bad-registration", permanent: true }],
    });
    const classId = await makeClass({
      classType: "GROUP",
      start: future(24),
      enrolled: [coachee.id],
    });

    await cancelWithPush.execute({ classId, coacheeId: coachee.id });

    expect(deactivate).toHaveBeenCalledWith(["coach-device-token"]);
  });

  it("does not dispatch a push when the coach has no active device tokens", async () => {
    const { cancelWithPush, send, listActiveTokens } = makePushHarness();
    listActiveTokens.mockResolvedValueOnce([]);
    const classId = await makeClass({
      classType: "GROUP",
      start: future(24),
      enrolled: [coachee.id],
    });

    await cancelWithPush.execute({ classId, coacheeId: coachee.id });

    expect(send).not.toHaveBeenCalled();
  });

  it("keeps the cancellation successful when the coach push delivery fails", async () => {
    const { cancelWithPush, send } = makePushHarness();
    send.mockRejectedValueOnce(new Error("FCM unavailable"));
    const classId = await makeClass({
      classType: "GROUP",
      start: future(24),
      enrolled: [coachee.id],
    });

    const result = await cancelWithPush.execute({ classId, coacheeId: coachee.id });
    expect(result).toEqual({
      message: "Enrollment canceled.",
      waitingListProcessed: false,
      claimedByCoachee: null,
      notificationsSent: 1,
      waitingListMembersNotified: 0,
    });

    const stored = await prisma.classEnrollment.findUnique({
      where: { class_id_coachee_id: { class_id: classId, coachee_id: coachee.id } },
    });
    expect(stored).toBeNull();
  });
});
