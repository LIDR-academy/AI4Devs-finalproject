import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { ReceiptProcessingStatus } from "@prisma/client";
import { ReceiptsService } from "./receipts.service";
import { ConfirmReceiptItemsDto } from "./dto/confirm-receipt-items.dto";

// ── Shared stubs ─────────────────────────────────────────────────────────────

function makeService(overrides: {
  prisma?: Partial<ReturnType<typeof makePrismaMock>>;
  users?: Partial<ReturnType<typeof makeUsersMock>>;
  households?: Partial<ReturnType<typeof makeHouseholdsMock>>;
  storage?: Partial<ReturnType<typeof makeStorageMock>>;
  ocr?: Partial<ReturnType<typeof makeOcrMock>>;
} = {}): ReceiptsService {
  const prisma = { ...makePrismaMock(), ...overrides.prisma };
  const users = { ...makeUsersMock(), ...overrides.users };
  const households = { ...makeHouseholdsMock(), ...overrides.households };
  const storage = { ...makeStorageMock(), ...overrides.storage };
  const ocr = { ...makeOcrMock(), ...overrides.ocr };

  return new ReceiptsService(
    prisma as never,
    users as never,
    households as never,
    makeExpirationMock() as never,
    makeMetricsMock() as never,
    storage as never,
    ocr as never,
  );
}

function makePrismaMock() {
  return {
    receipt: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    receiptItem: {
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    pantryItem: { create: jest.fn() },
    $transaction: jest.fn(async (fn: (tx: unknown) => Promise<void>) => fn({
      receiptItem: { updateMany: jest.fn(), update: jest.fn() },
      receipt: { update: jest.fn() },
      pantryItem: { create: jest.fn() },
    })),
  };
}

function makeUsersMock() {
  return { findById: jest.fn().mockResolvedValue({ id: "user-1" }) };
}

function makeHouseholdsMock() {
  return {
    getActiveHouseholdId: jest.fn().mockResolvedValue("hh-1"),
    getHouseholdMemberUserIds: jest.fn().mockResolvedValue(["user-1"]),
  };
}

function makeExpirationMock() {
  return {
    buildEstimate: jest.fn().mockReturnValue({
      suggestedExpirationDate: new Date("2026-12-31"),
    }),
  };
}

function makeMetricsMock() {
  return { increment: jest.fn(), observeDuration: jest.fn() };
}

function makeStorageMock() {
  return {
    savePrivate: jest.fn().mockResolvedValue({ bucket: "b", key: "k" }),
  };
}

function makeOcrMock() {
  return {
    extractLines: jest.fn().mockResolvedValue([{ rawName: "Yogurt" }]),
  };
}

const VALID_FILE = {
  buffer: Buffer.from("data"),
  mimetype: "image/jpeg" as const,
  originalname: "r.jpg",
  size: 1024,
};

// ── requireValidFile (tested via uploadAndProcess) ────────────────────────────

describe("ReceiptsService — requireValidFile", () => {
  it("throws BadRequestException when no file is provided", async () => {
    const svc = makeService();
    await expect(svc.uploadAndProcess("user-1", undefined)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("throws BadRequestException for an unsupported MIME type", async () => {
    const svc = makeService();
    const file = { ...VALID_FILE, mimetype: "text/html" };
    await expect(svc.uploadAndProcess("user-1", file)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("throws BadRequestException when file exceeds 8 MB", async () => {
    const svc = makeService();
    const file = { ...VALID_FILE, size: 8 * 1024 * 1024 + 1 };
    await expect(svc.uploadAndProcess("user-1", file)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("accepts valid file types (png, jpeg, pdf) and reaches storage", async () => {
    const storage = makeStorageMock();
    const prisma = makePrismaMock();
    prisma.receipt.create.mockResolvedValue({ id: "rcpt-1" });
    prisma.receipt.update.mockResolvedValue({ id: "rcpt-1" });
    prisma.receipt.findFirst.mockResolvedValue({
      id: "rcpt-1",
      ocrStatus: ReceiptProcessingStatus.COMPLETED,
      userId: "user-1",
      items: [],
    });

    const svc = makeService({ prisma, storage: storage });

    for (const mime of ["image/png", "image/jpeg", "application/pdf"] as const) {
      jest.clearAllMocks();
      prisma.receipt.create.mockResolvedValue({ id: "rcpt-1" });
      prisma.receipt.update.mockResolvedValue({ id: "rcpt-1" });
      prisma.receipt.findFirst.mockResolvedValue({
        id: "rcpt-1",
        ocrStatus: ReceiptProcessingStatus.COMPLETED,
        userId: "user-1",
        items: [],
      });
      storage.savePrivate.mockResolvedValue({ bucket: "b", key: "k" });

      await svc.uploadAndProcess("user-1", { ...VALID_FILE, mimetype: mime });
      expect(storage.savePrivate).toHaveBeenCalledTimes(1);
    }
  });

  it("throws ForbiddenException when the user cannot be found", async () => {
    const svc = makeService({
      users: { findById: jest.fn().mockResolvedValue(null) },
    });
    await expect(svc.uploadAndProcess("ghost", VALID_FILE)).rejects.toThrow(
      ForbiddenException,
    );
  });
});

// ── confirmItems guards ───────────────────────────────────────────────────────

function makeConfirmedReceipt(extra: Partial<object> = {}) {
  return {
    id: "rcpt-1",
    userId: "user-1",
    ocrStatus: ReceiptProcessingStatus.COMPLETED,
    confirmedAt: new Date(),
    items: [{ id: "item-1", rawName: "Milk", userConfirmed: false }],
    ...extra,
  };
}

function makeUnconfirmedReceipt() {
  return {
    id: "rcpt-1",
    userId: "user-1",
    ocrStatus: ReceiptProcessingStatus.COMPLETED,
    confirmedAt: null,
    items: [{ id: "item-1", rawName: "Milk", userConfirmed: false }],
  };
}

describe("ReceiptsService — confirmItems", () => {
  it("throws ConflictException (409) when the receipt has already been confirmed", async () => {
    const prisma = makePrismaMock();
    prisma.receipt.findFirst.mockResolvedValue(makeConfirmedReceipt());
    const svc = makeService({ prisma });

    const dto: ConfirmReceiptItemsDto = { itemIds: ["item-1"] };
    await expect(svc.confirmItems("user-1", "rcpt-1", dto)).rejects.toThrow(
      ConflictException,
    );
  });

  it("throws BadRequestException (400) when an itemId does not belong to the receipt", async () => {
    const prisma = makePrismaMock();
    prisma.receipt.findFirst.mockResolvedValue(makeUnconfirmedReceipt());
    const svc = makeService({ prisma });

    const dto: ConfirmReceiptItemsDto = { itemIds: ["item-does-not-exist"] };
    await expect(svc.confirmItems("user-1", "rcpt-1", dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("throws BadRequestException (400) when an itemOverride id does not belong to the receipt", async () => {
    const prisma = makePrismaMock();
    prisma.receipt.findFirst.mockResolvedValue(makeUnconfirmedReceipt());
    const svc = makeService({ prisma });

    const dto: ConfirmReceiptItemsDto = {
      itemIds: ["item-1"],
      itemOverrides: [{ itemId: "stranger-item" }],
    };
    await expect(svc.confirmItems("user-1", "rcpt-1", dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("throws BadRequestException (400) when OCR has not completed yet", async () => {
    const prisma = makePrismaMock();
    prisma.receipt.findFirst.mockResolvedValue({
      ...makeUnconfirmedReceipt(),
      ocrStatus: ReceiptProcessingStatus.PROCESSING,
    });
    const svc = makeService({ prisma });

    const dto: ConfirmReceiptItemsDto = { itemIds: ["item-1"] };
    await expect(svc.confirmItems("user-1", "rcpt-1", dto)).rejects.toThrow(
      BadRequestException,
    );
  });
});
