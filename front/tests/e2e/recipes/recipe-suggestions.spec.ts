import { expect, test, type Page } from "@playwright/test";
import { registerUser, seedSession } from "../notifications/_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";
const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:3000/api";

const MOCK_MEAL_ID = "52959";
const MOCK_MEAL_NAME = "Baked salmon with fennel & tomatoes";
const MOCK_PANTRY_ITEM_ID = "pantry-item-1";

interface MockRecipeSuggestion {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  matchedIngredients: string[];
  missingIngredients: string[];
  matchScore: number;
}

interface MockRecipeDetail {
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

async function mockRecipesApi(page: Page) {
  const suggestion: MockRecipeSuggestion = {
    id: MOCK_MEAL_ID,
    name: MOCK_MEAL_NAME,
    category: "Seafood",
    thumbnailUrl: "https://www.themealdb.com/images/media/meals/1548772327.jpg",
    matchedIngredients: ["Salmon"],
    missingIngredients: ["Fennel", "Tomato"],
    matchScore: 0.5,
  };

  const detail: MockRecipeDetail = {
    id: MOCK_MEAL_ID,
    name: MOCK_MEAL_NAME,
    category: "Seafood",
    thumbnailUrl: "https://www.themealdb.com/images/media/meals/1548772327.jpg",
    youtubeUrl: null,
    instructions: "Season the salmon and bake at 200°C for 20 minutes.",
    ingredients: [
      { name: "Salmon", measure: "350g" },
      { name: "Fennel", measure: "1 bulb" },
      { name: "Tomato", measure: "4 medium" },
    ],
    matchedPantryItemIds: [MOCK_PANTRY_ITEM_ID],
    matchedIngredientNames: ["Salmon"],
  };

  await page.route("**/recipes?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ recipes: [suggestion] }),
    });
  });

  await page.route(`**/recipes/${MOCK_MEAL_ID}`, async (route) => {
    const req = route.request();
    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(detail),
      });
    } else {
      await route.continue();
    }
  });

  await page.route(`**/recipes/${MOCK_MEAL_ID}/cook`, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ consumedCount: 1, events: [{ id: "evt-1" }] }),
    });
  });
}

async function mockPantryUseNext(page: Page, items: Array<{ id: string; name: string }> = []) {
  await page.route("**/pantry/use-next**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: items.map((item) => ({
          pantryItemId: item.id,
          name: item.name,
          quantity: 1,
          unit: "unit",
          pricePaid: null,
          expirationDate: null,
          daysUntilExpiration: 2,
          riskLevel: "HIGH",
        })),
      }),
    });
  });
}

test.describe("Recipe Suggestions", () => {
  test("shows recipe suggestions list and navigates to detail", async ({ page, request }) => {
    const email = `recipes-e2e-${Date.now()}@example.com`;
    const auth = await registerUser(request, email);

    await seedSession(page, auth);
    await mockRecipesApi(page);
    await mockPantryUseNext(page, [{ id: MOCK_PANTRY_ITEM_ID, name: "Salmon" }]);

    await page.goto(`${FRONT_BASE_URL}/recipes`);

    // Recipes tab shows at least one RecipeCard
    await expect(page.getByText(MOCK_MEAL_NAME)).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("1 ingredient from your pantry")).toBeVisible();
    await expect(page.getByText("Salmon")).toBeVisible();

    // Navigate to detail
    await page.getByRole("button", { name: MOCK_MEAL_NAME }).click();

    await expect(page).toHaveURL(new RegExp(`/recipes/${MOCK_MEAL_ID}`), { timeout: 5000 });
    await expect(page.getByText("Season the salmon and bake")).toBeVisible();

    // Ingredient list renders with matched (green) and missing (muted) items
    await expect(page.getByText("Salmon")).toBeVisible();
    await expect(page.getByText("Fennel")).toBeVisible();
    await expect(page.getByText("Tomato")).toBeVisible();
  });

  test("marks recipe as cooked and shows success toast", async ({ page, request }) => {
    const email = `recipes-e2e-cook-${Date.now()}@example.com`;
    const auth = await registerUser(request, email);

    await seedSession(page, auth);
    await mockRecipesApi(page);
    await mockPantryUseNext(page, [{ id: MOCK_PANTRY_ITEM_ID, name: "Salmon" }]);

    await page.goto(`${FRONT_BASE_URL}/recipes/${MOCK_MEAL_ID}`);

    await expect(page.getByText(MOCK_MEAL_NAME)).toBeVisible({ timeout: 8000 });

    // "Mark as cooked" button is visible (we have a matched pantry item)
    const cookButton = page.getByRole("button", { name: /mark as cooked/i });
    await expect(cookButton).toBeVisible();
    await cookButton.click();

    // Success toast appears
    await expect(
      page.getByText(/marked as cooked/i).or(page.getByText(/consumed/i)),
    ).toBeVisible({ timeout: 5000 });
  });

  test("shows error state when recipes API is unavailable", async ({ page, request }) => {
    const email = `recipes-e2e-err-${Date.now()}@example.com`;
    const auth = await registerUser(request, email);

    await seedSession(page, auth);
    await mockPantryUseNext(page, [{ id: "p1", name: "Salmon" }]);

    await page.route("**/recipes?**", async (route) => {
      await route.fulfill({ status: 503, contentType: "application/json", body: "{}" });
    });

    await page.goto(`${FRONT_BASE_URL}/recipes`);

    await expect(page.getByText(/unavailable/i)).toBeVisible({ timeout: 8000 });
  });

  test("shows empty state when pantry has no items", async ({ page, request }) => {
    const email = `recipes-e2e-empty-${Date.now()}@example.com`;
    const auth = await registerUser(request, email);

    await seedSession(page, auth);
    await mockPantryUseNext(page, []);

    await page.route("**/recipes?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ recipes: [] }),
      });
    });

    await page.goto(`${FRONT_BASE_URL}/recipes`);

    await expect(page.getByText(/no suggestions yet/i)).toBeVisible({ timeout: 8000 });
  });
});
