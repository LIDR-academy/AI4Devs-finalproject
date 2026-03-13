import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function UsersLoading() {
  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 7 }).map((_, i) => (
                <TableHead key={i} scope="col">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {Array.from({ length: 7 }).map((_, colIdx) => (
                  <TableCell key={colIdx}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
