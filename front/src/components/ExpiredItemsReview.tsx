import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { ExpiredCandidate } from "@/features/pantry/pantry.api";

interface ExpiredItemsReviewProps {
  candidates: ExpiredCandidate[];
  onWasteAll: (itemIds: string[]) => void;
  onDismissAll: (itemIds: string[]) => void;
  onKeep?: (itemId: string) => void;
  isProcessing?: boolean;
}

function formatValue(value: number | null): string {
  return value === null ? "—" : `€${value.toFixed(2)}`;
}

/**
 * Bulk-review surface for long-expired pantry items. Presentational: the parent route owns the
 * API calls and query invalidation. "Keep" removes an item from the local review list; the
 * bulk actions operate on whatever items remain visible.
 */
export function ExpiredItemsReview({
  candidates,
  onWasteAll,
  onDismissAll,
  onKeep,
  isProcessing = false,
}: ExpiredItemsReviewProps) {
  const [keptIds, setKeptIds] = useState<Set<string>>(new Set());
  const visible = candidates.filter((candidate) => !keptIds.has(candidate.id));
  const visibleIds = visible.map((candidate) => candidate.id);

  function handleKeep(itemId: string) {
    setKeptIds((previous) => new Set(previous).add(itemId));
    onKeep?.(itemId);
  }

  if (visible.length === 0) {
    return (
      <p data-testid="expired-review-empty" className="text-[13px] text-muted-foreground">
        No items left to review.
      </p>
    );
  }

  return (
    <div data-testid="expired-items-review" className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {visible.map((candidate) => (
          <li
            key={candidate.id}
            data-testid={`expired-candidate-${candidate.id}`}
            className="ios-card flex items-center justify-between p-3"
          >
            <div>
              <p className="font-medium">{candidate.name}</p>
              <p className="text-[12px] text-muted-foreground">
                Expired {candidate.daysExpired} days ago · {formatValue(candidate.estimatedValueEur)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleKeep(candidate.id)}
              disabled={isProcessing}
              className="text-[13px] font-medium text-primary"
              data-testid={`expired-keep-${candidate.id}`}
            >
              Keep
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onWasteAll(visibleIds)}
          disabled={isProcessing}
          className="flex items-center gap-1 rounded-full bg-destructive px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-50"
          data-testid="expired-waste-all"
        >
          <Trash2 className="h-4 w-4" />
          Mark all as wasted
        </button>
        <button
          type="button"
          onClick={() => onDismissAll(visibleIds)}
          disabled={isProcessing}
          className="flex items-center gap-1 rounded-full border px-4 py-2 text-[14px] font-medium disabled:opacity-50"
          data-testid="expired-dismiss-all"
        >
          <AlertTriangle className="h-4 w-4" />
          Dismiss all
        </button>
      </div>
    </div>
  );
}
