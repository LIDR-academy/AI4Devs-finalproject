import van from "vanjs-core";
import { COPY } from "../streams/copy";
import { validateMessageText } from "./message";

/** The single-line chat composer. Blocks empty and over-length messages client-side
 *  with calm inline copy (the server enforces regardless); valid text is sent. */

const { form, div, input, button, p } = van.tags;

export type Composer = {
  readonly el: HTMLElement;
  readonly input: HTMLInputElement;
  readonly errorText: { readonly val: string };
  submit(): void;
  setError(text: string): void;
};

export function createComposer(deps: { onSend: (text: string) => void }): Composer {
  const errorText = van.state("");
  const messageInput = input({
    class: "field",
    type: "text",
    name: "message",
    autocomplete: "off",
    placeholder: COPY.composerPlaceholder,
    "aria-label": COPY.chatHeading,
  });

  const submit = (): void => {
    const result = validateMessageText(messageInput.value);
    if (!result.ok) {
      errorText.val = result.error === "empty" ? COPY.messageRequired : COPY.messageTooLong;
      return;
    }
    errorText.val = "";
    deps.onSend(result.value);
    messageInput.value = "";
  };

  const setError = (text: string): void => {
    errorText.val = text;
  };

  const el = form(
    {
      class: "flex flex-col gap-1",
      onsubmit: (event: SubmitEvent) => {
        event.preventDefault();
        submit();
      },
    },
    div(
      { class: "flex gap-2" },
      messageInput,
      button(
        { class: "btn btn-primary transition-calm shrink-0", type: "submit" },
        COPY.sendAction,
      ),
    ),
    p(
      { class: "text-sm text-gray-strong min-h-5", role: "alert", "aria-live": "polite" },
      () => errorText.val,
    ),
  );

  return { el, input: messageInput, errorText, submit, setError };
}
