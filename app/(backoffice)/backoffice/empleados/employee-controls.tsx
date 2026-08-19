"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/** Cambio de rol y suspensión de un empleado. */
export function EmployeeControls({
  userId,
  role,
  status,
}: {
  userId: string;
  role: "OPERATOR" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, string>) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/employees/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        setError(problem?.errors?.[0]?.issue ?? problem?.detail ?? "No se ha podido guardar.");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => patch({ role: role === "ADMIN" ? "OPERATOR" : "ADMIN" })}
        >
          {role === "ADMIN" ? "Pasar a operador" : "Pasar a admin"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => patch({ status: status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" })}
        >
          {status === "ACTIVE" ? "Suspender" : "Reactivar"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
