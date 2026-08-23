export function WaitingListBadge({ count }: { count: number }) {
  if (count === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
      You are on the waiting list for {count} {count === 1 ? "class" : "classes"}.
    </div>
  );
}
