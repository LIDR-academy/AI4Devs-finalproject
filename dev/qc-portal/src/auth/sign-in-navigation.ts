import { navigate } from "../router/router";

/** Remembers where the user was headed when routed to sign-in, so the landing route can
 *  send them back after they authenticate (design D-P5/D-P8). */

let intended: string | null = null;

/** Route to the sign-in page, remembering the current location as the return destination. */
export function goToSignIn(): void {
  intended = window.location.pathname + window.location.search;
  navigate("/sign-in");
}

/** The remembered destination (consumed once), defaulting to Home. */
export function takeIntendedDestination(): string {
  const destination = intended ?? "/";
  intended = null;
  return destination;
}
