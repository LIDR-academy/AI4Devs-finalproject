import { afterEach, expect, mock, test } from "bun:test";
import type { ApiResult } from "./api";
import { COPY } from "./copy";
import { createStreamPage } from "./stream-page";

function ended(): () => Promise<ApiResult<null>> {
  return () => Promise.resolve({ ok: true, value: null });
}

function failed(status: number): () => Promise<ApiResult<null>> {
  return () => Promise.resolve({ ok: false, error: { kind: "http", status } });
}

afterEach(() => {
  document.body.replaceChildren();
});

test("a 204 redirects home", async () => {
  const end = mock(ended());
  const navigate = mock(() => {});
  const page = createStreamPage("abc", { end, navigate });
  await page.end();
  expect(end).toHaveBeenCalledWith("abc");
  expect(navigate).toHaveBeenCalledWith("/");
});

test("a 404 redirects home without showing an error", async () => {
  const navigate = mock(() => {});
  const page = createStreamPage("abc", { end: failed(404), navigate });
  await page.end();
  expect(navigate).toHaveBeenCalledWith("/");
  expect(page.errorText.val).toBe("");
});

test("another failure shows calm copy and does not redirect", async () => {
  const navigate = mock(() => {});
  const page = createStreamPage("abc", { end: failed(500), navigate });
  await page.end();
  expect(navigate).not.toHaveBeenCalled();
  expect(page.errorText.val).toBe(COPY.endFailed);
});

test("renders the stream id and placeholder copy", () => {
  const page = createStreamPage("abc", { end: ended(), navigate: () => {} });
  expect(page.el.textContent).toContain("abc");
  expect(page.el.textContent).toContain(COPY.streamLive);
});
