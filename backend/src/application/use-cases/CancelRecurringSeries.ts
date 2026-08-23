import type { Prisma, PrismaClient } from "@prisma/client";
import type { CalendarProvider } from "../../domain/ports/CalendarProvider.js";
import type {
  CancellationActor,
  ClassCancellationPolicy,
  ClassInstanceLike,
} from "../../domain/services/ClassCancellationPolicy.js";
import {
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
} from "../../infrastructure/errors.js";
import type { AuditLogger } from "../../infrastructure/logging/AuditLogger.js";

export interface CancelRecurringSeriesInput {
  seriesId: string;
  actor: CancellationActor;
}

export interface CancelRecurringSeriesResult {
  seriesId: string;
  canceledInstanceCount: number;
  status: "ACTIVE" | "CANCELED";
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

export class CancelRecurringSeries {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly calendar: CalendarProvider | null,
    private readonly policy: ClassCancellationPolicy,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(input: CancelRecurringSeriesInput): Promise<CancelRecurringSeriesResult> {
    const series = await this.prisma.recurrenceSeries.findUnique({
      where: { id: input.seriesId },
    });
    if (!series) {
      throw new NotFoundError("Recurring series not found.");
    }

    const isAssigned = this.policy.canCancel(input.actor, series.coach_id);
    const isCreator = input.actor.id === series.created_by && input.actor.role !== "COACHEE";
    if (!isAssigned && !isCreator) {
      await this.auditLogger.log({
        actorId: input.actor.id,
        action: "class.cancel",
        resource: "RECURRING_SERIES",
        resourceId: input.seriesId,
        outcome: "DENIED",
      });
      throw new ForbiddenError(
        "Only an Admin, the series creator, or the assigned Coach can cancel this series.",
      );
    }

    const instances = await this.prisma.trainingClass.findMany({
      where: { recurrence_series_id: input.seriesId },
      include: { enrollments: true },
      orderBy: { start_time: "asc" },
    });

    if (instances.length === 0) {
      return { seriesId: input.seriesId, canceledInstanceCount: 0, status: "CANCELED" };
    }

    const targetId = instances[0].id;
    const selection = this.policy.selectInstancesToCancel(
      instances.map(toClassInstanceLike),
      targetId,
      "series",
      new Date(),
    );
    const toCancel = instances.filter((trainingClass) =>
      selection.targetIds.includes(trainingClass.id),
    );

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
      resource: "RECURRING_SERIES",
      resourceId: input.seriesId,
      outcome: "SUCCESS",
    });

    return {
      seriesId: input.seriesId,
      canceledInstanceCount: toCancel.length,
      status: "CANCELED",
    };
  }

  private async deleteCalendarEvents(instances: ClassWithEnrollments[]) {
    for (const trainingClass of instances) {
      if (trainingClass.google_event_id) {
        if (!this.calendar) {
          throw new ServiceUnavailableError(
            "Calendar service is not configured; the series was not canceled.",
          );
        }
        try {
          await this.calendar.deleteEvent(trainingClass.google_event_id);
        } catch {
          throw new ServiceUnavailableError(
            "Google Calendar is temporarily unavailable; the series was not canceled.",
          );
        }
      }
    }
  }
}
