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
import {
  listConsumptionEvents,
  listPantryItems,
  reAddConsumptionEvent,
  type ConsumptionEventRecord,
  type PantryApiItem,
} from "@/features/pantry/pantry.api";
import {
  consumeHighlightedItem,
  readPantryFilter,
  readPantrySearch,
  savePantryFilter,
  savePantrySearch,
} from "@/features/pantry/pantry-view-state";

export const Route = createFileRoute("/pantry")({
  beforeLoad: requireAuthBeforeLoad,
  head: () => ({ meta: [{ title: "Pantry — RealSaveFooding" }] }),
  component: PantryPage,
});

const filters = ["All", "Expiring", "Fridge", "Pantry", "Freezer", "Consumed", "Wasted"] as const;

export function PantryPage() {
  const authed = useRequireAuthRedirect();

  if (!authed) {
    return null;
  }

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [items, setItems] = useState<PantryApiItem[]>([]);
  const [events, setEvents] = useState<ConsumptionEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reAddMessage, setReAddMessage] = useState<string | null>(null);
  const [reAddingId, setReAddingId] = useState<string | null>(null);
  const [reAddedIds, setReAddedIds] = useState<Set<string>>(new Set());
  const [itemEmojis, setItemEmojis] = useState<Record<string, string>>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Restore preserved filter/search and pick up a just-added item to highlight.
  // Done in an effect (not a lazy initializer) to avoid SSR/client hydration mismatch.
  useEffect(() => {
    const savedFilter = readPantryFilter();
    if (savedFilter && (filters as readonly string[]).includes(savedFilter)) {
      setFilter(savedFilter as (typeof filters)[number]);
    }
    const savedSearch = readPantrySearch();
    if (savedSearch) {
      setQ(savedSearch);
    }

    const newItemId = consumeHighlightedItem();
    if (newItemId) {
      setHighlightedId(newItemId);
      const timer = setTimeout(() => setHighlightedId(null), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Persist filter/search so they survive navigating to add-item and back.
  useEffect(() => {
    savePantryFilter(filter);
  }, [filter]);

  useEffect(() => {
    savePantrySearch(q);
  }, [q]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("rsf_item_emojis") ?? "{}") as Record<string, string>;
      setItemEmojis(stored);
    } catch {
      // localStorage unavailable
    }
  }, []);

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

  useEffect(() => {
    if (filter !== "Consumed" && filter !== "Wasted") return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setEvents([]);

    listConsumptionEvents(filter === "Consumed" ? "CONSUMED" : "WASTED")
      .then((result) => {
        if (isMounted) setEvents(result);
      })
      .catch((apiError) => {
        if (isMounted)
          setError(apiError instanceof Error ? apiError.message : "Could not load history.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filter]);

  async function handleReAdd(event: ConsumptionEventRecord) {
    if (reAddingId !== null) return;
    setReAddingId(event.id);
    try {
      // The backend recreates the pantry item AND deletes the consumption event in
      // one transaction, so the item cannot be re-added twice from history.
      const created = await reAddConsumptionEvent(event.id);
      // Carry the emoji from the name-based fallback map so the re-added item
      // keeps the same icon the user previously set, even though it has a new id.
      try {
        const byName = JSON.parse(localStorage.getItem("rsf_name_emojis") ?? "{}") as Record<string, string>;
        const savedEmoji = event.itemName ? byName[event.itemName] : undefined;
        if (savedEmoji) {
          const byId = JSON.parse(localStorage.getItem("rsf_item_emojis") ?? "{}") as Record<string, string>;
          byId[created.id] = savedEmoji;
          localStorage.setItem("rsf_item_emojis", JSON.stringify(byId));
          setItemEmojis((prev) => ({ ...prev, [created.id]: savedEmoji }));
        }
      } catch {
        // localStorage unavailable — silently skip
      }
      // Mark as re-added before the filter effect can re-fetch and restore the event
      setReAddedIds((prev) => new Set([...prev, event.id]));
      setEvents((current) => current.filter((e) => e.id !== event.id));
      // Refresh pantry items so All/Expiring/location filters show the re-added item
      const fresh = await listPantryItems();
      setItems(fresh);
      setReAddMessage(`"${event.itemName ?? "Item"}" added back to pantry.`);
      setTimeout(() => setReAddMessage(null), 3000);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not re-add item.");
    } finally {
      setReAddingId(null);
    }
  }

  const mappedItems: PantryItem[] = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        name: item.name,
        emoji: itemEmojis[item.id] ?? "🍽️",
        category: "Pantry",
        quantity: `${item.quantity} ${item.unit}`,
        addedAt: item.createdAt,
        expiresAt: item.expirationDate ?? new Date("2100-01-01").toISOString(),
        estimated: false,
        pricePaid: item.pricePaid ? Number(item.pricePaid) : 0,
        location: (item.storageLocation ?? "Pantry") as PantryItem["location"],
      })),
    [items, itemEmojis],
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

      {reAddMessage && (
        <div className="mb-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-[13px] text-emerald-700" data-testid="re-add-success">
          {reAddMessage}
        </div>
      )}

      {filter === "Consumed" || filter === "Wasted" ? (
        <ul className="space-y-2" data-testid="pantry-events-list">
          {isLoading && (
            <p className="py-12 text-center text-muted-foreground">Loading history...</p>
          )}
          {error && !isLoading && (
            <p className="py-12 text-center text-destructive">{error}</p>
          )}
          {!isLoading && !error && events.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">No {filter.toLowerCase()} items found.</p>
          )}
          {events
            .filter((e) => !reAddedIds.has(e.id))
            .filter((e) => (q ? (e.itemName ?? "").toLowerCase().includes(q.toLowerCase()) : true))
            .map((e) => (
              <li key={e.id} className="ios-card flex items-center gap-4 p-3.5" data-testid={`event-row-${e.id}`}>
                <div className="grid size-12 place-items-center rounded-xl bg-secondary text-2xl">
                  {filter === "Consumed" ? "✅" : "🗑️"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-[15px]" data-testid={`event-name-${e.id}`}>
                    {e.itemName ?? "Unknown item"}
                  </p>
                  <p className="text-[12.5px] text-muted-foreground">
                    {e.quantity} {e.itemUnit ?? "unit"} · {new Date(e.occurredAt).toLocaleDateString()}
                  </p>
                  {e.estimatedValueEur && (
                    <p className="text-[12px] text-muted-foreground">
                      €{Number(e.estimatedValueEur).toFixed(2)} value
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={reAddingId !== null}
                  className="shrink-0 rounded-xl bg-primary/10 px-3 py-1.5 text-[12px] font-medium text-primary disabled:opacity-50"
                  onClick={() => { void handleReAdd(e); }}
                  data-testid={`event-readd-${e.id}`}
                >
                  {reAddingId === e.id ? "Adding…" : "Re-add"}
                </button>
              </li>
            ))}
        </ul>
      ) : (
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
                <ItemRow item={i} highlighted={i.id === highlightedId} />
              </Link>
            </li>
          ))}
          {!isLoading && !error && filtered.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">No items found.</p>
          )}
        </ul>
      )}
    </AppShell>
  );
}

function ItemRow({ item, highlighted }: { item: PantryItem; highlighted?: boolean }) {
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
    <div
      className={cn(
        "ios-card flex items-center gap-4 p-3.5 transition active:scale-[0.99]",
        highlighted && "ring-2 ring-primary/60 bg-primary/5 animate-pulse",
      )}
      data-testid={highlighted ? "pantry-item-highlighted" : undefined}
      data-highlighted={highlighted ? "true" : undefined}
    >
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
