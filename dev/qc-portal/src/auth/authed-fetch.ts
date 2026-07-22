import { accessToken } from "./session-store";

/** Attach `Authorization: Bearer <access token>` (from the session) to a protected request
 *  (design D-P3). Public reads use plain `fetch`; only protected calls use this. */
export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await accessToken();
  const headers = new Headers(init.headers);
  if (token !== undefined) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
