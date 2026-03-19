import { AddressesTableSkeleton } from '@/components/addresses/addresses-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function AddressesLoading() {
  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <AddressesTableSkeleton />
    </div>
  );
}
