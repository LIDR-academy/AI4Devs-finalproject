import { afterEach, expect, mock, test } from "bun:test";
import van from "vanjs-core";
import { COPY } from "../streams/copy";
import { createLanding } from "./landing";

// Drain microtasks so the consume promise settles and VanJS flushes its DOM updates.
const flush = async (): Promise<void> => {
  for (let i = 0; i < 6; i += 1) {
    await Promise.resolve();
  }
};

afterEach(() => {
  document.body.replaceChildren();
  window.history.pushState({}, "", "/");
});

test("a consumed link redirects to the remembered destination (default Home)", async () => {
  const navigate = mock(() => {});
  createLanding({ consume: () => Promise.resolve(true), navigate });
  await flush();
  expect(navigate).toHaveBeenCalledWith("/");
});

test("a failed link shows calm failure copy and a link back to sign-in", async () => {
  const navigate = mock(() => {});
  const el = createLanding({ consume: () => Promise.resolve(false), navigate });
  // Mount with van.add so VanJS finalizes the reactive binding (as the app does), then the
  // failure-state child swap flushes.
  van.add(document.body, el);
  await flush();
  expect(navigate).not.toHaveBeenCalled();
  expect(el.textContent).toContain(COPY.linkFailed);
  const link = el.querySelector("a");
  expect(link?.getAttribute("href")).toBe("/sign-in");
  link?.click();
  expect(navigate).toHaveBeenCalledWith("/sign-in");
});
