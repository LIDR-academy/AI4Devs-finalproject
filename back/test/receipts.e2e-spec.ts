import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ReceiptProcessingStatus } from "@prisma/client";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";
import {
  RECEIPT_OCR_PORT,
  RECEIPT_STORAGE_PORT,
} from "../src/modules/receipts/ports/receipt-ports";

interface UserRecord {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PantryRecord {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expirationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface ReceiptItemRecord {
  id: string;
  rawName: string;
  quantity: number | null;
  unit: string | null;
  userConfirmed: boolean;
  createdAt: Date;
  receiptId: string;
  pantryItemId: string | null;
}

interface ReceiptRecord {
  id: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  storageBucket: string;
  storageKey: string;
  ocrStatus: ReceiptProcessingStatus;
  ocrError: string | null;
  processedAt: Date | null;
  confirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  householdId: string | null;
}

describe("Receipts (e2e)", () => {
  let app: INestApplication;

  const usersById = new Map<string, UserRecord>();
  const usersByEmail = new Map<string, UserRecord>();
  const pantryItemsById = new Map<string, PantryRecord>();
  const receiptsById = new Map<string, ReceiptRecord>();
  const receiptItemsById = new Map<string, ReceiptItemRecord>();

  let prismaMock: any;

  const storageMock = {
    savePrivate: jest.fn(async () => ({
      bucket: "test-receipts",
      key: `receipts/${randomUUID()}.png`,
    })),
  };

  const ocrMock = {
    extractLines: jest.fn(async () => [
      { rawName: "Milk 1L", quantity: 1, unit: "l" },
      { rawName: "Eggs x6", quantity: 6, unit: "unit" },
    ]),
  };

  prismaMock = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $transaction: jest.fn(async (callback: any) => callback(prismaMock)),
    householdMember: {
      findFirst: jest.fn(async () => null),
      findMany: jest.fn(async () => []),
    },
    user: {
      findUnique: jest.fn(
        async ({ where }: { where: { id?: string; email?: string } }) => {
          if (where.id) {
            return usersById.get(where.id) ?? null;
          }

          if (where.email) {
            return usersByEmail.get(where.email) ?? null;
          }

          return null;
        },
      ),
      create: jest.fn(
        async ({ data }: { data: { email: string; password: string } }) => {
          const now = new Date();
          const created: UserRecord = {
            id: randomUUID(),
            email: data.email,
            password: data.password,
            createdAt: now,
            updatedAt: now,
          };
          usersById.set(created.id, created);
          usersByEmail.set(created.email, created);
          return created;
        },
      ),
    },
    pantryItem: {
      create: jest.fn(
        async ({
          data,
        }: {
          data: {
            userId: string;
            name: string;
            quantity: number;
            unit: string;
            expirationDate?: Date | null;
          };
        }) => {
          const now = new Date();
          const created: PantryRecord = {
            id: randomUUID(),
            userId: data.userId,
            name: data.name,
            quantity: data.quantity,
            unit: data.unit,
            expirationDate: data.expirationDate ?? null,
            createdAt: now,
            updatedAt: now,
          };
          pantryItemsById.set(created.id, created);
          return created;
        },
      ),
    },
    receipt: {
      create: jest.fn(
        async ({
          data,
        }: {
          data: {
            userId: string;
            householdId?: string | null;
            originalFilename: string;
            mimeType: string;
            sizeBytes: number;
            storageBucket: string;
            storageKey: string;
            ocrStatus: ReceiptProcessingStatus;
          };
        }) => {
          const now = new Date();
          const created: ReceiptRecord = {
            id: randomUUID(),
            userId: data.userId,
            householdId: data.householdId ?? null,
            originalFilename: data.originalFilename,
            mimeType: data.mimeType,
            sizeBytes: data.sizeBytes,
            storageBucket: data.storageBucket,
            storageKey: data.storageKey,
            ocrStatus: data.ocrStatus,
            ocrError: null,
            processedAt: null,
            confirmedAt: null,
            createdAt: now,
            updatedAt: now,
          };
          receiptsById.set(created.id, created);
          return created;
        },
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: {
            ocrStatus?: ReceiptProcessingStatus;
            ocrError?: string;
            processedAt?: Date;
            confirmedAt?: Date;
            items?: {
              create: Array<{
                rawName: string;
                normalizedName?: string;
                quantity?: number | null;
                unit?: string | null;
              }>;
            };
          };
        }) => {
          const current = receiptsById.get(where.id);
          if (!current) {
            throw new Error("Receipt not found");
          }

          const updated: ReceiptRecord = {
            ...current,
            ocrStatus: data.ocrStatus ?? current.ocrStatus,
            ocrError: data.ocrError ?? current.ocrError,
            processedAt: data.processedAt ?? current.processedAt,
            confirmedAt: data.confirmedAt ?? current.confirmedAt,
            updatedAt: new Date(),
          };
          receiptsById.set(where.id, updated);

          if (data.items?.create) {
            data.items.create.forEach((line) => {
              const item: ReceiptItemRecord = {
                id: randomUUID(),
                rawName: line.rawName,
                quantity: line.quantity ?? null,
                unit: line.unit ?? null,
                userConfirmed: false,
                createdAt: new Date(),
                receiptId: where.id,
                pantryItemId: null,
              };
              receiptItemsById.set(item.id, item);
            });
          }

          return updated;
        },
      ),
      findFirst: jest.fn(
        async ({
          where,
        }: {
          where: { id: string; userId: string | { in: string[] } };
          include: { items: { orderBy: { createdAt: "asc" } } };
        }) => {
          const receipt = receiptsById.get(where.id);
          const allowedUserIds =
            typeof where.userId === "object" ? where.userId.in : [where.userId];
          if (!receipt || !allowedUserIds.includes(receipt.userId)) {
            return null;
          }

          const items = [...receiptItemsById.values()]
            .filter((item) => item.receiptId === receipt.id)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

          return {
            ...receipt,
            items,
          };
        },
      ),
    },
    receiptItem: {
      updateMany: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { receiptId: string; id: { in: string[] } };
          data: { userConfirmed: boolean };
        }) => {
          let count = 0;
          where.id.in.forEach((itemId) => {
            const item = receiptItemsById.get(itemId);
            if (!item || item.receiptId !== where.receiptId) {
              return;
            }
            receiptItemsById.set(itemId, {
              ...item,
              userConfirmed: data.userConfirmed,
            });
            count += 1;
          });

          return { count };
        },
      ),
      update: jest.fn(
        async ({ where, data }: { where: { id: string }; data: { pantryItemId: string } }) => {
          const item = receiptItemsById.get(where.id);
          if (!item) {
            throw new Error("Item not found");
          }
          const updated = {
            ...item,
            pantryItemId: data.pantryItemId,
          };
          receiptItemsById.set(where.id, updated);
          return updated;
        },
      ),
    },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(RECEIPT_STORAGE_PORT)
      .useValue(storageMock)
      .overrideProvider(RECEIPT_OCR_PORT)
      .useValue(ocrMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    usersById.clear();
    usersByEmail.clear();
    pantryItemsById.clear();
    receiptsById.clear();
    receiptItemsById.clear();
    storageMock.savePrivate.mockClear();
    ocrMock.extractLines.mockClear();
  });

  afterAll(async () => {
    await app.close();
  });

  it("uploads, processes, and confirms receipt items", async () => {
    const registerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "receipt@example.com", password: "password123" })
      .expect(201);

    const token = registerResponse.body.accessToken as string;

    const uploadResponse = await request(app.getHttpServer())
      .post("/api/receipts/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("Milk 1L\nEggs x6"), {
        filename: "receipt.png",
        contentType: "image/png",
      })
      .expect(201);

    expect(uploadResponse.body.ocrStatus).toBe("COMPLETED");
    expect(uploadResponse.body.items.length).toBeGreaterThan(0);

    const receiptId = uploadResponse.body.id as string;
    const itemIds = uploadResponse.body.items.map((item: { id: string }) => item.id);

    const statusResponse = await request(app.getHttpServer())
      .get(`/api/receipts/${receiptId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(statusResponse.body.ocrStatus).toBe("COMPLETED");

    const confirmResponse = await request(app.getHttpServer())
      .post(`/api/receipts/${receiptId}/confirm-items`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        itemIds,
        addToPantry: true,
      })
      .expect(201);

    expect(confirmResponse.body.items.every((item: { userConfirmed: boolean }) => item.userConfirmed)).toBe(true);
    expect(pantryItemsById.size).toBe(itemIds.length);
  });

  it("returns 400 for unsupported file type", async () => {
    const registerResponse = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "bad-file@example.com", password: "password123" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/receipts/upload")
      .set("Authorization", `Bearer ${registerResponse.body.accessToken as string}`)
      .attach("file", Buffer.from("bad"), {
        filename: "script.txt",
        contentType: "text/plain",
      })
      .expect(400);
  });

  it("returns 401 when token is missing", async () => {
    await request(app.getHttpServer())
      .post("/api/receipts/upload")
      .attach("file", Buffer.from("abc"), {
        filename: "receipt.png",
        contentType: "image/png",
      })
      .expect(401);
  });
});
