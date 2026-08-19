import { useState } from "react";
import type { TrainingClass } from "@/domain/types/class";
import { deriveClassCardState } from "@/domain/utils/classCardState";
import { enrollmentErrorMessage } from "@/domain/utils/enrollmentErrorMessages";
import { GYM_TIMEZONE } from "@/domain/utils/gymDateTime";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useCancelEnrollment } from "@/infrastructure/hooks/useCancelEnrollment";
import { useJoinClass } from "@/infrastructure/hooks/useJoinClass";

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: GYM_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function extractErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "response" in error) {
    const apiError = (
      error as {
        response?: { data?: { error?: { code?: string } } };
      }
    ).response?.data?.error;
    return apiError?.code;
  }
  return undefined;
}

type ConfirmAction = "join" | "cancel" | null;

export function CoacheeClassCard({ trainingClass }: { trainingClass: TrainingClass }) {
  const { showToast } = useToast();
  const joinMutation = useJoinClass();
  const cancelMutation = useCancelEnrollment();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const state = deriveClassCardState({
    classType: trainingClass.classType,
    status: trainingClass.status,
    enrollmentCount: trainingClass.enrollmentCount,
    capacity: trainingClass.capacity,
    visibility: trainingClass.visibility,
    coacheeStatus: trainingClass.coacheeStatus,
  });

  const runAction = async (action: "join" | "cancel") => {
    setConfirmAction(null);
    try {
      if (action === "join") {
        await joinMutation.mutateAsync(trainingClass.id);
        showToast("You joined the class.", "success");
      } else {
        await cancelMutation.mutateAsync(trainingClass.id);
        showToast("You left the class.", "success");
      }
    } catch (error: unknown) {
      showToast(enrollmentErrorMessage(extractErrorCode(error)), "error");
    }
  };

  const canceled = trainingClass.status === "CANCELED";

  return (
    <div className={`rounded-xl border bg-white p-4 ${canceled ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {trainingClass.classType === "GROUP" ? "Group" : "Individual"}
            </span>
            {canceled && (
              <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                Canceled
              </span>
            )}
            {trainingClass.isRecurring && (
              <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                Recurring
              </span>
            )}
          </div>
          <p className="mt-2 font-medium text-gray-900">{formatTime(trainingClass.startTime)}</p>
          <p className="text-sm text-gray-500">{trainingClass.assignedCoach?.name ?? "—"}</p>
          {trainingClass.level && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: trainingClass.level.color }}
              />
              {trainingClass.level.name}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">
            {trainingClass.enrollmentCount}/{trainingClass.capacity}
          </p>
          <p className="text-xs text-gray-400">enrolled</p>
        </div>
      </div>

      {state.action !== "none" && (
        <div className="mt-3 border-t pt-3">
          {state.action === "join" && (
            <button
              type="button"
              onClick={() => setConfirmAction("join")}
              className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Join
            </button>
          )}
          {state.action === "cancel" && (
            <button
              type="button"
              onClick={() => setConfirmAction("cancel")}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Cancel
            </button>
          )}
          {state.action === "waiting-list" && (
            <span className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-500">
              Waiting list
            </span>
          )}
        </div>
      )}

      {confirmAction && (
        <ConfirmDialog
          action={confirmAction}
          trainingClass={trainingClass}
          onConfirm={() => runAction(confirmAction)}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

function ConfirmDialog({
  action,
  trainingClass,
  onConfirm,
  onClose,
}: {
  action: "join" | "cancel";
  trainingClass: TrainingClass;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const joining = action === "join";
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <button
        type="button"
        className="fixed inset-0 bg-black/50 cursor-default"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {joining ? "Join this class?" : "Cancel your enrollment?"}
        </h3>
        <p className="text-sm text-gray-600">
          {joining
            ? "You will be enrolled in this class. Your spot is confirmed immediately."
            : "Your spot in this class will be released and it may be offered to someone on the waiting list."}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Keep class
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${
              joining ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {joining ? "Join class" : "Cancel enrollment"}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {trainingClass.startTime} · {trainingClass.assignedCoach?.name ?? "—"}
        </p>
      </div>
    </div>
  );
}
