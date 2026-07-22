import { afterEach, expect, mock, test } from "bun:test";
import { COPY } from "../streams/copy";
import { createComposer } from "./composer";
import { CHAT_MAX_CODE_POINTS } from "./message";

afterEach(() => {
  document.body.replaceChildren();
});

test("blocks an empty message and shows calm copy", () => {
  const onSend = mock(() => {});
  const composer = createComposer({ onSend });
  composer.input.value = "   ";
  composer.submit();
  expect(onSend).not.toHaveBeenCalled();
  expect(composer.errorText.val).toBe(COPY.messageRequired);
});

test("blocks an over-long message", () => {
  const onSend = mock(() => {});
  const composer = createComposer({ onSend });
  composer.input.value = "a".repeat(CHAT_MAX_CODE_POINTS + 1);
  composer.submit();
  expect(onSend).not.toHaveBeenCalled();
  expect(composer.errorText.val).toBe(COPY.messageTooLong);
});

test("sends trimmed valid text and clears the input", () => {
  const onSend = mock(() => {});
  const composer = createComposer({ onSend });
  composer.input.value = "  hello  ";
  composer.submit();
  expect(onSend).toHaveBeenCalledWith("hello");
  expect(composer.input.value).toBe("");
});

test("allows exactly the max length", () => {
  const onSend = mock(() => {});
  const composer = createComposer({ onSend });
  composer.input.value = "a".repeat(CHAT_MAX_CODE_POINTS);
  composer.submit();
  expect(onSend).toHaveBeenCalledTimes(1);
});

test("setError surfaces a server-side rejection calmly", () => {
  const composer = createComposer({ onSend: () => {} });
  composer.setError(COPY.messageRejected);
  expect(composer.errorText.val).toBe(COPY.messageRejected);
});
