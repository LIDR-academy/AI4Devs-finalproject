import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RetrieveLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Card className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </Card>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <Skeleton className="h-72 w-full" />
        </Card>
        <Card className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      </div>
    </div>
  );
}
