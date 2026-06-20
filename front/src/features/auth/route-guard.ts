import { redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { isAuthenticated } from "./session";

const AUTH_ROUTE = "/auth";

export function requireAuthBeforeLoad() {
  if (typeof window !== "undefined" && !isAuthenticated()) {
    throw redirect({ to: AUTH_ROUTE });
  }
}

export function useRequireAuthRedirect(): boolean {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      void navigate({ to: AUTH_ROUTE, replace: true });
    }
  }, [navigate]);

  // Always return true to avoid SSR/client conditional rendering mismatch.
  // Redirect side-effect above handles unauthenticated users on the client.
  return true;
}
