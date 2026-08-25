import { useState } from "react";
import type { WaitingListItem } from "@/domain/types/waitingList";
import { GYM_TIMEZONE } from "@/domain/utils/gymDateTime";
import { waitingListErrorMessage } from "@/domain/utils/waitingListErrorMessages";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useLeaveWaitingList } from "@/infrastructure/hooks/useLeaveWaitingList";
import { useMyWaitingLists } from "@/infrastructure/hooks/useMyWaitingLists";
import { EmptyState, ErrorStateWithRetry, LoadingState } from "@/ui/components/coachee/ViewState";

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

export function MyWaitingLists() {
  const { showToast } = useToast();
  const listsQuery = useMyWaitingLists();
  const leaveMutation = useLeaveWaitingList();
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [confirmEntry, setConfirmEntry] = useState<WaitingListItem | null>(null);

  if (listsQuery.isError) {
    return (
      <ErrorStateWithRetry
        message="Could not load your waiting lists."
        onRetry={() => listsQuery.refetch()}
      />
    );
  }

  if (listsQuery.isLoading || !listsQuery.data) {
    return <LoadingState label="Loading your waiting lists..." />;
  }

  const entries = listsQuery.data.data;
  if (entries.length === 0) {
    return <EmptyState title="You are not on any waiting list" />;
  }

  const handleLeave = async (entry: WaitingListItem) => {
    setConfirmEntry(null);
    setLeavingId(entry.id);
    try {
      await leaveMutation.mutateAsync(entry.class.id);
      showToast("You left the waiting list.", "success");
    } catch (error: unknown) {
      const code =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { error?: { code?: string } } } }).response?.data?.error
              ?.code
          : undefined;
      showToast(waitingListErrorMessage(code), "error");
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-gray-900">My Waiting Lists</h3>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    {entry.class.classType === "GROUP" ? "Group" : "Individual"}
                  </span>
                  {entry.hasOpenSpots && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Spot recently opened
                    </span>
                  )}
                </div>
                <p className="mt-2 font-medium text-gray-900">
                  {formatTime(entry.class.startTime)}
                </p>
                {entry.class.level && (
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.class.level.color }}
                    />
                    {entry.class.level.name}
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {entry.class.assignedCoach.name ?? "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmEntry(entry)}
                disabled={leavingId === entry.id}
                className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {leavingId === entry.id ? "Leaving..." : "Leave"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {confirmEntry && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <button
            type="button"
            className="fixed inset-0 bg-black/50 cursor-default"
            onClick={() => setConfirmEntry(null)}
            aria-label="Close"
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Leave the waiting list?</h3>
            <p className="text-sm text-gray-600">
              Your place for {formatTime(confirmEntry.class.startTime)} will be released for other
              Coachees. You can join the waiting list again later.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmEntry(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Keep my place
              </button>
              <button
                type="button"
                onClick={() => handleLeave(confirmEntry)}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700"
              >
                Leave waiting list
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
