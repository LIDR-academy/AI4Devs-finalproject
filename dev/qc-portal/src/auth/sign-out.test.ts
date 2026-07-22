import { expect, mock, test } from "bun:test";
import type { ApiResult } from "../streams/api";
import type { Stream } from "../streams/types";
import { performSignOut } from "./sign-out";

function okList(streams: Stream[]): () => Promise<ApiResult<Stream[]>> {
  return () => Promise.resolve({ ok: true, value: streams });
}

const okEnd = (): Promise<ApiResult<null>> => Promise.resolve({ ok: true, value: null });

test("owning an active stream: confirm ends the stream then signs out", async () => {
  const end = mock(okEnd);
  const signOut = mock(() => Promise.resolve());
  const confirm = mock(() => Promise.resolve(true));
  const navigate = mock(() => {});
  await performSignOut({
    list: okList([{ id: "s1", username: "ada", title: "T", description: "" }]),
    end,
    signOut,
    confirm,
    navigate,
    username: () => "ada",
  });
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(end).toHaveBeenCalledWith("s1");
  expect(signOut).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenCalledWith("/");
});

test("owning an active stream: declining the warning aborts — no end, no sign-out", async () => {
  const end = mock(okEnd);
  const signOut = mock(() => Promise.resolve());
  const confirm = mock(() => Promise.resolve(false));
  await performSignOut({
    list: okList([{ id: "s1", username: "ada", title: "T", description: "" }]),
    end,
    signOut,
    confirm,
    navigate: () => {},
    username: () => "ada",
  });
  expect(end).not.toHaveBeenCalled();
  expect(signOut).not.toHaveBeenCalled();
});

test("not streaming: signs out directly without a confirmation", async () => {
  const end = mock(okEnd);
  const signOut = mock(() => Promise.resolve());
  const confirm = mock(() => Promise.resolve(true));
  const navigate = mock(() => {});
  await performSignOut({
    list: okList([{ id: "s1", username: "someone-else", title: "T", description: "" }]),
    end,
    signOut,
    confirm,
    navigate,
    username: () => "ada",
  });
  expect(confirm).not.toHaveBeenCalled();
  expect(end).not.toHaveBeenCalled();
  expect(signOut).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenCalledWith("/");
});

test("no username (already anonymous): signs out directly", async () => {
  const signOut = mock(() => Promise.resolve());
  const confirm = mock(() => Promise.resolve(true));
  await performSignOut({
    list: okList([{ id: "s1", username: "ada", title: "T", description: "" }]),
    end: mock(okEnd),
    signOut,
    confirm,
    navigate: () => {},
    username: () => undefined,
  });
  expect(confirm).not.toHaveBeenCalled();
  expect(signOut).toHaveBeenCalledTimes(1);
});
