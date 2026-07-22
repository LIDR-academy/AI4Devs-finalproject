import { afterEach, expect, mock, test } from "bun:test";
import { COPY } from "../streams/copy";
import { createSignIn } from "./sign-in";

afterEach(() => {
  document.body.replaceChildren();
});

test("a valid email requests a magic link and shows the check-your-inbox state", async () => {
  const request = mock(() => Promise.resolve());
  const view = createSignIn({ request });
  view.emailInput.value = "ada@example.com";
  await view.submit();
  expect(request).toHaveBeenCalledWith("ada@example.com");
  expect(view.sent.val).toBe(true);
  expect(view.el.textContent).toContain(COPY.inboxHeading);
});

test("an invalid email is blocked and no link is requested", async () => {
  const request = mock(() => Promise.resolve());
  const view = createSignIn({ request });
  view.emailInput.value = "not-an-email";
  await view.submit();
  expect(request).not.toHaveBeenCalled();
  expect(view.sent.val).toBe(false);
  expect(view.errorText.val).toBe(COPY.emailInvalid);
});

test("a failed request shows calm failure copy and stays on the form", async () => {
  const request = mock(() => Promise.reject(new Error("network")));
  const view = createSignIn({ request });
  view.emailInput.value = "ada@example.com";
  await view.submit();
  expect(view.sent.val).toBe(false);
  expect(view.errorText.val).toBe(COPY.linkFailed);
});
