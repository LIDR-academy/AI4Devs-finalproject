// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

/**
 * Centralized auth token retrieval.
 * Checks localStorage first, then falls back to cookie.
 * Returns headers object ready for fetch().
 */
export function getAuthHeaders() {
  const token =
    localStorage.getItem("session_token") ||
    document.cookie
      .split("; ")
      .find((c) => c.startsWith("session_token="))
      ?.split("=")[1] ||
    "";
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

/**
 * Returns just the raw token string, or empty string if not found.
 */
export function getAuthToken() {
  return (
    localStorage.getItem("session_token") ||
    document.cookie
      .split("; ")
      .find((c) => c.startsWith("session_token="))
      ?.split("=")[1] ||
    ""
  );
}
