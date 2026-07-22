import { afterEach, expect, test } from "bun:test";
import { confirmModal } from "./confirm-modal";

afterEach(() => {
  document.body.replaceChildren();
});

function dialogButton(label: string): HTMLButtonElement {
  const button = [...document.querySelectorAll("button")].find((b) => b.textContent === label);
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`button "${label}" not found`);
  }
  return button;
}

test("confirming resolves true and removes the dialog", async () => {
  const result = confirmModal("End your stream?", "End", "Keep");
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  dialogButton("End").click();
  expect(await result).toBe(true);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

test("cancelling resolves false", async () => {
  const result = confirmModal("End your stream?", "End", "Keep");
  dialogButton("Keep").click();
  expect(await result).toBe(false);
});

test("Escape resolves false", async () => {
  const result = confirmModal("End your stream?", "End", "Keep");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  expect(await result).toBe(false);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});
