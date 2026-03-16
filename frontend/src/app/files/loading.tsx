import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FilesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Card className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
      <Card className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </Card>
    </div>
  );
}
