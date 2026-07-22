import { authedFetch } from "../auth/authed-fetch";
import type { CreateStreamInput, Stream } from "./types";

/** The streams API module owns the entire wire boundary to the §6 contract (design D-P2/D-P3).
 *  UI never calls `fetch`; every response is parsed from `unknown` and validated here.
 *  Protected calls (create, end) attach the Bearer token via `authedFetch`; reads are public. */

/** Why a call failed. `http` carries the status; the error body is never read. */
export type ApiError =
  | { readonly kind: "http"; readonly status: number }
  | { readonly kind: "network" }
  | { readonly kind: "malformed" };

/** Discriminated result so callers branch on the outcome, not on thrown values. */
export type ApiResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: ApiError };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStream(value: unknown): value is Stream {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.username === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string"
  );
}

function isStreamArray(value: unknown): value is Stream[] {
  return Array.isArray(value) && value.every(isStream);
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    const data: unknown = await response.json();
    return data;
  } catch {
    return undefined;
  }
}

/** `GET /streams` — list live streams (public, no auth). Malformed bodies fail rather than render. */
export async function listStreams(): Promise<ApiResult<Stream[]>> {
  let response: Response;
  try {
    response = await fetch("/streams", { headers: { Accept: "application/json" } });
  } catch {
    return { ok: false, error: { kind: "network" } };
  }
  if (response.status !== 200) {
    return { ok: false, error: { kind: "http", status: response.status } };
  }
  const data = await parseJson(response);
  if (!isStreamArray(data)) {
    return { ok: false, error: { kind: "malformed" } };
  }
  return { ok: true, value: data };
}

/** `POST /streams` — start a stream (authenticated). `201` returns the created stream (no
 *  creatorKey); `401` unauthenticated, `409` already streaming, `400` validation. */
export async function createStream(input: CreateStreamInput): Promise<ApiResult<Stream>> {
  let response: Response;
  try {
    response = await authedFetch("/streams", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, error: { kind: "network" } };
  }
  if (response.status !== 201) {
    return { ok: false, error: { kind: "http", status: response.status } };
  }
  const data = await parseJson(response);
  if (!isStream(data)) {
    return { ok: false, error: { kind: "malformed" } };
  }
  return { ok: true, value: data };
}

/** `DELETE /streams/{id}` — end a stream (authenticated, owner-only). `204` succeeds; callers
 *  treat `404` as already-ended, `403`/`401` as not-allowed. */
export async function endStream(id: string): Promise<ApiResult<null>> {
  let response: Response;
  try {
    response = await authedFetch(`/streams/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch {
    return { ok: false, error: { kind: "network" } };
  }
  if (response.status === 204) {
    return { ok: true, value: null };
  }
  return { ok: false, error: { kind: "http", status: response.status } };
}
