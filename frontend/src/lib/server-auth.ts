import "server-only";

export type ApiKeyStatus = "active" | "inactive" | "revoked";

export type SessionCookiePayload = {
  email: string;
  apiKey: string;
  createdAt: string;
};

export type BackendStatusData = {
  api_key_status: ApiKeyStatus;
  created_at: string;
  last_renewed_at: string | null;
  usage_count: number;
};

export type BackendEnvelope<T> = {
  status: number;
  message?: string;
  data?: T;
  errors?: Array<{ field?: string; message?: string }>;
};

export const SESSION_COOKIE_NAME = "ipfs_gateway_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function getSessionMaxAgeSeconds() {
  return SESSION_MAX_AGE_SECONDS;
}

export function getBackendApiUrl() {
  const backendApiUrl = process.env.BACKEND_API_URL?.trim();
  if (backendApiUrl) {
    return backendApiUrl.replace(/\/$/, "");
  }

  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (publicApiUrl && /^https?:\/\//i.test(publicApiUrl)) {
    return publicApiUrl.replace(/\/$/, "");
  }

  return "http://localhost:5000";
}

export function encodeSessionCookie(payload: SessionCookiePayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeSessionCookie(value?: string): SessionCookiePayload | null {
  if (!value) {
    return null;
  }

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as Partial<SessionCookiePayload>;

    if (!parsed.email || !parsed.apiKey || !parsed.createdAt) {
      return null;
    }

    return {
      email: parsed.email,
      apiKey: parsed.apiKey,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

export async function callBackend<T>(
  path: string,
  init: RequestInit & { apiKey?: string } = {},
): Promise<{ ok: boolean; status: number; body: BackendEnvelope<T> | null }> {
  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");

  if (init.apiKey) {
    headers.set("X-API-Key", init.apiKey);
  }

  const response = await fetch(`${getBackendApiUrl()}${path}`, {
    method: init.method ?? "GET",
    body: init.body,
    headers,
    cache: "no-store",
  });

  let body: BackendEnvelope<T> | null = null;
  try {
    body = (await response.json()) as BackendEnvelope<T>;
  } catch {
    body = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    body,
  };
}
