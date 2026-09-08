import { describe, expect, it } from "vitest";
import { canAddToGymSlot, type GymSlotUsage, validateClassSize } from "./CapacityValidator.js";

describe("CapacityValidator", () => {
  describe("validateClassSize", () => {
    it("accepts exactly 1 coachee for an individual class", () => {
      expect(validateClassSize("INDIVIDUAL", 1)).toBe(true);
    });

    it("rejects zero coachees for an individual class", () => {
      expect(validateClassSize("INDIVIDUAL", 0)).toBe(false);
    });

    it("rejects multiple coachees for an individual class", () => {
      expect(validateClassSize("INDIVIDUAL", 2)).toBe(false);
    });

    it("accepts 3 coachees for a group class (minimum)", () => {
      expect(validateClassSize("GROUP", 3)).toBe(true);
    });

    it("accepts 4 coachees for a group class (maximum)", () => {
      expect(validateClassSize("GROUP", 4)).toBe(true);
    });

    it("rejects 2 coachees for a group class", () => {
      expect(validateClassSize("GROUP", 2)).toBe(false);
    });

    it("rejects 5 coachees for a group class", () => {
      expect(validateClassSize("GROUP", 5)).toBe(false);
    });
  });

  describe("canAddToGymSlot", () => {
    const empty: GymSlotUsage = { individualCount: 0, groupCount: 0 };
    const oneIndividual: GymSlotUsage = { individualCount: 1, groupCount: 0 };
    const twoIndividuals: GymSlotUsage = { individualCount: 2, groupCount: 0 };
    const oneGroup: GymSlotUsage = { individualCount: 0, groupCount: 1 };
    const full: GymSlotUsage = { individualCount: 2, groupCount: 1 };

    it("allows an individual class in an empty slot", () => {
      expect(canAddToGymSlot(empty, "INDIVIDUAL")).toBe(true);
    });

    it("allows a second individual class", () => {
      expect(canAddToGymSlot(oneIndividual, "INDIVIDUAL")).toBe(true);
    });

    it("rejects a third individual class", () => {
      expect(canAddToGymSlot(twoIndividuals, "INDIVIDUAL")).toBe(false);
    });

    it("allows a group class in an empty slot", () => {
      expect(canAddToGymSlot(empty, "GROUP")).toBe(true);
    });

    it("rejects a second group class", () => {
      expect(canAddToGymSlot(oneGroup, "GROUP")).toBe(false);
    });

    it("allows an individual class alongside a group class", () => {
      expect(canAddToGymSlot(oneGroup, "INDIVIDUAL")).toBe(true);
    });

    it("rejects everything when the slot is full (2 individual + 1 group)", () => {
      expect(canAddToGymSlot(full, "INDIVIDUAL")).toBe(false);
      expect(canAddToGymSlot(full, "GROUP")).toBe(false);
    });
  });
});
