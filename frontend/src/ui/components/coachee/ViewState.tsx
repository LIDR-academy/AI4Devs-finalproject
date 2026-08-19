import { useId } from "react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-gray-500" role="status">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  );
}

export function ErrorStateWithRetry({
  message = "Could not load. Please try again.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  const buttonId = useId();
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center">
      <p className="text-sm font-medium text-red-700">{message}</p>
      <button
        type="button"
        id={buttonId}
        onClick={onRetry}
        className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );
}
