import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { ExpirationMethod } from "@prisma/client";
import { ExpirationService } from "./expiration.service";

const DAIRY_CONFIDENCE = 0.86;
const UNKNOWN_CONFIDENCE = 0.45;

const makePrisma = (overrides: Record<string, unknown> = {}) => ({
  pantryItem: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  expirationAssessment: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
  ...overrides,
});

const makeRulesService = (
  category = "dairy",
  suggestedDays = 7,
  confidence = DAIRY_CONFIDENCE,
) => ({
  estimateFromName: jest.fn().mockReturnValue({ suggestedDays, confidence, category }),
  buildEstimate: jest.fn().mockImplementation((_name: string, now = new Date()) => {
    const suggestedExpirationDate = new Date(now);
    suggestedExpirationDate.setDate(suggestedExpirationDate.getDate() + suggestedDays);
    return {
      suggestedExpirationDate,
      confidence,
      category,
      lowConfidence: confidence < 0.6,
    };
  }),
});

const makePreferenceRepo = (overrides: Record<string, unknown> = {}) => ({
  findByUserAndCategory: jest.fn().mockResolvedValue(null),
  upsertDelta: jest.fn().mockResolvedValue(undefined),
  deleteCategory: jest.fn().mockResolvedValue(undefined),
  deleteAll: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makePantryItem = (id = "item1", name = "Greek Yogurt", userId = "user1") => ({
  id,
  name,
  userId,
});

const makeAssessment = (
  method: ExpirationMethod,
  suggestedDate: Date,
  category = "dairy",
) => ({
  pantryItemId: "item1",
  suggestedExpirationDate: suggestedDate,
  confidence: "0.86",
  method,
  category,
  userConfirmed: false,
  confirmedByUserId: null,
});

describe("ExpirationService", () => {
  describe("overrideItemExpiration — delta recording (T006)", () => {
    it("records a positive delta when the user chooses a later date than the rule-based suggestion", async () => {
      const now = new Date("2026-06-01T00:00:00.000Z");
      const suggestedDate = new Date("2026-06-08T00:00:00.000Z"); // 7 days
      const userDate = new Date("2026-06-13T00:00:00.000Z"); // 12 days → delta = +5

      const prisma = makePrisma();
      const pantryItem = makePantryItem();
      (prisma.pantryItem.findFirst as jest.Mock).mockResolvedValue(pantryItem);
      (prisma.pantryItem.update as jest.Mock).mockResolvedValue({ ...pantryItem, expirationDate: userDate });
      (prisma.expirationAssessment.findUnique as jest.Mock).mockResolvedValue(
        makeAssessment(ExpirationMethod.RULE_BASED_SPAIN, suggestedDate),
      );
      (prisma.expirationAssessment.upsert as jest.Mock).mockResolvedValue(
        makeAssessment(ExpirationMethod.MANUAL_OVERRIDE, userDate),
      );

      const prefRepo = makePreferenceRepo();
      const service = new ExpirationService(prisma as never, makeRulesService() as never, prefRepo as never);

      await service.overrideItemExpiration("user1", "item1", { expirationDate: userDate.toISOString() });

      expect(prefRepo.upsertDelta).toHaveBeenCalledWith(
        "user1",
        "dairy",
        expect.closeTo(5, 0),
      );
      void now;
    });

    it("records a negative delta when the user chooses an earlier date", async () => {
      const suggestedDate = new Date("2026-06-08T00:00:00.000Z");
      const userDate = new Date("2026-06-05T00:00:00.000Z"); // delta = -3

      const prisma = makePrisma();
      (prisma.pantryItem.findFirst as jest.Mock).mockResolvedValue(makePantryItem());
      (prisma.pantryItem.update as jest.Mock).mockResolvedValue({ id: "item1", expirationDate: userDate });
      (prisma.expirationAssessment.findUnique as jest.Mock).mockResolvedValue(
        makeAssessment(ExpirationMethod.RULE_BASED_SPAIN, suggestedDate),
      );
      (prisma.expirationAssessment.upsert as jest.Mock).mockResolvedValue(
        makeAssessment(ExpirationMethod.MANUAL_OVERRIDE, userDate),
      );

      const prefRepo = makePreferenceRepo();
      const service = new ExpirationService(prisma as never, makeRulesService() as never, prefRepo as never);

      await service.overrideItemExpiration("user1", "item1", { expirationDate: userDate.toISOString() });

      expect(prefRepo.upsertDelta).toHaveBeenCalledWith("user1", "dairy", expect.closeTo(-3, 0));
    });

    it("does NOT record a delta when no prior assessment exists", async () => {
      const prisma = makePrisma();
      (prisma.pantryItem.findFirst as jest.Mock).mockResolvedValue(makePantryItem());
      (prisma.pantryItem.update as jest.Mock).mockResolvedValue({ id: "item1", expirationDate: new Date() });
      (prisma.expirationAssessment.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.expirationAssessment.upsert as jest.Mock).mockResolvedValue(
        makeAssessment(ExpirationMethod.MANUAL_OVERRIDE, new Date()),
      );

      const prefRepo = makePreferenceRepo();
      const service = new ExpirationService(prisma as never, makeRulesService() as never, prefRepo as never);

      await service.overrideItemExpiration("user1", "item1", { expirationDate: new Date().toISOString() });

      expect(prefRepo.upsertDelta).not.toHaveBeenCalled();
    });

    it("does NOT record a delta when prior assessment is MANUAL_OVERRIDE", async () => {
      const priorDate = new Date("2026-06-08T00:00:00.000Z");
      const userDate = new Date("2026-06-10T00:00:00.000Z");

      const prisma = makePrisma();
      (prisma.pantryItem.findFirst as jest.Mock).mockResolvedValue(makePantryItem());
      (prisma.pantryItem.update as jest.Mock).mockResolvedValue({ id: "item1", expirationDate: userDate });
      (prisma.expirationAssessment.findUnique as jest.Mock).mockResolvedValue(
        makeAssessment(ExpirationMethod.MANUAL_OVERRIDE, priorDate),
      );
      (prisma.expirationAssessment.upsert as jest.Mock).mockResolvedValue(
        makeAssessment(ExpirationMethod.MANUAL_OVERRIDE, userDate),
      );

      const prefRepo = makePreferenceRepo();
      const service = new ExpirationService(prisma as never, makeRulesService() as never, prefRepo as never);

      await service.overrideItemExpiration("user1", "item1", { expirationDate: userDate.toISOString() });

      expect(prefRepo.upsertDelta).not.toHaveBeenCalled();
    });

    it("still returns the override response when upsertDelta throws", async () => {
      const userDate = new Date("2026-06-13T00:00:00.000Z");

      const prisma = makePrisma();
      (prisma.pantryItem.findFirst as jest.Mock).mockResolvedValue(makePantryItem());
      (prisma.pantryItem.update as jest.Mock).mockResolvedValue({ id: "item1", expirationDate: userDate });
      (prisma.expirationAssessment.findUnique as jest.Mock).mockResolvedValue(
        makeAssessment(ExpirationMethod.RULE_BASED_SPAIN, new Date("2026-06-08T00:00:00.000Z")),
      );
      (prisma.expirationAssessment.upsert as jest.Mock).mockResolvedValue(
        makeAssessment(ExpirationMethod.MANUAL_OVERRIDE, userDate),
      );

      const prefRepo = makePreferenceRepo({
        upsertDelta: jest.fn().mockRejectedValue(new Error("DB error")),
      });
      const service = new ExpirationService(prisma as never, makeRulesService() as never, prefRepo as never);

      await expect(
        service.overrideItemExpiration("user1", "item1", { expirationDate: userDate.toISOString() }),
      ).resolves.toMatchObject({ pantryItemId: "item1" });
    });
  });

  describe("estimateForItem — delta application (T007)", () => {
    const makeEstimateSetup = (preference: {
      averageDelta: number;
      sampleCount: number;
    } | null) => {
      const prisma = makePrisma();
      const pantryItem = makePantryItem();
      (prisma.pantryItem.findFirst as jest.Mock).mockResolvedValue(pantryItem);
      (prisma.expirationAssessment.upsert as jest.Mock).mockImplementation(({ create }) =>
        Promise.resolve(create),
      );

      const rulesService = makeRulesService("dairy", 7, DAIRY_CONFIDENCE);
      // Use UTC midnight to avoid time-of-day flakiness when computing day differences
      rulesService.buildEstimate.mockImplementation((_name: string) => {
        const d = new Date();
        d.setUTCHours(0, 0, 0, 0);
        d.setUTCDate(d.getUTCDate() + 7);
        return { suggestedExpirationDate: d, confidence: DAIRY_CONFIDENCE, category: "dairy", lowConfidence: false };
      });

      const prefRepo = makePreferenceRepo({
        findByUserAndCategory: jest.fn().mockResolvedValue(preference),
      });

      return { prisma, rulesService, prefRepo };
    };

    it("offsets the suggested date by the averageDelta when a preference exists", async () => {
      const { prisma, rulesService, prefRepo } = makeEstimateSetup({ averageDelta: 5, sampleCount: 4 });
      const service = new ExpirationService(prisma as never, rulesService as never, prefRepo as never);

      await service.estimateForItem("user1", "item1");

      const upsertArg = (prisma.expirationAssessment.upsert as jest.Mock).mock.calls[0][0];
      const storedDate: Date = upsertArg.create.suggestedExpirationDate;

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const actualDays = Math.round(
        (storedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(actualDays).toBe(7 + 5);
    });

    it("clamps the adjustment to +30 days when averageDelta exceeds the cap", async () => {
      const { prisma, rulesService, prefRepo } = makeEstimateSetup({ averageDelta: 100, sampleCount: 6 });
      const service = new ExpirationService(prisma as never, rulesService as never, prefRepo as never);

      await service.estimateForItem("user1", "item1");

      const upsertArg = (prisma.expirationAssessment.upsert as jest.Mock).mock.calls[0][0];
      const storedDate: Date = upsertArg.create.suggestedExpirationDate;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const actualDays = Math.round(
        (storedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(actualDays).toBe(7 + 30);
    });

    it("clamps the adjustment to -30 days when averageDelta is below the negative cap", async () => {
      const { prisma, rulesService, prefRepo } = makeEstimateSetup({ averageDelta: -100, sampleCount: 6 });
      const service = new ExpirationService(prisma as never, rulesService as never, prefRepo as never);

      await service.estimateForItem("user1", "item1");

      const upsertArg = (prisma.expirationAssessment.upsert as jest.Mock).mock.calls[0][0];
      const storedDate: Date = upsertArg.create.suggestedExpirationDate;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const actualDays = Math.round(
        (storedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(actualDays).toBe(7 - 30);
    });

    it("uses the baseline date unchanged when no preference exists", async () => {
      const { prisma, rulesService, prefRepo } = makeEstimateSetup(null);
      const service = new ExpirationService(prisma as never, rulesService as never, prefRepo as never);

      await service.estimateForItem("user1", "item1");

      const upsertArg = (prisma.expirationAssessment.upsert as jest.Mock).mock.calls[0][0];
      const storedDate: Date = upsertArg.create.suggestedExpirationDate;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const actualDays = Math.round(
        (storedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(actualDays).toBe(7);
    });

    it("uses the baseline date unchanged when preference has fewer than 3 samples (US1/AC2)", async () => {
      const { prisma, rulesService, prefRepo } = makeEstimateSetup({ averageDelta: 5, sampleCount: 2 });
      const service = new ExpirationService(prisma as never, rulesService as never, prefRepo as never);

      await service.estimateForItem("user1", "item1");

      const upsertArg = (prisma.expirationAssessment.upsert as jest.Mock).mock.calls[0][0];
      const storedDate: Date = upsertArg.create.suggestedExpirationDate;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const actualDays = Math.round(
        (storedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(actualDays).toBe(7);
    });
  });

  describe("estimateForItem — confidence upgrade (T011)", () => {
    const makeConfidenceSetup = (sampleCount: number, baseConfidence: number, category: string) => {
      const prisma = makePrisma();
      (prisma.pantryItem.findFirst as jest.Mock).mockResolvedValue(makePantryItem("item1", "Mystery", "user1"));
      (prisma.expirationAssessment.upsert as jest.Mock).mockImplementation(({ create }) =>
        Promise.resolve(create),
      );

      const rulesService = makeRulesService(category, 7, baseConfidence);
      rulesService.buildEstimate.mockImplementation((_name: string, now = new Date()) => {
        const d = new Date(now);
        d.setDate(d.getDate() + 7);
        return { suggestedExpirationDate: d, confidence: baseConfidence, category, lowConfidence: baseConfidence < 0.6 };
      });

      const prefRepo = makePreferenceRepo({
        findByUserAndCategory: jest.fn().mockResolvedValue({ averageDelta: 0, sampleCount }),
      });

      return { prisma, rulesService, prefRepo };
    };

    it("upgrades confidence to 0.60 when sampleCount >= 3 and baseline is below 0.60", async () => {
      const { prisma, rulesService, prefRepo } = makeConfidenceSetup(3, UNKNOWN_CONFIDENCE, "unknown");
      const service = new ExpirationService(prisma as never, rulesService as never, prefRepo as never);

      await service.estimateForItem("user1", "item1");

      const upsertArg = (prisma.expirationAssessment.upsert as jest.Mock).mock.calls[0][0];
      const storedConfidence = Number(upsertArg.create.confidence);
      expect(storedConfidence).toBeGreaterThanOrEqual(0.6);
    });

    it("does NOT downgrade confidence when baseline already exceeds 0.60", async () => {
      const { prisma, rulesService, prefRepo } = makeConfidenceSetup(5, DAIRY_CONFIDENCE, "dairy");
      const service = new ExpirationService(prisma as never, rulesService as never, prefRepo as never);

      await service.estimateForItem("user1", "item1");

      const upsertArg = (prisma.expirationAssessment.upsert as jest.Mock).mock.calls[0][0];
      const storedConfidence = Number(upsertArg.create.confidence);
      expect(storedConfidence).toBeCloseTo(DAIRY_CONFIDENCE, 1);
    });

    it("does NOT upgrade confidence when sampleCount < 3", async () => {
      const { prisma, rulesService, prefRepo } = makeConfidenceSetup(2, UNKNOWN_CONFIDENCE, "unknown");
      const service = new ExpirationService(prisma as never, rulesService as never, prefRepo as never);

      await service.estimateForItem("user1", "item1");

      const upsertArg = (prisma.expirationAssessment.upsert as jest.Mock).mock.calls[0][0];
      const storedConfidence = Number(upsertArg.create.confidence);
      expect(storedConfidence).toBeCloseTo(UNKNOWN_CONFIDENCE, 2);
    });
  });

  describe("getPantryItemOrThrow (error paths)", () => {
    it("throws ForbiddenException when item belongs to another user", async () => {
      const prisma = makePrisma();
      (prisma.pantryItem.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.pantryItem.findUnique as jest.Mock).mockResolvedValue({ id: "item1", userId: "other" });

      const service = new ExpirationService(
        prisma as never,
        makeRulesService() as never,
        makePreferenceRepo() as never,
      );

      await expect(service.estimateForItem("user1", "item1")).rejects.toThrow(ForbiddenException);
    });

    it("throws NotFoundException when item does not exist", async () => {
      const prisma = makePrisma();
      (prisma.pantryItem.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.pantryItem.findUnique as jest.Mock).mockResolvedValue(null);

      const service = new ExpirationService(
        prisma as never,
        makeRulesService() as never,
        makePreferenceRepo() as never,
      );

      await expect(service.estimateForItem("user1", "item1")).rejects.toThrow(NotFoundException);
    });
  });
});
