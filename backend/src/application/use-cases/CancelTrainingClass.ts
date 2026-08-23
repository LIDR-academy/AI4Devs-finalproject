import type { Prisma, PrismaClient } from "@prisma/client";
import type { CalendarProvider } from "../../domain/ports/CalendarProvider.js";
import type {
  CancellationActor,
  CancellationScope,
  ClassCancellationPolicy,
  ClassInstanceLike,
} from "../../domain/services/ClassCancellationPolicy.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
} from "../../infrastructure/errors.js";
import type { AuditLogger } from "../../infrastructure/logging/AuditLogger.js";

export interface CancelTrainingClassInput {
  id: string;
  scope: CancellationScope;
  actor: CancellationActor;
}

export interface CancelTrainingClassResult {
  id: string;
  status: "ACTIVE" | "CANCELED";
  canceledInstances: number | null;
}

type ClassWithEnrollments = Prisma.TrainingClassGetPayload<{
  include: { enrollments: true };
}>;

function toClassInstanceLike(trainingClass: ClassWithEnrollments): ClassInstanceLike {
  return {
    id: trainingClass.id,
    status: trainingClass.status,
    start_time: trainingClass.start_time,
    recurrence_series_id: trainingClass.recurrence_series_id,
  };
}

export class CancelTrainingClass {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly calendar: CalendarProvider | null,
    private readonly policy: ClassCancellationPolicy,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(input: CancelTrainingClassInput): Promise<CancelTrainingClassResult> {
    const target = await this.prisma.trainingClass.findUnique({
      where: { id: input.id },
      include: { enrollments: true },
    });
    if (!target) {
      throw new NotFoundError("Class not found.");
    }

    if (target.status === "CANCELED") {
      throw new ConflictError("The class is already canceled.");
    }

    if (!this.policy.canCancel(input.actor, target.assigned_coach_id)) {
      await this.auditLogger.log({
        actorId: input.actor.id,
        action: "class.cancel",
        resource: "CLASS",
        resourceId: input.id,
        outcome: "DENIED",
      });
      throw new ForbiddenError("Only an Admin or the assigned Coach can cancel this class.");
    }

    const instances = await this.loadInstances(target, input.scope);
    const now = new Date();
    const selection = this.policy.selectInstancesToCancel(
      instances.map(toClassInstanceLike),
      input.id,
      input.scope,
      now,
    );
    const toCancel = instances.filter((trainingClass) =>
      selection.targetIds.includes(trainingClass.id),
    );

    if (toCancel.length === 0) {
      return { id: input.id, status: target.status, canceledInstances: 0 };
    }

    await this.deleteCalendarEvents(toCancel);

    await this.prisma.$transaction(async (tx) => {
      for (const trainingClass of toCancel) {
        await tx.trainingClass.update({
          where: { id: trainingClass.id },
          data: { status: "CANCELED", google_event_id: null },
        });
        for (const enrollment of trainingClass.enrollments) {
          await tx.notification.create({
            data: {
              notification_type: this.policy.notificationTypeForCancellation(),
              recipient_id: enrollment.coachee_id,
              class_id: trainingClass.id,
              content: "Your class has been canceled.",
            },
          });
        }
      }
    });

    await this.auditLogger.log({
      actorId: input.actor.id,
      action: "class.cancel",
      resource: "CLASS",
      resourceId: input.id,
      outcome: "SUCCESS",
    });

    return {
      id: input.id,
      status: "CANCELED",
      canceledInstances: input.scope === "series" ? toCancel.length : null,
    };
  }

  private async loadInstances(
    target: ClassWithEnrollments,
    scope: CancellationScope,
  ): Promise<ClassWithEnrollments[]> {
    if (scope !== "series" || !target.recurrence_series_id) {
      return [target];
    }
    return this.prisma.trainingClass.findMany({
      where: { recurrence_series_id: target.recurrence_series_id },
      include: { enrollments: true },
    });
  }

  private async deleteCalendarEvents(instances: ClassWithEnrollments[]) {
    for (const trainingClass of instances) {
      if (trainingClass.google_event_id) {
        if (!this.calendar) {
          throw new ServiceUnavailableError(
            "Calendar service is not configured; the class was not canceled.",
          );
        }
        try {
          await this.calendar.deleteEvent(trainingClass.google_event_id);
        } catch {
          throw new ServiceUnavailableError(
            "Google Calendar is temporarily unavailable; the class was not canceled.",
          );
        }
      }
    }
  }
}
