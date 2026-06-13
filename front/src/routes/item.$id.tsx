import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Tag, Repeat, CalendarClock, Settings2 } from "lucide-react";
import { priceComparison, daysUntil } from "@/lib/mock-data";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";
import {
  estimateExpiration,
  listPantryItems,
  overrideExpiration,
  type ExpirationEstimateResponse,
  type PantryApiItem,
} from "@/features/pantry/pantry.api";

export const Route = createFileRoute("/item/$id")({
  beforeLoad: requireAuthBeforeLoad,
  component: ItemDetail,
});

function ItemDetail() {
  const authed = useRequireAuthRedirect();

  if (!authed) {
    return null;
  }

  const { id } = useParams({ from: "/item/$id" });
  const [item, setItem] = useState<PantryApiItem | null>(null);
  const [estimate, setEstimate] = useState<ExpirationEstimateResponse | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSavingOverride, setIsSavingOverride] = useState(false);
  const [expirationInput, setExpirationInput] = useState("");
  const [expirationMessage, setExpirationMessage] = useState<string | null>(null);
  const [expirationError, setExpirationError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadItem() {
      const items = await listPantryItems();
      if (isMounted) {
        const found = items.find((i) => i.id === id) ?? null;
        setItem(found);
        setExpirationInput(found?.expirationDate?.slice(0, 10) ?? "");
      }
    }
    void loadItem();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!item) {
    return (
      <div className="min-h-screen bg-background p-6 text-center text-muted-foreground">
        Loading item...
      </div>
    );
  }

  const displayQuantity = `${item.quantity} ${item.unit}`;
  const expiresAt = item.expirationDate ?? new Date("2100-01-01").toISOString();
  const d = daysUntil(expiresAt);

  const confidenceLabel =
    !estimate ? null : estimate.confidence >= 0.8
      ? "High confidence"
      : estimate.confidence >= 0.6
        ? "Medium confidence"
        : "Low confidence";

  async function handleEstimate() {
    setExpirationError(null);
    setExpirationMessage(null);
    setIsEstimating(true);
    try {
      const result = await estimateExpiration(item.id);
      setEstimate(result);
      setExpirationInput(result.suggestedExpirationDate.slice(0, 10));
      setExpirationMessage("Suggestion generated. Review confidence before saving.");
    } catch (apiError) {
      setExpirationError(
        apiError instanceof Error ? apiError.message : "Could not estimate expiration.",
      );
    } finally {
      setIsEstimating(false);
    }
  }

  async function handleOverrideSave() {
    if (!expirationInput) {
      setExpirationError("Please select an expiration date.");
      return;
    }

    setExpirationError(null);
    setExpirationMessage(null);
    setIsSavingOverride(true);

    try {
      const payloadDate = new Date(`${expirationInput}T00:00:00.000Z`).toISOString();
      const result = await overrideExpiration(item.id, payloadDate);

      setItem((current) =>
        current
          ? {
              ...current,
              expirationDate: result.expirationDate,
            }
          : current,
      );

      setEstimate((current) =>
        current
          ? {
              ...current,
              method: result.assessment.method,
              confidence: result.assessment.confidence,
              suggestedExpirationDate: result.assessment.suggestedExpirationDate,
              lowConfidence: result.assessment.confidence < 0.6,
            }
          : null,
      );

      setExpirationMessage("Expiration date saved.");
    } catch (apiError) {
      setExpirationError(
        apiError instanceof Error ? apiError.message : "Could not save expiration date.",
      );
    } finally {
      setIsSavingOverride(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md md:max-w-2xl pb-16">
        <header className="ios-blur sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-border/60">
          <Link to="/pantry" className="flex items-center gap-1 text-primary">
            <ChevronLeft className="size-5" />
            <span className="text-[16px]">Pantry</span>
          </Link>
          <button className="text-[15px] text-primary font-medium">Edit</button>
        </header>

        <div className="px-5 pt-8 text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-3xl bg-secondary text-5xl shadow-ios">
            🍽️
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">{item.name}</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {displayQuantity} · Pantry · Pantry
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 px-5">
          <Stat label="Expires in" value={d < 0 ? `${Math.abs(d)}d ago` : `${d}d`} tone={d <= 2 ? "warn" : "ok"} />
          <Stat label="Paid" value="€0.00" />
          <Stat label="Added" value={new Date(item.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })} />
        </div>

        <section className="mt-7 px-5">
          <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Actions</h2>
          <ul className="ios-card divide-y divide-border overflow-hidden">
            <ActionRow icon={<Tag className="size-4.5" />} label="Compare prices" sublabel={`From €${Math.min(...priceComparison.map(p=>p.price)).toFixed(2)} at ${priceComparison.find(p=>p.price===Math.min(...priceComparison.map(x=>x.price)))?.store}`} />
            <ActionRow icon={<Repeat className="size-4.5" />} label="Alternatives" sublabel="Plant-based, lower price, longer shelf life" />
            <ActionRow icon={<CalendarClock className="size-4.5" />} label="Change expiration date" />
            <ActionRow icon={<Settings2 className="size-4.5" />} label="Change default for this food" />
          </ul>
        </section>

        <section className="mt-6 px-5">
          <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Expiration intelligence</h2>
          <div className="ios-card p-4 space-y-3">
            <button
              type="button"
              className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-[14px] font-semibold disabled:opacity-60"
              onClick={() => {
                void handleEstimate();
              }}
              disabled={isEstimating}
            >
              {isEstimating ? "Estimating..." : "Estimate expiration"}
            </button>

            {estimate && (
              <div className="rounded-xl border border-border bg-secondary/40 p-3">
                <p className="text-[13px] font-medium">
                  Suggested date: {new Date(estimate.suggestedExpirationDate).toLocaleDateString()}
                </p>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Method: {estimate.method} · Category: {estimate.category}
                </p>
                <p
                  className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                    estimate.lowConfidence
                      ? "bg-warning/20 border-warning/40 text-warning-foreground"
                      : "bg-success/20 border-success/40 text-success"
                  }`}
                >
                  {confidenceLabel}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
                Override expiration
              </label>
              <input
                type="date"
                value={expirationInput}
                onChange={(e) => setExpirationInput(e.target.value)}
                className="w-full h-11 rounded-xl bg-secondary px-3 text-[14px] outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <button
              type="button"
              className="w-full rounded-xl border border-border py-2.5 text-[14px] font-semibold disabled:opacity-60"
              onClick={() => {
                void handleOverrideSave();
              }}
              disabled={isSavingOverride}
            >
              {isSavingOverride ? "Saving..." : "Save override"}
            </button>

            {expirationMessage && (
              <p className="text-[12px] text-success">{expirationMessage}</p>
            )}
            {expirationError && (
              <p className="text-[12px] text-destructive">{expirationError}</p>
            )}
          </div>
        </section>

        <section className="mt-6 px-5">
          <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Price across stores</h2>
          <div className="ios-card divide-y divide-border overflow-hidden">
            {priceComparison.sort((a,b)=>a.price-b.price).map((p, idx) => (
              <div key={p.brand} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-[14.5px] font-medium">{p.brand}</p>
                  <p className="text-[12px] text-muted-foreground">{p.store}</p>
                </div>
                <div className="flex items-center gap-2">
                  {idx === 0 && <span className="rounded-full bg-success/20 px-2 py-0.5 text-[11px] font-semibold text-success">Best</span>}
                  <span className="text-[15px] font-semibold">€{p.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="px-5 mt-8">
          <button className="w-full rounded-2xl bg-destructive/10 text-destructive py-4 font-semibold text-[15px]">
            Mark as consumed
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className="ios-card p-3 text-center">
      <p className={`text-[16px] font-bold ${tone === "warn" ? "text-warning" : ""}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function ActionRow({ icon, label, sublabel }: { icon: React.ReactNode; label: string; sublabel?: string }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary/50 cursor-pointer">
      <div className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[14.5px] font-medium">{label}</p>
        {sublabel && <p className="text-[12px] text-muted-foreground truncate">{sublabel}</p>}
      </div>
      <ChevronLeft className="size-4 rotate-180 text-muted-foreground" />
    </li>
  );
}
