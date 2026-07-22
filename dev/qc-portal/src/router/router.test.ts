import { afterEach, describe, expect, test } from "bun:test";
import { currentPath, navigate, onNavigate, resolve } from "./router";

describe("resolve", () => {
  test("/ resolves to home", () => {
    expect(resolve("/")).toEqual({ name: "home" });
  });

  test("/sign-in resolves to sign-in", () => {
    expect(resolve("/sign-in")).toEqual({ name: "sign-in" });
  });

  test("/auth/verify resolves to auth-verify (the SPA landing route)", () => {
    expect(resolve("/auth/verify")).toEqual({ name: "auth-verify" });
  });

  test("other /auth/* paths are not-found (they belong to the security service)", () => {
    expect(resolve("/auth/signinup/code")).toEqual({ name: "not-found" });
  });

  test("/stream/{id} resolves to stream", () => {
    expect(resolve("/stream/abc")).toEqual({ name: "stream", id: "abc" });
  });

  test("decodes the id", () => {
    expect(resolve("/stream/a%20b")).toEqual({ name: "stream", id: "a b" });
  });

  test("unknown path resolves to not-found", () => {
    expect(resolve("/nope")).toEqual({ name: "not-found" });
  });

  test("/stream/ with no id resolves to not-found", () => {
    expect(resolve("/stream/")).toEqual({ name: "not-found" });
  });
});

describe("navigate", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  test("updates the path and notifies listeners", () => {
    let notified = 0;
    onNavigate(() => {
      notified += 1;
    });
    navigate("/stream/xyz");
    expect(currentPath()).toBe("/stream/xyz");
    expect(notified).toBe(1);
  });
});
