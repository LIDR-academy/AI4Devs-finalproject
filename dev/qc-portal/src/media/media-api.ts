import { authedFetch } from "../auth/authed-fetch";
import type { ApiResult } from "../streams/api";
import type { MediaRole, MediaToken } from "./types";

/** The media-token HTTP boundary (PRD §6): `POST /streams/{id}/media-token`. Auth-optional:
 *  `authedFetch` attaches the access token as `Authorization: Bearer` when signed in (root D2)
 *  and omits it when anonymous; the server stamps the `role`. Validates the response from
 *  `unknown`; treats `token`/`url` as opaque. Reuses the streams `ApiResult`. */

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

/** Fetch a media token for a room. The server grants a publish (`streamer`) or subscribe-only
 *  (`viewer`) role from the authenticated session/ownership. `404` means the room is gone. */
export async function fetchMediaToken(streamId: string): Promise<ApiResult<MediaToken>> {
  let response: Response;
  try {
    // Auth-optional: `authedFetch` attaches the Bearer token when signed in, else omits it.
    response = await authedFetch(`/streams/${encodeURIComponent(streamId)}/media-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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
