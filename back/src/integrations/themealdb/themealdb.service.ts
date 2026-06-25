import { Injectable, ServiceUnavailableException } from "@nestjs/common";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";
const TTL_MS = 60 * 60 * 1000;

export interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface MealIngredient {
  name: string;
  measure: string;
}

export interface MealDetail {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  youtubeUrl: string | null;
  instructions: string;
  ingredients: MealIngredient[];
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class ThemealdbService {
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry || Date.now() > entry.expiresAt) {
      return null;
    }
    return entry.data;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
  }

  private async fetchJson<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TheMealDB responded with ${response.status}`);
      }
      return (await response.json()) as T;
    } catch {
      throw new ServiceUnavailableException(
        "Recipe suggestions are temporarily unavailable. Please try again later.",
      );
    }
  }

  async searchByIngredient(ingredient: string): Promise<MealSummary[]> {
    const url = `${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`;
    const cached = this.getFromCache<MealSummary[]>(url);
    if (cached !== null) {
      return cached;
    }
    const data = await this.fetchJson<{ meals: MealSummary[] | null }>(url);
    const result = data.meals ?? [];
    this.setCache(url, result);
    return result;
  }

  async getMealDetail(mealId: string): Promise<MealDetail | null> {
    const url = `${BASE_URL}/lookup.php?i=${encodeURIComponent(mealId)}`;
    const cached = this.getFromCache<MealDetail | null>(url);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    const data = await this.fetchJson<{ meals: Record<string, string | null>[] | null }>(url);
    if (!data.meals || data.meals.length === 0) {
      return null;
    }

    const raw = data.meals[0];
    const ingredients: MealIngredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const name = raw[`strIngredient${i}`];
      const measure = raw[`strMeasure${i}`];
      if (name && name.trim()) {
        ingredients.push({ name: name.trim(), measure: (measure ?? "").trim() });
      }
    }

    const detail: MealDetail = {
      id: raw["idMeal"] ?? mealId,
      name: raw["strMeal"] ?? "",
      category: raw["strCategory"] ?? "",
      thumbnailUrl: raw["strMealThumb"] ?? "",
      youtubeUrl: raw["strYoutube"] ?? null,
      instructions: raw["strInstructions"] ?? "",
      ingredients,
    };

    this.setCache(url, detail);
    return detail;
  }
}
