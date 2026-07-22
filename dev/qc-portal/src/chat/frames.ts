/** WebSocket frame types and boundary validation for the room chat (PRD §6 WS contract).
 *  Inbound frames arrive as `unknown` JSON and are validated here before the UI sees them. */

export type Role = "streamer" | "viewer";

/** A chat message as stamped and broadcast by the server. */
export type ChatMessage = {
  readonly id: string;
  readonly sender: string;
  readonly role: Role;
  readonly text: string;
  readonly ts: string;
};

/** Frames the server sends to the client. */
export type WelcomeFrame = {
  readonly type: "welcome";
  readonly sender: string;
  readonly role: Role;
};
export type MessageFrame = { readonly type: "message"; readonly message: ChatMessage };
export type ErrorFrame = { readonly type: "error"; readonly reason: string };
export type ServerFrame = WelcomeFrame | MessageFrame | ErrorFrame;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRole(value: unknown): value is Role {
  return value === "streamer" || value === "viewer";
}

/** Validate a chat message shape from `unknown` (all fields present and typed). */
export function isChatMessage(value: unknown): value is ChatMessage {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.sender === "string" &&
    isRole(value.role) &&
    typeof value.text === "string" &&
    typeof value.ts === "string"
  );
}

/** Parse and validate an inbound server frame; returns null for anything malformed. */
export function parseServerFrame(raw: string): ServerFrame | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(value)) {
    return null;
  }
  if (value.type === "welcome" && typeof value.sender === "string" && isRole(value.role)) {
    return { type: "welcome", sender: value.sender, role: value.role };
  }
  if (value.type === "message" && isChatMessage(value.message)) {
    return { type: "message", message: value.message };
  }
  if (value.type === "error" && typeof value.reason === "string") {
    return { type: "error", reason: value.reason };
  }
  return null;
}

/** Encode the outbound `join` frame, carrying the access token when signed in (D6). */
export function encodeJoin(token: string | undefined): string {
  return JSON.stringify(token === undefined ? { type: "join" } : { type: "join", token });
}

/** Encode the outbound `message` frame. */
export function encodeMessage(text: string): string {
  return JSON.stringify({ type: "message", text });
}
