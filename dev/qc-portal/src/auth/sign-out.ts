import { navigate } from "../router/router";
import type { ApiResult } from "../streams/api";
import { endStream, listStreams } from "../streams/api";
import { COPY } from "../streams/copy";
import type { Stream } from "../streams/types";
import { confirmModal } from "./confirm-modal";
import { currentUsername, signOutSession } from "./session-store";

/** The sign-out flow (design D-P7, decision D5). If the user owns an active stream, warns
 *  calmly that signing out ends it; on confirm it ends the stream then signs out. Otherwise
 *  it signs out directly. Side effects are injected for testing. */

export type SignOutDeps = {
  readonly list?: () => Promise<ApiResult<Stream[]>>;
  readonly end?: (id: string) => Promise<ApiResult<null>>;
  readonly signOut?: () => Promise<void>;
  readonly username?: () => string | undefined;
  readonly confirm?: (message: string) => Promise<boolean>;
  readonly navigate?: (path: string) => void;
};

export async function performSignOut(deps: SignOutDeps = {}): Promise<void> {
  const list = deps.list ?? listStreams;
  const end = deps.end ?? endStream;
  const signOut = deps.signOut ?? signOutSession;
  const username = deps.username ?? currentUsername;
  const confirm =
    deps.confirm ?? ((message) => confirmModal(message, COPY.signOutConfirm, COPY.keepStreaming));
  const nav = deps.navigate ?? navigate;

  const owned = await findOwnedStream(list, username());
  if (owned !== null) {
    const proceed = await confirm(COPY.signOutWarnPublishing);
    if (!proceed) {
      return;
    }
    await end(owned.id);
  }
  await signOut();
  nav("/");
}

async function findOwnedStream(
  list: () => Promise<ApiResult<Stream[]>>,
  username: string | undefined,
): Promise<Stream | null> {
  if (username === undefined) {
    return null;
  }
  const result = await list();
  if (!result.ok) {
    return null;
  }
  return result.value.find((stream) => stream.username === username) ?? null;
}
