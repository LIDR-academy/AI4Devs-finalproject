import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ScanLine, Camera, PencilLine, Mic } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";
import {
  confirmReceiptItems,
  getReceipt,
  getReceiptStatus,
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
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

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
    setIsUploading(true);

    try {
      const uploadedReceipt = await uploadReceipt(file);
      setReceipt(uploadedReceipt);

      if (uploadedReceipt.ocrStatus !== "COMPLETED") {
        await refreshReceiptIfNeeded(uploadedReceipt.id);
      } else {
        setSelectedItemIds(uploadedReceipt.items.map((item) => item.id));
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
      });
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
        <BigOption icon={<Camera className="size-7" />} title="Photo of product" body="Identify a single item" />
        <BigOption
          icon={<PencilLine className="size-7" />}
          title="Manual entry"
          body="Type it yourself"
          to="/add/manual"
          onNavigate={(to) => navigate({ to })}
        />
        <BigOption icon={<Mic className="size-7" />} title="Voice add" body="Say what you bought" />
      </div>

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
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center gap-3 bg-background px-3 py-2.5"
                >
                  <input
                    type="checkbox"
                    checked={selectedItemIds.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                  />
                  <span className="text-[14px]">
                    {item.rawName}
                    {item.quantity ? ` (${item.quantity}${item.unit ?? ""})` : ""}
                  </span>
                </label>
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

      <section className="mt-8">
        <h2 className="px-2 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Recently added</h2>
        <div className="ios-card divide-y divide-border overflow-hidden">
          {["🥕 Carrots — 500g", "🧀 Manchego — 250g", "🍎 Apples — 6 ct"].map((t) => (
            <div key={t} className="flex items-center justify-between px-4 py-3.5 text-[14.5px]">
              <span>{t}</span>
              <span className="text-[12px] text-muted-foreground">just now</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
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
