/** Wire types for the streamer HTTP contract (PRD §6), consumed at same-origin `/streams`. */

/** A live stream as returned by the streamer service. `description` is always present. */
export type Stream = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
};

/** The body sent to `POST /streams` to start a stream. */
export type CreateStreamInput = {
  readonly title: string;
  readonly description: string;
};
