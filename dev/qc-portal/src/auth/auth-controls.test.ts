import { afterEach, expect, mock, test } from "bun:test";
import { COPY } from "../streams/copy";
import { createAuthControls } from "./auth-controls";

afterEach(() => {
  document.body.replaceChildren();
});

test("signed-out shows a Sign in control that triggers onSignIn", () => {
  const onSignIn = mock(() => {});
  const el = createAuthControls({ onSignIn, signedIn: () => false, username: () => undefined });
  const button = el.querySelector("button");
  expect(button?.textContent).toBe(COPY.signInAction);
  button?.click();
  expect(onSignIn).toHaveBeenCalledTimes(1);
});

test("signed-in shows the username (typography only) and a Sign out control", () => {
  const onSignOut = mock(() => {});
  const el = createAuthControls({ onSignOut, signedIn: () => true, username: () => "ada" });
  expect(el.textContent).toContain("ada");
  // Identity is text only — no avatar image, no colored chip element.
  expect(el.querySelector("img")).toBeNull();
  const signOut = [...el.querySelectorAll("button")].find(
    (button) => button.textContent === COPY.signOutAction,
  );
  expect(signOut).toBeDefined();
  signOut?.click();
  expect(onSignOut).toHaveBeenCalledTimes(1);
});
