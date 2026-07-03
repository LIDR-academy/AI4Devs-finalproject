import { Test, TestingModule } from "@nestjs/testing";
import { ExpirationPreferencesController } from "./expiration.controller";
import { ExpirationPreferenceRepository } from "./expiration-preference.repository";

const makeRepo = (overrides: Record<string, unknown> = {}) => ({
  findByUserAndCategory: jest.fn(),
  findAllForUser: jest.fn().mockResolvedValue([]),
  upsertDelta: jest.fn(),
  deleteCategory: jest.fn().mockResolvedValue(undefined),
  deleteAll: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makeListResult = () => [
  {
    id: "pref1",
    userId: "user1",
    category: "dairy",
    deltas: [5, 5, 5],
    averageDelta: 5,
    sampleCount: 3,
    updatedAt: new Date("2026-06-28T10:30:00.000Z"),
  },
  {
    id: "pref2",
    userId: "user1",
    category: "produce",
    deltas: [-2, -2],
    averageDelta: -2,
    sampleCount: 2,
    updatedAt: new Date("2026-06-27T08:15:00.000Z"),
  },
];

const makeReq = (userId = "user1") => ({ user: { id: userId, email: "u@test.com" } });

describe("ExpirationPreferencesController", () => {
  let controller: ExpirationPreferencesController;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(async () => {
    repo = makeRepo();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpirationPreferencesController],
      providers: [{ provide: ExpirationPreferenceRepository, useValue: repo }],
    }).compile();

    controller = module.get<ExpirationPreferencesController>(ExpirationPreferencesController);
  });

  describe("GET /expiration/preferences (T013)", () => {
    it("returns 200 with a preferences array when preferences exist", async () => {
      const list = makeListResult();
      (repo.findAllForUser as jest.Mock).mockResolvedValue(list);

      const result = await controller.getPreferences(makeReq() as never);

      expect(result).toEqual({
        preferences: [
          {
            category: "dairy",
            averageDelta: 5,
            sampleCount: 3,
            lastUpdatedAt: "2026-06-28T10:30:00.000Z",
          },
          {
            category: "produce",
            averageDelta: -2,
            sampleCount: 2,
            lastUpdatedAt: "2026-06-27T08:15:00.000Z",
          },
        ],
      });
    });

    it("returns 200 with an empty array when the user has no preferences", async () => {
      (repo.findAllForUser as jest.Mock).mockResolvedValue([]);

      const result = await controller.getPreferences(makeReq() as never);

      expect(result).toEqual({ preferences: [] });
    });
  });

  describe("DELETE /expiration/preferences/:category (T020)", () => {
    it("calls deleteCategory with the correct userId and category and returns void", async () => {
      await controller.deleteCategory(makeReq() as never, "dairy");

      expect(repo.deleteCategory).toHaveBeenCalledWith("user1", "dairy");
    });

    it("is idempotent: does not throw when the category does not exist", async () => {
      (repo.deleteCategory as jest.Mock).mockResolvedValue(undefined);

      await expect(controller.deleteCategory(makeReq() as never, "nonexistent")).resolves.toBeUndefined();
    });
  });

  describe("DELETE /expiration/preferences (T020)", () => {
    it("calls deleteAll with the correct userId and returns void", async () => {
      await controller.deleteAll(makeReq() as never);

      expect(repo.deleteAll).toHaveBeenCalledWith("user1");
    });
  });
});
