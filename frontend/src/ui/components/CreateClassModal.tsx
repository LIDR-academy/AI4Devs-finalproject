import { useMemo, useState } from "react";
import type { ClassType } from "@/domain/types/class";
import type { Level } from "@/domain/types/coachee";
import { toGymIsoDateTime } from "@/domain/utils/gymDateTime";
import { useAuth } from "@/infrastructure/context/AuthContext";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useAssignableCoaches } from "@/infrastructure/hooks/useAssignableCoaches";
import { useAvailableSlots } from "@/infrastructure/hooks/useAvailableSlots";
import { useCreateClass } from "@/infrastructure/hooks/useCreateClass";
import { useFindCoachees } from "@/infrastructure/hooks/useFindCoachees";
import { useLevels } from "@/infrastructure/hooks/useLevels";

const WEEKDAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function CreateClassModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const assignableCoachesQuery = useAssignableCoaches();
  const coacheesQuery = useFindCoachees("active", undefined, 1, 100);
  const levelsQuery = useLevels();
  const createMutation = useCreateClass();

  const [classType, setClassType] = useState<ClassType>("INDIVIDUAL");
  const [coachId, setCoachId] = useState(user?.id ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [levelId, setLevelId] = useState("");
  const [coacheeIds, setCoacheeIds] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startDate, setStartDate] = useState("");
  const [apiError, setApiError] = useState("");

  const effectiveCoachId = coachId || user?.id || "";

  const slotsQuery = useAvailableSlots(date || undefined, effectiveCoachId || undefined, classType);

  const levelsById = useMemo(() => {
    return new Map<string, Level>((levelsQuery.data ?? []).map((l) => [l.id, l]));
  }, [levelsQuery.data]);

  const slotPickerFailed = slotsQuery.isError;

  if (!open) return null;

  const toggleCoachee = (id: string) => {
    setCoacheeIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!effectiveCoachId) {
      setApiError("A coach must be assigned to the class.");
      return;
    }
    if (!date) {
      setApiError("A date is required.");
      return;
    }
    if (!time) {
      setApiError("Select an available time slot or enter a time for the class.");
      return;
    }
    if (classType === "GROUP" && !levelId) {
      setApiError("A level is required for group classes.");
      return;
    }
    if (recurring) {
      const chosenWeekday = new Date(`${startDate}T00:00:00Z`).getUTCDay();
      if (chosenWeekday !== dayOfWeek) {
        setApiError("Recurrence day of week must match the start date.");
        return;
      }
    }

    const startDateTime = toGymIsoDateTime(date, time);

    try {
      const result = await createMutation.mutateAsync({
        classType,
        assignedCoachId: effectiveCoachId,
        coacheeIds,
        levelId: classType === "GROUP" ? levelId : null,
        startDateTime,
        description: description.trim() || null,
        recurrence: recurring ? { enabled: true, dayOfWeek, startDate } : { enabled: false },
      });
      showToast(
        `Created ${result.instances.length} class${result.instances.length > 1 ? "es" : ""} successfully.`,
        "success",
      );
      setClassType("INDIVIDUAL");
      setCoachId(user?.id ?? "");
      setDate("");
      setTime("");
      setLevelId("");
      setCoacheeIds([]);
      setDescription("");
      setRecurring(false);
      setDayOfWeek(1);
      setStartDate("");
      onSuccess();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setApiError(axiosErr.response?.data?.error?.message || "Failed to create class");
      } else {
        setApiError("Failed to create class");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <button
        type="button"
        className="fixed inset-0 bg-black/50 cursor-default"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Class</h3>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">Class Type *</span>
            <div className="flex gap-3">
              {(["INDIVIDUAL", "GROUP"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setClassType(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    classType === type
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {type === "INDIVIDUAL" ? "Individual (1 coachee)" : "Group (3-4 coachees)"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="class-coach" className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Coach *
            </label>
            <select
              id="class-coach"
              value={effectiveCoachId}
              onChange={(e) => setCoachId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {!effectiveCoachId && <option value="">Select a coach...</option>}
              {assignableCoachesQuery.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="class-date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                id="class-date"
                type="date"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="class-time" className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                id="class-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {date && effectiveCoachId && !slotPickerFailed && slotsQuery.isSuccess && (
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">Available slots</span>
              <div className="flex flex-wrap gap-2">
                {slotsQuery.data.map((slot) => (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => setTime(slot.start)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                      time === slot.start
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {slot.start}
                    {slot.capacityAvailable === "both" && <span className="ml-1">(IND+GRP)</span>}
                  </button>
                ))}
                {slotsQuery.data.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No available slots on this date for the coach.
                  </p>
                )}
              </div>
            </div>
          )}

          {slotPickerFailed && date && effectiveCoachId && (
            <p className="text-sm text-amber-600">
              Slot availability is temporarily unavailable. Choose a time manually.
            </p>
          )}

          {classType === "GROUP" && (
            <div>
              <label htmlFor="class-level" className="block text-sm font-medium text-gray-700 mb-1">
                Level *
              </label>
              <select
                id="class-level"
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a level...</option>
                {levelsQuery.data?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Coachees {classType === "INDIVIDUAL" ? "(exactly 1)" : "(3-4)"} *
            </span>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {coacheesQuery.data?.data.map((c) => {
                const level = c.level ? levelsById.get(c.level.id) : undefined;
                return (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={coacheeIds.includes(c.id)}
                      onChange={() => toggleCoachee(c.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">{c.name}</span>
                    {level && (
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: level.color }}
                      >
                        {level.name}
                      </span>
                    )}
                  </label>
                );
              })}
              {coacheesQuery.data?.data.length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-500">No active coachees found.</p>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Recurring (weekly)
            </label>
          </div>

          {recurring && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label
                  htmlFor="class-dayofweek"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Day of Week *
                </label>
                <select
                  id="class-dayofweek"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {WEEKDAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="class-startdate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Date *
                </label>
                <input
                  id="class-startdate"
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="class-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="class-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes for the class"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {createMutation.isPending ? "Creating..." : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
