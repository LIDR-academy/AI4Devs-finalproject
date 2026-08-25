interface PushAffordanceBannerProps {
  onAccept: () => void;
  onDismiss: () => void;
}

export function PushAffordanceBanner({ onAccept, onDismiss }: PushAffordanceBannerProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <p className="mb-2">Get notified about class openings and schedule changes</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded px-3 py-1 text-xs text-amber-700 hover:underline"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
