import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-emerald-500 transition placeholder:text-slate-400 focus-visible:ring-2",
        className,
      )}
      {...props}
    />
  );
}
