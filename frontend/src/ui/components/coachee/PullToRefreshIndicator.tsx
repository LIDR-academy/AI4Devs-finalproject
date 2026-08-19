import type { PullGestureState } from "@/infrastructure/hooks/pullGesture";

export function PullToRefreshIndicator({ gesture }: { gesture: PullGestureState }) {
  if (!gesture.ready) {
    return null;
  }
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-3">
      <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <span className="text-xs font-medium text-gray-600">Refreshing...</span>
      </div>
    </div>
  );
}
