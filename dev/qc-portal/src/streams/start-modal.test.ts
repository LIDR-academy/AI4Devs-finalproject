import { afterEach, describe, expect, mock, test } from "bun:test";
import type { ApiResult } from "./api";
import { COPY } from "./copy";
import { createStartModal, openStartModal } from "./start-modal";
import type { Stream } from "./types";

function created(stream: Stream): () => Promise<ApiResult<Stream>> {
  return () => Promise.resolve({ ok: true, value: stream });
}

function rejected(status: number): () => Promise<ApiResult<Stream>> {
  return () => Promise.resolve({ ok: false, error: { kind: "http", status } });
}

afterEach(() => {
  document.body.replaceChildren();
});

test("valid submit creates with a trimmed title and navigates to the new stream", async () => {
  const create = mock(created({ id: "new-id", title: "Hi", description: "d" }));
  const navigate = mock(() => {});
  const onClose = mock(() => {});
  const modal = createStartModal({ create, navigate, onClose });
  modal.titleInput.value = "  Hi  ";
  modal.descriptionInput.value = "d";
  await modal.submit();
  expect(create).toHaveBeenCalledWith({ title: "Hi", description: "d" });
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenCalledWith("/stream/new-id");
});

test("empty title blocks submit and sends no request", async () => {
  const create = mock(created({ id: "x", title: "x", description: "" }));
  const navigate = mock(() => {});
  const modal = createStartModal({ create, navigate, onClose: () => {} });
  modal.titleInput.value = "   ";
  await modal.submit();
  expect(create).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
  expect(modal.errorText.val).toBe(COPY.titleRequired);
});

test("over-long description blocks submit", async () => {
  const create = mock(created({ id: "x", title: "x", description: "" }));
  const modal = createStartModal({ create, navigate: () => {}, onClose: () => {} });
  modal.titleInput.value = "Valid";
  modal.descriptionInput.value = "a".repeat(101);
  await modal.submit();
  expect(create).not.toHaveBeenCalled();
  expect(modal.errorText.val).toBe(COPY.descriptionTooLong);
});

test("exactly 100 multi-byte code points is accepted client-side", async () => {
  const description = "😀".repeat(100);
  const create = mock(created({ id: "x", title: "Valid", description }));
  const modal = createStartModal({ create, navigate: () => {}, onClose: () => {} });
  modal.titleInput.value = "Valid";
  modal.descriptionInput.value = description;
  await modal.submit();
  expect(create).toHaveBeenCalledTimes(1);
});

test("a server 400 shows calm copy and does not navigate or close", async () => {
  const create = mock(rejected(400));
  const navigate = mock(() => {});
  const onClose = mock(() => {});
  const modal = createStartModal({ create, navigate, onClose });
  modal.titleInput.value = "Valid";
  await modal.submit();
  expect(modal.errorText.val).toBe(COPY.startFailed);
  expect(navigate).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

test("does not surface server-provided error text (opaque body)", async () => {
  const create = mock(rejected(400));
  const modal = createStartModal({ create, navigate: () => {}, onClose: () => {} });
  modal.titleInput.value = "Valid";
  await modal.submit();
  // The portal shows only its own copy; there is no server message to leak.
  expect(modal.errorText.val).toBe(COPY.startFailed);
});

test("cancel closes and sends nothing", () => {
  const create = mock(created({ id: "x", title: "x", description: "" }));
  const onClose = mock(() => {});
  const modal = createStartModal({ create, navigate: () => {}, onClose });
  modal.cancel();
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(create).not.toHaveBeenCalled();
});

describe("openStartModal (mounting)", () => {
  test("mounts a dialog with title, description, Start and Cancel", () => {
    openStartModal({
      create: created({ id: "x", title: "x", description: "" }),
      navigate: () => {},
    });
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.querySelector('input[name="title"]')).not.toBeNull();
    expect(document.querySelector('textarea[name="description"]')).not.toBeNull();
    const labels = [...document.querySelectorAll("button")].map((button) => button.textContent);
    expect(labels).toContain(COPY.startConfirm);
    expect(labels).toContain(COPY.cancel);
  });

  test("Escape closes the modal", () => {
    openStartModal({
      create: created({ id: "x", title: "x", description: "" }),
      navigate: () => {},
    });
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
