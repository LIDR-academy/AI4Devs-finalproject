import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Users, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { daysUntil, type PantryItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";
import { listPantryItems, type PantryApiItem } from "@/features/pantry/pantry.api";

export const Route = createFileRoute("/pantry")({
  beforeLoad: requireAuthBeforeLoad,
  head: () => ({ meta: [{ title: "Pantry — RealSaveFooding" }] }),
  component: PantryPage,
});

const filters = ["All", "Expiring", "Fridge", "Pantry", "Freezer"] as const;

function PantryPage() {
  const authed = useRequireAuthRedirect();

  if (!authed) {
    return null;
  }

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [items, setItems] = useState<PantryApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await listPantryItems();
        if (isMounted) {
          setItems(result);
        }
      } catch (apiError) {
        if (isMounted) {
          setError(apiError instanceof Error ? apiError.message : "Could not load pantry items.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadItems();
    return () => {
      isMounted = false;
    };
  }, []);

  const mappedItems: PantryItem[] = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        name: item.name,
        emoji: "🍽️",
        category: "Pantry",
        quantity: `${item.quantity} ${item.unit}`,
        addedAt: item.createdAt,
        expiresAt: item.expirationDate ?? new Date("2100-01-01").toISOString(),
        estimated: false,
        pricePaid: item.pricePaid ? Number(item.pricePaid) : 0,
        location: "Pantry",
      })),
    [items],
  );

  const filtered = useMemo(() => {
    return mappedItems
      .filter((i) => i.name.toLowerCase().includes(q.toLowerCase()))
      .filter((i) =>
        filter === "All" ? true :
        filter === "Expiring" ? daysUntil(i.expiresAt) <= 3 :
        i.location === filter
      )
      .sort((a, b) => daysUntil(a.expiresAt) - daysUntil(b.expiresAt));
  }, [mappedItems, q, filter]);

  const expiringSoon = mappedItems.filter((i) => daysUntil(i.expiresAt) <= 2).length;

  return (
    <AppShell
      title="Pantry"
      rightSlot={
        <Link to="/sharing" className="grid size-9 place-items-center rounded-full bg-secondary text-foreground">
          <Users className="size-4" />
        </Link>
      }
    >
      {expiringSoon > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-warning/15 px-4 py-3 text-warning-foreground border border-warning/30">
          <AlertTriangle className="size-5 text-warning" />
          <div className="text-[14px]">
            <span className="font-semibold">{expiringSoon} items</span> expire within 2 days
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search pantry"
          className="w-full rounded-2xl border border-border bg-surface pl-10 pr-4 py-3 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
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

      <ul className="space-y-2">
        {isLoading && (
          <p className="py-12 text-center text-muted-foreground">Loading pantry...</p>
        )}
        {error && !isLoading && (
          <p className="py-12 text-center text-destructive">{error}</p>
        )}
        {filtered.map((i) => (
          <li key={i.id}>
            <Link to="/item/$id" params={{ id: i.id }} className="block">
              <ItemRow item={i} />
            </Link>
          </li>
        ))}
        {!isLoading && !error && filtered.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No items found.</p>
        )}
      </ul>
    </AppShell>
  );
}

function ItemRow({ item }: { item: PantryItem }) {
  const d = daysUntil(item.expiresAt);
  const tone =
    d < 0 ? "text-destructive" :
    d <= 1 ? "text-destructive" :
    d <= 3 ? "text-warning" : "text-muted-foreground";

  const label =
    d < 0 ? `Expired ${Math.abs(d)}d ago` :
    d === 0 ? "Expires today" :
    d === 1 ? "Tomorrow" :
    `${d} days left`;

  return (
    <div className="ios-card flex items-center gap-4 p-3.5 transition active:scale-[0.99]">
      <div className="grid size-12 place-items-center rounded-xl bg-secondary text-2xl">{item.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-[15px]">{item.name}</p>
          {item.estimated && (
            <span className="rounded-full bg-warning/20 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground border border-warning/40">
              est.
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-muted-foreground">
          {item.quantity} · {item.location}
        </p>
      </div>
      <div className="text-right">
        <p className={cn("text-[13px] font-semibold", tone)}>{label}</p>
        <p className="text-[11.5px] text-muted-foreground">€{item.pricePaid.toFixed(2)}</p>
      </div>
    </div>
  );
}
