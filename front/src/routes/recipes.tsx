import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChefHat } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RecipeCard } from "@/components/RecipeCard";
import { getRecipeSuggestions } from "@/features/recipes/recipes.api";
import { requireAuthBeforeLoad, useRequireAuthRedirect } from "@/features/auth/route-guard";

export const Route = createFileRoute("/recipes")({
  beforeLoad: requireAuthBeforeLoad,
  head: () => ({ meta: [{ title: "Recipes — RealSaveFooding" }] }),
  component: RecipesPage,
});

function RecipesPage() {
  const authed = useRequireAuthRedirect();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isChildRoute = pathname.startsWith("/recipes/");

  const {
    data: recipes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => getRecipeSuggestions(),
    enabled: !!authed && !isChildRoute,
  });

  if (isChildRoute) {
    return <Outlet />;
  }

  if (!authed) {
    return null;
  }

  if (isLoading) {
    return (
      <AppShell title="Recipes">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ios-card h-24 animate-pulse bg-secondary" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell title="Recipes">
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <ChefHat className="size-10 text-muted-foreground" />
          <p className="font-medium">Recipes unavailable right now</p>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load recipe suggestions. Please try again later.
          </p>
        </div>
      </AppShell>
    );
  }

  if (recipes.length === 0) {
    return (
      <AppShell title="Recipes">
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <ChefHat className="size-10 text-muted-foreground" />
          <p className="font-medium">No suggestions yet</p>
          <p className="text-sm text-muted-foreground">
            Add pantry items to get recipe ideas based on what&apos;s expiring soon.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Recipes">
      <ul className="space-y-3">
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <RecipeCard
              recipe={recipe}
              onSelect={() =>
                void navigate({ to: "/recipes/$mealId", params: { mealId: recipe.id } })
              }
            />
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
