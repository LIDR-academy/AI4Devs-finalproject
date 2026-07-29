import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';

const { mockPrisma } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mock: any = {
    user: { upsert: vi.fn() },
    purchaseProcess: { findFirst: vi.fn(), create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
    analyzedListing: { findFirst: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
    checklist: { findFirst: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    checklistItem: { update: vi.fn(), findUnique: vi.fn() },
    rateLimitCounter: { upsert: vi.fn() },
    redFlag: { createMany: vi.fn() },
    $transaction: vi.fn((fn: (p: unknown) => unknown) => fn(mock)),
  };
  return { mockPrisma: mock };
});

vi.mock('../../src/infrastructure/prisma/client', () => ({
  prisma: mockPrisma,
}));

import { app } from '../../src/index';

const TEST_SESSION = '550e8400-e29b-41d4-a716-446655440001';
const ANY_DATE = new Date('2024-01-01');

function prepare() {
  mockPrisma.user.upsert.mockResolvedValue({
    id: 'test-user', sessionId: TEST_SESSION, userId: null,
    createdAt: ANY_DATE, updatedAt: ANY_DATE,
  });
  mockPrisma.rateLimitCounter.upsert.mockResolvedValue({ count: 1 });
}

function processWithData(overrides: Record<string, unknown> = {}) {
  return {
    id: '00000000-0000-0000-0000-000000000000', userId: 'test-user',
    status: 'ACTIVE', currentStage: 'PRE_ARRAS', propertyPrice: null,
    sourceListingId: null, financialProfile: null,
    createdAt: ANY_DATE, updatedAt: ANY_DATE,
    analyzedListings: [], checklists: [],
    ...overrides,
  };
}

// ─── Dashboard ────────────────────────────────────────────────

describe('GET /api/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prepare();
  });

  it('devuelve estado vacío cuando no hay proceso activo (FR-019)', async () => {
    mockPrisma.purchaseProcess.findFirst.mockResolvedValue(null);

    const res = await supertest(app)
      .get('/api/dashboard')
      .set('X-Session-Id', TEST_SESSION);

    expect(res.status).toBe(200);
    expect(res.body.empty).toBe(true);
    expect(res.body.ctas).toHaveLength(2);
  });

  it('devuelve proceso activo con checklist y progreso', async () => {
    mockPrisma.purchaseProcess.findFirst.mockResolvedValue(
      processWithData({
        id: 'proc-1', propertyPrice: 200000, currentStage: 'ARRAS',
        analyzedListings: [{
          id: 'list-1', processId: 'proc-1', url: 'https://x.com', sourceHash: 'h',
          previousHash: null, diff: null, price: 200000, squareMeters: 80,
          transparencyScore: 82, scoreLabel: 'excelente',
          omissions: {}, positiveSignals: {}, summary: null,
          declaredAddress: null, coordinates: null, catastroMatch: null,
          createdAt: ANY_DATE,
          redFlags: [{ id: 'rf-1', flag: 'vague_location', severity: 'low', reasoning: 'x' }],
        }],
        checklists: [{
          id: 'chk-1', processId: 'proc-1', templateName: 'compra',
          items: [
            { id: 'ci-1', checklistId: 'chk-1', completed: true },
            { id: 'ci-2', checklistId: 'chk-1', completed: false },
          ],
        }],
      }),
    );

    const res = await supertest(app)
      .get('/api/dashboard')
      .set('X-Session-Id', TEST_SESSION);

    expect(res.status).toBe(200);
    expect(res.body.empty).toBe(false);
    expect(res.body.process.id).toBe('proc-1');
    expect(res.body.latestListing.transparencyScore).toBe(82);
    expect(res.body.checklist.totalItems).toBe(2);
  });
});

// ─── Listings ──────────────────────────────────────────────────

describe('POST /api/listings/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prepare();
  });

  it('rechaza petición sin url ni manualText', async () => {
    const res = await supertest(app)
      .post('/api/listings/analyze')
      .set('X-Session-Id', TEST_SESSION)
      .send({});

    expect(res.status).toBe(400);
  });

  it('rechaza URL con formato inválido', async () => {
    const res = await supertest(app)
      .post('/api/listings/analyze')
      .set('X-Session-Id', TEST_SESSION)
      .send({ url: 'no-es-url' });

    expect(res.status).toBe(400);
  });

  it('acepta texto manual y devuelve análisis (OpenRouter mock)', async () => {
    mockPrisma.purchaseProcess.findFirst.mockResolvedValue(null);
    mockPrisma.purchaseProcess.create.mockResolvedValue(
      processWithData({ id: 'proc-new' }),
    );
    mockPrisma.analyzedListing.findFirst.mockResolvedValue(null);
    mockPrisma.analyzedListing.create.mockResolvedValue({
      id: 'list-new', processId: 'proc-new', url: 'manual://text-only',
      sourceHash: 'hash', previousHash: null, diff: null,
      price: null, squareMeters: null, transparencyScore: 62, scoreLabel: 'media',
      omissions: {}, positiveSignals: {}, summary: null,
      declaredAddress: null, coordinates: null, catastroMatch: null,
      createdAt: ANY_DATE,
      redFlags: [{ id: 'rf-1', flag: 'vague_location', severity: 'medium', reasoning: 'mock' }],
    });
    mockPrisma.checklist.findFirst.mockResolvedValueOnce(null);
    mockPrisma.checklist.create.mockResolvedValue({ id: 'chk-new' });
    mockPrisma.checklist.findFirst.mockResolvedValue({
      id: 'chk-new', processId: 'proc-new',
      items: [{ id: 'ci-1', stage: 'PRE_ARRAS', title: 't', description: 'd', documentsNeeded: [], estimatedDays: 1, completed: false, completedAt: null, sortOrder: 0 }],
    });

    const res = await supertest(app)
      .post('/api/listings/analyze')
      .set('X-Session-Id', TEST_SESSION)
      .send({ manualText: 'Piso en centro, 80m², 200.000€. Sin certificado energético.' });

    expect(res.status).toBe(200);
    expect(res.body.listing).toBeDefined();
    expect(res.body.listing.redFlags).toBeDefined();
    expect(res.body.processSummary).toBeDefined();
    expect(res.body.processSummary.isNewProcess).toBe(true);
  });

  it('adjunta al proceso activo existente', async () => {
    mockPrisma.purchaseProcess.findFirst.mockResolvedValue(
      processWithData({ id: 'proc-exist', propertyPrice: 200000 }),
    );
    mockPrisma.analyzedListing.findFirst.mockResolvedValue(null);
    mockPrisma.analyzedListing.create.mockResolvedValue({
      id: 'list-2', processId: 'proc-exist', url: 'manual://text-only',
      sourceHash: 'hash', previousHash: null, diff: null,
      price: null, squareMeters: null, transparencyScore: 88, scoreLabel: 'excelente',
      omissions: {}, positiveSignals: {}, summary: null,
      declaredAddress: null, coordinates: null, catastroMatch: null,
      createdAt: ANY_DATE, redFlags: [],
    });
    mockPrisma.checklist.findFirst.mockResolvedValueOnce(null);
    mockPrisma.checklist.create.mockResolvedValue({ id: 'chk-exist' });
    mockPrisma.checklist.findFirst.mockResolvedValue({
      id: 'chk-exist', processId: 'proc-exist',
      items: [{ id: 'ci-1', stage: 'PRE_ARRAS', title: 't', description: 'd', documentsNeeded: [], estimatedDays: 1, completed: false, completedAt: null, sortOrder: 0 }],
    });

    const res = await supertest(app)
      .post('/api/listings/analyze')
      .set('X-Session-Id', TEST_SESSION)
      .send({ manualText: 'Ático reformado. 100m². Cert energético B.' });

    expect(res.status).toBe(200);
    expect(res.body.processSummary.isNewProcess).toBe(false);
  });
});

describe('GET /api/listings/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prepare();
  });

  it('devuelve 404 para listing que no existe', async () => {
    mockPrisma.analyzedListing.findFirst.mockResolvedValue(null);

    const res = await supertest(app)
      .get('/api/listings/00000000-0000-0000-0000-00000000abcd')
      .set('X-Session-Id', TEST_SESSION);

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/purchase-processes/active ─────────────────────

describe('DELETE /api/purchase-processes/active', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prepare();
  });

  it('borra el proceso activo y responde 200 OK', async () => {
    mockPrisma.purchaseProcess.deleteMany.mockResolvedValue({ count: 1 });

    const res = await supertest(app)
      .delete('/api/purchase-processes/active')
      .set('X-Session-Id', TEST_SESSION);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(mockPrisma.purchaseProcess.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'test-user', status: 'ACTIVE' },
    });
  });

  it('responde 200 OK incluso sin proceso activo (idempotente)', async () => {
    mockPrisma.purchaseProcess.deleteMany.mockResolvedValue({ count: 0 });

    const res = await supertest(app)
      .delete('/api/purchase-processes/active')
      .set('X-Session-Id', TEST_SESSION);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
