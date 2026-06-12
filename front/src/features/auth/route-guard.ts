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
  const authed = isAuthenticated();

  useEffect(() => {
    if (!authed) {
      void navigate({ to: AUTH_ROUTE, replace: true });
    }
  }, [authed, navigate]);

  return authed;
}
