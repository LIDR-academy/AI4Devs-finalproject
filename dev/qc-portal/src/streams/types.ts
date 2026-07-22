/** Wire types for the streamer HTTP contract (PRD §6), consumed at same-origin `/streams`. */

/** A live stream as returned by the streamer service. `username` is the owner's account
 *  username; `description` is always present. */
export type Stream = {
  readonly id: string;
  readonly username: string;
  readonly title: string;
  readonly description: string;
};

/** The body sent to `POST /streams` (authenticated) to start a stream. Username comes from
 *  the account (JWT claims), so it is not in the body; `creatorKey` is retired. */
export type CreateStreamInput = {
  readonly title: string;
  readonly description: string;
};
