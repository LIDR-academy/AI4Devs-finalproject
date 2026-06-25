import { getAccessToken } from "@/features/auth/session";
import type { RecipeSuggestion, RecipeDetail, CookRecipeResult } from "./recipes.types";

const DEFAULT_API_BASE_URL =
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:3000/api`
    : "http://localhost:3000/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("No session found");
  }
  return { Authorization: `Bearer ${token}` };
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new Error(
      `Cannot connect to API at ${API_BASE_URL}. Ensure backend is running.`,
    );
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? "Request failed");
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function getRecipeSuggestions(limit = 10): Promise<RecipeSuggestion[]> {
  return requestJson<{ recipes: RecipeSuggestion[] }>(`/recipes?limit=${limit}`).then(
    (r) => r.recipes,
  );
}

export function getRecipeDetail(mealId: string): Promise<RecipeDetail> {
  return requestJson<RecipeDetail>(`/recipes/${encodeURIComponent(mealId)}`);
}

export function cookRecipe(mealId: string, pantryItemIds: string[]): Promise<CookRecipeResult> {
  return requestJson<CookRecipeResult>(`/recipes/${encodeURIComponent(mealId)}/cook`, {
    method: "POST",
    body: JSON.stringify({ pantryItemIds }),
  });
}
