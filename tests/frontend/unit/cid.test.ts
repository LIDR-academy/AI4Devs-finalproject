import { isValidCid, normalizeCid } from "@/lib/cid";

describe("cid utilities", () => {
  it("normalizes valid CIDv1", async () => {
    const cid = "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca";

    await expect(normalizeCid(cid)).resolves.toBe(cid);
    await expect(isValidCid(cid)).resolves.toBe(true);
  });

  it("returns null for invalid CID", async () => {
    await expect(normalizeCid("invalid-cid")).resolves.toBeNull();
    await expect(isValidCid("invalid-cid")).resolves.toBe(false);
  });
});
