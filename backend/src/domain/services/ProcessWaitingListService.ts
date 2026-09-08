import type { ClassRepository } from "../ports/ClassRepository.js";
import type { DeviceTokenRepository } from "../ports/DeviceTokenRepository.js";
import type { NotificationRepository } from "../ports/NotificationRepository.js";
import type { NotificationSender } from "../ports/NotificationSender.js";
import type { UserRepository } from "../ports/UserRepository.js";
import type { WaitingListRepository } from "../ports/WaitingListRepository.js";
import { WaitingListPolicy } from "./WaitingListPolicy.js";

export interface SpotOpenedResult {
  notificationsSent: number;
  waitingListMembersNotified: number;
  coachNotificationType: number;
}

export interface ClaimResult {
  success: boolean;
  enrollmentCreated: boolean;
  waitingListRemoved: boolean;
  notificationsSent: number;
  errorCode?: string;
}

export class ProcessWaitingListService {
  private readonly policy = new WaitingListPolicy();

  constructor(
    private readonly classRepo: ClassRepository,
    private readonly waitingListRepo: WaitingListRepository,
    private readonly notificationSender: NotificationSender,
    private readonly userRepo: UserRepository,
    private readonly notificationRepo: NotificationRepository,
    private readonly deviceTokenRepo: DeviceTokenRepository,
  ) {}

  private async dispatchNotification(
    recipientId: string,
    type: number,
    content: string,
    classId: string,
  ): Promise<boolean> {
    try {
      await this.notificationRepo.create({
        recipientId,
        type,
        content,
        classId,
      });
    } catch {
      return false;
    }

    try {
      const tokens = await this.deviceTokenRepo.listActiveTokens(recipientId);
      if (tokens.length > 0) {
        const outcome = await this.notificationSender.send(
          {
            content,
            data: {
              classId,
              type: String(type),
              link: "/",
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

    return true;
  }

  async processSpotOpened(classId: string): Promise<SpotOpenedResult> {
    const trainingClass = await this.classRepo.findByIdWithEnrollmentsAndWaitingLists(classId);
    if (!trainingClass) {
      return { notificationsSent: 0, waitingListMembersNotified: 0, coachNotificationType: 0 };
    }

    const waitlistEntries = await this.waitingListRepo.findByClassId(classId);
    const hasWaitingList = waitlistEntries.length > 0;

    let notificationsSent = 0;
    let waitingListMembersNotified = 0;

    // Notify all waitlisted coachees simultaneously
    for (const entry of waitlistEntries) {
      try {
        const coachee = await this.userRepo.findById(entry.coacheeId);
        if (!coachee) continue;

        const content = this.buildSpotOpenedContent(trainingClass);
        const dispatched = await this.dispatchNotification(
          coachee.id,
          this.policy.notificationTypeForSpotOpened(),
          content,
          trainingClass.id,
        );
        if (dispatched) {
          waitingListMembersNotified++;
          notificationsSent++;
        }
      } catch {
        // Delivery failure isolation — never break the flow
      }
    }

    // Notify coach
    try {
      const coach = await this.userRepo.findById(trainingClass.assignedCoachId);
      if (coach) {
        const coachNotificationType =
          this.policy.coachNotificationTypeForSpotOpened(hasWaitingList);
        const content = this.buildCoachNotificationContent(trainingClass, hasWaitingList);
        const dispatched = await this.dispatchNotification(
          coach.id,
          coachNotificationType,
          content,
          trainingClass.id,
        );
        if (dispatched) notificationsSent++;
        return {
          notificationsSent,
          waitingListMembersNotified,
          coachNotificationType,
        };
      }
    } catch {
      // Delivery failure isolation
    }

    return {
      notificationsSent,
      waitingListMembersNotified,
      coachNotificationType: this.policy.coachNotificationTypeForSpotOpened(hasWaitingList),
    };
  }

  async processClaim(classId: string, coacheeId: string): Promise<ClaimResult> {
    const trainingClass = await this.classRepo.findByIdWithEnrollmentsAndWaitingLists(classId);
    if (!trainingClass) {
      return {
        success: false,
        enrollmentCreated: false,
        waitingListRemoved: false,
        notificationsSent: 0,
        errorCode: "CLASS_NOT_FOUND",
      };
    }

    if (trainingClass.status !== "ACTIVE") {
      return {
        success: false,
        enrollmentCreated: false,
        waitingListRemoved: false,
        notificationsSent: 0,
        errorCode: "CANCELED_CLASS",
      };
    }

    const waitingListEntry = await this.waitingListRepo.findByClassIdAndCoacheeId(
      classId,
      coacheeId,
    );
    if (!waitingListEntry) {
      return {
        success: false,
        enrollmentCreated: false,
        waitingListRemoved: false,
        notificationsSent: 0,
        errorCode: "NOT_ON_WAITING_LIST",
      };
    }

    const isAlreadyEnrolled = trainingClass.enrollments.some((e) => e.coacheeId === coacheeId);
    if (isAlreadyEnrolled) {
      return {
        success: false,
        enrollmentCreated: false,
        waitingListRemoved: false,
        notificationsSent: 0,
        errorCode: "ALREADY_ENROLLED",
      };
    }

    const isFull = trainingClass.enrollments.length >= WaitingListPolicy.GROUP_CAPACITY;
    if (isFull) {
      return {
        success: false,
        enrollmentCreated: false,
        waitingListRemoved: false,
        notificationsSent: 0,
        errorCode: "SPOT_TAKEN",
      };
    }

    // Claim is valid — the actual enrollment creation and waiting list deletion
    // are handled by the calling use case within a serializable transaction.
    // This service validates and prepares the notification dispatch.

    let notificationsSent = 0;

    // Notify the claiming coachee (#9)
    try {
      const coachee = await this.userRepo.findById(coacheeId);
      if (coachee) {
        const content = this.buildClaimConfirmationContent(trainingClass);
        const dispatched = await this.dispatchNotification(
          coachee.id,
          this.policy.notificationTypeForJoin(),
          content,
          trainingClass.id,
        );
        if (dispatched) notificationsSent++;
      }
    } catch {
      // Delivery failure isolation
    }

    // Notify the coach (#6)
    try {
      const coach = await this.userRepo.findById(trainingClass.assignedCoachId);
      if (coach) {
        const content = this.buildCoachClaimNotificationContent(trainingClass, coacheeId);
        const dispatched = await this.dispatchNotification(
          coach.id,
          this.policy.notificationTypeForSpotClaimed(),
          content,
          trainingClass.id,
        );
        if (dispatched) notificationsSent++;
      }
    } catch {
      // Delivery failure isolation
    }

    return {
      success: true,
      enrollmentCreated: true,
      waitingListRemoved: true,
      notificationsSent,
    };
  }

  private buildSpotOpenedContent(cls: {
    classType: string;
    level: { name: string } | null;
    startTime: Date;
    assignedCoach: { name: string };
  }): string {
    const levelName = cls.level?.name ?? "Unknown";
    const dateStr = cls.startTime.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const timeStr = cls.startTime.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `A spot has opened in ${cls.classType.toLowerCase()} class (${levelName}) on ${dateStr} at ${timeStr} with Coach ${cls.assignedCoach.name}. Claim it now \u2014 first come, first served!`;
  }

  private buildCoachNotificationContent(
    cls: {
      classType: string;
      level: { name: string } | null;
      startTime: Date;
    },
    hasWaitingList: boolean,
  ): string {
    const levelName = cls.level?.name ?? "Unknown";
    const dateStr = cls.startTime.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    if (hasWaitingList) {
      return `A Coachee canceled enrollment in ${cls.classType.toLowerCase()} class (${levelName}) on ${dateStr}. Waitlisted Coachees have been notified to claim the spot.`;
    }
    return `A Coachee canceled enrollment in ${cls.classType.toLowerCase()} class (${levelName}) on ${dateStr}. The spot is now available.`;
  }

  private buildClaimConfirmationContent(cls: {
    classType: string;
    level: { name: string } | null;
    startTime: Date;
  }): string {
    const levelName = cls.level?.name ?? "Unknown";
    const dateStr = cls.startTime.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const timeStr = cls.startTime.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `You joined ${cls.classType.toLowerCase()} class (${levelName}) on ${dateStr} at ${timeStr} from the waiting list.`;
  }

  private buildCoachClaimNotificationContent(
    cls: {
      classType: string;
      level: { name: string } | null;
      startTime: Date;
    },
    _coacheeId: string,
  ): string {
    const levelName = cls.level?.name ?? "Unknown";
    const dateStr = cls.startTime.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return `A waitlisted Coachee has claimed the spot in ${cls.classType.toLowerCase()} class (${levelName}) on ${dateStr}.`;
  }
}
