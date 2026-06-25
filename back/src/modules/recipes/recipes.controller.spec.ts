import { NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { RecipesController } from "./recipes.controller";
import type { RecipesService, RecipeSuggestion, RecipeDetailResponse } from "./recipes.service";

const userId = "user-1";
const makeReq = () => ({ user: { id: userId, email: "user@example.com" } });

const MOCK_SUGGESTION: RecipeSuggestion = {
  id: "m1",
  name: "Chicken Handi",
  category: "Chicken",
  thumbnailUrl: "https://example.com/thumb.jpg",
  matchedIngredients: ["Chicken"],
  missingIngredients: [],
  matchScore: 0.5,
};

const MOCK_DETAIL: RecipeDetailResponse = {
  id: "m1",
  name: "Chicken Handi",
  category: "Chicken",
  thumbnailUrl: "https://example.com/thumb.jpg",
  youtubeUrl: null,
  instructions: "Cook it.",
  ingredients: [{ name: "Chicken", measure: "1kg" }],
  matchedPantryItemIds: ["p1"],
  matchedIngredientNames: ["Chicken"],
};

// ── T009: GET /recipes ────────────────────────────────────────────────────────

describe("RecipesController GET /recipes", () => {
  function makeController(getSuggestedRecipes: jest.Mock) {
    const service = { getSuggestedRecipes } as unknown as RecipesService;
    return new RecipesController(service);
  }

  it("returns 200 with recipes array from service", async () => {
    const spy = jest.fn().mockResolvedValue([MOCK_SUGGESTION]);
    const controller = makeController(spy);

    const result = await controller.getSuggestions(makeReq() as any, 10);

    expect(result).toEqual({ recipes: [MOCK_SUGGESTION] });
  });

  it("uses default limit of 10 when not provided", async () => {
    const spy = jest.fn().mockResolvedValue([]);
    const controller = makeController(spy);

    await controller.getSuggestions(makeReq() as any, 10);

    expect(spy).toHaveBeenCalledWith(userId, 10);
  });

  it("passes provided limit to service", async () => {
    const spy = jest.fn().mockResolvedValue([]);
    const controller = makeController(spy);

    await controller.getSuggestions(makeReq() as any, 5);

    expect(spy).toHaveBeenCalledWith(userId, 5);
  });

  it("propagates ServiceUnavailableException from service", async () => {
    const spy = jest.fn().mockRejectedValue(new ServiceUnavailableException("unavailable"));
    const controller = makeController(spy);

    await expect(controller.getSuggestions(makeReq() as any, 10)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});

// ── T018: POST /recipes/:mealId/cook ─────────────────────────────────────────

describe("RecipesController POST /recipes/:mealId/cook", () => {
  function makeController(cookRecipe: jest.Mock) {
    const service = { cookRecipe } as unknown as RecipesService;
    return new RecipesController(service);
  }

  it("returns 201 with consumedCount and events on success", async () => {
    const spy = jest.fn().mockResolvedValue({ consumedCount: 2, events: [{ id: "e1" }, { id: "e2" }] });
    const controller = makeController(spy);

    const result = await controller.cookRecipe(makeReq() as any, "m1", {
      pantryItemIds: ["item-1", "item-2"],
    } as any);

    expect(result).toEqual({ consumedCount: 2, events: [{ id: "e1" }, { id: "e2" }] });
  });

  it("calls cookRecipe with userId and pantryItemIds", async () => {
    const spy = jest.fn().mockResolvedValue({ consumedCount: 1, events: [{ id: "e1" }] });
    const controller = makeController(spy);

    await controller.cookRecipe(makeReq() as any, "m1", { pantryItemIds: ["item-1"] } as any);

    expect(spy).toHaveBeenCalledWith(userId, ["item-1"]);
  });

  it("propagates NotFoundException when pantry item is invalid", async () => {
    const spy = jest.fn().mockRejectedValue(new NotFoundException("Pantry item not found"));
    const controller = makeController(spy);

    await expect(
      controller.cookRecipe(makeReq() as any, "m1", { pantryItemIds: ["bad-id"] } as any),
    ).rejects.toThrow(NotFoundException);
  });
});

// ── T024: GET /recipes/:mealId ───────────────────────────────────────────────

describe("RecipesController GET /recipes/:mealId", () => {
  function makeController(getRecipeDetail: jest.Mock) {
    const service = { getRecipeDetail } as unknown as RecipesService;
    return new RecipesController(service);
  }

  it("returns 200 with RecipeDetailResponse", async () => {
    const spy = jest.fn().mockResolvedValue(MOCK_DETAIL);
    const controller = makeController(spy);

    const result = await controller.getDetail(makeReq() as any, "m1");

    expect(result).toEqual(MOCK_DETAIL);
    expect(spy).toHaveBeenCalledWith(userId, "m1");
  });

  it("propagates NotFoundException when recipe is not found", async () => {
    const spy = jest.fn().mockRejectedValue(new NotFoundException("Recipe not found"));
    const controller = makeController(spy);

    await expect(controller.getDetail(makeReq() as any, "bad-id")).rejects.toThrow(
      NotFoundException,
    );
  });
});
