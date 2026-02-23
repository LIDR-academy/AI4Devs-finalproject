'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatRelativeDate, formatDate } from '@/lib/utils';

interface RelativeDateCellProps {
  iso: string | null;
}

export function RelativeDateCell({ iso }: RelativeDateCellProps) {
  if (!iso) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-xs text-muted-foreground cursor-default underline decoration-dotted underline-offset-2">
          {formatRelativeDate(iso)}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{formatDate(iso)}</p>
      </TooltipContent>
    </Tooltip>
  );
}
