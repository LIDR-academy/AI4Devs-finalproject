import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { CoacheeJoinableClass } from "@/domain/types/coachee";
import { extractErrorCode } from "@/domain/utils/apiError";
import { enrollmentErrorMessage } from "@/domain/utils/enrollmentErrorMessages";
import { formatNextClassTime } from "@/domain/utils/nextClassInfo";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useJoinClass } from "@/infrastructure/hooks/useJoinClass";
import { EmptyState, ErrorStateWithRetry, LoadingState } from "@/ui/components/coachee/ViewState";

interface JoinableClassListProps {
  classes: CoacheeJoinableClass[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function JoinableClassList({
  classes,
  isLoading = false,
  isError = false,
  onRetry,
}: JoinableClassListProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const joinMutation = useJoinClass();
  const [confirming, setConfirming] = useState<CoacheeJoinableClass | null>(null);

  const runJoin = async (joinable: CoacheeJoinableClass) => {
    setConfirming(null);
    try {
      await joinMutation.mutateAsync(joinable.id);
      showToast("You joined the class.", "success");
      queryClient.invalidateQueries({ queryKey: ["coachee", "dashboard"] });
    } catch (error: unknown) {
      showToast(enrollmentErrorMessage(extractErrorCode(error)), "error");
    }
  };

  if (isLoading) {
    return <LoadingState label="Loading classes..." />;
  }

  if (isError) {
    return (
      <ErrorStateWithRetry
        message="Could not load your joinable classes."
        onRetry={onRetry ?? (() => undefined)}
      />
    );
  }

  if (classes.length === 0) {
    return (
      <EmptyState
        title="No classes to join right now"
        description="New group classes within your reach will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {classes.map((joinable) => (
        <div
          key={joinable.id}
          className="flex items-center justify-between gap-3 rounded-xl border bg-white p-4"
        >
          <div className="min-w-0">
            <p className="font-medium text-gray-900">{formatNextClassTime(joinable.startTime)}</p>
            <p className="text-sm text-gray-500">{joinable.assignedCoach.name}</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: joinable.level.color }}
              />
              {joinable.level.name}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <p className="text-sm font-medium text-gray-700">
              {joinable.enrollmentCount}/{joinable.capacity}
            </p>
            <button
              type="button"
              onClick={() => setConfirming(joinable)}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Join
            </button>
          </div>
        </div>
      ))}

      {confirming && (
        <JoinConfirmDialog
          joinable={confirming}
          onConfirm={() => runJoin(confirming)}
          onClose={() => setConfirming(null)}
        />
      )}
    </div>
  );
}

function JoinConfirmDialog({
  joinable,
  onConfirm,
  onClose,
}: {
  joinable: CoacheeJoinableClass;
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
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Join this class?</h3>
        <p className="text-sm text-gray-600">
          You will be enrolled in this class. Your spot is confirmed immediately.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Keep class
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Join class
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {formatNextClassTime(joinable.startTime)} · {joinable.assignedCoach.name}
        </p>
      </div>
    </div>
  );
}
