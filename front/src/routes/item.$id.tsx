import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Tag, Repeat, Settings2 } from "lucide-react";

const ITEM_EMOJIS = ["🍎", "🥛", "🍞", "🥩", "🐟", "🥦", "🥚", "🧀", "🍝", "🥑", "🍌", "🍅", "🛒", "🥫", "🧃", "🧁", "🍽️"];
import { daysUntil } from "@/lib/mock-data";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";
import {
  estimateExpiration,
  listPantryItems,
  overrideExpiration,
  registerPantryItemEvent,
  updatePantryItem,
  WasteConfirmationRequiredError,
  PANTRY_UNITS,
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
  const navigate = useNavigate();
  const [item, setItem] = useState<PantryApiItem | null>(null);
  const [estimate, setEstimate] = useState<ExpirationEstimateResponse | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSavingOverride, setIsSavingOverride] = useState(false);
  const [expirationInput, setExpirationInput] = useState("");
  const [expirationMessage, setExpirationMessage] = useState<string | null>(null);
  const [expirationError, setExpirationError] = useState<string | null>(null);

  const [quantityInput, setQuantityInput] = useState("");
  const [unitInput, setUnitInput] = useState("unit");
  const [pricePaidInput, setPricePaidInput] = useState("");
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsMessage, setDetailsMessage] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [isConsuming, setIsConsuming] = useState(false);
  const [consumeError, setConsumeError] = useState<string | null>(null);

  const [emoji, setEmoji] = useState("🍽️");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isWasting, setIsWasting] = useState(false);
  const [wasteError, setWasteError] = useState<string | null>(null);
  const [wasteConfirmation, setWasteConfirmation] = useState<{
    itemName: string;
    daysPastExpiry: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadItem() {
      const items = await listPantryItems();
      if (isMounted) {
        const found = items.find((i) => i.id === id) ?? null;
        setItem(found);
        setExpirationInput(found?.expirationDate?.slice(0, 10) ?? "");
        setQuantityInput(String(found?.quantity ?? 1));
        setUnitInput(found?.unit ?? "unit");
        setPricePaidInput(found?.pricePaid ? Number(found.pricePaid).toFixed(2) : "");
      }
    }
    void loadItem();

    try {
      const stored = JSON.parse(localStorage.getItem("rsf_item_emojis") ?? "{}") as Record<string, string>;
      if (stored[id]) setEmoji(stored[id]);
    } catch {
      // localStorage unavailable
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  function updateEmoji(next: string) {
    setEmoji(next);
    setShowEmojiPicker(false);
    try {
      const stored = JSON.parse(localStorage.getItem("rsf_item_emojis") ?? "{}") as Record<string, string>;
      stored[id] = next;
      localStorage.setItem("rsf_item_emojis", JSON.stringify(stored));
    } catch {
      // localStorage unavailable
    }
  }

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

  async function handleDetailsSave() {
    const qty = parseInt(quantityInput, 10);
    const price = pricePaidInput !== "" ? parseFloat(pricePaidInput) : undefined;

    if (!quantityInput || isNaN(qty) || qty < 1) {
      setDetailsError("Quantity must be a positive number.");
      return;
    }
    if (price !== undefined && (isNaN(price) || price < 0)) {
      setDetailsError("Price must be a positive number.");
      return;
    }

    setDetailsError(null);
    setDetailsMessage(null);
    setIsSavingDetails(true);

    try {
      const updated = await updatePantryItem(item.id, {
        quantity: qty,
        unit: unitInput,
        ...(price !== undefined && { pricePaid: price }),
      });
      setItem((current) => (current ? { ...current, ...updated } : current));
      setDetailsMessage("Details saved.");
    } catch (apiError) {
      setDetailsError(apiError instanceof Error ? apiError.message : "Could not save details.");
    } finally {
      setIsSavingDetails(false);
    }
  }

  async function handleOverrideSave() {    if (!expirationInput) {
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

  async function handleMarkConsumed() {
    if (!item) return;
    setIsConsuming(true);
    setConsumeError(null);
    try {
      await registerPantryItemEvent(item.id, "CONSUMED");
      await navigate({ to: "/pantry" });
    } catch (apiError) {
      setConsumeError(apiError instanceof Error ? apiError.message : "Could not mark as consumed.");
    } finally {
      setIsConsuming(false);
    }
  }

  async function handleMarkWasted(confirmed = false) {
    if (!item) return;
    setIsWasting(true);
    setWasteError(null);
    try {
      await registerPantryItemEvent(item.id, "WASTED", { confirmed });
      setWasteConfirmation(null);
      await navigate({ to: "/pantry" });
    } catch (apiError) {
      if (apiError instanceof WasteConfirmationRequiredError) {
        setWasteConfirmation({
          itemName: apiError.itemName,
          daysPastExpiry: apiError.daysPastExpiry,
        });
      } else {
        setWasteError(apiError instanceof Error ? apiError.message : "Could not mark as wasted.");
      }
    } finally {
      setIsWasting(false);
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
          <button
            type="button"
            className="mx-auto grid size-24 place-items-center rounded-3xl bg-secondary text-5xl shadow-ios active:scale-95 transition"
            onClick={() => setShowEmojiPicker((v) => !v)}
            aria-label="Change icon"
            data-testid="item-emoji-btn"
          >
            {emoji}
          </button>
          {showEmojiPicker && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5" data-testid="item-emoji-picker">
              {ITEM_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => updateEmoji(e)}
                  className={`size-10 rounded-xl text-2xl transition ${
                    emoji === e ? "bg-primary/15 ring-2 ring-primary/50" : "bg-secondary"
                  }`}
                  aria-label={e}
                  data-testid={`item-emoji-pick-${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
          <h1 className="mt-5 text-2xl font-bold tracking-tight">{item.name}</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {displayQuantity} · Pantry · Pantry
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 px-5">
          <Stat label="Expires in" value={d < 0 ? `${Math.abs(d)}d ago` : `${d}d`} tone={d <= 2 ? "warn" : "ok"} />
          <Stat label="Paid" value={item.pricePaid ? `€${Number(item.pricePaid).toFixed(2)}` : "—"} />
          <Stat label="Added" value={new Date(item.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })} />
        </div>

        <section className="mt-7 px-5">
          <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Item details</h2>
          <div className="ios-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  data-testid="item-quantity-input"
                  className="w-full h-11 rounded-xl bg-secondary px-3 text-[14px] outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Unit
                </label>
                <select
                  value={unitInput}
                  onChange={(e) => setUnitInput(e.target.value)}
                  data-testid="item-unit-select"
                  className="w-full h-11 rounded-xl bg-secondary px-3 text-[14px] outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {PANTRY_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
                Price paid (€)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={pricePaidInput}
                onChange={(e) => setPricePaidInput(e.target.value)}
                data-testid="item-price-input"
                className="w-full h-11 rounded-xl bg-secondary px-3 text-[14px] outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="button"
              className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-[14px] font-semibold disabled:opacity-60"
              onClick={() => { void handleDetailsSave(); }}
              disabled={isSavingDetails}
              data-testid="item-details-save"
            >
              {isSavingDetails ? "Saving..." : "Save details"}
            </button>
            {detailsMessage && (
              <p className="text-[12px] text-success" data-testid="item-details-message">{detailsMessage}</p>
            )}
            {detailsError && (
              <p className="text-[12px] text-destructive" data-testid="item-details-error">{detailsError}</p>
            )}
          </div>
        </section>

        <section className="mt-6 px-5">
          <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Actions</h2>          <ul className="ios-card divide-y divide-border overflow-hidden">
            <ActionLinkRow
              icon={<Tag className="size-4.5" />}
              label="Compare prices"
              sublabel="View internal MVP reference price"
              to="/compare-price/$id"
              params={{ id: item.id }}
              testId="compare-price-action"
            />
            <ActionRow icon={<Repeat className="size-4.5" />} label="Alternatives" sublabel="Plant-based, lower price, longer shelf life" />
            <ActionRow icon={<Settings2 className="size-4.5" />} label="Change default for this food" />
          </ul>
        </section>

        <section className="mt-6 px-5">
          <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Expiration intelligence</h2>
          <div className="ios-card p-4 space-y-3">
            <p className="text-[12px] text-muted-foreground" data-testid="expiration-intelligence-guidance">
              Use this section to estimate and update expiration dates for this item.
            </p>
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

        <div className="px-5 mt-8 space-y-2">
          <button
            data-testid="item-consume-button"
            onClick={() => { void handleMarkConsumed(); }}
            disabled={isConsuming}
            className="w-full rounded-2xl bg-emerald-500/10 text-emerald-700 py-4 font-semibold text-[15px] disabled:opacity-60"
          >
            {isConsuming ? "Marking…" : "Mark as consumed"}
          </button>
          {consumeError && (
            <p className="text-[12px] text-destructive text-center" data-testid="item-consume-error">
              {consumeError}
            </p>
          )}

          <button
            data-testid="item-waste-button"
            onClick={() => { void handleMarkWasted(); }}
            disabled={isWasting}
            className="w-full rounded-2xl bg-destructive/20 text-destructive py-4 font-semibold text-[15px] disabled:opacity-60"
          >
            {isWasting ? "Marking…" : "Mark as wasted"}
          </button>
          {wasteError && (
            <p className="text-[12px] text-destructive text-center" data-testid="item-waste-error">
              {wasteError}
            </p>
          )}
        </div>

        {wasteConfirmation && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pb-8"
            data-testid="waste-confirmation-overlay"
          >
            <div className="mx-4 w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl" data-testid="waste-confirmation-modal">
              <h3 className="text-[17px] font-bold">Confirm waste</h3>
              <p className="mt-2 text-[14px] text-muted-foreground">
                <strong>{wasteConfirmation.itemName}</strong> expired{" "}
                <strong>{wasteConfirmation.daysPastExpiry} day(s) ago</strong>. Are you sure you want
                to mark it as wasted?
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-border py-3 text-[14px] font-semibold"
                  onClick={() => setWasteConfirmation(null)}
                  data-testid="waste-confirmation-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-destructive text-destructive-foreground py-3 text-[14px] font-semibold"
                  onClick={() => { void handleMarkWasted(true); }}
                  data-testid="waste-confirmation-confirm"
                >
                  Yes, mark wasted
                </button>
              </div>
            </div>
          </div>
        )}
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

function ActionLinkRow({
  icon,
  label,
  sublabel,
  to,
  params,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  to: "/compare-price/$id";
  params: { id: string };
  testId?: string;
}) {
  return (
    <li>
      <Link
        className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary/50"
        to={to}
        params={params}
        data-testid={testId}
      >
        <div className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[14.5px] font-medium">{label}</p>
          {sublabel && <p className="text-[12px] text-muted-foreground truncate">{sublabel}</p>}
        </div>
        <ChevronLeft className="size-4 rotate-180 text-muted-foreground" />
      </Link>
    </li>
  );
}
