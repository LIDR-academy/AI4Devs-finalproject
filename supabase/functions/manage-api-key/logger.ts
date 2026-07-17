/**
 * Redacted, structured event log for manage-api-key. The type signature itself is the
 * redaction guarantee (@s12, risks.md R5): there is no parameter through which a raw key
 * could ever reach a log call, on this path or any future one that reuses this helper.
 */
export type ApiKeyLogEvent = {
  action: 'save' | 'remove';
  outcome: string;
  userId: string;
};

type LogSink = (...args: unknown[]) => void;

export const logEvent = (event: ApiKeyLogEvent, sink: LogSink = console.log): void => {
  sink(event);
};
