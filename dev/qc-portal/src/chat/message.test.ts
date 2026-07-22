import { expect, test } from "bun:test";
import { CHAT_MAX_CODE_POINTS, validateMessageText } from "./message";

test("rejects empty and whitespace-only text", () => {
  expect(validateMessageText("")).toEqual({ ok: false, error: "empty" });
  expect(validateMessageText("   ")).toEqual({ ok: false, error: "empty" });
});

test("trims and accepts normal text", () => {
  expect(validateMessageText("  hi  ")).toEqual({ ok: true, value: "hi" });
});

test("accepts exactly the max code points", () => {
  const text = "a".repeat(CHAT_MAX_CODE_POINTS);
  expect(validateMessageText(text)).toEqual({ ok: true, value: text });
});

test("rejects one code point over the max", () => {
  expect(validateMessageText("a".repeat(CHAT_MAX_CODE_POINTS + 1))).toEqual({
    ok: false,
    error: "too-long",
  });
});

test("counts code points, not UTF-16 units", () => {
  const text = "😀".repeat(CHAT_MAX_CODE_POINTS); // exactly max code points, 2x UTF-16 units
  expect(validateMessageText(text).ok).toBe(true);
});
