import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";

type CalloutType = "info" | "warning" | "tip";

type CalloutProps = {
  type?: CalloutType;
  title?: string;
} & PropsWithChildren;

const VARIANTS: Record<CalloutType, { bg: string; border: string; icon: React.ReactNode; defaultTitle: string }> = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Info className="h-4 w-4 text-blue-600" />,
    defaultTitle: "Note",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
    defaultTitle: "Warning",
  },
  tip: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <Lightbulb className="h-4 w-4 text-emerald-600" />,
    defaultTitle: "Tip",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const v = VARIANTS[type];
  return (
    <div className={cn("my-4 flex gap-3 rounded-xl border p-4", v.bg, v.border)}>
      <div className="mt-0.5 shrink-0">{v.icon}</div>
      <div className="text-sm">
        {title !== undefined ? (
          <p className="mb-1 font-semibold text-slate-900">{title}</p>
        ) : (
          <p className="mb-1 font-semibold text-slate-900">{v.defaultTitle}</p>
        )}
        <div className="text-slate-700">{children}</div>
      </div>
    </div>
  );
}
