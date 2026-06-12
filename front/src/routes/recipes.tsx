import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChefHat, Clock, Flame, Sparkles, Filter } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { pantryItems, daysUntil } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";

export const Route = createFileRoute("/recipes")({
  beforeLoad: requireAuthBeforeLoad,
  head: () => ({ meta: [{ title: "Recipes — RealSaveFooding" }] }),
  component: RecipesPage,
});

type Recipe = {
  id: string;
  title: string;
  emoji: string;
  minutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  calories: number;
  uses: string[]; // pantry item names used
  missing: string[];
  tags: string[];
};

const RECIPES: Recipe[] = [
  {
    id: "r1",
    title: "Creamy Spinach & Chicken Skillet",
    emoji: "🍗",
    minutes: 25,
    difficulty: "Easy",
    calories: 520,
    uses: ["Chicken Breast", "Spinach", "Whole Milk"],
    missing: ["Garlic", "Parmesan"],
    tags: ["High protein", "One pan"],
  },
  {
    id: "r2",
    title: "Greek Yogurt Berry Parfait",
    emoji: "🥣",
    minutes: 5,
    difficulty: "Easy",
    calories: 240,
    uses: ["Greek Yogurt"],
    missing: ["Granola", "Honey"],
    tags: ["Breakfast", "No cook"],
  },
  {
    id: "r3",
    title: "Sourdough Avocado Toast & Egg",
    emoji: "🥑",
    minutes: 10,
    difficulty: "Easy",
    calories: 380,
    uses: ["Sourdough Bread", "Avocado", "Eggs", "Cherry Tomatoes"],
    missing: ["Chili flakes"],
    tags: ["Breakfast", "Quick"],
  },
  {
    id: "r4",
    title: "Lemon Salmon with Cherry Tomatoes",
    emoji: "🐟",
    minutes: 20,
    difficulty: "Medium",
    calories: 460,
    uses: ["Salmon Fillet", "Cherry Tomatoes", "Spinach"],
    missing: ["Lemon", "Olive oil"],
    tags: ["Omega-3", "Sheet pan"],
  },
  {
    id: "r5",
    title: "One-Pot Tomato Pasta",
    emoji: "🍝",
    minutes: 18,
    difficulty: "Easy",
    calories: 540,
    uses: ["Pasta", "Cherry Tomatoes", "Spinach"],
    missing: ["Garlic", "Basil"],
    tags: ["Vegetarian", "Pantry friendly"],
  },
  {
    id: "r6",
    title: "Fluffy Milk & Egg Pancakes",
    emoji: "🥞",
    minutes: 15,
    difficulty: "Easy",
    calories: 420,
    uses: ["Whole Milk", "Eggs"],
    missing: ["Flour", "Sugar", "Baking powder"],
    tags: ["Breakfast", "Kid friendly"],
  },
];

const filters = ["Best match", "Use expiring", "Quick (≤15m)", "Vegetarian"] as const;

function RecipesPage() {
  const authed = useRequireAuthRedirect();

  if (!authed) {
    return null;
  }

  const [filter, setFilter] = useState<(typeof filters)[number]>("Best match");

  const { ranked, expiringNames } = useMemo(() => {
    const have = new Set(pantryItems.map((p) => p.name));
    const expiringNames = new Set(
      pantryItems.filter((p) => daysUntil(p.expiresAt) <= 3).map((p) => p.name)
    );

    let list = RECIPES.map((r) => {
      const usedHave = r.uses.filter((u) => have.has(u));
      const expiringUsed = r.uses.filter((u) => expiringNames.has(u)).length;
      const match = Math.round((usedHave.length / r.uses.length) * 100);
      return { ...r, usedHave, expiringUsed, match };
    });

    if (filter === "Use expiring") list = list.filter((r) => r.expiringUsed > 0);
    if (filter === "Quick (≤15m)") list = list.filter((r) => r.minutes <= 15);
    if (filter === "Vegetarian") list = list.filter((r) => r.tags.includes("Vegetarian"));

    list.sort((a, b) => b.expiringUsed - a.expiringUsed || b.match - a.match || a.minutes - b.minutes);
    return { ranked: list, expiringNames };
  }, [filter]);

  return (
    <AppShell title="Recipes">
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3">
        <Sparkles className="size-5 text-primary" />
        <div className="text-[13.5px] leading-snug">
          <span className="font-semibold">AI suggestions</span> based on what's in your pantry
          {expiringNames.size > 0 && (
            <> — prioritizing <span className="font-semibold">{expiringNames.size} expiring</span> ingredients.</>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <Filter className="size-4 text-muted-foreground shrink-0" />
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition",
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {ranked.map((r) => (
          <li key={r.id} className="ios-card p-4">
            <div className="flex items-start gap-3">
              <div className="grid size-12 place-items-center rounded-xl bg-secondary text-2xl shrink-0">{r.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-[15.5px] leading-tight">{r.title}</h3>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      r.match === 100
                        ? "bg-success/20 text-success-foreground border border-success/40"
                        : r.match >= 60
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {r.match}% match
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{r.minutes} min</span>
                  <span className="inline-flex items-center gap-1"><Flame className="size-3.5" />{r.calories} kcal</span>
                  <span className="inline-flex items-center gap-1"><ChefHat className="size-3.5" />{r.difficulty}</span>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {r.usedHave.map((u) => (
                    <span
                      key={u}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] border",
                        expiringNames.has(u)
                          ? "bg-warning/15 text-warning-foreground border-warning/40"
                          : "bg-success/10 text-success-foreground border-success/30"
                      )}
                    >
                      {expiringNames.has(u) ? "⏳ " : "✓ "}{u}
                    </span>
                  ))}
                  {r.missing.map((m) => (
                    <span key={m} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground border border-border">
                      + {m}
                    </span>
                  ))}
                </div>

                {r.expiringUsed > 0 && (
                  <p className="mt-2.5 text-[12px] text-warning-foreground">
                    Uses {r.expiringUsed} ingredient{r.expiringUsed > 1 ? "s" : ""} expiring soon
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-xl bg-primary text-primary-foreground py-2 text-[13.5px] font-semibold">
                Start cooking
              </button>
              <button className="rounded-xl bg-secondary text-secondary-foreground px-4 py-2 text-[13.5px] font-medium">
                Save
              </button>
            </div>
          </li>
        ))}
        {ranked.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No recipes match this filter.</p>
        )}
      </ul>
    </AppShell>
  );
}
