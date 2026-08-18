import { useState } from "react";
import { UserRole } from "@/domain/types/auth";
import type { BlockType } from "@/domain/types/block";
import { toGymIsoDateTime } from "@/domain/utils/gymDateTime";
import { useAuth } from "@/infrastructure/context/AuthContext";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useAssignableCoaches } from "@/infrastructure/hooks/useAssignableCoaches";
import { useCreateBlock } from "@/infrastructure/hooks/useCreateBlock";

const START_HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
const END_HOURS = Array.from({ length: 17 }, (_, i) => i + 7);

export function CreateBlockModal({
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
  const createMutation = useCreateBlock();

  const isAdmin = user?.role === UserRole.ADMIN;

  const [blockType, setBlockType] = useState<BlockType>(isAdmin ? "PERSONAL" : "PERSONAL");
  const [coachId, setCoachId] = useState(user?.id ?? "");
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState(7);
  const [endHour, setEndHour] = useState(8);
  const [description, setDescription] = useState("");
  const [apiError, setApiError] = useState("");

  if (!open) return null;

  const effectiveEndHour = Math.max(endHour, Math.min(startHour + 1, 23));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!date) {
      setApiError("A date is required.");
      return;
    }
    if (!user?.id) {
      setApiError("You must be signed in to create a block.");
      return;
    }

    if (blockType === "PERSONAL") {
      if (isAdmin && !coachId) {
        setApiError("Select the coach whose calendar to block.");
        return;
      }
    }

    const start = `${String(startHour).padStart(2, "0")}:00`;
    const end = `${String(effectiveEndHour).padStart(2, "0")}:00`;

    try {
      const created = await createMutation.mutateAsync({
        blockType,
        coachId: blockType === "PERSONAL" && isAdmin ? coachId : user.id,
        startDateTime: toGymIsoDateTime(date, start),
        endDateTime: toGymIsoDateTime(date, end),
        description: description.trim() || null,
      });
      showToast(
        created.blockType === "PERSONAL" ? "Personal block created." : "Gym-wide block created.",
        "success",
      );
      setBlockType(isAdmin ? "PERSONAL" : "PERSONAL");
      setCoachId(user?.id ?? "");
      setDate("");
      setStartHour(7);
      setEndHour(8);
      setDescription("");
      onSuccess();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setApiError(axiosErr.response?.data?.error?.message || "Failed to create block");
      } else {
        setApiError("Failed to create block");
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
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Block</h3>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isAdmin && (
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">Block Type *</span>
              <div className="flex gap-3">
                {(["PERSONAL", "GYM_WIDE"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBlockType(type)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      blockType === type
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {type === "PERSONAL" ? "Personal" : "Gym-wide"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isAdmin && blockType === "PERSONAL" && (
            <div>
              <label htmlFor="block-coach" className="block text-sm font-medium text-gray-700 mb-1">
                Coach *
              </label>
              <select
                id="block-coach"
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {!coachId && <option value="">Select a coach...</option>}
                {assignableCoachesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isAdmin && (
            <p className="text-sm text-gray-500">
              {blockType === "PERSONAL"
                ? "Your calendar will be blocked for this window."
                : "Gym-wide blocks require an Admin."}
            </p>
          )}

          <div>
            <label htmlFor="block-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              id="block-date"
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="block-start" className="block text-sm font-medium text-gray-700 mb-1">
                Start *
              </label>
              <select
                id="block-start"
                value={startHour}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setStartHour(next);
                  if (endHour <= next) {
                    setEndHour(Math.min(next + 1, 23));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {START_HOURS.map((h) => (
                  <option key={h} value={h}>
                    {`${String(h).padStart(2, "0")}:00`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="block-end" className="block text-sm font-medium text-gray-700 mb-1">
                End *
              </label>
              <select
                id="block-end"
                value={effectiveEndHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {END_HOURS.filter((h) => h > startHour).map((h) => (
                  <option key={h} value={h}>
                    {`${String(h).padStart(2, "0")}:00`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="block-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="block-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes for the block"
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
              {createMutation.isPending ? "Creating..." : "Add Block"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
