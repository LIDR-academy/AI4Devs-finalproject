import { ExpirationPreferenceRepository } from "./expiration-preference.repository";

const makePrisma = (overrides: Record<string, unknown> = {}) => ({
  userCategoryExpiryPreference: {
    findUnique: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    upsert: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
    deleteMany: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  },
});

describe("ExpirationPreferenceRepository", () => {
  describe("upsertDelta", () => {
    it("creates a new record with a single delta when none exists", async () => {
      const prisma = makePrisma({
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve(create)),
      });
      const repo = new ExpirationPreferenceRepository(prisma as never);

      await repo.upsertDelta("user1", "dairy", 5);

      const upsertCall = prisma.userCategoryExpiryPreference.upsert.mock.calls[0][0];
      expect(upsertCall.create.deltas).toEqual([5]);
      expect(upsertCall.create.averageDelta).toBe(5);
      expect(upsertCall.create.sampleCount).toBe(1);
    });

    it("appends delta to an existing record and recomputes the average", async () => {
      const existing = { userId: "u1", category: "dairy", deltas: [4, 6], averageDelta: 5, sampleCount: 2 };
      const prisma = makePrisma({
        findUnique: jest.fn().mockResolvedValue(existing),
        upsert: jest.fn().mockImplementation(({ update }) => Promise.resolve(update)),
      });
      const repo = new ExpirationPreferenceRepository(prisma as never);

      await repo.upsertDelta("u1", "dairy", 8);

      const upsertCall = prisma.userCategoryExpiryPreference.upsert.mock.calls[0][0];
      expect(upsertCall.update.deltas).toEqual([4, 6, 8]);
      expect(upsertCall.update.averageDelta).toBeCloseTo(6);
      expect(upsertCall.update.sampleCount).toBe(3);
    });

    it("drops the oldest delta when the window exceeds 5 entries", async () => {
      const existing = {
        userId: "u1",
        category: "produce",
        deltas: [1, 2, 3, 4, 5],
        averageDelta: 3,
        sampleCount: 5,
      };
      const prisma = makePrisma({
        findUnique: jest.fn().mockResolvedValue(existing),
        upsert: jest.fn().mockImplementation(({ update }) => Promise.resolve(update)),
      });
      const repo = new ExpirationPreferenceRepository(prisma as never);

      await repo.upsertDelta("u1", "produce", 10);

      const upsertCall = prisma.userCategoryExpiryPreference.upsert.mock.calls[0][0];
      expect(upsertCall.update.deltas).toEqual([2, 3, 4, 5, 10]);
      expect(upsertCall.update.deltas).toHaveLength(5);
      expect(upsertCall.update.averageDelta).toBeCloseTo((2 + 3 + 4 + 5 + 10) / 5);
      expect(upsertCall.update.sampleCount).toBe(6);
    });

    it("increments sampleCount beyond the window size", async () => {
      const existing = {
        userId: "u1",
        category: "produce",
        deltas: [1, 2, 3, 4, 5],
        averageDelta: 3,
        sampleCount: 10,
      };
      const prisma = makePrisma({
        findUnique: jest.fn().mockResolvedValue(existing),
        upsert: jest.fn().mockImplementation(({ update }) => Promise.resolve(update)),
      });
      const repo = new ExpirationPreferenceRepository(prisma as never);

      await repo.upsertDelta("u1", "produce", 7);

      const upsertCall = prisma.userCategoryExpiryPreference.upsert.mock.calls[0][0];
      expect(upsertCall.update.sampleCount).toBe(11);
    });
  });

  describe("findByUserAndCategory", () => {
    it("returns the existing record when found", async () => {
      const record = { userId: "u1", category: "dairy", deltas: [5], averageDelta: 5, sampleCount: 1 };
      const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(record) });
      const repo = new ExpirationPreferenceRepository(prisma as never);

      const result = await repo.findByUserAndCategory("u1", "dairy");

      expect(result).toBe(record);
    });

    it("returns null when no record exists", async () => {
      const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(null) });
      const repo = new ExpirationPreferenceRepository(prisma as never);

      const result = await repo.findByUserAndCategory("u1", "bakery");

      expect(result).toBeNull();
    });
  });

  describe("deleteCategory", () => {
    it("calls delete with the correct where clause", async () => {
      const prisma = makePrisma();
      const repo = new ExpirationPreferenceRepository(prisma as never);

      await repo.deleteCategory("u1", "dairy");

      expect(prisma.userCategoryExpiryPreference.delete).toHaveBeenCalledWith({
        where: { userId_category: { userId: "u1", category: "dairy" } },
      });
    });

    it("does not throw when the record does not exist (idempotent)", async () => {
      const notFoundError = new Error("Record not found");
      (notFoundError as { code?: string }).code = "P2025";
      const prisma = makePrisma({ delete: jest.fn().mockRejectedValue(notFoundError) });
      const repo = new ExpirationPreferenceRepository(prisma as never);

      await expect(repo.deleteCategory("u1", "missing")).resolves.toBeUndefined();
    });
  });

  describe("deleteAll", () => {
    it("calls deleteMany with the userId filter", async () => {
      const prisma = makePrisma();
      const repo = new ExpirationPreferenceRepository(prisma as never);

      await repo.deleteAll("u1");

      expect(prisma.userCategoryExpiryPreference.deleteMany).toHaveBeenCalledWith({
        where: { userId: "u1" },
      });
    });
  });
});
