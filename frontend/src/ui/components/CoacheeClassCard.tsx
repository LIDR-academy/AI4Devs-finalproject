import { useState } from "react";
import type { TrainingClass } from "@/domain/types/class";
import { deriveClassCardState } from "@/domain/utils/classCardState";
import { enrollmentErrorMessage } from "@/domain/utils/enrollmentErrorMessages";
import { GYM_TIMEZONE } from "@/domain/utils/gymDateTime";
import { waitingListErrorMessage } from "@/domain/utils/waitingListErrorMessages";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useCancelEnrollment } from "@/infrastructure/hooks/useCancelEnrollment";
import { useJoinClass } from "@/infrastructure/hooks/useJoinClass";
import { useJoinWaitingList } from "@/infrastructure/hooks/useJoinWaitingList";
import { useLeaveWaitingList } from "@/infrastructure/hooks/useLeaveWaitingList";

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

type ConfirmAction = "join" | "cancel" | "waiting-list" | "leave" | null;

export function CoacheeClassCard({ trainingClass }: { trainingClass: TrainingClass }) {
  const { showToast } = useToast();
  const joinMutation = useJoinClass();
  const cancelMutation = useCancelEnrollment();
  const joinWaitingListMutation = useJoinWaitingList();
  const leaveWaitingListMutation = useLeaveWaitingList();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const state = deriveClassCardState({
    classType: trainingClass.classType,
    status: trainingClass.status,
    enrollmentCount: trainingClass.enrollmentCount,
    capacity: trainingClass.capacity,
    visibility: trainingClass.visibility,
    coacheeStatus: trainingClass.coacheeStatus,
  });

  const runAction = async (action: Exclude<ConfirmAction, null>) => {
    setConfirmAction(null);
    try {
      if (action === "join") {
        await joinMutation.mutateAsync(trainingClass.id);
        showToast("You joined the class.", "success");
      } else if (action === "cancel") {
        await cancelMutation.mutateAsync(trainingClass.id);
        showToast("You left the class.", "success");
      } else if (action === "waiting-list") {
        await joinWaitingListMutation.mutateAsync(trainingClass.id);
        showToast("You joined the waiting list.", "success");
      } else {
        await leaveWaitingListMutation.mutateAsync(trainingClass.id);
        showToast("You left the waiting list.", "success");
      }
    } catch (error: unknown) {
      const code = extractErrorCode(error);
      const message =
        action === "join" || action === "cancel"
          ? enrollmentErrorMessage(code)
          : waitingListErrorMessage(code);
      showToast(message, "error");
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
            <button
              type="button"
              onClick={() => setConfirmAction("waiting-list")}
              className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Join waiting list
            </button>
          )}
          {state.action === "leave" && (
            <button
              type="button"
              onClick={() => setConfirmAction("leave")}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Leave waiting list
            </button>
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
  action: Exclude<ConfirmAction, null>;
  trainingClass: TrainingClass;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const copy = dialogCopy(action);
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <button
        type="button"
        className="fixed inset-0 bg-black/50 cursor-default"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{copy.title}</h3>
        <p className="text-sm text-gray-600">{copy.body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {copy.cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${copy.confirmClassName}`}
          >
            {copy.confirmLabel}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {trainingClass.startTime} · {trainingClass.assignedCoach?.name ?? "—"}
        </p>
      </div>
    </div>
  );
}

function dialogCopy(action: Exclude<ConfirmAction, null>): {
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  confirmClassName: string;
} {
  switch (action) {
    case "join":
      return {
        title: "Join this class?",
        body: "You will be enrolled in this class. Your spot is confirmed immediately.",
        cancelLabel: "Keep class",
        confirmLabel: "Join class",
        confirmClassName: "bg-green-600 hover:bg-green-700",
      };
    case "cancel":
      return {
        title: "Cancel your enrollment?",
        body: "Your spot in this class will be released and it may be offered to someone on the waiting list.",
        cancelLabel: "Keep class",
        confirmLabel: "Cancel enrollment",
        confirmClassName: "bg-red-600 hover:bg-red-700",
      };
    case "waiting-list":
      return {
        title: "Join the waiting list?",
        body: "The class is currently full. If a spot opens, you will be notified.",
        cancelLabel: "Cancel",
        confirmLabel: "Join waiting list",
        confirmClassName: "bg-green-600 hover:bg-green-700",
      };
    case "leave":
      return {
        title: "Leave the waiting list?",
        body: "Your place will be released for other Coachees. You can join the waiting list again later.",
        cancelLabel: "Keep my place",
        confirmLabel: "Leave waiting list",
        confirmClassName: "bg-red-600 hover:bg-red-700",
      };
  }
}
