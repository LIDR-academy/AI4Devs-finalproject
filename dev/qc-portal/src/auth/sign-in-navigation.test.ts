import { afterEach, expect, test } from "bun:test";
import { goToSignIn, takeIntendedDestination } from "./sign-in-navigation";

afterEach(() => {
  window.history.pushState({}, "", "/");
  // Drain any remembered destination so tests stay independent.
  takeIntendedDestination();
});

test("with nothing remembered, the destination defaults to Home", () => {
  expect(takeIntendedDestination()).toBe("/");
});

test("goToSignIn remembers the current location and routes to /sign-in", () => {
  window.history.pushState({}, "", "/stream/abc?x=1");
  goToSignIn();
  expect(window.location.pathname).toBe("/sign-in");
  expect(takeIntendedDestination()).toBe("/stream/abc?x=1");
});

test("the remembered destination is consumed once, then resets to Home", () => {
  window.history.pushState({}, "", "/stream/abc");
  goToSignIn();
  expect(takeIntendedDestination()).toBe("/stream/abc");
  expect(takeIntendedDestination()).toBe("/");
});
