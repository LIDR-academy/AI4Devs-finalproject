import type { PrismaClient, User } from "@prisma/client";
import { PrismaClient as PrismaClientInstance } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { DeviceTokenRepository } from "../domain/ports/DeviceTokenRepository.js";
import type { DeliveryOutcome, NotificationSender } from "../domain/ports/NotificationSender.js";
import { ClassLifecycleNotificationService } from "../domain/services/ClassLifecycleNotificationService.js";
import { PrismaClassRepository } from "../infrastructure/persistence/PrismaClassRepository.js";
import { PrismaNotificationRepository } from "../infrastructure/persistence/PrismaNotificationRepository.js";
import { PrismaUserRepository } from "../infrastructure/persistence/PrismaUserRepository.js";

class StubDeviceTokenRepository implements DeviceTokenRepository {
  private tokens: Map<string, string[]> = new Map();

  async upsert(token: string, userId: string): Promise<{ id: string }> {
    const userTokens = this.tokens.get(userId) || [];
    userTokens.push(token);
    this.tokens.set(userId, userTokens);
    return { id: `token-${Date.now()}` };
  }

  async listActiveTokens(userId: string): Promise<string[]> {
    return this.tokens.get(userId) || [];
  }

  async deactivate(tokens: string[]): Promise<void> {
    for (const [userId, userTokens] of this.tokens.entries()) {
      this.tokens.set(
        userId,
        userTokens.filter((t) => !tokens.includes(t)),
      );
    }
  }
}

class StubNotificationSender implements NotificationSender {
  public sentNotifications: Array<{ payload: unknown; tokens: string[] }> = [];
  public shouldFail = false;

  async send(
    payload: { content: string; data: Record<string, string> },
    tokens: string[],
  ): Promise<DeliveryOutcome> {
    if (this.shouldFail) {
      return {
        succeeded: [],
        failed: tokens.map((t) => ({ token: t, reason: "test", permanent: false })),
      };
    }
    this.sentNotifications.push({ payload, tokens });
    return { succeeded: tokens, failed: [] };
  }
}

describe("ClassLifecycleNotificationService (integration)", () => {
  const prisma: PrismaClient = new PrismaClientInstance();
  const deviceTokenRepo = new StubDeviceTokenRepository();
  const notificationSender = new StubNotificationSender();
  let service: ClassLifecycleNotificationService;

  let admin: User;
  let coach1: User;
  let coach2: User;
  let coachees: User[];
  let levelIds: Record<string, string>;

  beforeAll(async () => {
    const classRepo = new PrismaClassRepository(prisma);
    const userRepo = new PrismaUserRepository(prisma);
    const notificationRepo = new PrismaNotificationRepository();

    service = new ClassLifecycleNotificationService(
      classRepo,
      userRepo,
      notificationRepo,
      notificationSender,
      deviceTokenRepo,
    );

    const allLevels = await prisma.level.findMany({ orderBy: { sort_order: "asc" } });
    levelIds = Object.fromEntries(allLevels.map((l) => [l.name, l.id]));

    admin = await prisma.user.create({
      data: {
        email: `lifecycle-admin-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Lifecycle Admin",
        phone: "+34 600 000 020",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    coach1 = await prisma.user.create({
      data: {
        email: `lifecycle-coach1-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Lifecycle Coach 1",
        phone: "+34 600 000 021",
        role: "COACH",
        status: "ACTIVE",
      },
    });

    coach2 = await prisma.user.create({
      data: {
        email: `lifecycle-coach2-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Lifecycle Coach 2",
        phone: "+34 600 000 022",
        role: "COACH",
        status: "ACTIVE",
      },
    });

    coachees = [];
    const levels = ["Principiante", "Basico", "Intermedio", "Avanzado", "Experto"];
    for (let i = 0; i < 5; i++) {
      const coachee = await prisma.user.create({
        data: {
          email: `lifecycle-coachee-${i}-${Date.now()}@example.com`,
          password_hash: "not-used",
          name: `Lifecycle Coachee ${i + 1}`,
          phone: `+34 600 000 03${i}`,
          role: "COACHEE",
          status: "ACTIVE",
          level_id: levelIds[levels[i]],
        },
      });
      coachees.push(coachee);
      await deviceTokenRepo.upsert(`token-coachee-${i}`, coachee.id);
    }

    await deviceTokenRepo.upsert(`token-coach1`, coach1.id);
    await deviceTokenRepo.upsert(`token-coach2`, coach2.id);
  });

  beforeEach(async () => {
    await prisma.classEnrollment.deleteMany();
    await prisma.waitingList.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.trainingClass.deleteMany();
    await prisma.recurrenceSeries.deleteMany();
    await prisma.block.deleteMany();
    notificationSender.sentNotifications = [];
    notificationSender.shouldFail = false;
  });

  afterAll(async () => {
    const userIds = [
      admin?.id,
      coach1?.id,
      coach2?.id,
      ...(coachees ?? []).map((c) => c.id),
    ].filter(Boolean) as string[];
    await prisma.classEnrollment.deleteMany();
    await prisma.waitingList.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.trainingClass.deleteMany();
    await prisma.recurrenceSeries.deleteMany();
    await prisma.block.deleteMany();
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  });

  async function createTestClass(overrides: {
    classType: "INDIVIDUAL" | "GROUP";
    createdBy: string;
    assignedCoachId: string;
    levelId?: string;
    coacheeIds?: string[];
  }): Promise<string> {
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() + 14);
    startDate.setUTCHours(10, 0, 0, 0);

    const created = await prisma.trainingClass.create({
      data: {
        class_type: overrides.classType,
        assigned_coach_id: overrides.assignedCoachId,
        level_id: overrides.levelId ?? null,
        start_time: startDate,
        duration_minutes: 60,
        status: "ACTIVE",
        description: null,
        recurrence_series_id: null,
        google_event_id: `cal-${crypto.randomUUID()}`,
        created_by: overrides.createdBy,
      },
    });

    if (overrides.coacheeIds && overrides.coacheeIds.length > 0) {
      for (const coacheeId of overrides.coacheeIds) {
        await prisma.classEnrollment.create({
          data: {
            class_id: created.id,
            coachee_id: coacheeId,
          },
        });
      }
    }

    return created.id;
  }

  describe("notifyNewClassAvailable", () => {
    it("sends notification to coachees within reach of the class level", async () => {
      const classId = await createTestClass({
        classType: "GROUP",
        createdBy: admin.id,
        assignedCoachId: coach1.id,
        levelId: levelIds.Intermedio,
      });

      const result = await service.notifyNewClassAvailable(classId);

      expect(result.notificationsSent).toBeGreaterThan(0);

      const notifications = await prisma.notification.findMany({
        where: { class_id: classId, notification_type: 2 },
      });
      expect(notifications.length).toBeGreaterThan(0);
    });

    it("does not send notification to coachees outside reach", async () => {
      const classId = await createTestClass({
        classType: "GROUP",
        createdBy: admin.id,
        assignedCoachId: coach1.id,
        levelId: levelIds.Intermedio,
      });

      await service.notifyNewClassAvailable(classId);

      const notifications = await prisma.notification.findMany({
        where: { class_id: classId, notification_type: 2 },
      });

      const recipientIds = notifications.map((n) => n.recipient_id);
      expect(recipientIds).not.toContain(coachees[0].id);
      expect(recipientIds).not.toContain(coachees[4].id);
    });
  });

  describe("notifyIndividualClassAssigned", () => {
    it("sends notification to assigned coach with correct content", async () => {
      const classId = await createTestClass({
        classType: "INDIVIDUAL",
        createdBy: admin.id,
        assignedCoachId: coach1.id,
        coacheeIds: [coachees[0].id],
      });

      const result = await service.notifyIndividualClassAssigned(classId, coachees[0].id);

      expect(result.notificationsSent).toBe(1);

      const notifications = await prisma.notification.findMany({
        where: { class_id: classId, notification_type: 8 },
      });
      expect(notifications).toHaveLength(1);
      expect(notifications[0].recipient_id).toBe(coach1.id);
      expect(notifications[0].content).toContain("Lifecycle Coachee 1");
      expect(notifications[0].content).toContain("General");
    });
  });

  describe("notifyClassCanceled", () => {
    it("sends notification to all enrolled coachees", async () => {
      const classId = await createTestClass({
        classType: "GROUP",
        createdBy: admin.id,
        assignedCoachId: coach1.id,
        levelId: levelIds.Intermedio,
        coacheeIds: [coachees[1].id, coachees[2].id, coachees[3].id],
      });

      const result = await service.notifyClassCanceled(classId);

      expect(result.notificationsSent).toBe(3);

      const notifications = await prisma.notification.findMany({
        where: { class_id: classId, notification_type: 7 },
      });
      expect(notifications).toHaveLength(3);

      const recipientIds = notifications.map((n) => n.recipient_id).sort();
      expect(recipientIds).toEqual([coachees[1].id, coachees[2].id, coachees[3].id].sort());
    });

    it("sends notification with correct content including class type", async () => {
      const classId = await createTestClass({
        classType: "GROUP",
        createdBy: admin.id,
        assignedCoachId: coach1.id,
        levelId: levelIds.Intermedio,
        coacheeIds: [coachees[1].id],
      });

      await service.notifyClassCanceled(classId);

      const notifications = await prisma.notification.findMany({
        where: { class_id: classId, notification_type: 7 },
      });
      expect(notifications[0].content).toContain("group");
      expect(notifications[0].content).toContain("canceled");
    });
  });

  describe("notifyCoachAssigned", () => {
    it("sends notification when coach did not create the class", async () => {
      const classId = await createTestClass({
        classType: "GROUP",
        createdBy: admin.id,
        assignedCoachId: coach1.id,
        levelId: levelIds.Intermedio,
      });

      const result = await service.notifyCoachAssigned(classId);

      expect(result.notificationsSent).toBe(1);

      const notifications = await prisma.notification.findMany({
        where: { class_id: classId, notification_type: 12 },
      });
      expect(notifications).toHaveLength(1);
      expect(notifications[0].recipient_id).toBe(coach1.id);
    });

    it("does not send notification when coach created the class", async () => {
      const classId = await createTestClass({
        classType: "GROUP",
        createdBy: coach1.id,
        assignedCoachId: coach1.id,
        levelId: levelIds.Intermedio,
      });

      const result = await service.notifyCoachAssigned(classId);

      expect(result.notificationsSent).toBe(0);

      const notifications = await prisma.notification.findMany({
        where: { class_id: classId, notification_type: 12 },
      });
      expect(notifications).toHaveLength(0);
    });
  });

  describe("failure isolation", () => {
    it("persists notification even when push delivery fails", async () => {
      notificationSender.shouldFail = true;

      const classId = await createTestClass({
        classType: "INDIVIDUAL",
        createdBy: admin.id,
        assignedCoachId: coach1.id,
        coacheeIds: [coachees[0].id],
      });

      const result = await service.notifyIndividualClassAssigned(classId, coachees[0].id);

      expect(result.notificationsSent).toBe(1);

      const notifications = await prisma.notification.findMany({
        where: { class_id: classId, notification_type: 8 },
      });
      expect(notifications).toHaveLength(1);
    });
  });
});
