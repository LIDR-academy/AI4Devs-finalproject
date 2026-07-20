/** Wire types for the streamer HTTP contract (PRD §6), consumed at same-origin `/streams`. */

/** A live stream as returned by the streamer service. `description` is always present. */
export type Stream = {
  readonly id: string;
  readonly username: string;
  readonly title: string;
  readonly description: string;
};

/** The body sent to `POST /streams` to start a stream. */
export type CreateStreamInput = {
  readonly username: string;
  readonly title: string;
  readonly description: string;
};

/** The `201` response to `POST /streams`. Adds the opaque `creatorKey`, which is
 *  returned only here and kept in memory only (design D-P5). */
export type CreateStreamResult = Stream & {
  readonly creatorKey: string;
};
