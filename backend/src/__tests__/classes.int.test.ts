import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CreateTrainingClass } from "../application/use-cases/CreateTrainingClass.js";
import { DeleteTrainingClass } from "../application/use-cases/DeleteTrainingClass.js";
import { ListTrainingClasses } from "../application/use-cases/ListTrainingClasses.js";
import { env, resolveCalendarId } from "../config/env.js";
import { GoogleCalendarAdapter } from "../infrastructure/adapters/calendar/GoogleCalendarAdapter.js";

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
  let deleteTrainingClass: DeleteTrainingClass;
  let listTrainingClasses: ListTrainingClasses;
  let createdClassId: string | null = null;

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
    deleteTrainingClass = new DeleteTrainingClass(prisma, adapter);
    listTrainingClasses = new ListTrainingClasses(prisma);
  });

  it("should create an individual class and persist google_event_id", async () => {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
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
    const classes = await listTrainingClasses.execute();
    expect(Array.isArray(classes)).toBe(true);
  });

  it("should delete a class and its calendar event", async () => {
    if (!createdClassId) {
      return;
    }
    await expect(deleteTrainingClass.execute(createdClassId)).resolves.toBeUndefined();
  }, 15000);

  afterAll(async () => {
    if (createdClassId) {
      try {
        await deleteTrainingClass.execute(createdClassId);
      } catch {
        // Already cleaned up
      }
    }
    await prisma.$disconnect();
  });
});
