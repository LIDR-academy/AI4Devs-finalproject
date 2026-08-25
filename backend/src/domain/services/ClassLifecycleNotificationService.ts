import type { ClassRepository } from "../ports/ClassRepository.js";
import type { DeviceTokenRepository } from "../ports/DeviceTokenRepository.js";
import type { NotificationRepository } from "../ports/NotificationRepository.js";
import type { NotificationSender } from "../ports/NotificationSender.js";
import type { UserRepository } from "../ports/UserRepository.js";
import { ClassLifecycleNotificationPolicy } from "./ClassLifecycleNotificationPolicy.js";
import {
  renderClassCanceled,
  renderCoachAssigned,
  renderIndividualClassAssigned,
  renderNewClassAvailable,
} from "./NotificationContentRenderer.js";

export interface ClassLifecycleNotificationResult {
  notificationsSent: number;
}

export class ClassLifecycleNotificationService {
  private readonly policy = new ClassLifecycleNotificationPolicy();

  constructor(
    private readonly classRepo: ClassRepository,
    private readonly userRepo: UserRepository,
    private readonly notificationRepo: NotificationRepository,
    private readonly notificationSender: NotificationSender,
    private readonly deviceTokenRepo: DeviceTokenRepository,
  ) {}

  async notifyNewClassAvailable(classId: string): Promise<ClassLifecycleNotificationResult> {
    const trainingClass = await this.classRepo.findByIdWithEnrollmentsAndWaitingLists(classId);
    if (!trainingClass?.level) {
      return { notificationsSent: 0 };
    }

    const eligibleCoachees = await this.userRepo.findActiveCoacheesByLevelReach(
      trainingClass.level.sortOrder,
    );

    let notificationsSent = 0;
    for (const coachee of eligibleCoachees) {
      if (
        !coachee.levelSortOrder ||
        !this.policy.isEligibleForNewClassNotification(
          coachee.levelSortOrder,
          trainingClass.level.sortOrder,
        )
      ) {
        continue;
      }

      const content = renderNewClassAvailable(
        trainingClass.level.name,
        trainingClass.startTime,
        trainingClass.assignedCoach.name,
      );

      try {
        await this.notificationRepo.create({
          recipientId: coachee.id,
          type: this.policy.notificationTypeForNewClass(),
          content,
          classId: trainingClass.id,
        });
      } catch {
        continue;
      }

      try {
        const tokens = await this.deviceTokenRepo.listActiveTokens(coachee.id);
        if (tokens.length > 0) {
          const outcome = await this.notificationSender.send(
            {
              content,
              data: {
                classId: trainingClass.id,
                type: String(this.policy.notificationTypeForNewClass()),
              },
            },
            tokens,
          );
          const permanentFailures = outcome.failed.filter((f) => f.permanent).map((f) => f.token);
          if (permanentFailures.length > 0) {
            await this.deviceTokenRepo.deactivate(permanentFailures);
          }
        }
      } catch {
        // Delivery failure isolation — never break the flow
      }

      notificationsSent++;
    }

    return { notificationsSent };
  }

  async notifyIndividualClassAssigned(
    classId: string,
    coacheeId: string,
  ): Promise<ClassLifecycleNotificationResult> {
    const trainingClass = await this.classRepo.findByIdWithEnrollmentsAndWaitingLists(classId);
    if (!trainingClass) {
      return { notificationsSent: 0 };
    }

    const coach = await this.userRepo.findById(trainingClass.assignedCoachId);
    if (!coach) {
      return { notificationsSent: 0 };
    }

    const coachee = await this.userRepo.findById(coacheeId);
    if (!coachee) {
      return { notificationsSent: 0 };
    }

    const levelName = trainingClass.level?.name ?? "General";

    const content = renderIndividualClassAssigned(
      coachee.name,
      trainingClass.startTime,
      levelName,
      coach.name,
    );

    try {
      await this.notificationRepo.create({
        recipientId: coach.id,
        type: this.policy.notificationTypeForIndividualAssignment(),
        content,
        classId: trainingClass.id,
      });
    } catch {
      return { notificationsSent: 0 };
    }

    try {
      const tokens = await this.deviceTokenRepo.listActiveTokens(coach.id);
      if (tokens.length > 0) {
        const outcome = await this.notificationSender.send(
          {
            content,
            data: {
              classId: trainingClass.id,
              type: String(this.policy.notificationTypeForIndividualAssignment()),
            },
          },
          tokens,
        );
        const permanentFailures = outcome.failed.filter((f) => f.permanent).map((f) => f.token);
        if (permanentFailures.length > 0) {
          await this.deviceTokenRepo.deactivate(permanentFailures);
        }
      }
    } catch {
      // Delivery failure isolation
    }

    return { notificationsSent: 1 };
  }

  async notifyClassCanceled(classId: string): Promise<ClassLifecycleNotificationResult> {
    const trainingClass = await this.classRepo.findByIdWithEnrollmentsAndWaitingLists(classId);
    if (!trainingClass) {
      return { notificationsSent: 0 };
    }

    const levelName = trainingClass.level?.name ?? "General";
    let notificationsSent = 0;
    for (const enrollment of trainingClass.enrollments) {
      const coachee = await this.userRepo.findById(enrollment.coacheeId);
      if (!coachee) continue;

      const content = renderClassCanceled(
        levelName,
        trainingClass.classType,
        trainingClass.startTime,
        trainingClass.assignedCoach.name,
      );

      try {
        await this.notificationRepo.create({
          recipientId: coachee.id,
          type: this.policy.notificationTypeForClassCanceled(),
          content,
          classId: trainingClass.id,
        });
      } catch {
        continue;
      }

      try {
        const tokens = await this.deviceTokenRepo.listActiveTokens(coachee.id);
        if (tokens.length > 0) {
          const outcome = await this.notificationSender.send(
            {
              content,
              data: {
                classId: trainingClass.id,
                type: String(this.policy.notificationTypeForClassCanceled()),
              },
            },
            tokens,
          );
          const permanentFailures = outcome.failed.filter((f) => f.permanent).map((f) => f.token);
          if (permanentFailures.length > 0) {
            await this.deviceTokenRepo.deactivate(permanentFailures);
          }
        }
      } catch {
        // Delivery failure isolation
      }

      notificationsSent++;
    }

    return { notificationsSent };
  }

  async notifyCoachAssigned(classId: string): Promise<ClassLifecycleNotificationResult> {
    const trainingClass = await this.classRepo.findByIdWithEnrollmentsAndWaitingLists(classId);
    if (!trainingClass) {
      return { notificationsSent: 0 };
    }

    if (
      !this.policy.shouldNotifyCoachOfClassAssignment(
        trainingClass.createdBy,
        trainingClass.assignedCoachId,
      )
    ) {
      return { notificationsSent: 0 };
    }

    const coach = await this.userRepo.findById(trainingClass.assignedCoachId);
    if (!coach) {
      return { notificationsSent: 0 };
    }

    const levelName = trainingClass.level?.name ?? "General";

    const content = renderCoachAssigned(
      levelName,
      trainingClass.classType,
      trainingClass.startTime,
    );

    try {
      await this.notificationRepo.create({
        recipientId: coach.id,
        type: this.policy.notificationTypeForCoachAssignment(),
        content,
        classId: trainingClass.id,
      });
    } catch {
      return { notificationsSent: 0 };
    }

    try {
      const tokens = await this.deviceTokenRepo.listActiveTokens(coach.id);
      if (tokens.length > 0) {
        const outcome = await this.notificationSender.send(
          {
            content,
            data: {
              classId: trainingClass.id,
              type: String(this.policy.notificationTypeForCoachAssignment()),
            },
          },
          tokens,
        );
        const permanentFailures = outcome.failed.filter((f) => f.permanent).map((f) => f.token);
        if (permanentFailures.length > 0) {
          await this.deviceTokenRepo.deactivate(permanentFailures);
        }
      }
    } catch {
      // Delivery failure isolation
    }

    return { notificationsSent: 1 };
  }
}
