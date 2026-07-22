import van from "vanjs-core";
import { navigate } from "../router/router";
import { COPY } from "../streams/copy";
import { consumeMagicLink } from "./session-store";
import { takeIntendedDestination } from "./sign-in-navigation";

/** The magic-link landing route (`/auth/verify`, design D-P8): on mount it consumes the link
 *  via the SDK and redirects to the remembered destination, or shows a calm failure. */

const { section, h1, p, a } = van.tags;

export function createLanding(
  deps: { consume?: () => Promise<boolean>; navigate?: (path: string) => void } = {},
): HTMLElement {
  const consume = deps.consume ?? consumeMagicLink;
  const nav = deps.navigate ?? navigate;
  const failed = van.state(false);

  const el = section(
    { class: "mx-auto max-w-md px-4 py-16 flex flex-col gap-4 text-center" },
    h1({ class: "text-2xl font-semibold" }, () =>
      failed.val ? COPY.signInHeading : COPY.verifying,
    ),
    p({ class: "text-base text-gray-strong" }, () => (failed.val ? COPY.linkFailed : "")),
    () =>
      failed.val
        ? a(
            {
              class: "text-ink underline w-fit mx-auto",
              href: "/sign-in",
              onclick: (event: MouseEvent) => {
                event.preventDefault();
                nav("/sign-in");
              },
            },
            COPY.signInAction,
          )
        : "",
  );

  void consume().then((ok) => {
    if (ok) {
      nav(takeIntendedDestination());
    } else {
      failed.val = true;
    }
  });

  return el;
}
