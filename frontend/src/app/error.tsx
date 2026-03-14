"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-900">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-700">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm">A server error occurred while rendering this view. Please retry the action.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={reset}>Retry</Button>
        <Link href="/">
          <Button variant="ghost">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
