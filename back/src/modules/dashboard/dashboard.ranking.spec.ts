import {
  compareUseNextCandidates,
  daysUntilExpiration,
  UseNextCandidate,
} from "./dashboard.ranking";

describe("dashboard ranking", () => {
  const now = new Date("2026-06-13T10:00:00.000Z");

  it("computes days-until with day precision", () => {
    expect(daysUntilExpiration(new Date("2026-06-13T23:00:00.000Z"), now)).toBe(0);
    expect(daysUntilExpiration(new Date("2026-06-14T00:00:00.000Z"), now)).toBe(1);
  });

  it("orders by days until expiration then deterministic tie-breaks", () => {
    const items: UseNextCandidate[] = [
      {
        id: "b",
        expirationDate: new Date("2026-06-15T00:00:00.000Z"),
        createdAt: new Date("2026-06-13T00:00:00.000Z"),
      },
      {
        id: "a",
        expirationDate: new Date("2026-06-14T00:00:00.000Z"),
        createdAt: new Date("2026-06-12T00:00:00.000Z"),
      },
      {
        id: "c",
        expirationDate: new Date("2026-06-14T00:00:00.000Z"),
        createdAt: new Date("2026-06-13T00:00:00.000Z"),
      },
    ];

    const sorted = [...items].sort((x, y) => compareUseNextCandidates(x, y, now));

    expect(sorted.map((i) => i.id)).toEqual(["a", "c", "b"]);
  });
});
