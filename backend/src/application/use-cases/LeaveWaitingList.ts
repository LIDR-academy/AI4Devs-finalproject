import type { PrismaClient } from "@prisma/client";
import type { WaitingListPolicy } from "../../domain/services/WaitingListPolicy.js";
import { ForbiddenError, NotFoundError } from "../../infrastructure/errors.js";
import type { AuditLogger } from "../../infrastructure/logging/AuditLogger.js";

export interface LeaveWaitingListInput {
  classId: string;
  coacheeId: string;
}

export interface LeaveWaitingListResult {
  message: string;
}

export class LeaveWaitingList {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly policy: WaitingListPolicy,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(input: LeaveWaitingListInput): Promise<LeaveWaitingListResult> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const trainingClass = await tx.trainingClass.findUnique({
          where: { id: input.classId },
        });
        if (!trainingClass) {
          throw new NotFoundError("Class not found.");
        }

        const coachee = await tx.user.findUnique({
          where: { id: input.coacheeId },
        });
        if (!coachee) {
          throw new NotFoundError("Coachee not found.");
        }
        if (coachee.role !== "COACHEE" || coachee.status !== "ACTIVE") {
          throw new ForbiddenError("Only an active Coachee can leave a waiting list.");
        }

        const entry = await tx.waitingList.findUnique({
          where: {
            class_id_coachee_id: {
              class_id: input.classId,
              coachee_id: input.coacheeId,
            },
          },
        });
        if (!entry) {
          throw new NotFoundError("You are not on the waiting list for this class.");
        }
        if (!this.policy.ownsEntry(input.coacheeId, entry.coachee_id)) {
          throw new ForbiddenError("You can only leave your own waiting-list entry.");
        }

        await tx.waitingList.delete({ where: { id: entry.id } });

        await tx.notification.create({
          data: {
            notification_type: this.policy.notificationTypeForLeave(),
            recipient_id: input.coacheeId,
            class_id: input.classId,
            content: "You left the waiting list for this class.",
          },
        });
      });

      await this.auditLogger.log({
        actorId: input.coacheeId,
        action: "waiting-list.leave",
        resource: "WAITING_LIST",
        resourceId: input.classId,
        outcome: "SUCCESS",
      });

      return { message: "Removed from waiting list." };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        await this.auditLogger.log({
          actorId: input.coacheeId,
          action: "waiting-list.leave",
          resource: "WAITING_LIST",
          resourceId: input.classId,
          outcome: "DENIED",
        });
      }
      throw error;
    }
  }
}
