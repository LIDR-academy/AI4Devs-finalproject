import { useState } from "react";
import type { CoacheeNextClass } from "@/domain/types/coachee";
import { extractErrorCode } from "@/domain/utils/apiError";
import { enrollmentErrorMessage } from "@/domain/utils/enrollmentErrorMessages";
import { formatNextClassTime, hasNextClass } from "@/domain/utils/nextClassInfo";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useCancelEnrollment } from "@/infrastructure/hooks/useCancelEnrollment";
import { EmptyState } from "@/ui/components/coachee/ViewState";

export function NextClassCard({ nextClass }: { nextClass: CoacheeNextClass | null }) {
  const { showToast } = useToast();
  const cancelMutation = useCancelEnrollment();
  const [confirming, setConfirming] = useState(false);

  if (!hasNextClass(nextClass)) {
    return (
      <EmptyState title="No upcoming classes" description="Your next class will appear here." />
    );
  }

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(nextClass.id);
      showToast("You left the class.", "success");
    } catch (error: unknown) {
      showToast(enrollmentErrorMessage(extractErrorCode(error)), "error");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Next Class</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {formatNextClassTime(nextClass.startTime)}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {nextClass.classType === "GROUP" ? "Group" : "Individual"}
        </span>
        <span>{nextClass.assignedCoach.name}</span>
        {nextClass.level && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: nextClass.level.color }}
            />
            {nextClass.level.name}
          </span>
        )}
      </div>
      <div className="mt-3 border-t pt-3">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={cancelMutation.isPending}
          className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel enrollment
        </button>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <button
            type="button"
            className="fixed inset-0 cursor-default bg-black/50"
            onClick={() => setConfirming(false)}
            aria-label="Close"
            disabled={cancelMutation.isPending}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Cancel your enrollment?"
            className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Cancel your enrollment?</h3>
            <p className="text-sm text-gray-600">
              Your spot in this class will be released and it may be offered to someone on the
              waiting list.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={cancelMutation.isPending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep class
              </button>
              <button
                type="button"
                onClick={() => void handleCancel()}
                disabled={cancelMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelMutation.isPending ? "Working..." : "Cancel enrollment"}
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              {formatNextClassTime(nextClass.startTime)} · {nextClass.assignedCoach.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
