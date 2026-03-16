import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
