import { describe, expect, it } from "vitest";
import { toGymIsoDateTime } from "./gymDateTime";

describe("toGymIsoDateTime", () => {
  it("converts a winter wall-clock time (CET, UTC+1)", () => {
    expect(toGymIsoDateTime("2026-01-15", "15:00")).toBe("2026-01-15T14:00:00.000Z");
  });

  it("converts a summer wall-clock time (CEST, UTC+2)", () => {
    expect(toGymIsoDateTime("2026-08-17", "15:00")).toBe("2026-08-17T13:00:00.000Z");
  });

  it("handles the spring-forward transition (nonexistent local hour)", () => {
    expect(toGymIsoDateTime("2026-03-29", "03:00")).toBe("2026-03-29T01:00:00.000Z");
  });

  it("handles the fall-back transition", () => {
    expect(toGymIsoDateTime("2026-10-25", "03:00")).toBe("2026-10-25T02:00:00.000Z");
  });

  it("keeps minutes intact", () => {
    expect(toGymIsoDateTime("2026-08-17", "09:30")).toBe("2026-08-17T07:30:00.000Z");
  });
});
