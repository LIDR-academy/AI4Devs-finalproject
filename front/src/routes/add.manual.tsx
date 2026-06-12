import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";
import { createPantryItem } from "@/features/pantry/pantry.api";

export const Route = createFileRoute("/add/manual")({
  beforeLoad: requireAuthBeforeLoad,
  component: ManualEntryPage,
});

const CATEGORIES = ["Produce", "Dairy", "Meat", "Seafood", "Bakery", "Pantry", "Frozen", "Beverages", "Other"];
const LOCATIONS = ["Fridge", "Pantry", "Freezer"] as const;
const UNITS = ["unit", "g", "kg", "ml", "l", "pack"] as const;
const EMOJI_SUGGEST = ["🍎", "🥛", "🍞", "🥩", "🐟", "🥦", "🥚", "🧀", "🍝", "🥑", "🍌", "🍅"];

function ManualEntryPage() {
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
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSave = name.trim().length > 0 && Number(quantity) >= 1;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSave) {
      setError("Name and quantity are required.");
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError("Quantity must be a whole number greater than 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPantryItem({
        name,
        quantity: parsedQuantity,
        unit,
        expirationDate: expiresAt || undefined,
      });

      setSaved(true);
      setTimeout(() => navigate({ to: "/pantry" }), 700);
    } catch (apiError) {
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Could not save item. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
            />
          </div>
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
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              className="input-ios"
            />
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
          <Field label="Price paid (€)">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="2.40"
              className="input-ios"
            />
          </Field>
          <Field label="Expires on" full>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="input-ios"
            />
          </Field>
        </section>

        {error && (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
            {error}
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
          disabled={!canSave || saved || isSubmitting}
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
