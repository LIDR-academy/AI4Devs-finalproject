import { maskUserId } from "./mask-user-id";

describe("maskUserId", () => {
  it("masks a normal id to its first 3 characters plus ***", () => {
    expect(maskUserId("usr_12345")).toBe("usr***");
  });

  it("passes undefined through as undefined", () => {
    expect(maskUserId(undefined)).toBeUndefined();
  });

  it("passes null through as undefined", () => {
    expect(maskUserId(null as unknown as undefined)).toBeUndefined();
  });

  it("suffixes strings shorter than 3 characters with *** instead of throwing", () => {
    expect(maskUserId("ab")).toBe("ab***");
    expect(maskUserId("")).toBe("***");
  });
});
