import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeCard } from "@/components/RecipeCard";
import type { RecipeSuggestion } from "@/features/recipes/recipes.types";

const MOCK_RECIPE: RecipeSuggestion = {
  id: "m1",
  name: "Chicken Handi",
  category: "Chicken",
  thumbnailUrl: "https://example.com/thumb.jpg",
  matchedIngredients: ["Chicken", "Tomato"],
  missingIngredients: ["Garlic"],
  matchScore: 0.5,
};

describe("RecipeCard", () => {
  it("renders the recipe name", () => {
    render(<RecipeCard recipe={MOCK_RECIPE} onSelect={vi.fn()} />);
    expect(screen.getByText("Chicken Handi")).toBeInTheDocument();
  });

  it("shows matched ingredient count", () => {
    render(<RecipeCard recipe={MOCK_RECIPE} onSelect={vi.fn()} />);
    expect(screen.getByText(/2 ingredients from your pantry/i)).toBeInTheDocument();
  });

  it("renders matched ingredient chips", () => {
    render(<RecipeCard recipe={MOCK_RECIPE} onSelect={vi.fn()} />);
    expect(screen.getByText("Chicken")).toBeInTheDocument();
    expect(screen.getByText("Tomato")).toBeInTheDocument();
  });

  it("calls onSelect when card is clicked", async () => {
    const onSelect = vi.fn();
    render(<RecipeCard recipe={MOCK_RECIPE} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: /chicken handi/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("shows '1 ingredient from your pantry' in singular form", () => {
    const recipe: RecipeSuggestion = { ...MOCK_RECIPE, matchedIngredients: ["Chicken"] };
    render(<RecipeCard recipe={recipe} onSelect={vi.fn()} />);
    expect(screen.getByText(/1 ingredient from your pantry/i)).toBeInTheDocument();
  });
});
