import van from "vanjs-core";
import { COPY } from "../streams/copy";
import { requestMagicLink } from "./session-store";

/** The sign-in view (design D-P5, style D-P10 — the calmest surface): an email form that
 *  requests a magic link, then a calm "check your inbox" state. Side effects injected. */

const { section, form, div, h1, label, span, input, button, p } = van.tags;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type SignInView = {
  readonly el: HTMLElement;
  readonly emailInput: HTMLInputElement;
  readonly errorText: { readonly val: string };
  readonly sent: { readonly val: boolean };
  submit: () => Promise<void>;
};

export function createSignIn(
  deps: { request?: (email: string) => Promise<void> } = {},
): SignInView {
  const request = deps.request ?? requestMagicLink;
  const errorText = van.state("");
  const sent = van.state(false);
  const submitting = van.state(false);

  const emailInput = input({
    class: "field",
    type: "email",
    name: "email",
    autocomplete: "email",
    placeholder: COPY.emailPlaceholder,
    id: "signin-email",
  });

  const submit = async (): Promise<void> => {
    if (submitting.val) {
      return;
    }
    const email = emailInput.value.trim();
    if (!isValidEmail(email)) {
      errorText.val = COPY.emailInvalid;
      return;
    }
    errorText.val = "";
    submitting.val = true;
    try {
      await request(email);
      sent.val = true;
      // Swap to the inbox state imperatively (matching Home's list swap) — a reactive child
      // that replaces the whole form subtree is fragile across DOM implementations.
      content.replaceChildren(inboxView);
    } catch {
      errorText.val = COPY.linkFailed;
    }
    submitting.val = false;
  };

  const formView = form(
    {
      class: "flex flex-col gap-4",
      onsubmit: (event: SubmitEvent) => {
        event.preventDefault();
        void submit();
      },
    },
    label(
      { class: "flex flex-col gap-1 text-sm", for: "signin-email" },
      span({ class: "font-semibold" }, COPY.emailLabel),
      emailInput,
    ),
    p(
      { class: "text-sm text-gray-strong min-h-5", role: "alert", "aria-live": "polite" },
      () => errorText.val,
    ),
    button(
      { class: "btn btn-primary transition-calm", type: "submit", disabled: () => submitting.val },
      COPY.sendMagicLink,
    ),
  );

  const inboxView = div(
    { class: "flex flex-col gap-2" },
    p({ class: "text-xl font-semibold" }, COPY.inboxHeading),
    p({ class: "text-base text-gray-strong" }, COPY.inboxBody),
  );

  const content = div({}, formView);

  const el = section(
    { class: "mx-auto max-w-md px-4 py-16 flex flex-col gap-6" },
    h1({ class: "text-2xl font-semibold" }, COPY.signInHeading),
    content,
  );

  return { el, emailInput, errorText, sent, submit };
}
