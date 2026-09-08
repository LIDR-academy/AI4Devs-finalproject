import { useState } from "react";
import type { CancelClassScope } from "@/domain/types/class";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useCancelClass } from "@/infrastructure/hooks/useCancelClass";

export function CancelClassDialog({
  open,
  classId,
  isRecurring,
  onClose,
}: {
  open: boolean;
  classId: string;
  isRecurring: boolean;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const cancelMutation = useCancelClass();
  const [scope, setScope] = useState<CancelClassScope>("single");
  const [apiError, setApiError] = useState("");

  if (!open) return null;

  const handleCancel = async () => {
    setApiError("");
    try {
      await cancelMutation.mutateAsync({ id: classId, scope });
      showToast(
        scope === "series" ? "The whole series was canceled." : "The class was canceled.",
        "success",
      );
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setApiError(axiosErr.response?.data?.error?.message || "Failed to cancel the class");
      } else {
        setApiError("Failed to cancel the class");
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
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel class</h3>
        <p className="text-sm text-gray-600">
          The class will be marked as canceled and its Google Calendar slot will be freed. The
          enrolled coachees will be notified.
        </p>

        {isRecurring && (
          <div className="mt-4 space-y-2">
            <span className="block text-sm font-medium text-gray-700">Scope</span>
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="cancel-scope"
                checked={scope === "single"}
                onChange={() => setScope("single")}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">This occurrence only</span>
                <br />
                <span className="text-gray-500">
                  Cancels just the selected class, keeps the rest.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="cancel-scope"
                checked={scope === "series"}
                onChange={() => setScope("series")}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Entire series</span>
                <br />
                <span className="text-gray-500">
                  Cancels this class and every future occurrence.
                </span>
              </span>
            </label>
          </div>
        )}

        {apiError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {apiError}
          </div>
        )}

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
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Cancel class
          </button>
        </div>
      </div>
    </div>
  );
}
