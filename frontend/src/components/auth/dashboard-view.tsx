"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import type { DashboardOverview } from "@/types/dashboard";

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatSize(value: number | null) {
  if (value === null) {
    return "Not available";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let size = value / 1024;
  let unit = units[0];

  for (let index = 1; index < units.length && size >= 1024; index += 1) {
    size /= 1024;
    unit = units[index];
  }

  return `${size.toFixed(1)} ${unit}`;
}

async function fetchOverview(): Promise<DashboardOverview> {
  const response = await fetch("/api/dashboard/overview", {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; data?: DashboardOverview }
    | null;

  if (!response.ok || !payload?.data) {
    const message = payload?.message ?? "Failed to load dashboard";
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return payload.data;
}

export function DashboardView() {
  const router = useRouter();
  const { logout } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [challengeCode, setChallengeCode] = useState<string | null>(null);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchOverview,
    refetchOnWindowFocus: false,
  });

  const apiStatusTone = useMemo(() => {
    const status = data?.account.apiKeyStatus;
    if (status === "active") {
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    }
    if (status === "inactive") {
      return "text-amber-700 bg-amber-50 border-amber-200";
    }
    return "text-rose-700 bg-rose-50 border-rose-200";
  }, [data?.account.apiKeyStatus]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/login");
  };

  const handleRequestRenewCode = async () => {
    setIsRequestingCode(true);
    try {
      const response = await fetch("/api/auth/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "challenge" }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string; data?: { verificationCode?: string } } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? "Failed to request renewal challenge");
      }
      const code = payload?.data?.verificationCode ?? null;
      setChallengeCode(code);
      if (code) {
        setVerificationCode(code);
      }
      toast.success(payload?.message ?? "Verification code requested");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to request renewal challenge";
      toast.error(message);
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleConfirmRenew = async () => {
    if (!verificationCode.trim()) {
      toast.error("Verification code is required");
      return;
    }

    setIsRenewing(true);
    try {
      const response = await fetch("/api/auth/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", verificationCode: verificationCode.trim() }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string; data?: { newApiKey?: string } } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "API key renewal failed");
      }

      setNewApiKey(payload?.data?.newApiKey ?? null);
      setVerificationCode("");
      setChallengeCode(null);
      toast.success("API key renewed successfully");
      void refetch();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "API key renewal failed";
      toast.error(message);
    } finally {
      setIsRenewing(false);
    }
  };

  const handleRevoke = async () => {
    if (!window.confirm("Are you sure you want to revoke your current API key? This action requires backend support.")) {
      return;
    }

    setIsRevoking(true);
    try {
      const response = await fetch("/api/auth/revoke", {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Revoke request failed");
      }

      toast.success(payload?.message ?? "API key revoked");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Revoke request failed";
      toast.error(message);
    } finally {
      setIsRevoking(false);
    }
  };

  if (isError) {
    const status = (error as Error & { status?: number }).status;
    if (status === 401) {
      void handleLogout();
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">User Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Monitor account status, usage, and authentication controls.</p>
          </div>
          <Button onClick={() => void handleLogout()} type="button" variant="ghost">
            Logout
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </div>
        ) : null}

        {isError ? (
          <Card className="border-rose-200 bg-rose-50 text-rose-800">
            <p className="font-semibold">Unable to load dashboard data</p>
            <p className="mt-2 text-sm">{error instanceof Error ? error.message : "Unexpected error"}</p>
            <Button className="mt-4" onClick={() => void refetch()} type="button" variant="ghost">
              Retry
            </Button>
          </Card>
        ) : null}

        {!isLoading && !isError && data ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Account Overview</h2>
              <dl className="mt-4 space-y-2 text-sm text-slate-700">
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-slate-600">Email</dt>
                  <dd>{data.account.email}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-slate-600">Account created</dt>
                  <dd>{formatDate(data.account.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-slate-600">Last renewed</dt>
                  <dd>{formatDate(data.account.lastRenewedAt)}</dd>
                </div>
              </dl>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900">API Key Status</h2>
              <div className={`mt-4 inline-flex rounded-full border px-3 py-1 text-sm font-medium capitalize ${apiStatusTone}`}>
                {data.account.apiKeyStatus}
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button disabled={isRequestingCode} onClick={() => void handleRequestRenewCode()} type="button" variant="ghost">
                    {isRequestingCode ? "Requesting..." : "Request Renew Code"}
                  </Button>
                  <Button disabled={isRevoking} onClick={() => void handleRevoke()} type="button" variant="ghost">
                    {isRevoking ? "Processing..." : "Revoke API Key"}
                  </Button>
                </div>

                {challengeCode ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <p className="font-semibold">Verification code</p>
                    <p className="mt-1 text-xs text-amber-700">Copy this code into the field below, then click Confirm Renew. It expires shortly.</p>
                    <code className="mt-2 block overflow-x-auto rounded bg-slate-900 px-2 py-1 text-base font-bold tracking-widest text-amber-300 select-all">{challengeCode}</code>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    onChange={(event) => setVerificationCode(event.target.value)}
                    placeholder="Enter renewal verification code"
                    value={verificationCode}
                  />
                  <Button disabled={isRenewing} onClick={() => void handleConfirmRenew()} type="button">
                    {isRenewing ? "Renewing..." : "Confirm Renew"}
                  </Button>
                </div>
              </div>

              {newApiKey ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  <p className="font-semibold">New API key generated</p>
                  <code className="mt-2 block overflow-x-auto rounded bg-slate-900 px-2 py-1 text-emerald-300">{newApiKey}</code>
                </div>
              ) : null}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Usage Statistics</h2>
              <dl className="mt-4 space-y-2 text-sm text-slate-700">
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-slate-600">Files uploaded</dt>
                  <dd>{data.usage.fileCount ?? "Not available"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-slate-600">Storage used</dt>
                  <dd>{formatSize(data.usage.storageUsedBytes)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-slate-600">Requests made</dt>
                  <dd>{data.usage.requestCount}</dd>
                </div>
              </dl>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Recent Files</h2>
              {data.recentFiles.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">Recent files feed will be enabled once backend list endpoint is available.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {data.recentFiles.map((file) => (
                    <li className="rounded-lg border border-slate-200 px-3 py-2 text-sm" key={file.cid}>
                      <p className="font-medium text-slate-900">{file.originalFilename}</p>
                      <p className="text-slate-600">{file.cid}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/upload">
                <Button type="button" variant="ghost">
                  Upload File
                </Button>
              </Link>
              <Link href="/retrieve">
                <Button type="button" variant="ghost">
                  Retrieve by CID
                </Button>
              </Link>
              <Link href="/files">
                <Button type="button" variant="ghost">
                  Manage Files
                </Button>
              </Link>
            </div>
          </Card>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
