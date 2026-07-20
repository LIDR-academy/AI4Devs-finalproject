import van from "vanjs-core";
import { navigate } from "../router/router";
import { COPY } from "./copy";

/** Calm fallback for unknown client-side routes. */

const { section, p, a } = van.tags;

export function NotFound(): HTMLElement {
  return section(
    { class: "mx-auto max-w-2xl px-4 py-8 flex flex-col gap-4" },
    p({ class: "text-base text-gray-strong" }, COPY.notFound),
    a(
      {
        class: "text-ink underline w-fit",
        href: "/",
        onclick: (event: MouseEvent) => {
          event.preventDefault();
          navigate("/");
        },
      },
      COPY.backHome,
    ),
  );
}
