import { afterEach, describe, expect, mock, test } from "bun:test";
import type { ApiResult } from "./api";
import { COPY } from "./copy";
import { createStartModal, openStartModal } from "./start-modal";
import type { Stream } from "./types";

function created(result: Stream): () => Promise<ApiResult<Stream>> {
  return () => Promise.resolve({ ok: true, value: result });
}

function rejected(status: number): () => Promise<ApiResult<Stream>> {
  return () => Promise.resolve({ ok: false, error: { kind: "http", status } });
}

const noop = (): void => {};

afterEach(() => {
  document.body.replaceChildren();
});

test("valid submit creates with trimmed title (no username), closes, and navigates", async () => {
  const create = mock(created({ id: "new-id", username: "u", title: "Hi", description: "d" }));
  const navigate = mock(() => {});
  const onClose = mock(() => {});
  const modal = createStartModal({ create, navigate, onClose, onAuthRequired: noop });
  modal.titleInput.value = "  Hi  ";
  modal.descriptionInput.value = "d";
  await modal.submit();
  expect(create).toHaveBeenCalledWith({ title: "Hi", description: "d" });
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenCalledWith("/stream/new-id");
});

test("empty title blocks submit and sends no request", async () => {
  const create = mock(created({ id: "x", username: "u", title: "t", description: "" }));
  const modal = createStartModal({
    create,
    navigate: noop,
    onClose: noop,
    onAuthRequired: noop,
  });
  modal.titleInput.value = "   ";
  await modal.submit();
  expect(create).not.toHaveBeenCalled();
  expect(modal.errorText.val).toBe(COPY.titleRequired);
});

test("over-long description blocks submit", async () => {
  const create = mock(created({ id: "x", username: "u", title: "t", description: "" }));
  const modal = createStartModal({
    create,
    navigate: noop,
    onClose: noop,
    onAuthRequired: noop,
  });
  modal.titleInput.value = "Valid";
  modal.descriptionInput.value = "a".repeat(101);
  await modal.submit();
  expect(create).not.toHaveBeenCalled();
  expect(modal.errorText.val).toBe(COPY.descriptionTooLong);
});

test("exactly 100 multi-byte code points is accepted client-side", async () => {
  const description = "😀".repeat(100);
  const create = mock(created({ id: "x", username: "u", title: "Valid", description }));
  const modal = createStartModal({
    create,
    navigate: noop,
    onClose: noop,
    onAuthRequired: noop,
  });
  modal.titleInput.value = "Valid";
  modal.descriptionInput.value = description;
  await modal.submit();
  expect(create).toHaveBeenCalledTimes(1);
});

test("a 401 closes the modal and routes to sign-in", async () => {
  const create = mock(rejected(401));
  const onClose = mock(() => {});
  const onAuthRequired = mock(() => {});
  const navigate = mock(() => {});
  const modal = createStartModal({ create, navigate, onClose, onAuthRequired });
  modal.titleInput.value = "Valid";
  await modal.submit();
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onAuthRequired).toHaveBeenCalledTimes(1);
  expect(navigate).not.toHaveBeenCalled();
});

test("a 409 shows calm already-streaming copy and does not navigate or close", async () => {
  const create = mock(rejected(409));
  const navigate = mock(() => {});
  const onClose = mock(() => {});
  const modal = createStartModal({ create, navigate, onClose, onAuthRequired: noop });
  modal.titleInput.value = "Valid";
  await modal.submit();
  expect(modal.errorText.val).toBe(COPY.alreadyStreaming);
  expect(navigate).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

test("a server 400 shows calm copy and does not navigate or close", async () => {
  const create = mock(rejected(400));
  const navigate = mock(() => {});
  const onClose = mock(() => {});
  const modal = createStartModal({ create, navigate, onClose, onAuthRequired: noop });
  modal.titleInput.value = "Valid";
  await modal.submit();
  expect(modal.errorText.val).toBe(COPY.startFailed);
  expect(navigate).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

test("does not surface server-provided error text (opaque body)", async () => {
  const create = mock(rejected(400));
  const modal = createStartModal({
    create,
    navigate: noop,
    onClose: noop,
    onAuthRequired: noop,
  });
  modal.titleInput.value = "Valid";
  await modal.submit();
  // The portal shows only its own copy; there is no server message to leak.
  expect(modal.errorText.val).toBe(COPY.startFailed);
});

test("cancel closes and sends nothing", () => {
  const create = mock(created({ id: "x", username: "u", title: "t", description: "" }));
  const onClose = mock(() => {});
  const modal = createStartModal({ create, navigate: noop, onClose, onAuthRequired: noop });
  modal.cancel();
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(create).not.toHaveBeenCalled();
});

describe("openStartModal (mounting)", () => {
  test("mounts a dialog with title, description, Start and Cancel — and no username field", () => {
    openStartModal({
      create: created({ id: "x", username: "u", title: "t", description: "" }),
      navigate: noop,
    });
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.querySelector('input[name="username"]')).toBeNull();
    expect(document.querySelector('input[name="title"]')).not.toBeNull();
    expect(document.querySelector('textarea[name="description"]')).not.toBeNull();
    const labels = [...document.querySelectorAll("button")].map((button) => button.textContent);
    expect(labels).toContain(COPY.startConfirm);
    expect(labels).toContain(COPY.cancel);
  });

  test("Escape closes the modal", () => {
    openStartModal({
      create: created({ id: "x", username: "u", title: "t", description: "" }),
      navigate: noop,
    });
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
