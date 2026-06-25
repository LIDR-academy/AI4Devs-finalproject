import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChefHat, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { cookRecipe, getRecipeDetail } from "@/features/recipes/recipes.api";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";

export const Route = createFileRoute("/recipes/$mealId")({
  beforeLoad: requireAuthBeforeLoad,
  head: () => ({ meta: [{ title: "Recipe — RealSaveFooding" }] }),
  component: RecipeDetailPage,
});

function RecipeDetailPage() {
  const authed = useRequireAuthRedirect();
  const { mealId } = useParams({ from: "/recipes/$mealId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCooking, setIsCooking] = useState(false);

  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ["recipe", mealId],
    queryFn: () => getRecipeDetail(mealId),
    enabled: !!authed,
  });

  if (!authed) {
    return null;
  }

  if (isLoading) {
    return (
      <AppShell title="Recipe">
        <div className="space-y-4">
          <div className="h-48 rounded-2xl animate-pulse bg-secondary" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 rounded animate-pulse bg-secondary" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (isError || !recipe) {
    return (
      <AppShell title="Recipe">
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <ChefHat className="size-10 text-muted-foreground" />
          <p className="font-medium">Recipe not found</p>
          <p className="text-sm text-muted-foreground">This recipe may no longer be available.</p>
          <button
            type="button"
            className="text-sm text-primary"
            onClick={() => void navigate({ to: "/recipes" })}
          >
            Back to recipes
          </button>
        </div>
      </AppShell>
    );
  }

  async function handleCook() {
    if (!recipe || isCooking) return;
    setIsCooking(true);
    try {
      const result = await cookRecipe(mealId, recipe.matchedPantryItemIds);
      toast.success(
        `Marked as cooked! ${result.consumedCount} pantry item${result.consumedCount === 1 ? "" : "s"} consumed.`,
      );
      await queryClient.invalidateQueries({ queryKey: ["pantry"] });
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
    } catch {
      toast.error("Could not mark as cooked. Please try again.");
    } finally {
      setIsCooking(false);
    }
  }

  const matchedIngredientSet = new Set(
    recipe.matchedIngredientNames.map((n) => n.toLowerCase()),
  );

  return (
    <AppShell title={recipe.name}>
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => void navigate({ to: "/recipes" })}
          className="flex items-center gap-1 text-primary text-[14px] -mt-1"
        >
          <ChevronLeft className="size-4" />
          Recipes
        </button>

        <img
          src={recipe.thumbnailUrl}
          alt={recipe.name}
          className="w-full rounded-2xl object-cover max-h-56"
        />

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-3 py-1 text-[12px] font-medium">
            {recipe.category}
          </span>
          {recipe.youtubeUrl && (
            <a
              href={recipe.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[12px] text-primary"
            >
              Watch video <ExternalLink className="size-3" />
            </a>
          )}
        </div>

        <section>
          <h2 className="font-semibold text-[15px] mb-2">Ingredients</h2>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ing) => {
              const isMatched = matchedIngredientSet.has(ing.name.toLowerCase());
              return (
                <li
                  key={ing.name}
                  className="flex justify-between text-[13.5px]"
                >
                  <span className={isMatched ? "text-success-foreground font-medium" : "text-muted-foreground"}>
                    {ing.name}
                  </span>
                  <span className="text-muted-foreground">{ing.measure}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-[15px] mb-2">Instructions</h2>
          <p className="text-[13.5px] leading-relaxed text-muted-foreground whitespace-pre-line">
            {recipe.instructions}
          </p>
        </section>

        {recipe.matchedPantryItemIds.length > 0 && (
          <button
            type="button"
            disabled={isCooking}
            onClick={() => void handleCook()}
            className="w-full rounded-2xl bg-primary text-primary-foreground py-3.5 font-semibold text-[15px] disabled:opacity-60"
          >
            {isCooking ? "Marking as cooked…" : "Mark as cooked"}
          </button>
        )}
      </div>
    </AppShell>
  );
}
