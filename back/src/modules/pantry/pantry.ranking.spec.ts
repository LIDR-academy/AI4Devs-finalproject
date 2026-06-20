import {
  compareUseNextCandidates,
  daysUntilExpiration,
  riskFromDays,
  UseNextCandidate,
} from "./pantry.ranking";

const NOW = new Date("2026-06-15T10:00:00.000Z");

describe("daysUntilExpiration", () => {
  it("returns 0 when expiry is today (any time)", () => {
    expect(daysUntilExpiration(new Date("2026-06-15T00:00:00.000Z"), NOW)).toBe(0);
    expect(daysUntilExpiration(new Date("2026-06-15T23:59:59.000Z"), NOW)).toBe(0);
  });

  it("returns 1 for tomorrow", () => {
    expect(daysUntilExpiration(new Date("2026-06-16T00:00:00.000Z"), NOW)).toBe(1);
  });

  it("returns negative for past dates", () => {
    expect(daysUntilExpiration(new Date("2026-06-14T00:00:00.000Z"), NOW)).toBe(-1);
    expect(daysUntilExpiration(new Date("2026-06-08T00:00:00.000Z"), NOW)).toBe(-7);
  });

  it("uses UTC day boundaries (no timezone drift)", () => {
    // 23:00 UTC is still the same UTC day as 00:01 UTC
    expect(
      daysUntilExpiration(new Date("2026-06-15T23:00:00.000Z"), new Date("2026-06-15T00:01:00.000Z")),
    ).toBe(0);
  });
});

describe("riskFromDays", () => {
  it("returns HIGH for null (but null is LOW — no expiry is low risk)", () => {
    expect(riskFromDays(null)).toBe("LOW");
  });

  it("returns HIGH for days <= 1", () => {
    expect(riskFromDays(-10)).toBe("HIGH");
    expect(riskFromDays(0)).toBe("HIGH");
    expect(riskFromDays(1)).toBe("HIGH");
  });

  it("returns MEDIUM for days 2-3", () => {
    expect(riskFromDays(2)).toBe("MEDIUM");
    expect(riskFromDays(3)).toBe("MEDIUM");
  });

  it("returns LOW for days > 3", () => {
    expect(riskFromDays(4)).toBe("LOW");
    expect(riskFromDays(100)).toBe("LOW");
  });
});

describe("compareUseNextCandidates", () => {
  const base: UseNextCandidate = {
    id: "a",
    expirationDate: new Date("2026-06-20T00:00:00.000Z"),
    createdAt: new Date("2026-06-01T00:00:00.000Z"),
  };

  describe("primary sort — days until expiration", () => {
    it("expired item ranks before expiring-soon item", () => {
      const expired: UseNextCandidate = {
        ...base,
        id: "expired",
        expirationDate: new Date("2026-06-10T00:00:00.000Z"),
      };
      const soon: UseNextCandidate = {
        ...base,
        id: "soon",
        expirationDate: new Date("2026-06-16T00:00:00.000Z"),
      };
      expect(compareUseNextCandidates(expired, soon, NOW)).toBeLessThan(0);
    });

    it("expiring-soon item ranks before item with no expiry", () => {
      const soon: UseNextCandidate = {
        ...base,
        id: "soon",
        expirationDate: new Date("2026-06-16T00:00:00.000Z"),
      };
      const noExpiry: UseNextCandidate = { ...base, id: "none", expirationDate: null };
      expect(compareUseNextCandidates(soon, noExpiry, NOW)).toBeLessThan(0);
    });

    it("item expiring in 1 day ranks before item expiring in 3 days", () => {
      const a: UseNextCandidate = { ...base, id: "a", expirationDate: new Date("2026-06-16T00:00:00.000Z") };
      const b: UseNextCandidate = { ...base, id: "b", expirationDate: new Date("2026-06-18T00:00:00.000Z") };
      expect(compareUseNextCandidates(a, b, NOW)).toBeLessThan(0);
    });
  });

  describe("tie-break 1 — exact expiration timestamp", () => {
    it("same calendar day but earlier time ranks first", () => {
      const early: UseNextCandidate = {
        ...base,
        id: "early",
        expirationDate: new Date("2026-06-20T06:00:00.000Z"),
      };
      const late: UseNextCandidate = {
        ...base,
        id: "late",
        expirationDate: new Date("2026-06-20T18:00:00.000Z"),
      };
      // both daysUntilExpiration = 5, but early ms < late ms
      expect(compareUseNextCandidates(early, late, NOW)).toBeLessThan(0);
    });
  });

  describe("tie-break 2 — creation date (older first)", () => {
    it("older item ranks before newer when expiry is identical", () => {
      const older: UseNextCandidate = {
        ...base,
        id: "older",
        expirationDate: new Date("2026-06-20T00:00:00.000Z"),
        createdAt: new Date("2026-05-01T00:00:00.000Z"),
      };
      const newer: UseNextCandidate = {
        ...base,
        id: "newer",
        expirationDate: new Date("2026-06-20T00:00:00.000Z"),
        createdAt: new Date("2026-06-01T00:00:00.000Z"),
      };
      expect(compareUseNextCandidates(older, newer, NOW)).toBeLessThan(0);
    });
  });

  describe("tie-break 3 — ID lexicographic", () => {
    it("id 'aaa' ranks before 'bbb' when all other fields are identical", () => {
      const a: UseNextCandidate = { ...base, id: "aaa" };
      const b: UseNextCandidate = { ...base, id: "bbb" };
      expect(compareUseNextCandidates(a, b, NOW)).toBeLessThan(0);
    });

    it("produces 0 only when items are identical", () => {
      expect(compareUseNextCandidates(base, base, NOW)).toBe(0);
    });
  });

  describe("full sort order (fixture-based)", () => {
    it("orders a mixed set deterministically", () => {
      const items: UseNextCandidate[] = [
        {
          id: "rice",
          expirationDate: new Date("2026-06-22T00:00:00.000Z"), // 7 days
          createdAt: new Date("2026-06-10T00:00:00.000Z"),
        },
        {
          id: "milk",
          expirationDate: new Date("2026-06-16T00:00:00.000Z"), // 1 day — HIGH
          createdAt: new Date("2026-06-10T00:00:00.000Z"),
        },
        {
          id: "yogurt",
          expirationDate: new Date("2026-06-16T00:00:00.000Z"), // 1 day — HIGH, older
          createdAt: new Date("2026-06-05T00:00:00.000Z"),
        },
        {
          id: "no-expiry",
          expirationDate: null,
          createdAt: new Date("2026-06-01T00:00:00.000Z"),
        },
      ];

      const sorted = [...items].sort((a, b) => compareUseNextCandidates(a, b, NOW));

      // yogurt and milk both expire in 1 day; yogurt was created first → yogurt before milk
      expect(sorted.map((i) => i.id)).toEqual(["yogurt", "milk", "rice", "no-expiry"]);
    });

    it("is stable across multiple calls (determinism guarantee)", () => {
      const items: UseNextCandidate[] = [
        { id: "b", expirationDate: new Date("2026-06-18T00:00:00.000Z"), createdAt: new Date("2026-06-01T00:00:00.000Z") },
        { id: "a", expirationDate: new Date("2026-06-17T00:00:00.000Z"), createdAt: new Date("2026-06-01T00:00:00.000Z") },
        { id: "c", expirationDate: new Date("2026-06-17T00:00:00.000Z"), createdAt: new Date("2026-06-02T00:00:00.000Z") },
      ];

      const run1 = [...items].sort((x, y) => compareUseNextCandidates(x, y, NOW)).map((i) => i.id);
      const run2 = [...items].sort((x, y) => compareUseNextCandidates(x, y, NOW)).map((i) => i.id);

      expect(run1).toEqual(run2);
      expect(run1).toEqual(["a", "c", "b"]);
    });
  });

  describe("no-expiry items", () => {
    it("two no-expiry items are ordered by createdAt then id", () => {
      const a: UseNextCandidate = { id: "aaa", expirationDate: null, createdAt: new Date("2026-06-01T00:00:00.000Z") };
      const b: UseNextCandidate = { id: "bbb", expirationDate: null, createdAt: new Date("2026-06-02T00:00:00.000Z") };
      expect(compareUseNextCandidates(a, b, NOW)).toBeLessThan(0);
    });
  });
});
