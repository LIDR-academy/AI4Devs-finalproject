import type { Block } from "@/domain/types/block";
import { useAuth } from "@/infrastructure/context/AuthContext";
import { useCancelBlock } from "@/infrastructure/hooks/useCancelBlock";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function BlockDetailView({ block, onClose }: { block: Block | null; onClose: () => void }) {
  const { user } = useAuth();
  const cancelMutation = useCancelBlock();

  if (!block || !user) return null;

  const canCancel =
    user.role === "ADMIN" ||
    (user.role === "COACH" && block.blockType === "PERSONAL" && block.createdBy.id === user.id);

  const handleCancel = () => {
    cancelMutation.mutate(block.id, { onSuccess: onClose });
  };

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
          <h3 className="text-lg font-semibold text-gray-900">Blocked time</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          {formatDate(block.startTime)} · {formatTime(block.startTime)} –{" "}
          {formatTime(block.endTime)}
        </p>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Type</dt>
            <dd className="font-medium">
              {block.blockType === "GYM_WIDE" ? "Gym-wide block" : "Personal block"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Coach</dt>
            <dd className="font-medium">{block.coach ? block.coach.name : "Entire gym"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Created by</dt>
            <dd className="font-medium">{block.createdBy.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Description</dt>
            <dd className="max-w-[60%] text-right text-gray-700">{block.description ?? "—"}</dd>
          </div>
        </dl>

        {canCancel && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {cancelMutation.isPending ? "Canceling..." : "Cancel block"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
