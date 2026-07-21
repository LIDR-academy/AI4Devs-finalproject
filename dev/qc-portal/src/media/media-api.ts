import type { ApiResult } from "../streams/api";
import type { MediaRole, MediaToken } from "./types";

/** The media-token HTTP boundary (PRD §6): `POST /streams/{id}/media-token`. Sends the
 *  in-memory creatorKey as `Authorization: Bearer` (root D2) only when held; validates the
 *  response from `unknown`; treats `token`/`url` as opaque. Reuses the streams `ApiResult`. */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMediaRole(value: unknown): value is MediaRole {
  return value === "streamer" || value === "viewer";
}

function isMediaToken(value: unknown): value is MediaToken {
  return (
    isRecord(value) &&
    typeof value.token === "string" &&
    typeof value.url === "string" &&
    typeof value.identity === "string" &&
    isMediaRole(value.role)
  );
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    const data: unknown = await response.json();
    return data;
  } catch {
    return undefined;
  }
}

/** Fetch a media token for a room. A held `creatorKey` yields a publish (`streamer`) grant;
 *  none yields a subscribe-only (`viewer`) grant. `404` means the room is gone. */
export async function fetchMediaToken(
  streamId: string,
  creatorKey?: string,
): Promise<ApiResult<MediaToken>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (creatorKey !== undefined) {
    headers.Authorization = `Bearer ${creatorKey}`;
  }
  let response: Response;
  try {
    response = await fetch(`/streams/${encodeURIComponent(streamId)}/media-token`, {
      method: "POST",
      headers,
      body: "{}",
    });
  } catch {
    return { ok: false, error: { kind: "network" } };
  }
  if (response.status !== 200) {
    return { ok: false, error: { kind: "http", status: response.status } };
  }
  const data = await parseJson(response);
  if (!isMediaToken(data)) {
    return { ok: false, error: { kind: "malformed" } };
  }
  return { ok: true, value: data };
}
