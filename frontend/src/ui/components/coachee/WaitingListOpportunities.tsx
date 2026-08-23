import { useState } from "react";
import type { CoacheeWaitlistEligibleClass } from "@/domain/types/coachee";
import { extractErrorCode } from "@/domain/utils/apiError";
import { formatNextClassTime } from "@/domain/utils/nextClassInfo";
import { waitingListErrorMessage } from "@/domain/utils/waitingListErrorMessages";
import {
  waitingListOpportunitiesEmptyCopy,
  waitingListOpportunitySummary,
} from "@/domain/utils/waitingListOpportunities";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useJoinWaitingList } from "@/infrastructure/hooks/useJoinWaitingList";
import { EmptyState, ErrorStateWithRetry, LoadingState } from "@/ui/components/coachee/ViewState";

interface WaitingListOpportunitiesProps {
  classes: CoacheeWaitlistEligibleClass[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function WaitingListOpportunities({
  classes,
  isLoading = false,
  isError = false,
  onRetry,
}: WaitingListOpportunitiesProps) {
  const { showToast } = useToast();
  const joinMutation = useJoinWaitingList();
  const [confirming, setConfirming] = useState<CoacheeWaitlistEligibleClass | null>(null);

  const runJoin = async (eligibles: CoacheeWaitlistEligibleClass) => {
    setConfirming(null);
    try {
      await joinMutation.mutateAsync(eligibles.id);
      showToast("You joined the waiting list.", "success");
    } catch (error: unknown) {
      showToast(waitingListErrorMessage(extractErrorCode(error)), "error");
    }
  };

  if (isLoading) {
    return <LoadingState label="Loading waiting list opportunities..." />;
  }

  if (isError) {
    return (
      <ErrorStateWithRetry
        message="Could not load your waiting list opportunities."
        onRetry={onRetry ?? (() => undefined)}
      />
    );
  }

  if (classes.length === 0) {
    const empty = waitingListOpportunitiesEmptyCopy();
    return <EmptyState title={empty.title} description={empty.description} />;
  }

  return (
    <div className="space-y-3">
      {classes.map((eligibles) => {
        const pendingJoin = joinMutation.isPending && joinMutation.variables === eligibles.id;
        return (
          <div
            key={eligibles.id}
            className="flex items-center justify-between gap-3 rounded-xl border bg-white p-4"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900">
                {formatNextClassTime(eligibles.startTime)}
              </p>
              <p className="text-sm text-gray-500">{eligibles.assignedCoach.name}</p>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: eligibles.level.color }}
                />
                {eligibles.level.name}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <p className="text-sm font-medium text-gray-700">
                {eligibles.enrollmentCount}/{eligibles.capacity}
              </p>
              <button
                type="button"
                disabled={pendingJoin}
                onClick={() => setConfirming(eligibles)}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingJoin ? "Joining..." : "Join waiting list"}
              </button>
            </div>
          </div>
        );
      })}

      {confirming && (
        <WaitlistConfirmDialog
          eligibles={confirming}
          onConfirm={() => runJoin(confirming)}
          onClose={() => setConfirming(null)}
        />
      )}
    </div>
  );
}

function WaitlistConfirmDialog({
  eligibles,
  onConfirm,
  onClose,
}: {
  eligibles: CoacheeWaitlistEligibleClass;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <button
        type="button"
        className="fixed inset-0 bg-black/50 cursor-default"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Join this waiting list?</h3>
        <p className="text-sm text-gray-600">
          This class is full. If a spot opens up, you will be notified.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Join waiting list
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">{waitingListOpportunitySummary(eligibles)}</p>
      </div>
    </div>
  );
}
