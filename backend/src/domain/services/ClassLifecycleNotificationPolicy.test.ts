import { describe, expect, it } from "vitest";
import { ClassLifecycleNotificationPolicy } from "./ClassLifecycleNotificationPolicy.js";

describe("ClassLifecycleNotificationPolicy", () => {
  const policy = new ClassLifecycleNotificationPolicy();

  describe("notificationTypeForNewClass", () => {
    it("returns 2", () => {
      expect(policy.notificationTypeForNewClass()).toBe(2);
    });
  });

  describe("notificationTypeForIndividualAssignment", () => {
    it("returns 8", () => {
      expect(policy.notificationTypeForIndividualAssignment()).toBe(8);
    });
  });

  describe("notificationTypeForClassCanceled", () => {
    it("returns 7", () => {
      expect(policy.notificationTypeForClassCanceled()).toBe(7);
    });
  });

  describe("notificationTypeForCoachAssignment", () => {
    it("returns 12", () => {
      expect(policy.notificationTypeForCoachAssignment()).toBe(12);
    });
  });

  describe("shouldNotifyCoachOfClassAssignment", () => {
    it("returns true when creator and assigned coach are different", () => {
      expect(policy.shouldNotifyCoachOfClassAssignment("coach-1", "coach-2")).toBe(true);
    });

    it("returns false when creator and assigned coach are the same", () => {
      expect(policy.shouldNotifyCoachOfClassAssignment("coach-1", "coach-1")).toBe(false);
    });

    it("returns true when assigned coach is null/undefined", () => {
      expect(policy.shouldNotifyCoachOfClassAssignment("coach-1", "")).toBe(true);
    });
  });

  describe("isEligibleForNewClassNotification", () => {
    it("returns true when coachee is at the same level as the class", () => {
      expect(policy.isEligibleForNewClassNotification(3, 3)).toBe(true);
    });

    it("returns true when coachee is one level below the class", () => {
      expect(policy.isEligibleForNewClassNotification(2, 3)).toBe(true);
    });

    it("returns true when coachee is one level above the class", () => {
      expect(policy.isEligibleForNewClassNotification(4, 3)).toBe(true);
    });

    it("returns false when coachee is two levels below the class", () => {
      expect(policy.isEligibleForNewClassNotification(1, 3)).toBe(false);
    });

    it("returns false when coachee is two levels above the class", () => {
      expect(policy.isEligibleForNewClassNotification(5, 3)).toBe(false);
    });

    it("returns false when coachee is three levels away", () => {
      expect(policy.isEligibleForNewClassNotification(1, 4)).toBe(false);
    });

    it("handles boundary levels (level 1)", () => {
      expect(policy.isEligibleForNewClassNotification(1, 1)).toBe(true);
      expect(policy.isEligibleForNewClassNotification(2, 1)).toBe(true);
      expect(policy.isEligibleForNewClassNotification(3, 1)).toBe(false);
    });

    it("handles boundary levels (level 5)", () => {
      expect(policy.isEligibleForNewClassNotification(5, 5)).toBe(true);
      expect(policy.isEligibleForNewClassNotification(4, 5)).toBe(true);
      expect(policy.isEligibleForNewClassNotification(3, 5)).toBe(false);
    });
  });
});
