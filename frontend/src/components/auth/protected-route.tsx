"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isHydrating } = useAuth();

  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [isAuthenticated, isHydrating, pathname, router]);

  if (isHydrating) {
    return (
      <div className="flex min-h-[240px] items-center justify-center gap-2 text-slate-600">
        <Spinner />
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
