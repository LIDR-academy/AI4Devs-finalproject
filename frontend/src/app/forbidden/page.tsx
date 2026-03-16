import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-amber-700">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-amber-900">Access denied</h1>
      <p className="mt-3 text-sm text-amber-800">
        You do not have permission to access this resource.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/login">
          <Button>Go to Login</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
