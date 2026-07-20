import type { ApiResult } from "../streams/api";
import type { ChatMessage } from "./frames";
import { isChatMessage } from "./frames";

/** The chat history HTTP boundary (PRD §6): `GET /streams/{id}/messages`. Reuses the
 *  streams `ApiResult` discriminated result; responses are validated from `unknown`. */

/** A page of chat history: messages oldest→newest, plus a cursor for the previous page. */
export type HistoryPage = {
  readonly messages: ChatMessage[];
  readonly nextCursor: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHistoryPage(value: unknown): value is HistoryPage {
  return (
    isRecord(value) &&
    Array.isArray(value.messages) &&
    value.messages.every(isChatMessage) &&
    (value.nextCursor === null || typeof value.nextCursor === "string")
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

/** Fetch a page of history. No `before` returns the latest page; `before` returns the
 *  page older than that message id. `404` means the room does not exist. */
export async function fetchHistory(
  streamId: string,
  before?: string,
): Promise<ApiResult<HistoryPage>> {
  const base = `/streams/${encodeURIComponent(streamId)}/messages`;
  const url = before === undefined ? base : `${base}?before=${encodeURIComponent(before)}`;
  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    return { ok: false, error: { kind: "network" } };
  }
  if (response.status !== 200) {
    return { ok: false, error: { kind: "http", status: response.status } };
  }
  const data = await parseJson(response);
  if (!isHistoryPage(data)) {
    return { ok: false, error: { kind: "malformed" } };
  }
  return { ok: true, value: data };
}
