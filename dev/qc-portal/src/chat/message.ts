import { countCodePoints } from "../streams/validation";

/** Client-side chat message validation, mirroring the server (PRD §6): non-empty after
 *  trim and ≤ CHAT_MAX_CODE_POINTS. Length is counted in Unicode code points to match
 *  streamer's server-side count. The server enforces regardless. */

/** Maximum message length in Unicode code points (`CHAT_MAX_LENGTH`, default 500). */
export const CHAT_MAX_CODE_POINTS = 500;

export type MessageValidation =
  | { readonly ok: true; readonly value: string }
  | { readonly ok: false; readonly error: "empty" | "too-long" };

/** Validate composer text: non-empty after trim, ≤ CHAT_MAX_CODE_POINTS. Returns trimmed. */
export function validateMessageText(raw: string): MessageValidation {
  const value = raw.trim();
  if (value.length === 0) {
    return { ok: false, error: "empty" };
  }
  if (countCodePoints(value) > CHAT_MAX_CODE_POINTS) {
    return { ok: false, error: "too-long" };
  }
  return { ok: true, value };
}
