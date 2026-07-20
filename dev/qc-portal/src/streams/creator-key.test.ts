import { afterEach, expect, test } from "bun:test";
import { clearCreatorKey, getCreatorKey, setCreatorKey } from "./creator-key";

afterEach(() => {
  clearCreatorKey("s1");
  clearCreatorKey("s2");
  localStorage.clear();
  sessionStorage.clear();
});

test("stores and retrieves a creatorKey in memory", () => {
  setCreatorKey("s1", "key-1");
  expect(getCreatorKey("s1")).toBe("key-1");
  expect(getCreatorKey("s2")).toBeUndefined();
});

test("clear removes the key", () => {
  setCreatorKey("s1", "key-1");
  clearCreatorKey("s1");
  expect(getCreatorKey("s1")).toBeUndefined();
});

test("never writes the key to web storage", () => {
  setCreatorKey("s1", "secret-key");
  expect(localStorage.length).toBe(0);
  expect(sessionStorage.length).toBe(0);
  // And the secret does not appear serialized anywhere in web storage.
  expect(JSON.stringify(localStorage)).not.toContain("secret-key");
  expect(JSON.stringify(sessionStorage)).not.toContain("secret-key");
});
