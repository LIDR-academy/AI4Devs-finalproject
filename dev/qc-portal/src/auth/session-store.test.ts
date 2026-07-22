import { expect, test } from "bun:test";
import { createFakeAuthSession } from "./auth-session.fake";
import {
  accessToken,
  consumeMagicLink,
  currentUsername,
  isSignedIn,
  requestMagicLink,
  resolveSession,
  sessionState,
  setAuthSession,
  signOutSession,
  subscribe,
} from "./session-store";

test("resolveSession → anonymous when the session reports signed-out", async () => {
  setAuthSession(createFakeAuthSession({ signedIn: false }));
  await resolveSession();
  expect(sessionState()).toEqual({ status: "anonymous" });
  expect(isSignedIn()).toBe(false);
  expect(currentUsername()).toBeUndefined();
});

test("resolveSession → signed-in carries the username claim", async () => {
  setAuthSession(createFakeAuthSession({ signedIn: true, username: "ada" }));
  await resolveSession();
  expect(sessionState()).toEqual({ status: "signed-in", username: "ada" });
  expect(isSignedIn()).toBe(true);
  expect(currentUsername()).toBe("ada");
});

test("accessToken returns the token when signed in, undefined when signed out", async () => {
  const fake = createFakeAuthSession({ signedIn: true, username: "ada", token: "tok-1" });
  setAuthSession(fake);
  await resolveSession();
  expect(await accessToken()).toBe("tok-1");
  fake.setSignedOut();
  expect(await accessToken()).toBeUndefined();
});

test("requestMagicLink delegates to the session", async () => {
  const fake = createFakeAuthSession();
  setAuthSession(fake);
  await requestMagicLink("ada@example.com");
  expect(fake.calls.requestMagicLink).toEqual(["ada@example.com"]);
});

test("consumeMagicLink success moves the store to signed-in", async () => {
  const fake = createFakeAuthSession({ username: "ada" });
  setAuthSession(fake);
  const ok = await consumeMagicLink();
  expect(ok).toBe(true);
  expect(sessionState()).toEqual({ status: "signed-in", username: "ada" });
});

test("consumeMagicLink failure returns false and does not sign in", async () => {
  // Start anonymous, then a failing link must leave the store untouched.
  setAuthSession(createFakeAuthSession({ signedIn: false }));
  await resolveSession();
  setAuthSession(createFakeAuthSession({ consumeFails: true }));
  const ok = await consumeMagicLink();
  expect(ok).toBe(false);
  expect(isSignedIn()).toBe(false);
});

test("signOutSession returns the store to anonymous", async () => {
  setAuthSession(createFakeAuthSession({ signedIn: true, username: "ada" }));
  await resolveSession();
  await signOutSession();
  expect(sessionState()).toEqual({ status: "anonymous" });
});

test("subscribers are notified on state change and stop after unsubscribe", async () => {
  setAuthSession(createFakeAuthSession({ signedIn: true, username: "ada" }));
  let count = 0;
  const unsubscribe = subscribe(() => {
    count += 1;
  });
  await resolveSession();
  expect(count).toBe(1);
  unsubscribe();
  await signOutSession();
  expect(count).toBe(1);
});
