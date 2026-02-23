import { Skeleton } from '@/components/ui/skeleton';

export default function ConversationLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="shrink-0 bg-brand-black px-6 py-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-28 bg-white/10" />
          <div className="flex gap-2 ml-auto">
            <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
            <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
          </div>
        </div>
        <Skeleton className="h-3 w-64 mt-2 bg-white/10" />
      </div>

      {/* Burbujas skeleton alternadas */}
      <div className="flex-1 overflow-y-auto bg-white px-6 py-4 space-y-4">
        {/* assistant */}
        <div className="flex items-end gap-2">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <Skeleton className="h-14 w-64 rounded-chat" />
        </div>
        {/* user */}
        <div className="flex items-end justify-end gap-2">
          <Skeleton className="h-10 w-48 rounded-chat" />
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        </div>
        {/* assistant */}
        <div className="flex items-end gap-2">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <Skeleton className="h-10 w-80 rounded-chat" />
        </div>
        {/* user */}
        <div className="flex items-end justify-end gap-2">
          <Skeleton className="h-8 w-32 rounded-chat" />
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        </div>
        {/* assistant */}
        <div className="flex items-end gap-2">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <Skeleton className="h-12 w-72 rounded-chat" />
        </div>
        {/* user */}
        <div className="flex items-end justify-end gap-2">
          <Skeleton className="h-8 w-16 rounded-chat" />
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        </div>
      </div>
    </div>
  );
}
