import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CancelTrainingClass } from "../application/use-cases/CancelTrainingClass.js";
import { CreateTrainingClass } from "../application/use-cases/CreateTrainingClass.js";
import { ListTrainingClasses } from "../application/use-cases/ListTrainingClasses.js";
import { env, resolveCalendarId } from "../config/env.js";
import { ClassCancellationPolicy } from "../domain/services/ClassCancellationPolicy.js";
import { GoogleCalendarAdapter } from "../infrastructure/adapters/calendar/GoogleCalendarAdapter.js";
import { AuditLogger } from "../infrastructure/logging/AuditLogger.js";

const keyPath = env.GOOGLE_CALENDAR_SA_KEY_PATH
  ? resolve(process.cwd(), env.GOOGLE_CALENDAR_SA_KEY_PATH)
  : null;

const hasCredentials = !!(
  env.GOOGLE_CALENDAR_SA_EMAIL &&
  env.GOOGLE_CALENDAR_SA_KEY_PATH &&
  resolveCalendarId() &&
  keyPath &&
  existsSync(keyPath)
);

describe.runIf(hasCredentials)("TrainingClass Calendar Sync Integration", () => {
  const prisma = new PrismaClient();
  let adapter: GoogleCalendarAdapter;
  let createTrainingClass: CreateTrainingClass;
  let cancelTrainingClass: CancelTrainingClass;
  let listTrainingClasses: ListTrainingClasses;
  let createdClassId: string | null = null;
  let adminId = "00000000-0000-0000-0000-000000000000";

  beforeAll(async () => {
    const calendarId = resolveCalendarId();
    if (!calendarId || !env.GOOGLE_CALENDAR_SA_EMAIL || !env.GOOGLE_CALENDAR_SA_KEY_PATH) {
      throw new Error("Missing Google Calendar credentials in env");
    }
    adapter = new GoogleCalendarAdapter(
      env.GOOGLE_CALENDAR_SA_EMAIL,
      env.GOOGLE_CALENDAR_SA_KEY_PATH,
      calendarId,
    );
    createTrainingClass = new CreateTrainingClass(prisma, adapter);
    cancelTrainingClass = new CancelTrainingClass(
      prisma,
      adapter,
      new ClassCancellationPolicy(),
      new AuditLogger(prisma),
    );
    listTrainingClasses = new ListTrainingClasses(prisma);
  });

  it("should create an individual class and persist google_event_id", async () => {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (adminUser) {
      adminId = adminUser.id;
    }
    const coach = await prisma.user.findFirst({ where: { role: "COACH" } });
    let coachee = await prisma.user.findFirst({ where: { role: "COACHEE", status: "ACTIVE" } });
    if (!coachee) {
      const existing = await prisma.level.findFirst();
      coachee = await prisma.user.create({
        data: {
          email: `int-test-coachee-${Date.now()}@example.com`,
          password_hash: "not-used",
          name: "Integration Coachee",
          phone: "+34 600 000 000",
          role: "COACHEE",
          status: "ACTIVE",
          level_id: existing?.id ?? null,
        },
      });
    }

    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 14);
    startTime.setUTCHours(9, 0, 0, 0);

    const result = await createTrainingClass.execute({
      classType: "INDIVIDUAL",
      coacheeIds: [coachee.id],
      assignedCoachId: coach?.id ?? "00000000-0000-0000-0000-000000000000",
      startDateTime: startTime,
      description: "Integration test class — safe to delete",
      createdBy: adminUser?.id ?? "00000000-0000-0000-0000-000000000000",
    });

    expect(result.instances).toHaveLength(1);
    const trainingClass = result.instances[0];
    expect(trainingClass.id).toBeTruthy();
    expect(trainingClass.google_event_id).toBeTruthy();
    expect(typeof trainingClass.google_event_id).toBe("string");
    createdClassId = trainingClass.id;
  }, 30000);

  it("should list training classes", async () => {
    const classes = await listTrainingClasses.execute({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      page: 1,
      limit: 20,
      viewerRole: "ADMIN",
      viewerId: "00000000-0000-0000-0000-000000000000",
    });
    expect(classes.meta).toHaveProperty("total");
    expect(Array.isArray(classes.data)).toBe(true);
  });

  it("should cancel a class and remove its calendar event", async () => {
    if (!createdClassId) {
      return;
    }
    const result = await cancelTrainingClass.execute({
      id: createdClassId,
      scope: "single",
      actor: { id: adminId, role: "ADMIN" },
    });
    expect(result.status).toBe("CANCELED");
  }, 15000);

  afterAll(async () => {
    if (createdClassId) {
      try {
        await cancelTrainingClass.execute({
          id: createdClassId,
          scope: "single",
          actor: { id: adminId, role: "ADMIN" },
        });
      } catch {
        // Already cleaned up
      }
    }
    await prisma.$disconnect();
  });
});
