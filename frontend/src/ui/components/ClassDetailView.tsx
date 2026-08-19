import { useState } from "react";
import { useAuth } from "@/infrastructure/context/AuthContext";
import { useClassDetail } from "@/infrastructure/hooks/useClassDetail";
import { CancelClassDialog } from "@/ui/components/CancelClassDialog";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function ClassDetailView({ classId, onClose }: { classId: string; onClose: () => void }) {
  const { user } = useAuth();
  const detailQuery = useClassDetail(classId);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!classId) return null;

  const trainingClass = detailQuery.data;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <button
        type="button"
        className="fixed inset-0 bg-black/50 cursor-default"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {trainingClass
              ? `${trainingClass.classType === "GROUP" ? "Group class" : "Individual class"}`
              : "Class details"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        {detailQuery.isLoading && <p className="mt-4 text-sm text-gray-500">Loading...</p>}
        {detailQuery.isError && (
          <p className="mt-4 text-sm text-red-600">Could not load the class details.</p>
        )}

        {trainingClass && (
          <>
            <p className="mt-1 text-sm text-gray-500">
              {formatDate(trainingClass.startTime)} · {formatTime(trainingClass.startTime)} –{" "}
              {formatTime(
                new Date(
                  new Date(trainingClass.startTime).getTime() +
                    trainingClass.durationMinutes * 60000,
                ).toISOString(),
              )}
            </p>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd>
                  {trainingClass.status === "CANCELED" ? (
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium">
                      Canceled
                    </span>
                  ) : (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Active
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Coach</dt>
                <dd className="font-medium">{trainingClass.assignedCoach.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Level</dt>
                <dd className="font-medium">
                  {trainingClass.level ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: trainingClass.level.color }}
                      />
                      {trainingClass.level.name}
                    </span>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Enrollment</dt>
                <dd className="font-medium">
                  {trainingClass.enrollmentCount}/{trainingClass.capacity}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Waiting list</dt>
                <dd className="font-medium">
                  {trainingClass.hasWaitingList ? trainingClass.waitingListCount : "None"}
                </dd>
              </div>
              {trainingClass.isRecurring && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Recurrence</dt>
                  <dd>
                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      Part of a series
                    </span>
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Description</dt>
                <dd className="max-w-[60%] text-right text-gray-700">
                  {trainingClass.description ?? "—"}
                </dd>
              </div>
            </dl>

            {(user?.role === "ADMIN" || user?.role === "COACH") &&
              trainingClass.enrolledCoachees.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Enrolled coachees</h4>
                  <ul className="mt-2 space-y-1">
                    {trainingClass.enrolledCoachees.map((coachee) => (
                      <li key={coachee.id} className="text-sm text-gray-700">
                        {coachee.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {(user?.role === "ADMIN" || user?.role === "COACH") &&
              trainingClass.waitingListCoachees.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Waiting list coachees</h4>
                  <ul className="mt-2 space-y-1">
                    {trainingClass.waitingListCoachees.map((coachee) => (
                      <li key={coachee.id} className="text-sm text-gray-700">
                        {coachee.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {(user?.role === "ADMIN" || user?.role === "COACH") &&
              trainingClass.status === "ACTIVE" && (
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCancelOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Cancel class
                  </button>
                </div>
              )}
          </>
        )}

        <CancelClassDialog
          open={cancelOpen}
          classId={classId}
          isRecurring={trainingClass?.isRecurring ?? false}
          onClose={() => setCancelOpen(false)}
        />
      </div>
    </div>
  );
}
