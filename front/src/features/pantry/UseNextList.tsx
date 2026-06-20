import { useEffect, useRef, useState } from "react";
import type { UseNextItem } from "./pantry.api";

interface UseNextListProps {
  items: UseNextItem[];
  isLoading: boolean;
  error: string | null;
  onConsume: (itemId: string) => Promise<void>;
  onWaste: (itemId: string) => Promise<void>;
  emptyMessage?: string;
  loadingMessage?: string;
  /**
   * Prefix for data-testid attributes. Defaults to "use-next".
   * Pass "dashboard" to preserve backward-compatible test IDs for the insights/dashboard page.
   */
  testIdPrefix?: string;
}

export function UseNextList({
  items,
  isLoading,
  error,
  onConsume,
  onWaste,
  emptyMessage = "No active items to prioritize.",
  loadingMessage = "Loading...",
  testIdPrefix = "use-next",
}: UseNextListProps) {
  const p = testIdPrefix;
  const [itemEmojis, setItemEmojis] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("rsf_item_emojis") ?? "{}") as Record<string, string>;
      setItemEmojis(stored);
    } catch {
      // localStorage unavailable
    }
  }, []);

  if (isLoading) {
    return (
      <p className="py-8 text-center text-muted-foreground" data-testid={`${p}-loading`}>
        {loadingMessage}
      </p>
    );
  }

  if (error) {
    return (
      <p
        className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-[12px] text-destructive"
        data-testid={`${p}-error`}
      >
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground" data-testid={`${p}-empty`}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-2" data-testid={`${p}-list`}>
      {items.map((item, index) => (
        <li
          key={item.pantryItemId}
          className="ios-card p-3"
          data-testid={`${p}-item-${index}`}
        >
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-xl">
              {itemEmojis[item.pantryItemId] ?? "🍽️"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p
                  className="text-[14px] font-semibold leading-snug"
                  data-testid={`${p}-name-${item.pantryItemId}`}
                >
                  {item.name}
                </p>
                <RiskBadge risk={item.riskLevel} />
              </div>
              <p className="text-[12px] text-muted-foreground">
                {item.quantity} {item.unit}
                {item.pricePaid ? ` · €${Number(item.pricePaid).toFixed(2)}` : ""}
              </p>
              <p
                className="mt-0.5 text-[12px] text-muted-foreground"
                data-testid={`${p}-days-${item.pantryItemId}`}
              >
                {formatDays(item.daysUntilExpiration)}
              </p>
            </div>
          </div>

          <div className="mt-3 ml-[52px] flex gap-2">
            <button
              type="button"
              className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[12px] font-medium text-emerald-700"
              onClick={() => { void onConsume(item.pantryItemId); }}
              data-testid={`${p}-consume-${item.pantryItemId}`}
            >
              Mark consumed
            </button>
            <button
              type="button"
              className="rounded-lg bg-destructive/10 px-3 py-1.5 text-[12px] font-medium text-destructive"
              onClick={() => { void onWaste(item.pantryItemId); }}
              data-testid={`${p}-waste-${item.pantryItemId}`}
            >
              Mark wasted
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

const RISK_CONFIG = {
  HIGH:   { label: "Use today",   emoji: "🔴", classes: "bg-destructive/10 text-destructive" },
  MEDIUM: { label: "Use soon",    emoji: "🟡", classes: "bg-warning/20 text-warning-foreground" },
  LOW:    { label: "Still fresh", emoji: "🟢", classes: "bg-secondary text-muted-foreground" },
} as const;

const RISK_LEGEND = (
  <>
    <p>🔴 <strong>Use today</strong> — expires within 1 day</p>
    <p className="mt-0.5">🟡 <strong>Use soon</strong> — expires within 3 days</p>
    <p className="mt-0.5">🟢 <strong>Still fresh</strong> — more than 3 days left</p>
  </>
);

function RiskBadge({ risk }: { risk: "HIGH" | "MEDIUM" | "LOW" }) {
  const { label, emoji, classes } = RISK_CONFIG[risk];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Close on outside click (mobile tap elsewhere)
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative shrink-0">
      <button
        type="button"
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${classes}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {emoji} {label}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-border bg-popover p-3 text-[11px] leading-relaxed text-popover-foreground shadow-lg"
        >
          {RISK_LEGEND}
        </span>
      )}
    </span>
  );
}

function formatDays(days: number | null): string {
  if (days === null) {
    return "No expiration date";
  }
  if (days < 0) {
    return `Expired ${Math.abs(days)} day(s) ago`;
  }
  if (days === 0) {
    return "Expires today";
  }
  return `Expires in ${days} day(s)`;
}
