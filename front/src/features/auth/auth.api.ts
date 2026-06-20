import type { AuthSession, SessionUser } from "./session";
import { getAccessToken } from "./session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

interface AuthPayload {
  email: string;
  password: string;
}

interface ApiErrorBody {
  message?: string | string[];
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const message = Array.isArray(errorBody.message)
      ? errorBody.message.join(", ")
      : errorBody.message ?? "Request failed";
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function register(payload: AuthPayload): Promise<AuthSession> {
  return requestJson<AuthSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: AuthPayload): Promise<AuthSession> {
  return requestJson<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(): Promise<SessionUser> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("No session found");
  }

  return requestJson<SessionUser>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
