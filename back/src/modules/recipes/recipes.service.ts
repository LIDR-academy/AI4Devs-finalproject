import { Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { ThemealdbService, MealDetail } from "../../integrations/themealdb/themealdb.service";
import { PantryService } from "../pantry/pantry.service";
import { PantryConsumptionEventType } from "../pantry/dto/register-consumption-event.dto";

export interface RecipeSuggestion {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  matchedIngredients: string[];
  missingIngredients: string[];
  matchScore: number;
}

export interface RecipeDetailResponse {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  youtubeUrl: string | null;
  instructions: string;
  ingredients: Array<{ name: string; measure: string }>;
  matchedPantryItemIds: string[];
  matchedIngredientNames: string[];
}

export interface CookRecipeResponse {
  consumedCount: number;
  events: Array<{ id: string }>;
}

const MAX_SEARCH_INGREDIENTS = 5;

@Injectable()
export class RecipesService {
  constructor(
    private readonly pantryService: PantryService,
    private readonly themealdbService: ThemealdbService,
  ) {}

  async getSuggestedRecipes(userId: string, limit: number): Promise<RecipeSuggestion[]> {
    const { items } = await this.pantryService.getUseNext(userId);
    if (items.length === 0) {
      return [];
    }

    const searchTerms = items
      .slice(0, MAX_SEARCH_INGREDIENTS)
      .map((i) => ({ originalName: i.name, term: i.name.toLowerCase() }));

    const mealMap = new Map<
      string,
      { summary: { idMeal: string; strMeal: string; strMealThumb: string }; matchedNames: Set<string> }
    >();

    const settledResults = await Promise.allSettled(
      searchTerms.map(async ({ originalName, term }) => {
        const meals = await this.themealdbService.searchByIngredient(term);
        return { originalName, meals };
      }),
    );

    const allMealsByIngredient = settledResults
      .filter(
        (r): r is PromiseFulfilledResult<{ originalName: string; meals: Awaited<ReturnType<ThemealdbService["searchByIngredient"]>> }> =>
          r.status === "fulfilled",
      )
      .map((r) => r.value);

    if (allMealsByIngredient.length === 0) {
      throw new ServiceUnavailableException(
        "Recipe suggestions are temporarily unavailable. Please try again later.",
      );
    }

    for (const { originalName, meals } of allMealsByIngredient) {
      for (const meal of meals) {
        const existing = mealMap.get(meal.idMeal);
        if (existing) {
          existing.matchedNames.add(originalName);
        } else {
          mealMap.set(meal.idMeal, {
            summary: meal,
            matchedNames: new Set([originalName]),
          });
        }
      }
    }

    const searchTermCount = searchTerms.length;
    const suggestions: RecipeSuggestion[] = Array.from(mealMap.values()).map(
      ({ summary, matchedNames }) => ({
        id: summary.idMeal,
        name: summary.strMeal,
        category: "",
        thumbnailUrl: summary.strMealThumb,
        matchedIngredients: Array.from(matchedNames),
        missingIngredients: [],
        matchScore: matchedNames.size / searchTermCount,
      }),
    );

    return suggestions
      .sort((a, b) => b.matchScore - a.matchScore || b.matchedIngredients.length - a.matchedIngredients.length)
      .slice(0, limit);
  }

  async cookRecipe(userId: string, pantryItemIds: string[]): Promise<CookRecipeResponse> {
    const events = await Promise.all(
      pantryItemIds.map((id) =>
        this.pantryService.registerEvent(userId, id, {
          type: PantryConsumptionEventType.CONSUMED,
        }),
      ),
    );
    return { consumedCount: events.length, events };
  }

  async getRecipeDetail(userId: string, mealId: string): Promise<RecipeDetailResponse> {
    const [detail, { items }] = await Promise.all([
      this.themealdbService.getMealDetail(mealId),
      this.pantryService.getUseNext(userId),
    ]);

    if (!detail) {
      throw new NotFoundException("Recipe not found");
    }

    const matchedPantryItemIds = items
      .filter((pantryItem) => {
        const pantryName = pantryItem.name.toLowerCase();
        return detail.ingredients.some((ing) => {
          const ingName = ing.name.toLowerCase();
          return ingName.includes(pantryName) || pantryName.includes(ingName);
        });
      })
      .map((i) => i.pantryItemId);

    const matchedIngredientNames = detail.ingredients
      .filter((ing) => {
        const ingName = ing.name.toLowerCase();
        return items.some((item) => {
          const pantryName = item.name.toLowerCase();
          return ingName.includes(pantryName) || pantryName.includes(ingName);
        });
      })
      .map((ing) => ing.name);

    return {
      id: detail.id,
      name: detail.name,
      category: detail.category,
      thumbnailUrl: detail.thumbnailUrl,
      youtubeUrl: detail.youtubeUrl,
      instructions: detail.instructions,
      ingredients: detail.ingredients,
      matchedPantryItemIds,
      matchedIngredientNames,
    };
  }
}
