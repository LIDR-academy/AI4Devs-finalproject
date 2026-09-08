import type { PrismaClient } from "@prisma/client";
import type { DeviceTokenRepository } from "../../domain/ports/DeviceTokenRepository.js";
import type { NotificationSender } from "../../domain/ports/NotificationSender.js";
import type { EnrollmentPolicy } from "../../domain/services/EnrollmentPolicy.js";
import type { ProcessWaitingListService } from "../../domain/services/ProcessWaitingListService.js";
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
  notificationsSent: number;
  waitingListMembersNotified: number;
}

export class CancelEnrollment {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly policy: EnrollmentPolicy,
    private readonly auditLogger: AuditLogger,
    private readonly processWaitingList?: ProcessWaitingListService,
    private readonly deviceTokenRepo?: DeviceTokenRepository,
    private readonly notificationSender?: NotificationSender | null,
  ) {}

  async execute(input: CancelEnrollmentInput): Promise<CancelEnrollmentResult> {
    try {
      const txResult = await this.prisma.$transaction(async (tx) => {
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
        const willNotifyViaWaitingListService =
          hasWaitingList && this.processWaitingList !== undefined;

        let coachNotification: {
          id: string;
          type: number;
          content: string;
          recipientId: string;
        } | null = null;
        if (!willNotifyViaWaitingListService) {
          const created = await tx.notification.create({
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
          coachNotification = {
            id: created.id,
            type: created.notification_type,
            content: created.content,
            recipientId: created.recipient_id,
          };
        }

        return {
          openedSpot: this.policy.openedSpotDetected(hasWaitingList),
          hasWaitingList,
          coachNotification,
        };
      });

      // Process waiting-list automation after the transaction commits
      let notificationsSent = 1; // coach notification already sent in transaction
      let waitingListMembersNotified = 0;

      if (txResult.coachNotification && this.notificationSender && this.deviceTokenRepo) {
        await this.dispatchCoachPush(txResult.coachNotification, input.classId);
      }

      if (txResult.openedSpot && this.processWaitingList) {
        try {
          const wlResult = await this.processWaitingList.processSpotOpened(input.classId);
          notificationsSent = wlResult.notificationsSent;
          waitingListMembersNotified = wlResult.waitingListMembersNotified;

          await this.auditLogger.log({
            actorId: input.coacheeId,
            action: "waiting-list.notify-spot-opened",
            resource: "WAITING_LIST",
            resourceId: input.classId,
            outcome: "SUCCESS",
          });
        } catch {
          // Notification delivery failure must not break the cancellation
          await this.auditLogger.log({
            actorId: input.coacheeId,
            action: "waiting-list.notify-spot-opened",
            resource: "WAITING_LIST",
            resourceId: input.classId,
            outcome: "DENIED",
          });
        }
      }

      await this.auditLogger.log({
        actorId: input.coacheeId,
        action: "class.cancel-enrollment",
        resource: "CLASS_ENROLLMENT",
        resourceId: input.classId,
        outcome: "SUCCESS",
      });

      return {
        message: "Enrollment canceled.",
        waitingListProcessed: txResult.openedSpot,
        claimedByCoachee: null,
        notificationsSent,
        waitingListMembersNotified,
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

  private async dispatchCoachPush(
    notification: { id: string; type: number; content: string; recipientId: string },
    classId: string,
  ): Promise<void> {
    const repo = this.deviceTokenRepo;
    const sender = this.notificationSender;
    if (!repo || !sender) return;

    try {
      const tokens = await repo.listActiveTokens(notification.recipientId);
      if (tokens.length === 0) return;

      const outcome = await sender.send(
        {
          content: notification.content,
          data: {
            notificationId: notification.id,
            type: String(notification.type),
            classId,
          },
        },
        tokens,
      );

      const permanentFailures = outcome.failed
        .filter((failure) => failure.permanent)
        .map((failure) => failure.token);
      if (permanentFailures.length > 0) {
        await repo.deactivate(permanentFailures);
      }
    } catch {
      // Delivery failure isolation — a push failure must never break the cancellation
    }
  }
}
