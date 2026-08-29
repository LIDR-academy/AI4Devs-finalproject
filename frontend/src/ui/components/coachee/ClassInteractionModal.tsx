import { useState } from "react";
import type { TrainingClass } from "@/domain/types/class";
import { extractErrorCode } from "@/domain/utils/apiError";
import { deriveCalendarInteraction } from "@/domain/utils/calendarInteraction";
import { coacheeEventTitle } from "@/domain/utils/coacheeCalendarEvents";
import { enrollmentErrorMessage } from "@/domain/utils/enrollmentErrorMessages";
import { formatNextClassTime } from "@/domain/utils/nextClassInfo";
import { waitingListErrorMessage } from "@/domain/utils/waitingListErrorMessages";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useCancelEnrollment } from "@/infrastructure/hooks/useCancelEnrollment";
import { useClaimWaitingListSpot } from "@/infrastructure/hooks/useClaimWaitingListSpot";
import { useClassDetail } from "@/infrastructure/hooks/useClassDetail";
import { useJoinClass } from "@/infrastructure/hooks/useJoinClass";
import { useJoinWaitingList } from "@/infrastructure/hooks/useJoinWaitingList";
import { useLeaveWaitingList } from "@/infrastructure/hooks/useLeaveWaitingList";

type CalendarAction = "join" | "cancel" | "waitlist-join" | "waitlist-leave" | "claim";

interface ClassInteractionModalProps {
  trainingClass: TrainingClass;
  onClose: () => void;
}

interface ConfirmCopy {
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  confirmClassName: string;
}

const ACTION_COPY: Record<CalendarAction, ConfirmCopy> = {
  join: {
    title: "Join this class?",
    body: "You will be enrolled in this class. Your spot is confirmed immediately.",
    cancelLabel: "Keep class",
    confirmLabel: "Join class",
    confirmClassName: "bg-green-600 hover:bg-green-700",
  },
  cancel: {
    title: "Cancel your enrollment?",
    body: "Your spot in this class will be released and it may be offered to someone on the waiting list.",
    cancelLabel: "Keep class",
    confirmLabel: "Cancel enrollment",
    confirmClassName: "bg-red-600 hover:bg-red-700",
  },
  "waitlist-join": {
    title: "Join the waiting list?",
    body: "The class is currently full. If a spot opens, you will be notified.",
    cancelLabel: "Cancel",
    confirmLabel: "Join waiting list",
    confirmClassName: "bg-green-600 hover:bg-green-700",
  },
  "waitlist-leave": {
    title: "Leave the waiting list?",
    body: "Your place will be released for other Coachees. You can join the waiting list again later.",
    cancelLabel: "Keep my place",
    confirmLabel: "Leave waiting list",
    confirmClassName: "bg-red-600 hover:bg-red-700",
  },
  claim: {
    title: "Join this class?",
    body: "A spot has opened up in this class. Claim it now — first come, first served.",
    cancelLabel: "Keep my place",
    confirmLabel: "Join class",
    confirmClassName: "bg-green-600 hover:bg-green-700",
  },
};

const ACTION_BUTTON_LABEL: Record<CalendarAction, string> = {
  join: "Join",
  cancel: "Cancel enrollment",
  "waitlist-join": "Join waiting list",
  "waitlist-leave": "Leave waiting list",
  claim: "Join class",
};

const INFO_COPY: Record<"canceled" | "out-of-reach" | "not-open", string> = {
  canceled: "This class has been canceled.",
  "out-of-reach": "This time slot is not open to you.",
  "not-open": "This time slot is not open to you.",
};

export function ClassInteractionModal({ trainingClass, onClose }: ClassInteractionModalProps) {
  const { showToast } = useToast();
  const detailQuery = useClassDetail(trainingClass.id);
  const joinMutation = useJoinClass();
  const cancelMutation = useCancelEnrollment();
  const joinWaitlistMutation = useJoinWaitingList();
  const leaveWaitlistMutation = useLeaveWaitingList();
  const claimMutation = useClaimWaitingListSpot();
  const [confirming, setConfirming] = useState<CalendarAction | null>(null);

  const detail = detailQuery.data ?? trainingClass;
  const interaction = deriveCalendarInteraction({
    classType: detail.classType,
    status: detail.status,
    visibility: detail.visibility,
    coacheeStatus: detail.coacheeStatus,
    enrollmentCount: detail.enrollmentCount,
    capacity: detail.capacity,
  });

  const pending =
    joinMutation.isPending ||
    cancelMutation.isPending ||
    joinWaitlistMutation.isPending ||
    leaveWaitlistMutation.isPending ||
    claimMutation.isPending;

  const detailsLoading = detail.visibility === "gray" && detailQuery.isLoading;

  const runAction = async (action: CalendarAction) => {
    try {
      if (action === "join") {
        await joinMutation.mutateAsync(trainingClass.id);
        showToast("You joined the class.", "success");
      } else if (action === "cancel") {
        await cancelMutation.mutateAsync(trainingClass.id);
        showToast("You left the class.", "success");
      } else if (action === "waitlist-join") {
        await joinWaitlistMutation.mutateAsync(trainingClass.id);
        showToast("You joined the waiting list.", "success");
      } else if (action === "claim") {
        await claimMutation.mutateAsync(trainingClass.id);
        showToast("You joined the class from the waiting list.", "success");
      } else {
        await leaveWaitlistMutation.mutateAsync(trainingClass.id);
        showToast("You left the waiting list.", "success");
      }
      onClose();
    } catch (error: unknown) {
      const code = extractErrorCode(error);
      const message =
        action === "join" || action === "cancel"
          ? enrollmentErrorMessage(code)
          : waitingListErrorMessage(code);
      showToast(message, "error");
      setConfirming(null);
    }
  };

  const confirmAndRun = (action: CalendarAction) => {
    setConfirming(action);
  };

  const isInfo = interaction.kind === "info";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <button
        type="button"
        className="fixed inset-0 cursor-default bg-black/50"
        onClick={onClose}
        aria-label="Close"
        disabled={pending}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={coacheeEventTitle(detail)}
        className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{coacheeEventTitle(detail)}</h3>
            <p className="mt-1 text-sm text-gray-500">{formatNextClassTime(detail.startTime)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close details"
            disabled={pending}
          >
            ✕
          </button>
        </div>

        <dl className="mt-4 space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <dt className="text-gray-400">Type</dt>
            <dd>{detail.classType === "GROUP" ? "Group" : "Individual"}</dd>
          </div>
          {detail.classType === "GROUP" && detail.level && (
            <div className="flex justify-between">
              <dt className="text-gray-400">Level</dt>
              <dd>{detail.level.name}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-400">Coach</dt>
            <dd>{detail.assignedCoach.name}</dd>
          </div>
          {detail.visibility === "green" && (
            <div className="flex justify-between">
              <dt className="text-gray-400">Spots available</dt>
              <dd>{Math.max(0, detail.capacity - detail.enrollmentCount)}</dd>
            </div>
          )}
          {detail.visibility === "gray" && (
            <div className="flex justify-between">
              <dt className="text-gray-400">Waiting list</dt>
              <dd>{detail.waitingListCount}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6">
          {isInfo ? (
            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              {INFO_COPY[interaction.reason ?? "not-open"]}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => confirmAndRun(interaction.kind as CalendarAction)}
              disabled={pending || detailsLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {detailsLoading
                ? "Checking availability..."
                : (ACTION_BUTTON_LABEL[interaction.kind as CalendarAction] ?? "Continue")}
            </button>
          )}
        </div>
      </div>

      {confirming && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ACTION_COPY[confirming].title}
          className="fixed inset-0 z-[120] flex items-center justify-center"
        >
          <button
            type="button"
            className="fixed inset-0 cursor-default bg-black/50"
            onClick={() => setConfirming(null)}
            aria-label="Close confirmation"
            disabled={pending}
          />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {ACTION_COPY[confirming].title}
            </h3>
            <p className="text-sm text-gray-600">{ACTION_COPY[confirming].body}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                disabled={pending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {ACTION_COPY[confirming].cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => void runAction(confirming)}
                disabled={pending}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${ACTION_COPY[confirming].confirmClassName}`}
              >
                {pending ? "Working..." : ACTION_COPY[confirming].confirmLabel}
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              {formatNextClassTime(detail.startTime)} · {detail.assignedCoach.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
