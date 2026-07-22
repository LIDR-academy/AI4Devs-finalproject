/** Wire types for the media-token contract (PRD §6), consumed at same-origin `/streams`. */

export type MediaRole = "streamer" | "viewer";

/** The media-token response. `token` and `url` are treated as opaque and handed to
 *  `livekit-client` — the portal never parses the JWT. `role` is server-stamped. */
export type MediaToken = {
  readonly token: string;
  readonly url: string;
  readonly identity: string;
  readonly role: MediaRole;
};
