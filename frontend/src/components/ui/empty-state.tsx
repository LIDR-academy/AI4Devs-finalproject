import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
      {icon ? <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-4" onClick={onAction} variant="ghost">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
