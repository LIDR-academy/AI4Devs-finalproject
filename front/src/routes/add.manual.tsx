import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";
import {
  ApiError,
  createPantryItem,
  estimateExpirationByName,
  type QuickExpirationEstimate,
} from "@/features/pantry/pantry.api";
import {
  validateAddItem,
  type AddItemErrors,
} from "@/features/pantry/add-item.schema";
import { setHighlightedItem } from "@/features/pantry/pantry-view-state";
import { clearSession } from "@/features/auth/session";
import { trackEvent } from "@/shared/lib/analytics";

export const Route = createFileRoute("/add/manual")({
  beforeLoad: requireAuthBeforeLoad,
  component: ManualEntryPage,
});

const CATEGORIES = ["Produce", "Dairy", "Meat", "Seafood", "Bakery", "Pantry", "Frozen", "Beverages", "Other"];
const LOCATIONS = ["Fridge", "Pantry", "Freezer"] as const;
const UNITS = ["unit", "g", "kg", "ml", "l", "pack"] as const;
const EMOJI_SUGGEST = ["🍎", "🥛", "🍞", "🥩", "🐟", "🥦", "🥚", "🧀", "🍝", "🥑", "🍌", "🍅"];

export function ManualEntryPage() {
  const authed = useRequireAuthRedirect();

  if (!authed) {
    return null;
  }

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍎");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<(typeof UNITS)[number]>("unit");
  const [location, setLocation] = useState<(typeof LOCATIONS)[number]>("Fridge");
  const [expiresAt, setExpiresAt] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AddItemErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [expirationEstimate, setExpirationEstimate] = useState<QuickExpirationEstimate | null>(null);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  const canEstimate = name.trim().length > 0;

  useEffect(() => {
    trackEvent("pantry_add_item_opened");
  }, []);

  // Keep the total "Price paid" in sync when the user enters a per-unit price.
  function recomputePriceFromUnit(nextUnitPrice: string, nextQuantity: string) {
    const parsedUnitPrice = parseFloat(nextUnitPrice);
    const parsedQuantity = parseFloat(nextQuantity);
    if (
      !Number.isNaN(parsedUnitPrice) &&
      !Number.isNaN(parsedQuantity) &&
      parsedUnitPrice >= 0 &&
      parsedQuantity > 0
    ) {
      setPrice((parsedUnitPrice * parsedQuantity).toFixed(2));
    }
  }

  function handleUnitPriceChange(value: string) {
    setUnitPrice(value);
    recomputePriceFromUnit(value, quantity);
  }

  function handleQuantityChange(value: string) {
    setQuantity(value);
    recomputePriceFromUnit(unitPrice, value);
  }

  async function handleEstimateExpiration() {
    setEstimateError(null);
    setIsEstimating(true);
    try {
      const result = await estimateExpirationByName(name.trim());
      setExpirationEstimate(result);
      setExpiresAt(result.suggestedExpirationDate.slice(0, 10));
    } catch (apiError) {
      setEstimateError(
        apiError instanceof Error ? apiError.message : "Could not estimate expiration.",
      );
    } finally {
      setIsEstimating(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const validation = validateAddItem({
      name,
      quantity: Number(quantity),
      unit,
      expirationDate: expiresAt || undefined,
      unitPrice: unitPrice.trim() === "" ? undefined : Number(unitPrice),
      pricePaid: price.trim() === "" ? undefined : Number(price),
    });

    if (!validation.success || !validation.values) {
      setFieldErrors(validation.errors);
      return;
    }

    const values = validation.values;
    // Only emitted once client validation passes, per the ticket definition.
    trackEvent("pantry_add_item_submitted", { hasExpiration: Boolean(values.expirationDate) });

    setIsSubmitting(true);
    try {
      const created = await createPantryItem({
        name: values.name,
        quantity: values.quantity,
        unit: values.unit,
        storageLocation: location,
        expirationDate: values.expirationDate,
        ...(values.pricePaid !== undefined && {
          pricePaid: Number(values.pricePaid.toFixed(2)),
        }),
      });

      // Persist emoji by item id and by name (name fallback is used when re-adding consumed/wasted items).
      try {
        const byId = JSON.parse(localStorage.getItem("rsf_item_emojis") ?? "{}") as Record<string, string>;
        byId[created.id] = emoji;
        localStorage.setItem("rsf_item_emojis", JSON.stringify(byId));

        const byName = JSON.parse(localStorage.getItem("rsf_name_emojis") ?? "{}") as Record<string, string>;
        byName[values.name] = emoji;
        localStorage.setItem("rsf_name_emojis", JSON.stringify(byName));
      } catch {
        // localStorage unavailable — silently skip
      }

      trackEvent("pantry_add_item_success");
      setHighlightedItem(created.id);
      setSaved(true);
      toast.success(`"${values.name}" added to your pantry.`);
      setTimeout(() => navigate({ to: "/pantry" }), 700);
    } catch (apiError) {
      handleSaveError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSaveError(apiError: unknown) {
    const status = apiError instanceof ApiError ? apiError.status : undefined;

    // Session expired mid-submit: clear and bounce to login (matches the guard).
    if (status === 401) {
      trackEvent("pantry_add_item_failed", { reason: "unauthorized" });
      clearSession();
      void navigate({ to: "/auth", replace: true });
      return;
    }

    let message: string;
    let reason: string;
    if (status === 403) {
      message = "You don't have access to this household's pantry.";
      reason = "forbidden";
    } else if (status !== undefined && status >= 500) {
      message = "Something went wrong on our end. Please try again.";
      reason = "server_error";
    } else if (status === 400) {
      message = apiError instanceof Error ? apiError.message : "Please check the form and try again.";
      reason = "validation";
    } else {
      message = apiError instanceof Error ? apiError.message : "Could not save item. Please try again.";
      reason = "unknown";
    }

    trackEvent("pantry_add_item_failed", { reason });
    setFormError(message);
  }

  return (
    <AppShell
      title="Manual entry"
      rightSlot={
        <Link to="/add" className="flex items-center gap-1 text-[15px] text-primary font-medium -ml-1">
          <ChevronLeft className="size-5" />
          Add
        </Link>
      }
    >
      <p className="text-[15px] text-muted-foreground mb-5">Type item details to add it to your pantry.</p>

      <form onSubmit={handleSave} className="space-y-5">
        <section className="ios-card p-4">
          <Label>Item</Label>
          <div className="flex gap-3 items-start">
            <button
              type="button"
              className="grid size-14 place-items-center rounded-2xl bg-secondary text-3xl shrink-0"
              onClick={() => {
                const i = EMOJI_SUGGEST.indexOf(emoji);
                setEmoji(EMOJI_SUGGEST[(i + 1) % EMOJI_SUGGEST.length]);
              }}
              aria-label="Cycle emoji"
            >
              {emoji}
            </button>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Greek Yogurt"
              className="flex-1 h-14 rounded-2xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 focus:ring-primary/40"
              data-testid="manual-name-input"
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={fieldErrors.name ? "manual-name-error" : undefined}
            />
          </div>
          <FieldError id="manual-name-error" testId="manual-name-error" message={fieldErrors.name} />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {EMOJI_SUGGEST.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`size-9 rounded-xl text-xl ${emoji === e ? "bg-primary/15 ring-2 ring-primary/50" : "bg-secondary"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </section>

        <section className="ios-card p-4 grid grid-cols-2 gap-3">
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-ios">
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Quantity">
            <input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              placeholder="1"
              className="input-ios"
              data-testid="manual-quantity-input"
              aria-invalid={fieldErrors.quantity ? true : undefined}
              aria-describedby={fieldErrors.quantity ? "manual-quantity-error" : undefined}
            />
            <FieldError id="manual-quantity-error" testId="manual-quantity-error" message={fieldErrors.quantity} />
          </Field>
          <Field label="Unit">
            <select value={unit} onChange={(e) => setUnit(e.target.value as (typeof UNITS)[number])} className="input-ios">
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <select value={location} onChange={(e) => setLocation(e.target.value as (typeof LOCATIONS)[number])} className="input-ios">
              {LOCATIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Price per unit (€)">
            <input
              value={unitPrice}
              onChange={(e) => handleUnitPriceChange(e.target.value)}
              inputMode="decimal"
              placeholder="1.20"
              className="input-ios"
              data-testid="manual-unit-price-input"
              aria-invalid={fieldErrors.unitPrice ? true : undefined}
              aria-describedby={fieldErrors.unitPrice ? "manual-unit-price-error" : undefined}
            />
            <FieldError id="manual-unit-price-error" testId="manual-unit-price-error" message={fieldErrors.unitPrice} />
          </Field>
          <Field label="Price paid (€)">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="2.40"
              className="input-ios"
              data-testid="manual-price-input"
              aria-invalid={fieldErrors.pricePaid ? true : undefined}
              aria-describedby={fieldErrors.pricePaid ? "manual-price-error" : undefined}
            />
            <FieldError id="manual-price-error" testId="manual-price-error" message={fieldErrors.pricePaid} />
          </Field>
          <Field label="Expires on" full>
            <div className="space-y-2">
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="input-ios"
                data-testid="manual-expiration-input"
              />
              <button
                type="button"
                onClick={() => { void handleEstimateExpiration(); }}
                disabled={!canEstimate || isEstimating}
                className="w-full h-10 rounded-xl border border-border bg-secondary text-[13px] font-medium disabled:opacity-50"
                data-testid="manual-estimate-expiration-btn"
              >
                {isEstimating ? "Estimating…" : "Estimate expiration"}
              </button>
              {expirationEstimate && (
                <div className="rounded-xl border border-border bg-secondary/40 p-3 text-[12px]" data-testid="manual-estimate-result">
                  <p className="font-medium">
                    Suggested: {new Date(expirationEstimate.suggestedExpirationDate).toLocaleDateString()}
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Category: {expirationEstimate.category} ·{" "}
                    {expirationEstimate.lowConfidence ? "Low confidence" : "Good confidence"}
                  </p>
                </div>
              )}
              {estimateError && (
                <p className="text-[12px] text-destructive" data-testid="manual-estimate-error">
                  {estimateError}
                </p>
              )}
            </div>
          </Field>
        </section>

        {formError && (
          <p
            className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive"
            role="alert"
            data-testid="manual-form-error"
          >
            {formError}
          </p>
        )}

        <section className="ios-card p-4">
          <Label>Notes</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes (brand, store, etc.)"
            rows={3}
            className="w-full rounded-2xl bg-secondary px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </section>

        <button
          type="submit"
          disabled={saved || isSubmitting}
          data-testid="manual-save-btn"
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-[16px] font-semibold disabled:opacity-50 active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            "Saving..."
          ) : saved ? (
            <>
              <Check className="size-5" /> Added to pantry
            </>
          ) : (
            "Save item"
          )}
        </button>
      </form>

      <style>{`
        .input-ios {
          height: 44px;
          width: 100%;
          border-radius: 14px;
          background: hsl(var(--secondary) / 1);
          padding: 0 12px;
          font-size: 15px;
          outline: none;
        }
        .input-ios:focus { box-shadow: 0 0 0 2px hsl(var(--primary) / 0.4); }
      `}</style>
    </AppShell>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="px-1 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">{children}</p>;
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function FieldError({ id, testId, message }: { id: string; testId: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} data-testid={testId} role="alert" className="mt-1 px-1 text-[12px] text-destructive">
      {message}
    </p>
  );
}
