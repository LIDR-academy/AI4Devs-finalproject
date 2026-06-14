import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ScanLine, Camera, PencilLine, Mic } from "lucide-react";

const RECEIPT_EMOJIS = ["🍎", "🥛", "🍞", "🥩", "🐟", "🥦", "🥚", "🧀", "🍝", "🥑", "🍌", "🍅", "🛒", "🥫", "🧃", "🧁"];
import { AppShell } from "@/components/AppShell";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";
import { listPantryItems, type PantryApiItem } from "@/features/pantry/pantry.api";
import {
  confirmReceiptItems,
  getReceipt,
  getReceiptStatus,
  type ReceiptApiItem,
  type ReceiptApiModel,
  uploadReceipt,
} from "@/features/receipts/receipts.api";

export const Route = createFileRoute("/add")({
  beforeLoad: requireAuthBeforeLoad,
  component: AddPage,
});

function AddPage() {
  const authed = useRequireAuthRedirect();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptApiModel | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [itemEdits, setItemEdits] = useState<
    Record<string, { emoji: string; quantity: string; expirationDate: string; unitPrice: string; pricePaid: string }>
  >({});
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [recentItems, setRecentItems] = useState<PantryApiItem[]>([]);
  const [itemEmojis, setItemEmojis] = useState<Record<string, string>>({});
  const [mvpAlert, setMvpAlert] = useState<string | null>(null);

  useEffect(() => {
    listPantryItems()
      .then((items) => {
        const sorted = [...items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setRecentItems(sorted.slice(0, 3));
      })
      .catch(() => {
        // silently ignore — recently added is non-critical
      });

    try {
      const stored = JSON.parse(localStorage.getItem("rsf_item_emojis") ?? "{}") as Record<string, string>;
      setItemEmojis(stored);
    } catch {
      // localStorage unavailable
    }
  }, []);

  if (!authed) {
    return null;
  }

  // /add.manual.tsx is a child route of /add; render children explicitly.
  if (pathname.startsWith("/add/manual")) {
    return <Outlet />;
  }

  async function refreshReceiptIfNeeded(receiptId: string) {
    const status = await getReceiptStatus(receiptId);
    if (status.ocrStatus === "PROCESSING") {
      return;
    }

    const fullReceipt = await getReceipt(receiptId);
    setReceipt(fullReceipt);
    if (fullReceipt.items.length > 0) {
      setSelectedItemIds(fullReceipt.items.map((item) => item.id));
      setItemEdits(buildInitialItemEdits(fullReceipt.items));
    }
  }

  async function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadError(null);
    setConfirmationMessage(null);
    setReceipt(null);
    setSelectedItemIds([]);
    setItemEdits({});
    setIsUploading(true);

    try {
      const uploadedReceipt = await uploadReceipt(file);
      setReceipt(uploadedReceipt);

      if (uploadedReceipt.ocrStatus !== "COMPLETED") {
        await refreshReceiptIfNeeded(uploadedReceipt.id);
      } else {
        setSelectedItemIds(uploadedReceipt.items.map((item) => item.id));
        setItemEdits(buildInitialItemEdits(uploadedReceipt.items));
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Upload failed",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleConfirmItems() {
    if (!receipt || selectedItemIds.length === 0) {
      return;
    }

    setUploadError(null);
    setIsConfirming(true);

    try {
      const confirmed = await confirmReceiptItems({
        receiptId: receipt.id,
        itemIds: selectedItemIds,
        addToPantry: true,
        itemOverrides: selectedItemIds.map((itemId) => {
          const edit = itemEdits[itemId];
          const pricePaid =
            edit?.pricePaid && edit.pricePaid.trim() !== ""
              ? Number.parseFloat(edit.pricePaid)
              : undefined;
          const quantity =
            edit?.quantity && edit.quantity.trim() !== ""
              ? parseInt(edit.quantity, 10)
              : undefined;

          return {
            itemId,
            expirationDate: edit?.expirationDate
              ? new Date(`${edit.expirationDate}T00:00:00.000Z`).toISOString()
              : undefined,
            ...(pricePaid !== undefined && Number.isFinite(pricePaid)
              ? { pricePaid: Number(pricePaid.toFixed(2)) }
              : {}),
            ...(quantity !== undefined && Number.isInteger(quantity) && quantity > 0
              ? { quantity }
              : {}),
          };
        }),
      });

      // Persist emoji selections so the recently-added list can display them
      try {
        const emojiMap = JSON.parse(localStorage.getItem("rsf_item_emojis") ?? "{}") as Record<string, string>;
        for (const ci of confirmed.items) {
          if (ci.pantryItemId && itemEdits[ci.id]?.emoji) {
            emojiMap[ci.pantryItemId] = itemEdits[ci.id].emoji;
          }
        }
        localStorage.setItem("rsf_item_emojis", JSON.stringify(emojiMap));
      } catch {
        // localStorage unavailable
      }

      setReceipt(confirmed);
      setConfirmationMessage("Items confirmed and added to pantry.");
      setTimeout(() => {
        void navigate({ to: "/pantry" });
      }, 700);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Confirmation failed",
      );
    } finally {
      setIsConfirming(false);
    }
  }

  function toggleItem(id: string) {
    setSelectedItemIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  }

  function updateItemEdit(
    itemId: string,
    key: "emoji" | "quantity" | "expirationDate" | "unitPrice" | "pricePaid",
    value: string,
  ) {
    setItemEdits((current) => {
      const prev = current[itemId] ?? { emoji: "🍽️", quantity: "", expirationDate: "", unitPrice: "", pricePaid: "" };
      const updated = { ...prev, [key]: value };

      if (key === "unitPrice" || key === "quantity") {
        const up = parseFloat(key === "unitPrice" ? value : updated.unitPrice);
        const qty = parseFloat(key === "quantity" ? value : updated.quantity);
        if (!isNaN(up) && !isNaN(qty) && up >= 0 && qty > 0) {
          updated.pricePaid = (up * qty).toFixed(2);
        }
      }

      return { ...current, [itemId]: updated };
    });
  }

  function showMvpAlert(feature: string) {
    setMvpAlert(`${feature} is not available in the MVP. Use "Scan receipt" or "Manual entry".`);
    setTimeout(() => setMvpAlert(null), 4000);
  }

  return (
    <AppShell title="Add">
      <p className="text-[15px] text-muted-foreground mb-5">Pick a way to add items to your pantry.</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="grid grid-cols-2 gap-3">
        <BigOption
          icon={<ScanLine className="size-7" />}
          title="Scan receipt"
          body="AI extracts items & expirations"
          primary
          onClick={() => {
            fileInputRef.current?.click();
          }}
        />
        <BigOption
          icon={<Camera className="size-7" />}
          title="Photo of product"
          body="Identify a single item"
          onClick={() => showMvpAlert("Photo of product")}
        />
        <BigOption
          icon={<PencilLine className="size-7" />}
          title="Manual entry"
          body="Type it yourself"
          to="/add/manual"
          onNavigate={(to) => navigate({ to })}
        />
        <BigOption
          icon={<Mic className="size-7" />}
          title="Voice add"
          body="Say what you bought"
          onClick={() => showMvpAlert("Voice add")}
        />
      </div>

      {mvpAlert && (
        <p
          className="mt-4 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] text-warning-foreground"
          data-testid="mvp-unavailable-alert"
        >
          {mvpAlert}
        </p>
      )}

      {isUploading && (
        <p className="mt-4 rounded-2xl border border-border bg-secondary px-4 py-3 text-[14px]">
          Uploading and processing receipt...
        </p>
      )}

      {uploadError && (
        <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          {uploadError}
        </p>
      )}

      {receipt && (
        <section className="mt-6 ios-card p-4">
          <h2 className="text-[15px] font-semibold">Receipt review</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Status: {receipt.ocrStatus}
          </p>
          {receipt.ocrError && (
            <p className="mt-2 text-[13px] text-destructive">{receipt.ocrError}</p>
          )}

          {receipt.items.length > 0 && (
            <div className="mt-3 divide-y divide-border rounded-2xl border border-border overflow-hidden">
              {receipt.items.map((item) => (
                <div key={item.id} className="bg-background px-3 py-2.5">
                  {/* Header: checkbox + emoji + name */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedItemIds.includes(item.id)}
                      onChange={() => toggleItem(item.id)}
                    />
                    <button
                      type="button"
                      className="text-xl shrink-0 leading-none"
                      onClick={() => {
                        const cur = itemEdits[item.id]?.emoji ?? RECEIPT_EMOJIS[0];
                        const idx = RECEIPT_EMOJIS.indexOf(cur);
                        updateItemEdit(item.id, "emoji", RECEIPT_EMOJIS[(idx + 1) % RECEIPT_EMOJIS.length]);
                      }}
                      aria-label="Cycle icon"
                      data-testid={`receipt-emoji-btn-${item.id}`}
                    >
                      {itemEdits[item.id]?.emoji ?? RECEIPT_EMOJIS[0]}
                    </button>
                    <span className="text-[14px] flex-1 truncate">{item.rawName}</span>
                  </div>

                  {/* Emoji quick-select row */}
                  <div className="mt-1.5 flex gap-1 flex-wrap">
                    {RECEIPT_EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => updateItemEdit(item.id, "emoji", e)}
                        className={`size-7 rounded-lg text-base leading-none transition ${
                          (itemEdits[item.id]?.emoji ?? RECEIPT_EMOJIS[0]) === e
                            ? "bg-primary/15 ring-2 ring-primary/50"
                            : "bg-secondary"
                        }`}
                        aria-label={e}
                        data-testid={`receipt-emoji-pick-${item.id}-${e}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>

                  {/* Editable fields */}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="col-span-2 flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Expiration date</span>
                      <input
                        type="date"
                        value={itemEdits[item.id]?.expirationDate ?? ""}
                        onChange={(event) => updateItemEdit(item.id, "expirationDate", event.target.value)}
                        className="h-10 rounded-xl border border-border bg-secondary px-3 text-[13px]"
                        data-testid={`receipt-expiration-${item.id}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Units</span>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={itemEdits[item.id]?.quantity ?? ""}
                        onChange={(event) => updateItemEdit(item.id, "quantity", event.target.value)}
                        placeholder="1"
                        className="h-10 rounded-xl border border-border bg-secondary px-3 text-[13px]"
                        data-testid={`receipt-quantity-${item.id}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Unit price (€)</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={itemEdits[item.id]?.unitPrice ?? ""}
                        onChange={(event) => updateItemEdit(item.id, "unitPrice", event.target.value)}
                        placeholder="0.00"
                        className="h-10 rounded-xl border border-border bg-secondary px-3 text-[13px]"
                        data-testid={`receipt-unit-price-${item.id}`}
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Total price (€)</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={itemEdits[item.id]?.pricePaid ?? ""}
                        onChange={(event) => updateItemEdit(item.id, "pricePaid", event.target.value)}
                        placeholder="0.00"
                        className="h-10 rounded-xl border border-border bg-secondary px-3 text-[13px]"
                        data-testid={`receipt-price-${item.id}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="mt-4 w-full h-11 rounded-2xl bg-primary text-primary-foreground text-[14px] font-semibold disabled:opacity-50"
            disabled={
              receipt.ocrStatus !== "COMPLETED" ||
              selectedItemIds.length === 0 ||
              isConfirming
            }
            onClick={() => {
              void handleConfirmItems();
            }}
          >
            {isConfirming ? "Confirming..." : "Confirm selected items"}
          </button>

          {confirmationMessage && (
            <p className="mt-2 text-[13px] text-emerald-700">{confirmationMessage}</p>
          )}
        </section>
      )}

      {recentItems.length > 0 && (
        <section className="mt-8" data-testid="recently-added-section">
          <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
            Recently added
          </h2>
          <div className="ios-card divide-y divide-border overflow-hidden">
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3.5 text-[14.5px]" data-testid={`recent-item-${item.id}`}>
                <span>{itemEmojis[item.id] ?? "🍽️"} {item.name} — {item.quantity} {item.unit}</span>
                <span className="text-[12px] text-muted-foreground">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}

function buildInitialItemEdits(items: ReceiptApiItem[]) {
  return Object.fromEntries(
    items.map((item) => {
      const defaultPrice =
        item.lineTotalEur ??
        (item.unitPriceEur && item.quantity
          ? (Number(item.unitPriceEur) * item.quantity).toFixed(2)
          : null);

      return [
        item.id,
        {
          emoji: RECEIPT_EMOJIS[0],
          quantity: item.quantity != null ? String(item.quantity) : "",
          expirationDate: (item.defaultExpirationDate ?? new Date().toISOString()).slice(0, 10),
          unitPrice: item.unitPriceEur ? Number(item.unitPriceEur).toFixed(2) : "",
          pricePaid: defaultPrice ? Number(defaultPrice).toFixed(2) : "",
        },
      ];
    }),
  ) as Record<string, { emoji: string; quantity: string; expirationDate: string; unitPrice: string; pricePaid: string }>;
}

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function BigOption({
  icon,
  title,
  body,
  primary,
  to,
  onNavigate,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  primary?: boolean;
  to?: string;
  onNavigate?: (to: "/add/manual") => void;
  onClick?: () => void;
}) {
  const className = `ios-card flex flex-col items-start gap-2 p-5 text-left active:scale-[0.98] transition ${primary ? "bg-primary text-primary-foreground" : ""}`;
  const inner = (
    <>
      <div className={`grid size-12 place-items-center rounded-2xl ${primary ? "bg-primary-foreground/15" : "bg-secondary text-primary"}`}>
        {icon}
      </div>
      <p className="mt-1 text-[15px] font-semibold">{title}</p>
      <p className={`text-[12.5px] ${primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{body}</p>
    </>
  );
  if (to) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          if (onNavigate) {
            onNavigate(to as "/add/manual");
            return;
          }

          if (onClick) {
            onClick();
          }
        }}
      >
        {inner}
      </button>
    );
  }
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      {inner}
    </button>
  );
}
