import type { RecipeSuggestion } from "@/features/recipes/recipes.types";

interface RecipeCardProps {
  recipe: RecipeSuggestion;
  onSelect: () => void;
}

export function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  const count = recipe.matchedIngredients.length;
  const label = `${count} ingredient${count === 1 ? "" : "s"} from your pantry`;

  return (
    <button
      type="button"
      aria-label={recipe.name}
      onClick={onSelect}
      className="ios-card w-full p-4 text-left"
    >
      <div className="flex items-start gap-3">
        <img
          src={recipe.thumbnailUrl}
          alt={recipe.name}
          className="size-14 rounded-xl object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15.5px] leading-tight">{recipe.name}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">{label}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {recipe.matchedIngredients.map((ing) => (
              <span
                key={ing}
                className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-medium"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
