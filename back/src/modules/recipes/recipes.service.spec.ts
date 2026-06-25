import { NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { RecipesService, RecipeSuggestion, RecipeDetailResponse } from "./recipes.service";
import type { ThemealdbService, MealSummary, MealDetail } from "../../integrations/themealdb/themealdb.service";
import type { PantryService, UseNextResponse } from "../pantry/pantry.service";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeUseNextResponse(items: Array<{ id: string; name: string; riskLevel?: "HIGH" | "MEDIUM" | "LOW" }>): UseNextResponse {
  return {
    items: items.map((i) => ({
      pantryItemId: i.id,
      name: i.name,
      quantity: 1,
      unit: "unit",
      pricePaid: null,
      expirationDate: null,
      daysUntilExpiration: i.riskLevel === "HIGH" ? 1 : 7,
      riskLevel: i.riskLevel ?? "LOW",
    })),
  };
}

function makeMealSummary(id: string, name: string): MealSummary {
  return { idMeal: id, strMeal: name, strMealThumb: `https://example.com/${id}.jpg` };
}

function makeMealDetail(id: string, ingredients: string[]): MealDetail {
  return {
    id,
    name: `Meal ${id}`,
    category: "Chicken",
    thumbnailUrl: `https://example.com/${id}.jpg`,
    youtubeUrl: null,
    instructions: "Cook it.",
    ingredients: ingredients.map((n) => ({ name: n, measure: "100g" })),
  };
}

// ── T008: RecipesService.getSuggestedRecipes ─────────────────────────────────

describe("RecipesService.getSuggestedRecipes", () => {
  function makeService(overrides?: {
    getUseNext?: () => Promise<UseNextResponse>;
    searchByIngredient?: (ingredient: string) => Promise<MealSummary[]>;
  }) {
    const pantryServiceMock = {
      getUseNext: overrides?.getUseNext ?? jest.fn().mockResolvedValue(makeUseNextResponse([])),
    } as unknown as PantryService;

    const themealdbServiceMock = {
      searchByIngredient: overrides?.searchByIngredient ?? jest.fn().mockResolvedValue([]),
      getMealDetail: jest.fn().mockResolvedValue(null),
    } as unknown as ThemealdbService;

    return new RecipesService(pantryServiceMock, themealdbServiceMock);
  }

  it("returns empty array when pantry is empty", async () => {
    const service = makeService();
    const result = await service.getSuggestedRecipes("user-1", 10);
    expect(result).toEqual([]);
  });

  it("uses top-5 pantry item names as search ingredients (by expiry risk order)", async () => {
    const pantryItems = [
      { id: "p1", name: "Chicken", riskLevel: "HIGH" as const },
      { id: "p2", name: "Tomato", riskLevel: "HIGH" as const },
      { id: "p3", name: "Onion", riskLevel: "MEDIUM" as const },
      { id: "p4", name: "Garlic", riskLevel: "LOW" as const },
      { id: "p5", name: "Milk", riskLevel: "LOW" as const },
      { id: "p6", name: "Egg", riskLevel: "LOW" as const },
    ];
    const searchSpy = jest.fn().mockResolvedValue([]);
    const service = makeService({
      getUseNext: () => Promise.resolve(makeUseNextResponse(pantryItems)),
      searchByIngredient: searchSpy,
    });

    await service.getSuggestedRecipes("user-1", 10);

    expect(searchSpy).toHaveBeenCalledTimes(5);
    expect(searchSpy).not.toHaveBeenCalledWith("egg");
  });

  it("deduplicates meals across ingredient searches and accumulates matched ingredients", async () => {
    const meal = makeMealSummary("m1", "Chicken Tomato Soup");
    const service = makeService({
      getUseNext: () =>
        Promise.resolve(makeUseNextResponse([
          { id: "p1", name: "Chicken", riskLevel: "HIGH" },
          { id: "p2", name: "Tomato", riskLevel: "HIGH" },
        ])),
      searchByIngredient: (ingredient) =>
        Promise.resolve(ingredient === "chicken" || ingredient === "tomato" ? [meal] : []),
    });

    const result = await service.getSuggestedRecipes("user-1", 10);

    expect(result).toHaveLength(1);
    expect(result[0].matchedIngredients).toHaveLength(2);
    expect(result[0].matchedIngredients).toContain("Chicken");
    expect(result[0].matchedIngredients).toContain("Tomato");
  });

  it("sorts results by matchScore descending", async () => {
    const meal1 = makeMealSummary("m1", "Chicken Tomato Soup");
    const meal2 = makeMealSummary("m2", "Garlic Bread");
    const service = makeService({
      getUseNext: () =>
        Promise.resolve(makeUseNextResponse([
          { id: "p1", name: "Chicken", riskLevel: "HIGH" },
          { id: "p2", name: "Tomato", riskLevel: "HIGH" },
          { id: "p3", name: "Garlic", riskLevel: "MEDIUM" },
        ])),
      searchByIngredient: (ingredient) => {
        if (ingredient === "chicken" || ingredient === "tomato") return Promise.resolve([meal1]);
        if (ingredient === "garlic") return Promise.resolve([meal2]);
        return Promise.resolve([]);
      },
    });

    const result = await service.getSuggestedRecipes("user-1", 10);

    expect(result[0].id).toBe("m1");
    expect(result[0].matchScore).toBeGreaterThan(result[1].matchScore);
  });

  it("matchScore is 0 when no pantry items match (meal surfaced by single term)", async () => {
    const meal = makeMealSummary("m1", "Chicken Stew");
    const service = makeService({
      getUseNext: () =>
        Promise.resolve(makeUseNextResponse([{ id: "p1", name: "Chicken", riskLevel: "HIGH" }])),
      searchByIngredient: () => Promise.resolve([meal]),
    });

    const result = await service.getSuggestedRecipes("user-1", 10);

    expect(result[0].matchScore).toBeGreaterThanOrEqual(0);
    expect(result[0].matchScore).toBeLessThanOrEqual(1);
  });

  it("re-throws ServiceUnavailableException from ThemealdbService", async () => {
    const service = makeService({
      getUseNext: () =>
        Promise.resolve(makeUseNextResponse([{ id: "p1", name: "Chicken", riskLevel: "HIGH" }])),
      searchByIngredient: () => {
        throw new ServiceUnavailableException("unavailable");
      },
    });

    await expect(service.getSuggestedRecipes("user-1", 10)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it("returns partial results when some ingredient searches fail (graceful degradation)", async () => {
    let callCount = 0;
    const chickenMeals = [makeMealSummary("m1", "Chicken Handi")];
    const service = makeService({
      getUseNext: () =>
        Promise.resolve(
          makeUseNextResponse([
            { id: "p1", name: "Chicken", riskLevel: "HIGH" },
            { id: "p2", name: "Tomato", riskLevel: "HIGH" },
          ]),
        ),
      searchByIngredient: () => {
        callCount += 1;
        if (callCount === 1) return Promise.resolve(chickenMeals);
        throw new ServiceUnavailableException("unavailable");
      },
    });

    const result = await service.getSuggestedRecipes("user-1", 10);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("m1");
  });

  it("respects the limit parameter", async () => {
    const meals = Array.from({ length: 5 }, (_, i) => makeMealSummary(`m${i}`, `Meal ${i}`));
    const service = makeService({
      getUseNext: () =>
        Promise.resolve(makeUseNextResponse([{ id: "p1", name: "Chicken", riskLevel: "HIGH" }])),
      searchByIngredient: () => Promise.resolve(meals),
    });

    const result = await service.getSuggestedRecipes("user-1", 3);

    expect(result).toHaveLength(3);
  });
});

// ── T017: RecipesService.cookRecipe ──────────────────────────────────────────

describe("RecipesService.cookRecipe", () => {
  function makeService(registerEvent: jest.Mock) {
    const pantryServiceMock = {
      registerEvent,
    } as unknown as PantryService;

    const themealdbServiceMock = {
      searchByIngredient: jest.fn(),
      getMealDetail: jest.fn(),
    } as unknown as ThemealdbService;

    return new RecipesService(pantryServiceMock, themealdbServiceMock);
  }

  it("calls PantryService.registerEvent for each pantryItemId", async () => {
    const registerEvent = jest.fn().mockResolvedValue({ id: "evt-1" });
    const service = makeService(registerEvent);

    await service.cookRecipe("user-1", ["item-1", "item-2"]);

    expect(registerEvent).toHaveBeenCalledTimes(2);
    expect(registerEvent).toHaveBeenCalledWith("user-1", "item-1", { type: "CONSUMED" });
    expect(registerEvent).toHaveBeenCalledWith("user-1", "item-2", { type: "CONSUMED" });
  });

  it("returns CookRecipeResponse with consumedCount and events", async () => {
    const registerEvent = jest
      .fn()
      .mockResolvedValueOnce({ id: "evt-1" })
      .mockResolvedValueOnce({ id: "evt-2" });
    const service = makeService(registerEvent);

    const result = await service.cookRecipe("user-1", ["item-1", "item-2"]);

    expect(result.consumedCount).toBe(2);
    expect(result.events).toEqual([{ id: "evt-1" }, { id: "evt-2" }]);
  });

  it("propagates NotFoundException if any item is invalid (atomic failure)", async () => {
    const registerEvent = jest
      .fn()
      .mockResolvedValueOnce({ id: "evt-1" })
      .mockRejectedValueOnce(new NotFoundException("Pantry item not found"));
    const service = makeService(registerEvent);

    await expect(service.cookRecipe("user-1", ["item-1", "bad-id"])).rejects.toThrow(
      NotFoundException,
    );
  });
});

// ── T023: RecipesService.getRecipeDetail ──────────────────────────────────────

describe("RecipesService.getRecipeDetail", () => {
  function makeService(
    getMealDetail: (id: string) => Promise<MealDetail | null>,
    getUseNext: () => Promise<UseNextResponse>,
  ) {
    const pantryServiceMock = { getUseNext } as unknown as PantryService;
    const themealdbServiceMock = {
      getMealDetail,
      searchByIngredient: jest.fn(),
    } as unknown as ThemealdbService;
    return new RecipesService(pantryServiceMock, themealdbServiceMock);
  }

  it("returns RecipeDetailResponse with matchedPantryItemIds for matching pantry items", async () => {
    const detail = makeMealDetail("m1", ["Chicken", "Tomato", "Garlic"]);
    const service = makeService(
      () => Promise.resolve(detail),
      () =>
        Promise.resolve(makeUseNextResponse([
          { id: "p1", name: "Chicken", riskLevel: "HIGH" },
          { id: "p2", name: "Garlic", riskLevel: "LOW" },
          { id: "p3", name: "Beef", riskLevel: "LOW" },
        ])),
    );

    const result = await service.getRecipeDetail("user-1", "m1");

    expect(result.matchedPantryItemIds).toContain("p1");
    expect(result.matchedPantryItemIds).toContain("p2");
    expect(result.matchedPantryItemIds).not.toContain("p3");
  });

  it("throws NotFoundException when getMealDetail returns null", async () => {
    const service = makeService(
      () => Promise.resolve(null),
      () => Promise.resolve(makeUseNextResponse([])),
    );

    await expect(service.getRecipeDetail("user-1", "bad-id")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("matching is case-insensitive", async () => {
    const detail = makeMealDetail("m1", ["chicken breast"]);
    const service = makeService(
      () => Promise.resolve(detail),
      () =>
        Promise.resolve(makeUseNextResponse([{ id: "p1", name: "Chicken Breast", riskLevel: "HIGH" }])),
    );

    const result = await service.getRecipeDetail("user-1", "m1");

    expect(result.matchedPantryItemIds).toContain("p1");
  });
});
