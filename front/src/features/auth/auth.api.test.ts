import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./session", () => ({
  getAccessToken: vi.fn(() => "test-token"),
}));

import { getCurrentUser, updateProfile } from "./auth.api";

function mockFetchResolvedOnce(body: unknown) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    json: async () => body,
  });
}

describe("auth.api — requestJson header merging", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("sends both Content-Type and Authorization headers together on updateProfile (PATCH with a body)", async () => {
    mockFetchResolvedOnce({ id: "u1", email: "u@example.com", firstName: "Alexandra" });

    await updateProfile({ firstName: "Alexandra" });

    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer test-token",
    });
    expect(init.body).toBe(JSON.stringify({ firstName: "Alexandra" }));
  });

  it("still sends the Authorization header on getCurrentUser (GET, no body)", async () => {
    mockFetchResolvedOnce({ id: "u1", email: "u@example.com" });

    await getCurrentUser();

    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer test-token",
    });
  });
});
