import { isWithinReach } from "./ReachCalculator.js";

export type LifecycleNotificationType = 2 | 7 | 8 | 12;

export class ClassLifecycleNotificationPolicy {
  notificationTypeForNewClass(): 2 {
    return 2;
  }

  notificationTypeForIndividualAssignment(): 8 {
    return 8;
  }

  notificationTypeForClassCanceled(): 7 {
    return 7;
  }

  notificationTypeForCoachAssignment(): 12 {
    return 12;
  }

  shouldNotifyCoachOfClassAssignment(createdBy: string, assignedCoachId: string): boolean {
    return createdBy !== assignedCoachId;
  }

  isEligibleForNewClassNotification(coacheeSortOrder: number, classSortOrder: number): boolean {
    return isWithinReach(coacheeSortOrder, classSortOrder);
  }
}
