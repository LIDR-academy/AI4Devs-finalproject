import { describe, expect, test } from "bun:test";
import { countCodePoints, validateDescription, validateTitle } from "./validation";

describe("validateTitle", () => {
  test("accepts and trims a non-empty title", () => {
    expect(validateTitle("  hi  ")).toEqual({ ok: true, value: "hi" });
  });

  test("rejects an empty title", () => {
    expect(validateTitle("")).toEqual({ ok: false, error: "empty" });
  });

  test("rejects a whitespace-only title", () => {
    expect(validateTitle("   ")).toEqual({ ok: false, error: "empty" });
  });
});

describe("validateDescription", () => {
  test("accepts an empty description", () => {
    expect(validateDescription("")).toEqual({ ok: true, value: "" });
  });

  test("accepts exactly 100 code points, including multi-byte characters", () => {
    const description = "😀".repeat(100); // 100 code points, 200 UTF-16 units
    expect(countCodePoints(description)).toBe(100);
    expect(validateDescription(description)).toEqual({ ok: true, value: description });
  });

  test("rejects 101 code points", () => {
    expect(validateDescription("a".repeat(101))).toEqual({ ok: false, error: "too-long" });
  });

  test("counts code points, not UTF-16 units", () => {
    const description = "😀".repeat(51); // 51 code points, 102 UTF-16 units
    expect(description.length).toBe(102);
    expect(validateDescription(description).ok).toBe(true);
  });
});
