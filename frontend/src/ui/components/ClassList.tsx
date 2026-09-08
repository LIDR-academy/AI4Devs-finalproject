import { useState } from "react";
import type { ClassType, ClassVisibility, TrainingClass } from "@/domain/types/class";
import { GYM_TIMEZONE, toGymIsoDateTime } from "@/domain/utils/gymDateTime";
import { useAuth } from "@/infrastructure/context/AuthContext";
import { useFindCoaches } from "@/infrastructure/hooks/useFindCoaches";
import { useListClasses } from "@/infrastructure/hooks/useListClasses";
import { CancelClassDialog } from "@/ui/components/CancelClassDialog";
import { ClassDetailView } from "@/ui/components/ClassDetailView";

const VISIBILITY_LABEL: Record<ClassVisibility, string> = {
  blue: "Enrolled",
  green: "Open",
  gray: "Unavailable",
};

const VISIBILITY_CLASS: Record<ClassVisibility, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  gray: "bg-gray-100 text-gray-500",
};

function todayGymDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: GYM_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts;
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: GYM_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: GYM_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function ClassList() {
  const { user } = useAuth();
  const coachesQuery = useFindCoaches("active", 1, 100);
  const [fromDate, setFromDate] = useState(todayGymDate());
  const [toDate, setToDate] = useState(todayGymDate());
  const [classType, setClassType] = useState<"ALL" | ClassType>("ALL");
  const [coachId, setCoachId] = useState("");
  const [page, setPage] = useState(1);

  const start = toGymIsoDateTime(fromDate, "00:00");
  const end = toGymIsoDateTime(toDate, "23:59");

  const classesQuery = useListClasses({
    start,
    end,
    classType: classType === "ALL" ? undefined : classType,
    coachId: coachId || undefined,
    page,
    limit: 20,
  });

  const classes = classesQuery.data?.data ?? [];
  const meta = classesQuery.data?.meta;
  const isAdmin = user?.role === "ADMIN";
  const canCancel = isAdmin || user?.role === "COACH";
  const [cancelTarget, setCancelTarget] = useState<TrainingClass | null>(null);
  const [detailTargetId, setDetailTargetId] = useState<string>("");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="from-date">
            From
          </label>
          <input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="to-date">
            To
          </label>
          <input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="class-type">
            Type
          </label>
          <select
            id="class-type"
            value={classType}
            onChange={(e) => {
              setClassType(e.target.value as "ALL" | ClassType);
              setPage(1);
            }}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="ALL">All types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="GROUP">Group</option>
          </select>
        </div>
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="coach-filter">
              Coach
            </label>
            <select
              id="coach-filter"
              value={coachId}
              onChange={(e) => {
                setCoachId(e.target.value);
                setPage(1);
              }}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All coaches</option>
              {(coachesQuery.data?.data ?? []).map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {classesQuery.isLoading && <p className="text-sm text-gray-500">Loading classes...</p>}
      {classesQuery.isError && <p className="text-sm text-red-600">Could not load classes.</p>}
      {!classesQuery.isLoading && !classesQuery.isError && classes.length === 0 && (
        <p className="text-sm text-gray-500">No classes in the selected range.</p>
      )}

      {classes.length > 0 && (
        <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200 text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500">When</th>
              <th className="px-4 py-3 font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 font-medium text-gray-500">Coach</th>
              <th className="px-4 py-3 font-medium text-gray-500">Level</th>
              <th className="px-4 py-3 font-medium text-gray-500">Enrolled</th>
              <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              {canCancel && <th className="px-4 py-3 font-medium text-gray-500" />}
              <th className="px-4 py-3 font-medium text-gray-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {classes.map((trainingClass) => (
              <ClassRow
                key={trainingClass.id}
                trainingClass={trainingClass}
                onCancel={canCancel ? setCancelTarget : undefined}
                onView={(c) => setDetailTargetId(c.id)}
              />
            ))}
          </tbody>
        </table>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {meta.total} classes · page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm enabled:hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm enabled:hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <CancelClassDialog
        open={cancelTarget !== null}
        classId={cancelTarget?.id ?? ""}
        isRecurring={cancelTarget?.recurrenceSeriesId != null}
        onClose={() => setCancelTarget(null)}
      />
      <ClassDetailView classId={detailTargetId} onClose={() => setDetailTargetId("")} />
    </div>
  );
}

function ClassRow({
  trainingClass,
  onCancel,
  onView,
}: {
  trainingClass: TrainingClass;
  onCancel?: (trainingClass: TrainingClass) => void;
  onView?: (trainingClass: TrainingClass) => void;
}) {
  const canceled = trainingClass.status === "CANCELED";
  return (
    <tr className={canceled ? "text-gray-400" : ""}>
      <td className="whitespace-nowrap px-4 py-3">
        <span className="block">{formatDay(trainingClass.startTime)}</span>
        <span className="block text-gray-500">
          {formatTime(trainingClass.startTime)} –{" "}
          {formatTime(
            new Date(
              new Date(trainingClass.startTime).getTime() + trainingClass.durationMinutes * 60000,
            ).toISOString(),
          )}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {trainingClass.classType === "GROUP" ? "Group" : "Individual"}
        </span>
      </td>
      <td className="px-4 py-3">{trainingClass.assignedCoach?.name ?? "—"}</td>
      <td className="px-4 py-3">
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
      </td>
      <td className="px-4 py-3">
        {trainingClass.enrollmentCount}/{trainingClass.capacity}
      </td>
      <td className="px-4 py-3">
        {trainingClass.visibility && (
          <span
            className={`mr-2 rounded px-2 py-0.5 text-xs font-medium ${VISIBILITY_CLASS[trainingClass.visibility]}`}
          >
            {VISIBILITY_LABEL[trainingClass.visibility]}
          </span>
        )}
        {canceled ? (
          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium">Canceled</span>
        ) : (
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            Active
          </span>
        )}
      </td>
      {onCancel && (
        <td className="px-4 py-3 text-right">
          {!canceled && (
            <button
              type="button"
              onClick={() => onCancel(trainingClass)}
              className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
            >
              Cancel
            </button>
          )}
        </td>
      )}
      {onView && (
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            onClick={() => onView(trainingClass)}
            className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Details
          </button>
        </td>
      )}
    </tr>
  );
}
