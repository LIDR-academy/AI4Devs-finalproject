import van from "vanjs-core";
import type { ApiResult } from "./api";
import { createStream } from "./api";
import { COPY } from "./copy";
import type { CreateStreamInput, Stream } from "./types";
import { validateDescription, validateTitle } from "./validation";

/** The start-flow modal (design D-P8): one dialog with title + optional description,
 *  client-side validation, and a POST that redirects on success. Side effects (create,
 *  navigate, close) are injected so the flow is testable without the DOM or network. */

const { div, form, label, span, input, textarea, p, button } = van.tags;

type StartModalConfig = {
  readonly create: (input: CreateStreamInput) => Promise<ApiResult<Stream>>;
  readonly navigate: (path: string) => void;
  readonly onClose: () => void;
};

export type StartModal = {
  readonly root: HTMLElement;
  readonly titleInput: HTMLInputElement;
  readonly descriptionInput: HTMLTextAreaElement;
  readonly errorText: { readonly val: string };
  readonly submit: () => Promise<void>;
  readonly cancel: () => void;
};

/** Build the modal element and its behavior. Mounting concerns (focus, Esc, DOM
 *  insertion) live in `openStartModal`; this stays a pure UI + submit unit. */
export function createStartModal(config: StartModalConfig): StartModal {
  const errorText = van.state("");
  const submitting = van.state(false);

  const titleInput = input({ class: "field", type: "text", name: "title", id: "start-title" });
  const descriptionInput = textarea({
    class: "field",
    name: "description",
    id: "start-description",
  });

  const submit = async (): Promise<void> => {
    if (submitting.val) {
      return;
    }
    const title = validateTitle(titleInput.value);
    if (!title.ok) {
      errorText.val = COPY.titleRequired;
      return;
    }
    const description = validateDescription(descriptionInput.value);
    if (!description.ok) {
      errorText.val = COPY.descriptionTooLong;
      return;
    }
    errorText.val = "";
    submitting.val = true;
    const result = await config.create({ title: title.value, description: description.value });
    submitting.val = false;
    if (result.ok) {
      config.onClose();
      config.navigate(`/stream/${result.value.id}`);
      return;
    }
    // Any failure — including a 400 the client did not pre-check (design D-P4) — is calm copy.
    errorText.val = COPY.startFailed;
  };

  const cancel = (): void => {
    config.onClose();
  };

  const root = div(
    {
      class: "fixed inset-0 flex items-center justify-center p-4",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": COPY.startConfirmHeading,
    },
    // Scrim: a plain ink overlay at low opacity (the only elevation cue, style §4).
    div({ class: "absolute inset-0 bg-ink/40", onclick: cancel }),
    form(
      {
        class:
          "relative w-full max-w-md bg-surface border border-gray-line p-6 flex flex-col gap-4",
        onsubmit: (event: SubmitEvent) => {
          event.preventDefault();
          void submit();
        },
      },
      p({ class: "text-xl font-semibold" }, COPY.startConfirmHeading),
      label(
        { class: "flex flex-col gap-1 text-sm", for: "start-title" },
        span({ class: "font-semibold" }, COPY.titleLabel),
        titleInput,
      ),
      label(
        { class: "flex flex-col gap-1 text-sm", for: "start-description" },
        span({ class: "font-semibold" }, COPY.descriptionLabel),
        descriptionInput,
      ),
      // Error region is always in the DOM (aria-live) so screen readers hear updates.
      p(
        { class: "text-sm text-gray-strong min-h-5", role: "alert", "aria-live": "polite" },
        () => errorText.val,
      ),
      div(
        { class: "flex justify-end gap-3" },
        button(
          { class: "btn btn-secondary transition-calm", type: "button", onclick: cancel },
          COPY.cancel,
        ),
        button(
          {
            class: "btn btn-primary transition-calm",
            type: "submit",
            disabled: () => submitting.val,
          },
          COPY.startConfirm,
        ),
      ),
    ),
  );

  return { root, titleInput, descriptionInput, errorText, submit, cancel };
}

type StartModalDeps = {
  readonly create: (input: CreateStreamInput) => Promise<ApiResult<Stream>>;
  readonly navigate: (path: string) => void;
};

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>("button, input, textarea, [href]")].filter(
    (element) => !element.hasAttribute("disabled"),
  );
}

/** Open the modal: mount it, trap focus, wire Esc, and restore focus on close. */
export function openStartModal(deps: StartModalDeps): HTMLElement {
  const previouslyFocused = document.activeElement;

  const onClose = (): void => {
    modal.root.remove();
    document.removeEventListener("keydown", onKeydown);
    if (previouslyFocused instanceof HTMLElement) {
      previouslyFocused.focus();
    }
  };

  const modal = createStartModal({ create: deps.create, navigate: deps.navigate, onClose });

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      modal.cancel();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    const focusable = focusableWithin(modal.root);
    const first = focusable.at(0);
    const last = focusable.at(-1);
    if (first === undefined || last === undefined) {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener("keydown", onKeydown);
  document.body.appendChild(modal.root);
  modal.titleInput.focus();
  return modal.root;
}

/** Default open used by Home: real create + real navigation. */
export function openStartModalDefault(navigate: (path: string) => void): void {
  openStartModal({ create: createStream, navigate });
}
