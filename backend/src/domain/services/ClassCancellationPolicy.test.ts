import { describe, expect, it } from "vitest";
import {
  type CancellationActor,
  type CancellationScope,
  ClassCancellationPolicy,
  type ClassInstanceLike,
} from "./ClassCancellationPolicy.js";

const now = new Date("2026-01-15T10:00:00.000Z");

const instance = (overrides: Partial<ClassInstanceLike>): ClassInstanceLike => ({
  id: "inst-1",
  status: "ACTIVE",
  start_time: new Date("2026-01-16T09:00:00.000Z"),
  recurrence_series_id: "series-1",
  ...overrides,
});

const actor = (overrides: Partial<CancellationActor>): CancellationActor => ({
  id: "user-1",
  role: "COACH",
  ...overrides,
});

describe("ClassCancellationPolicy.canCancel", () => {
  const policy = new ClassCancellationPolicy();

  it("allows an Admin for any class", () => {
    expect(policy.canCancel(actor({ id: "admin-1", role: "ADMIN" }), "assigned-1")).toBe(true);
    expect(policy.canCancel(actor({ id: "admin-1", role: "ADMIN" }), null)).toBe(true);
  });

  it("allows the assigned Coach", () => {
    expect(policy.canCancel(actor({ id: "assigned-1", role: "COACH" }), "assigned-1")).toBe(true);
  });

  it("denies any other Coach", () => {
    expect(policy.canCancel(actor({ id: "other-1", role: "COACH" }), "assigned-1")).toBe(false);
  });

  it("denies a Coachee even if it matches the assigned coach id", () => {
    expect(policy.canCancel(actor({ id: "assigned-1", role: "COACHEE" }), "assigned-1")).toBe(
      false,
    );
  });

  it("denies a non-admin when there is no assigned coach", () => {
    expect(policy.canCancel(actor({ id: "user-1", role: "COACH" }), null)).toBe(false);
  });
});

describe("ClassCancellationPolicy.selectInstancesToCancel (single)", () => {
  const policy = new ClassCancellationPolicy();

  it.each<CancellationScope>([
    "single",
    "series",
  ])("returns the target id for a future ACTIVE instance with scope=%s", (scope) => {
    const result = policy.selectInstancesToCancel([instance({})], "inst-1", scope, now);
    expect(result.targetIds).toEqual(["inst-1"]);
  });

  it("returns an empty list when the target is already canceled (single)", () => {
    const result = policy.selectInstancesToCancel(
      [instance({ status: "CANCELED" })],
      "inst-1",
      "single",
      now,
    );
    expect(result.targetIds).toEqual([]);
  });

  it("returns an empty list when the target is in the past (single)", () => {
    const result = policy.selectInstancesToCancel(
      [instance({ start_time: new Date("2026-01-14T09:00:00.000Z") })],
      "inst-1",
      "single",
      now,
    );
    expect(result.targetIds).toEqual([]);
  });

  it("returns an empty list when the target is not among the instances (single)", () => {
    const result = policy.selectInstancesToCancel([instance({})], "missing", "single", now);
    expect(result.targetIds).toEqual([]);
  });
});

describe("ClassCancellationPolicy.selectInstancesToCancel (series)", () => {
  const policy = new ClassCancellationPolicy();

  it("selects every future ACTIVE instance of the series including the target", () => {
    const instances = [
      instance({ id: "a", start_time: new Date("2026-01-16T09:00:00.000Z") }),
      instance({ id: "b", start_time: new Date("2026-01-23T09:00:00.000Z") }),
      instance({ id: "c", start_time: new Date("2026-01-30T09:00:00.000Z") }),
    ];
    const result = policy.selectInstancesToCancel(instances, "b", "series", now);
    expect(result.targetIds).toEqual(["a", "b", "c"]);
  });

  it("skips already-canceled instances", () => {
    const instances = [
      instance({ id: "a", start_time: new Date("2026-01-16T09:00:00.000Z") }),
      instance({ id: "b", status: "CANCELED", start_time: new Date("2026-01-23T09:00:00.000Z") }),
      instance({ id: "c", start_time: new Date("2026-01-30T09:00:00.000Z") }),
    ];
    const result = policy.selectInstancesToCancel(instances, "c", "series", now);
    expect(result.targetIds).toEqual(["a", "c"]);
  });

  it("never touches past instances", () => {
    const instances = [
      instance({ id: "past", start_time: new Date("2026-01-10T09:00:00.000Z") }),
      instance({ id: "target", start_time: new Date("2026-01-16T09:00:00.000Z") }),
    ];
    const result = policy.selectInstancesToCancel(instances, "target", "series", now);
    expect(result.targetIds).toEqual(["target"]);
  });

  it("ignores instances from another series", () => {
    const instances = [
      instance({ id: "a", start_time: new Date("2026-01-16T09:00:00.000Z") }),
      instance({
        id: "other",
        recurrence_series_id: "series-2",
        start_time: new Date("2026-01-17T09:00:00.000Z"),
      }),
      instance({ id: "c", start_time: new Date("2026-01-23T09:00:00.000Z") }),
    ];
    const result = policy.selectInstancesToCancel(instances, "c", "series", now);
    expect(result.targetIds).toEqual(["a", "c"]);
  });

  it("returns the target alone for a non-recurring class with scope=series", () => {
    const instances = [
      instance({ id: "a", recurrence_series_id: null }),
      instance({
        id: "b",
        recurrence_series_id: "series-1",
        start_time: new Date("2026-01-23T09:00:00.000Z"),
      }),
    ];
    const result = policy.selectInstancesToCancel(instances, "a", "series", now);
    expect(result.targetIds).toEqual(["a"]);
  });
});

describe("ClassCancellationPolicy.notificationTypeForCancellation", () => {
  it("maps to notification type 7", () => {
    expect(new ClassCancellationPolicy().notificationTypeForCancellation()).toBe(7);
  });
});
