"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <SearchX className="h-7 w-7" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-3 text-sm text-slate-600">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Button onClick={() => history.back()} type="button" variant="ghost">
          Go Back
        </Button>
      </div>
    </div>
  );
}
