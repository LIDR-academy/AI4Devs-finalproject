import type { PrismaClient } from "@prisma/client";
import type { EnrollmentPolicy } from "../../domain/services/EnrollmentPolicy.js";
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../infrastructure/errors.js";
import type { AuditLogger } from "../../infrastructure/logging/AuditLogger.js";

export interface CancelEnrollmentInput {
  classId: string;
  coacheeId: string;
}

export interface CancelEnrollmentResult {
  message: string;
  waitingListProcessed: boolean;
  claimedByCoachee: string | null;
}

export class CancelEnrollment {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly policy: EnrollmentPolicy,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(input: CancelEnrollmentInput): Promise<CancelEnrollmentResult> {
    try {
      const openedSpot = await this.prisma.$transaction(async (tx) => {
        const trainingClass = await tx.trainingClass.findUnique({
          where: { id: input.classId },
          include: { waitingLists: true },
        });
        if (!trainingClass) {
          throw new NotFoundError("Class not found.");
        }

        const cancellationVerdict = this.policy.assertCancellationAllowed({
          status: trainingClass.status,
        });
        if (!cancellationVerdict.ok) {
          throw new ValidationError("This class has been canceled.");
        }

        const enrollment = await tx.classEnrollment.findUnique({
          where: {
            class_id_coachee_id: {
              class_id: input.classId,
              coachee_id: input.coacheeId,
            },
          },
        });
        if (!enrollment) {
          throw new NotFoundError("Enrollment not found.");
        }
        if (!this.policy.canCancelEnrollment(input.coacheeId, enrollment.coachee_id)) {
          throw new ForbiddenError("You can only cancel your own enrollment.");
        }

        await tx.classEnrollment.delete({ where: { id: enrollment.id } });

        const hasWaitingList = trainingClass.waitingLists.length > 0;
        await tx.notification.create({
          data: {
            notification_type: this.policy.coachNotificationTypeForCancellation(
              trainingClass.class_type,
              hasWaitingList,
            ),
            recipient_id: trainingClass.assigned_coach_id,
            class_id: trainingClass.id,
            content: "A Coachee canceled their enrollment in this class.",
          },
        });

        return this.policy.openedSpotDetected(hasWaitingList);
      });

      await this.auditLogger.log({
        actorId: input.coacheeId,
        action: "class.cancel-enrollment",
        resource: "CLASS_ENROLLMENT",
        resourceId: input.classId,
        outcome: "SUCCESS",
      });

      return {
        message: "Enrollment canceled.",
        waitingListProcessed: openedSpot,
        claimedByCoachee: null,
      };
    } catch (error) {
      if (error instanceof AppError) {
        await this.auditLogger.log({
          actorId: input.coacheeId,
          action: "class.cancel-enrollment",
          resource: "CLASS_ENROLLMENT",
          resourceId: input.classId,
          outcome: "DENIED",
        });
      }
      throw error;
    }
  }
}
