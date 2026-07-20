import { expect, test } from "bun:test";
import type { ChatMessage } from "./frames";
import { encodeJoin, encodeMessage, isChatMessage, parseServerFrame } from "./frames";

const validMessage: ChatMessage = {
  id: "1",
  sender: "u",
  role: "viewer",
  text: "hi",
  ts: "2026-01-01T00:00:00Z",
};

test("parses a welcome frame", () => {
  expect(
    parseServerFrame(JSON.stringify({ type: "welcome", sender: "u", role: "streamer" })),
  ).toEqual({ type: "welcome", sender: "u", role: "streamer" });
});

test("parses a message frame", () => {
  expect(parseServerFrame(JSON.stringify({ type: "message", message: validMessage }))).toEqual({
    type: "message",
    message: validMessage,
  });
});

test("parses an error frame", () => {
  expect(parseServerFrame(JSON.stringify({ type: "error", reason: "nope" }))).toEqual({
    type: "error",
    reason: "nope",
  });
});

test("returns null for non-JSON", () => {
  expect(parseServerFrame("not json")).toBeNull();
});

test("returns null for an unknown type", () => {
  expect(parseServerFrame(JSON.stringify({ type: "mystery" }))).toBeNull();
});

test("returns null for a message missing fields", () => {
  expect(parseServerFrame(JSON.stringify({ type: "message", message: { id: "1" } }))).toBeNull();
});

test("returns null for an invalid role", () => {
  expect(
    parseServerFrame(
      JSON.stringify({ type: "message", message: { ...validMessage, role: "admin" } }),
    ),
  ).toBeNull();
});

test("isChatMessage validates shape", () => {
  expect(isChatMessage(validMessage)).toBe(true);
  expect(isChatMessage({ ...validMessage, ts: 123 })).toBe(false);
});

test("encodeJoin includes creatorKey only when present", () => {
  expect(JSON.parse(encodeJoin(undefined))).toEqual({ type: "join" });
  expect(JSON.parse(encodeJoin("k"))).toEqual({ type: "join", creatorKey: "k" });
});

test("encodeMessage wraps text", () => {
  expect(JSON.parse(encodeMessage("hello"))).toEqual({ type: "message", text: "hello" });
});
