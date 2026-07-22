import van from "vanjs-core";
import { COPY } from "../streams/copy";

/** A calm confirmation dialog (style §4): ink scrim, 0 radius, hairline border, standard
 *  buttons. Returns a promise that resolves true (confirm) or false (cancel/Esc). Used by
 *  the sign-out-while-streaming warning. */

const { div, p, button } = van.tags;

export function confirmModal(
  message: string,
  confirmLabel: string,
  cancelLabel: string = COPY.cancel,
): Promise<boolean> {
  return new Promise((resolve) => {
    const close = (result: boolean): void => {
      root.remove();
      document.removeEventListener("keydown", onKeydown);
      resolve(result);
    };
    function onKeydown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
      }
    }
    const root = div(
      {
        class: "fixed inset-0 flex items-center justify-center p-4",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": message,
      },
      div({ class: "absolute inset-0 bg-ink/40", onclick: () => close(false) }),
      div(
        {
          class:
            "relative w-full max-w-md bg-surface border border-gray-line p-6 flex flex-col gap-4",
        },
        p({ class: "text-base" }, message),
        div(
          { class: "flex justify-end gap-3" },
          button(
            {
              class: "btn btn-secondary transition-calm",
              type: "button",
              onclick: () => close(false),
            },
            cancelLabel,
          ),
          button(
            {
              class: "btn btn-primary transition-calm",
              type: "button",
              onclick: () => close(true),
            },
            confirmLabel,
          ),
        ),
      ),
    );
    document.addEventListener("keydown", onKeydown);
    document.body.appendChild(root);
  });
}
