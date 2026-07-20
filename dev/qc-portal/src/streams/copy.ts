/** All user-facing copy in one place. Failure copy is the portal's own calm wording
 *  keyed by outcome — the streamer error body is treated as opaque (design D-P3). */
export const COPY = {
  homeHeading: "Live streams",
  startAction: "Start streaming",
  loading: "Loading streams…",
  emptyState: "No one is streaming right now.",
  loadError: "Couldn't load streams right now. Refresh to try again.",

  startConfirmHeading: "Are you sure to start stream?",
  titleLabel: "Title",
  descriptionLabel: "Description (optional)",
  startConfirm: "Start",
  cancel: "Cancel",
  titleRequired: "A title is required.",
  descriptionTooLong: "Description must be 100 characters or fewer.",
  startFailed: "Couldn't start the stream. Check your input and try again.",

  streamLive: "Stream is live. Media is coming in a later version.",
  endAction: "End stream",
  endFailed: "Couldn't end the stream right now. Try again.",

  notFound: "Page not found.",
  backHome: "Back to home",
} as const;
