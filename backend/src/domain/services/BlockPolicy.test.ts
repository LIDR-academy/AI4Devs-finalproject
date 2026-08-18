import { describe, expect, it } from "vitest";
import { BlockPolicy, type BlockPolicyLike } from "./BlockPolicy.js";

describe("BlockPolicy.validBlockWindow", () => {
  const policy = new BlockPolicy();
  const now = new Date("2026-08-18T08:00:00.000Z");

  it("accepts an hour-aligned window of at least 60 minutes starting at or after now", () => {
    const start = new Date("2026-08-18T09:00:00.000Z");
    const end = new Date("2026-08-18T10:00:00.000Z");
    expect(policy.validBlockWindow(start, end, now)).toEqual({ valid: true });
  });

  it("accepts a window starting exactly at now", () => {
    const start = new Date("2026-08-18T08:00:00.000Z");
    const end = new Date("2026-08-18T10:00:00.000Z");
    expect(policy.validBlockWindow(start, end, now)).toEqual({ valid: true });
  });

  it("accepts a multi-hour window", () => {
    const start = new Date("2026-08-18T09:00:00.000Z");
    const end = new Date("2026-08-18T12:00:00.000Z");
    expect(policy.validBlockWindow(start, end, now)).toEqual({ valid: true });
  });

  it("rejects a start not aligned to the hour boundary", () => {
    const start = new Date("2026-08-18T09:30:00.000Z");
    const end = new Date("2026-08-18T11:00:00.000Z");
    expect(policy.validBlockWindow(start, end, now)).toEqual({
      valid: false,
      reason: "HOUR_ALIGNED",
    });
  });

  it("rejects a start with non-zero seconds", () => {
    const start = new Date("2026-08-18T09:00:30.000Z");
    const end = new Date("2026-08-18T10:00:00.000Z");
    expect(policy.validBlockWindow(start, end, now)).toEqual({
      valid: false,
      reason: "HOUR_ALIGNED",
    });
  });

  it("rejects an end not aligned to the hour boundary", () => {
    const start = new Date("2026-08-18T09:00:00.000Z");
    const end = new Date("2026-08-18T10:30:00.000Z");
    expect(policy.validBlockWindow(start, end, now)).toEqual({
      valid: false,
      reason: "HOUR_ALIGNED",
    });
  });

  it("rejects a window shorter than 60 minutes", () => {
    const start = new Date("2026-08-18T09:00:00.000Z");
    const end = new Date("2026-08-18T09:30:00.000Z");
    expect(policy.validBlockWindow(start, end, now)).toEqual({
      valid: false,
      reason: "MIN_DURATION",
    });
  });

  it("rejects a window with start equal to end", () => {
    const start = new Date("2026-08-18T09:00:00.000Z");
    const end = new Date("2026-08-18T09:00:00.000Z");
    expect(policy.validBlockWindow(start, end, now)).toEqual({
      valid: false,
      reason: "RANGE",
    });
  });

  it("rejects inverted start/end", () => {
    const start = new Date("2026-08-18T10:00:00.000Z");
    const end = new Date("2026-08-18T09:00:00.000Z");
    expect(policy.validBlockWindow(start, end, now)).toEqual({
      valid: false,
      reason: "RANGE",
    });
  });

  it("rejects a start in the past", () => {
    const start = new Date("2026-08-18T07:00:00.000Z");
    const end = new Date("2026-08-18T09:00:00.000Z");
    expect(policy.validBlockWindow(start, end, now)).toEqual({
      valid: false,
      reason: "PAST_START",
    });
  });
});

describe("BlockPolicy.canCreatePersonal", () => {
  const policy = new BlockPolicy();
  const actorId = "00000000-0000-0000-0000-000000000001";
  const otherId = "00000000-0000-0000-0000-000000000002";

  it("allows an Admin to create a personal block for any coach", () => {
    expect(policy.canCreatePersonal("ADMIN", actorId, otherId)).toBe(true);
  });

  it("allows a COACH to create a personal block for themselves", () => {
    expect(policy.canCreatePersonal("COACH", actorId, actorId)).toBe(true);
  });

  it("denies a COACH creating a personal block for another coach", () => {
    expect(policy.canCreatePersonal("COACH", actorId, otherId)).toBe(false);
  });

  it("denies a COACHEE creating a personal block", () => {
    expect(policy.canCreatePersonal("COACHEE", actorId, otherId)).toBe(false);
    expect(policy.canCreatePersonal("COACHEE", actorId, actorId)).toBe(false);
  });
});

describe("BlockPolicy.canCreateGymWide", () => {
  const policy = new BlockPolicy();

  it("allows an Admin to create a gym-wide block", () => {
    expect(policy.canCreateGymWide("ADMIN")).toBe(true);
  });

  it("denies a COACH creating a gym-wide block", () => {
    expect(policy.canCreateGymWide("COACH")).toBe(false);
  });

  it("denies a COACHEE creating a gym-wide block", () => {
    expect(policy.canCreateGymWide("COACHEE")).toBe(false);
  });
});

describe("BlockPolicy.canCancel", () => {
  const policy = new BlockPolicy();
  const actorId = "00000000-0000-0000-0000-000000000001";
  const otherId = "00000000-0000-0000-0000-000000000002";

  const ownPersonal: BlockPolicyLike = { block_type: "PERSONAL", created_by: actorId };
  const otherPersonal: BlockPolicyLike = { block_type: "PERSONAL", created_by: otherId };
  const gymWide: BlockPolicyLike = { block_type: "GYM_WIDE", created_by: otherId };

  it("allows an Admin to cancel any block", () => {
    expect(policy.canCancel("ADMIN", actorId, ownPersonal)).toBe(true);
    expect(policy.canCancel("ADMIN", actorId, otherPersonal)).toBe(true);
    expect(policy.canCancel("ADMIN", actorId, gymWide)).toBe(true);
  });

  it("allows a COACH to cancel their own personal block", () => {
    expect(policy.canCancel("COACH", actorId, ownPersonal)).toBe(true);
  });

  it("denies a COACH canceling another coach's personal block", () => {
    expect(policy.canCancel("COACH", actorId, otherPersonal)).toBe(false);
  });

  it("denies a COACH canceling a gym-wide block", () => {
    expect(policy.canCancel("COACH", actorId, gymWide)).toBe(false);
  });

  it("denies a COACHEE canceling any block", () => {
    expect(policy.canCancel("COACHEE", actorId, ownPersonal)).toBe(false);
    expect(policy.canCancel("COACHEE", actorId, otherPersonal)).toBe(false);
    expect(policy.canCancel("COACHEE", actorId, gymWide)).toBe(false);
  });
});
