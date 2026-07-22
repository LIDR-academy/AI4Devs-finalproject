import van from "vanjs-core";
import { COPY } from "../streams/copy";
import { currentUsername, isSignedIn, subscribe } from "./session-store";
import { goToSignIn } from "./sign-in-navigation";
import { performSignOut } from "./sign-out";

/** Home top-right auth controls (design D-P/§5.4): Sign in when signed out, or the username
 *  (typography only — no avatar/chip) + Sign out when signed in. Reactive to the session. */

const { div, span, button } = van.tags;

export function createAuthControls(
  deps: {
    onSignIn?: () => void;
    onSignOut?: () => void;
    signedIn?: () => boolean;
    username?: () => string | undefined;
  } = {},
): HTMLElement {
  const onSignIn = deps.onSignIn ?? goToSignIn;
  const onSignOut = deps.onSignOut ?? (() => void performSignOut());
  const signedIn = deps.signedIn ?? isSignedIn;
  const username = deps.username ?? currentUsername;

  const container = div({ class: "flex items-center gap-3 shrink-0" });

  const render = (): void => {
    if (signedIn()) {
      container.replaceChildren(
        span(
          { class: "font-mono text-xs uppercase tracking-wide text-gray-strong" },
          username() ?? "",
        ),
        button(
          {
            class: "btn btn-secondary transition-calm",
            type: "button",
            onclick: () => onSignOut(),
          },
          COPY.signOutAction,
        ),
      );
    } else {
      container.replaceChildren(
        button(
          { class: "btn btn-secondary transition-calm", type: "button", onclick: () => onSignIn() },
          COPY.signInAction,
        ),
      );
    }
  };

  render();
  subscribe(render);
  return container;
}
