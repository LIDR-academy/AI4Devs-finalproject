import { ServiceUnavailableException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ThemealdbService } from "./themealdb.service";

const SEARCH_URL = "https://www.themealdb.com/api/json/v1/1/filter.php?i=chicken";
const LOOKUP_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=52795";

const MEAL_SUMMARY = { idMeal: "52795", strMeal: "Chicken Handi", strMealThumb: "https://example.com/thumb.jpg" };

const MEAL_DETAIL_RAW = {
  idMeal: "52795",
  strMeal: "Chicken Handi",
  strCategory: "Chicken",
  strYoutube: "https://youtube.com/watch?v=abc",
  strInstructions: "Step 1: ...",
  strMealThumb: "https://example.com/thumb.jpg",
  strIngredient1: "Chicken",
  strMeasure1: "1kg",
  strIngredient2: "Onion",
  strMeasure2: "2",
  strIngredient3: "",
  strMeasure3: "",
  ...Object.fromEntries(
    Array.from({ length: 17 }, (_, i) => [`strIngredient${i + 4}`, ""]),
  ),
  ...Object.fromEntries(
    Array.from({ length: 17 }, (_, i) => [`strMeasure${i + 4}`, ""]),
  ),
};

function mockFetch(data: unknown): jest.SpyInstance {
  return jest.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response);
}

describe("ThemealdbService", () => {
  let service: ThemealdbService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ThemealdbService],
    }).compile();
    service = module.get(ThemealdbService);
    jest.restoreAllMocks();
  });

  // ── T003: searchByIngredient ─────────────────────────────────────────────

  describe("searchByIngredient", () => {
    it("fetches the correct filter.php URL and returns MealSummary[]", async () => {
      const spy = mockFetch({ meals: [MEAL_SUMMARY] });
      const result = await service.searchByIngredient("chicken");
      expect(spy).toHaveBeenCalledWith(SEARCH_URL);
      expect(result).toEqual([MEAL_SUMMARY]);
    });

    it("returns empty array when meals is null", async () => {
      mockFetch({ meals: null });
      const result = await service.searchByIngredient("unknowningredient");
      expect(result).toEqual([]);
    });

    it("throws ServiceUnavailableException when fetch fails", async () => {
      jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("network error"));
      await expect(service.searchByIngredient("chicken")).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  // ── T004: getMealDetail ──────────────────────────────────────────────────

  describe("getMealDetail", () => {
    it("fetches the correct lookup.php URL", async () => {
      const spy = mockFetch({ meals: [MEAL_DETAIL_RAW] });
      await service.getMealDetail("52795");
      expect(spy).toHaveBeenCalledWith(LOOKUP_URL);
    });

    it("parses non-empty strIngredient/strMeasure pairs into ingredients array", async () => {
      mockFetch({ meals: [MEAL_DETAIL_RAW] });
      const result = await service.getMealDetail("52795");
      expect(result).not.toBeNull();
      expect(result!.ingredients).toEqual([
        { name: "Chicken", measure: "1kg" },
        { name: "Onion", measure: "2" },
      ]);
    });

    it("omits empty string ingredient entries", async () => {
      mockFetch({ meals: [MEAL_DETAIL_RAW] });
      const result = await service.getMealDetail("52795");
      expect(result!.ingredients).toHaveLength(2);
    });

    it("returns null when meals is null", async () => {
      mockFetch({ meals: null });
      const result = await service.getMealDetail("99999");
      expect(result).toBeNull();
    });

    it("throws ServiceUnavailableException when fetch fails", async () => {
      jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("network error"));
      await expect(service.getMealDetail("52795")).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  // ── T005: TTL cache ──────────────────────────────────────────────────────

  describe("cache TTL", () => {
    it("caches the result — second call does not call fetch again", async () => {
      const spy = jest.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ meals: [MEAL_SUMMARY] }),
      } as Response);

      await service.searchByIngredient("chicken");
      await service.searchByIngredient("chicken");

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("fetches again after cache TTL expires", async () => {
      const now = Date.now();
      const dateSpy = jest
        .spyOn(Date, "now")
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 3_600_001);

      const spy = jest.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ meals: [MEAL_SUMMARY] }),
      } as Response);

      await service.searchByIngredient("chicken");
      await service.searchByIngredient("chicken");

      expect(spy).toHaveBeenCalledTimes(2);
      dateSpy.mockRestore();
    });
  });
});
