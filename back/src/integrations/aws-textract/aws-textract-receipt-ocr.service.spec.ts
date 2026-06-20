import { TextractClient } from "@aws-sdk/client-textract";
import { AwsTextractReceiptOcrService } from "./aws-textract-receipt-ocr.service";
import {
  OcrTimeoutError,
  OcrTransientError,
} from "../../modules/receipts/ports/receipt-ports";

jest.mock("@aws-sdk/client-textract", () => ({
  TextractClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  AnalyzeExpenseCommand: jest.fn().mockImplementation((input) => input),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeParams() {
  return {
    buffer: Buffer.from("fake-image"),
    contentType: "image/jpeg",
    originalName: "receipt.jpg",
  };
}

function getClientSendMock(svc: AwsTextractReceiptOcrService): jest.Mock {
  const ClientClass = TextractClient as jest.MockedClass<typeof TextractClient>;
  const instance = ClientClass.mock.results[ClientClass.mock.results.length - 1].value as { send: jest.Mock };
  return instance.send;
}

// Build a Textract ExpenseDocument response with line items
function makeLineItemResponse(items: Array<{ name: string; price: string; quantity?: string }>) {
  return {
    ExpenseDocuments: [
      {
        LineItemGroups: [
          {
            LineItems: items.map((item) => ({
              LineItemExpenseFields: [
                {
                  Type: { Text: "ITEM" },
                  ValueDetection: { Text: item.name },
                },
                {
                  Type: { Text: "PRICE" },
                  ValueDetection: { Text: item.price },
                },
                ...(item.quantity
                  ? [
                      {
                        Type: { Text: "QUANTITY" },
                        ValueDetection: { Text: item.quantity },
                      },
                    ]
                  : []),
              ],
            })),
          },
        ],
      },
    ],
  };
}

// Build a response with plain LINE blocks (fallback path)
function makeBlockResponse(lines: string[]) {
  return {
    ExpenseDocuments: [
      {
        LineItemGroups: [],
        Blocks: lines.map((text) => ({ BlockType: "LINE", Text: text })),
      },
    ],
  };
}

function makeService(): AwsTextractReceiptOcrService {
  return new AwsTextractReceiptOcrService();
}

// ── extractLineItems happy path ───────────────────────────────────────────────

describe("AwsTextractReceiptOcrService — extractLineItems", () => {
  it("returns extracted lines with name and price from line-item groups", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    send.mockResolvedValue(makeLineItemResponse([{ name: "Greek Yogurt", price: "1.29" }]));

    const lines = await svc.extractLines(makeParams());

    expect(lines).toHaveLength(1);
    expect(lines[0].rawName).toBe("Greek Yogurt");
    expect(lines[0].unitPriceEur).toBe(1.29);
  });

  it("extracts quantity when present in the line item", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    send.mockResolvedValue(
      makeLineItemResponse([{ name: "Milk", price: "0.89", quantity: "2" }]),
    );

    const lines = await svc.extractLines(makeParams());

    expect(lines[0].quantity).toBe(2);
    expect(lines[0].rawName).toBe("Milk");
  });

  it("parses decimal quantities like '1.5 l'", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    send.mockResolvedValue(
      makeLineItemResponse([{ name: "Orange Juice", price: "1.99", quantity: "1.5 l" }]),
    );

    const lines = await svc.extractLines(makeParams());

    expect(lines[0].quantity).toBe(1.5);
    expect(lines[0].unit).toBe("l");
  });

  it("parses decimal quantities with comma separator like '0,5 kg'", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    send.mockResolvedValue(
      makeLineItemResponse([{ name: "Cheese", price: "3.20", quantity: "0,5 kg" }]),
    );

    const lines = await svc.extractLines(makeParams());

    expect(lines[0].quantity).toBe(0.5);
    expect(lines[0].unit).toBe("kg");
  });

  it("routes TOTAL_PRICE field to lineTotalEur, not unitPriceEur", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    send.mockResolvedValue({
      ExpenseDocuments: [
        {
          LineItemGroups: [
            {
              LineItems: [
                {
                  LineItemExpenseFields: [
                    { Type: { Text: "ITEM" }, ValueDetection: { Text: "Bread" } },
                    { Type: { Text: "TOTAL_PRICE" }, ValueDetection: { Text: "2.50" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const lines = await svc.extractLines(makeParams());
    expect(lines[0].lineTotalEur).toBe(2.5);
    expect(lines[0].unitPriceEur).toBeUndefined();
  });

  it("ignores line items with no name field", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    send.mockResolvedValue({
      ExpenseDocuments: [
        {
          LineItemGroups: [
            {
              LineItems: [
                {
                  LineItemExpenseFields: [
                    { Type: { Text: "PRICE" }, ValueDetection: { Text: "9.99" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const lines = await svc.extractLines(makeParams());
    expect(lines).toHaveLength(0);
  });
});

// ── extractPlainLines fallback ────────────────────────────────────────────────

describe("AwsTextractReceiptOcrService — extractPlainLines fallback", () => {
  it("falls back to block-level lines when no line-item groups are present", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    send.mockResolvedValue(makeBlockResponse(["Bread", "Butter"]));

    const lines = await svc.extractLines(makeParams());

    expect(lines.map((l) => l.rawName)).toEqual(["Bread", "Butter"]);
  });

  it("skips blocks that are not of type LINE", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    send.mockResolvedValue({
      ExpenseDocuments: [
        {
          LineItemGroups: [],
          Blocks: [
            { BlockType: "WORD", Text: "ignored" },
            { BlockType: "LINE", Text: "Milk" },
          ],
        },
      ],
    });

    const lines = await svc.extractLines(makeParams());
    expect(lines).toHaveLength(1);
    expect(lines[0].rawName).toBe("Milk");
  });

  it("caps fallback results at 40 lines", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    const manyLines = Array.from({ length: 60 }, (_, i) => `item-${i}`);
    send.mockResolvedValue(makeBlockResponse(manyLines));

    const lines = await svc.extractLines(makeParams());
    expect(lines).toHaveLength(40);
  });
});

// ── parseMoneyValue edge cases ────────────────────────────────────────────────
// Tested indirectly through extractLineItems, which calls parseMoneyValue for
// PRICE/TOTAL fields.

describe("AwsTextractReceiptOcrService — parseMoneyValue edge cases", () => {
  async function extractPrice(priceText: string): Promise<number | undefined> {
    const svc = makeService();
    const send = getClientSendMock(svc);
    send.mockResolvedValue(makeLineItemResponse([{ name: "Item", price: priceText }]));
    const lines = await svc.extractLines(makeParams());
    return lines[0]?.unitPriceEur;
  }

  it("parses a plain decimal value", async () => {
    expect(await extractPrice("2.50")).toBe(2.5);
  });

  it("parses comma-decimal notation (European format)", async () => {
    expect(await extractPrice("1,99")).toBe(1.99);
  });

  it("strips the EUR symbol before parsing", async () => {
    expect(await extractPrice("€3.75")).toBe(3.75);
  });

  it("strips the 'eur' label before parsing", async () => {
    expect(await extractPrice("5.00 EUR")).toBe(5.0);
  });

  it("strips a leading minus sign (OCR artefact) and returns the numeric value", async () => {
    // The implementation strips all non-digit/dot chars before parsing, so a
    // spurious OCR minus sign produces the absolute value rather than undefined.
    expect(await extractPrice("-1.00")).toBe(1.0);
  });

  it("returns undefined for non-numeric text", async () => {
    expect(await extractPrice("n/a")).toBeUndefined();
  });
});

// ── Error classification ──────────────────────────────────────────────────────

describe("AwsTextractReceiptOcrService — error classification", () => {
  it("wraps a timeout error code as OcrTimeoutError", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    const err = Object.assign(new Error("timed out"), { name: "TimeoutError" });
    send.mockRejectedValue(err);

    await expect(svc.extractLines(makeParams())).rejects.toThrow(OcrTimeoutError);
  });

  it("wraps RequestTimeout as OcrTimeoutError", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    const err = Object.assign(new Error("timeout"), { name: "RequestTimeout" });
    send.mockRejectedValue(err);

    await expect(svc.extractLines(makeParams())).rejects.toThrow(OcrTimeoutError);
  });

  it("wraps ThrottlingException as OcrTransientError", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    const err = Object.assign(new Error("throttled"), { name: "ThrottlingException" });
    send.mockRejectedValue(err);

    await expect(svc.extractLines(makeParams())).rejects.toThrow(OcrTransientError);
  });

  it("wraps ServiceUnavailableException as OcrTransientError", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    const err = Object.assign(new Error("unavailable"), {
      name: "ServiceUnavailableException",
    });
    send.mockRejectedValue(err);

    await expect(svc.extractLines(makeParams())).rejects.toThrow(OcrTransientError);
  });

  it("rethrows unrecognised errors as-is", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    const err = new Error("unexpected failure");
    send.mockRejectedValue(err);

    await expect(svc.extractLines(makeParams())).rejects.toBe(err);
  });
});
