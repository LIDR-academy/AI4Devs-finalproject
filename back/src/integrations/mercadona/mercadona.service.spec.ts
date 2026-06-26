import { Test } from "@nestjs/testing";
import { MercadonaService, MercadonaProduct } from "./mercadona.service";

const LECHE_RESPONSE = {
  hits: [
    {
      display_name: "Leche entera Hacendado 1L",
      price_instructions: {
        reference_price: "0.72",
        reference_format: "l",
      },
    },
  ],
};

const EMPTY_RESPONSE = { hits: [] };

function mockFetch(data: unknown, ok = true): jest.SpyInstance {
  return jest.spyOn(global, "fetch").mockResolvedValueOnce({
    ok,
    json: () => Promise.resolve(data),
  } as Response);
}

describe("MercadonaService", () => {
  let service: MercadonaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MercadonaService],
    }).compile();
    service = module.get(MercadonaService);
    jest.restoreAllMocks();
  });

  // ── US1: searchProduct — live fetch ──────────────────────────────────────

  describe("searchProduct — live fetch", () => {
    it("returns MercadonaProduct with MERCADONA_LIVE source on fresh fetch", async () => {
      mockFetch(LECHE_RESPONSE);
      const result = await service.searchProduct("Leche Entera 1L");

      expect(result).not.toBeNull();
      expect(result!.productName).toBe("Leche entera Hacendado 1L");
      expect(result!.priceEur).toBe("0.72");
      expect(result!.unit).toBe("l");
      expect(result!.source).toBe("MERCADONA_LIVE");
      expect(result!.fetchedAt).toBeInstanceOf(Date);
    });

    it("calls the Algolia search endpoint with correct headers and body", async () => {
      const spy = mockFetch(LECHE_RESPONSE);
      await service.searchProduct("leche");

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("algolia.net/1/indexes/products_prod_vlc1_es/query"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "X-Algolia-Application-Id": "REDACTED_ALGOLIA_APP_ID",
            "X-Algolia-API-Key": expect.stringMatching(/[a-f0-9]{20,}/),
          }),
          body: expect.stringContaining('"query":"leche"'),
        }),
      );
    });

    it("returns null when products array is empty", async () => {
      mockFetch(EMPTY_RESPONSE);
      const result = await service.searchProduct("carne de dragon");
      expect(result).toBeNull();
    });

    it("returns null when reference_price is zero", async () => {
      mockFetch({
        hits: [{ display_name: "Test", price_instructions: { reference_price: "0.00", reference_format: "kg" } }],
      });
      const result = await service.searchProduct("test");
      expect(result).toBeNull();
    });

    it("returns null when reference_price is negative", async () => {
      mockFetch({
        hits: [{ display_name: "Test", price_instructions: { reference_price: "-1.00", reference_format: "kg" } }],
      });
      const result = await service.searchProduct("test");
      expect(result).toBeNull();
    });

    it("returns null when normalizedName is too short (< 3 chars)", async () => {
      const spy = jest.spyOn(global, "fetch");
      const result = await service.searchProduct("1L");
      expect(result).toBeNull();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  // ── US1: cache behaviour ─────────────────────────────────────────────────

  describe("cache", () => {
    it("returns MERCADONA_CACHED source on cache hit", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(LECHE_RESPONSE),
      } as Response);

      await service.searchProduct("leche");
      const second = await service.searchProduct("leche");

      expect(second!.source).toBe("MERCADONA_CACHED");
    });

    it("does not call fetch again on cache hit", async () => {
      const spy = jest.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(LECHE_RESPONSE),
      } as Response);

      await service.searchProduct("leche");
      await service.searchProduct("leche");

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("cached result carries the original fetchedAt timestamp", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(LECHE_RESPONSE),
      } as Response);

      const first = await service.searchProduct("leche");
      const second = await service.searchProduct("leche");

      expect(second!.fetchedAt.getTime()).toBe(first!.fetchedAt.getTime());
    });

    it("fetches again after 24h TTL expires", async () => {
      const now = Date.now();
      const dateSpy = jest
        .spyOn(Date, "now")
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 24 * 60 * 60 * 1001);

      const spy = jest.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(LECHE_RESPONSE),
      } as Response);

      await service.searchProduct("leche");
      await service.searchProduct("leche");

      expect(spy).toHaveBeenCalledTimes(2);
      dateSpy.mockRestore();
    });
  });

  // ── US2: error handling ──────────────────────────────────────────────────

  describe("error handling (US2)", () => {
    it("returns null when fetch throws (network error)", async () => {
      jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("network error"));
      const result = await service.searchProduct("leche");
      expect(result).toBeNull();
    });

    it("returns null when Mercadona responds with 5xx", async () => {
      mockFetch({}, false);
      const result = await service.searchProduct("leche");
      expect(result).toBeNull();
    });

    it("returns null when AbortController fires (simulated timeout)", async () => {
      jest
        .spyOn(global, "fetch")
        .mockRejectedValueOnce(new DOMException("The operation was aborted.", "AbortError"));
      const result = await service.searchProduct("leche");
      expect(result).toBeNull();
    });
  });
});
