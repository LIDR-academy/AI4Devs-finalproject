import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';

const { mockPrisma } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mock: any = {
    user: { upsert: vi.fn() },
    purchaseProcess: { findFirst: vi.fn(), create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
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

function setupAnalyzeMock(overrides: Record<string, unknown> = {}) {
  mockPrisma.purchaseProcess.findFirst.mockResolvedValue(
    overrides.process ?? null,
  );
  mockPrisma.purchaseProcess.create.mockResolvedValue(
    overrides.createdProcess ?? {
      id: 'proc-new', status: 'ACTIVE', currentStage: 'PRE_ARRAS',
      propertyPrice: null, sourceListingId: null,
      userId: 'test-user', financialProfile: null,
      createdAt: ANY_DATE, updatedAt: ANY_DATE,
    },
  );
  mockPrisma.analyzedListing.findFirst.mockResolvedValue(null);
  mockPrisma.analyzedListing.create.mockResolvedValue({
    id: 'list-contract', processId: 'proc-new', url: 'manual://text-only',
    sourceHash: 'hash-abc', previousHash: null, diff: null,
    price: 200000, squareMeters: 80, transparencyScore: 62, scoreLabel: 'media',
    omissions: {}, positiveSignals: {}, summary: 'Resumen',
    declaredAddress: 'Calle Test 1', coordinates: { lat: 40.4, lng: -3.7 },
    catastroMatch: { cadastralRef: '1234567VK4797N', cadastralM2: 78, claimedM2: 80 },
    createdAt: ANY_DATE,
    redFlags: [
      { id: 'rf-1', flag: 'vague_location', severity: 'medium', reasoning: 'Ubicación imprecisa' },
    ],
  });
  mockPrisma.checklist.findFirst.mockResolvedValueOnce(null);
  mockPrisma.checklist.create.mockResolvedValue({ id: 'chk-contract' });
  mockPrisma.checklist.findFirst.mockResolvedValue({
    id: 'chk-contract', processId: 'proc-new',
    items: [{ id: 'ci-1', stage: 'PRE_ARRAS', title: 'Nota simple', description: 'd', documentsNeeded: [], estimatedDays: 3, completed: false, completedAt: null, sortOrder: 1 }],
  });
}

// ─── Contract: Analyze endpoint ─────────────────────────────────

describe('Contract: POST /api/listings/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prepare();
    setupAnalyzeMock();
  });

  it('responde con la forma esperada del listing', async () => {
    const res = await supertest(app)
      .post('/api/listings/analyze')
      .set('X-Session-Id', TEST_SESSION)
      .send({ manualText: 'Piso en centro, 80m², 200.000€.' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('listing');
    expect(res.body).toHaveProperty('processSummary');

    const listing = res.body.listing;
    expect(typeof listing.id).toBe('string');
    expect(typeof listing.url).toBe('string');
    expect(typeof listing.transparencyScore).toBe('number');
    expect(typeof listing.scoreLabel).toBe('string');
    expect(Array.isArray(listing.redFlags)).toBe(true);
    expect(listing.redFlags.length).toBeGreaterThan(0);
    expect(listing.redFlags[0]).toHaveProperty('flag');
    expect(listing.redFlags[0]).toHaveProperty('severity');
    expect(listing.redFlags[0]).toHaveProperty('reasoning');

    const summary = res.body.processSummary;
    expect(typeof summary.processId).toBe('string');
    expect(typeof summary.isNewProcess).toBe('boolean');
    expect(typeof summary.currentStage).toBe('string');
  });

  it('incluye datos catastrales en el contrato', async () => {
    const res = await supertest(app)
      .post('/api/listings/analyze')
      .set('X-Session-Id', TEST_SESSION)
      .send({ manualText: 'Piso, 80m².' });

    expect(res.status).toBe(200);
    expect(res.body.listing.catastroMatch).toBeTruthy();
    expect(res.body.listing.catastroMatch).toHaveProperty('cadastralRef');
    expect(res.body.listing.catastroMatch).toHaveProperty('cadastralM2');
    expect(res.body.listing.catastroMatch).toHaveProperty('claimedM2');
  });
});

// ─── Contract: Dashboard endpoint ───────────────────────────────

describe('Contract: GET /api/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prepare();
  });

  it('responde con forma de estado vacío', async () => {
    mockPrisma.purchaseProcess.findFirst.mockResolvedValue(null);

    const res = await supertest(app)
      .get('/api/dashboard')
      .set('X-Session-Id', TEST_SESSION);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('empty', true);
    expect(res.body).toHaveProperty('ctas');
    expect(Array.isArray(res.body.ctas)).toBe(true);
    expect(res.body.ctas.length).toBeGreaterThanOrEqual(1);
    expect(res.body.ctas[0]).toHaveProperty('label');
    expect(res.body.ctas[0]).toHaveProperty('href');
  });

  it('responde con forma de proceso activo', async () => {
    mockPrisma.purchaseProcess.findFirst.mockResolvedValue({
      id: 'proc-contract', userId: 'test-user',
      status: 'ACTIVE', currentStage: 'ARRAS', propertyPrice: 200000,
      sourceListingId: null, financialProfile: null,
      createdAt: ANY_DATE, updatedAt: ANY_DATE,
      analyzedListings: [{
        id: 'list-1', processId: 'proc-contract', url: 'https://x.com',
        sourceHash: 'h', previousHash: null, diff: null,
        price: 200000, squareMeters: 80, transparencyScore: 82,
        scoreLabel: 'excelente', omissions: {}, positiveSignals: {},
        summary: null, declaredAddress: null, coordinates: null,
        catastroMatch: null, createdAt: ANY_DATE,
        redFlags: [{ id: 'rf-1', flag: 'vague_location', severity: 'low', reasoning: 'x' }],
      }],
      checklists: [{
        id: 'chk-1', processId: 'proc-contract', templateName: 'compra',
        items: [
          { id: 'ci-1', checklistId: 'chk-1', completed: true },
          { id: 'ci-2', checklistId: 'chk-1', completed: false },
        ],
      }],
    });

    const res = await supertest(app)
      .get('/api/dashboard')
      .set('X-Session-Id', TEST_SESSION);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('empty', false);
    expect(res.body).toHaveProperty('process');
    expect(res.body.process).toHaveProperty('id', 'proc-contract');
    expect(res.body).toHaveProperty('latestListing');
    expect(res.body.latestListing).toHaveProperty('transparencyScore', 82);
    expect(res.body).toHaveProperty('checklist');
    expect(typeof res.body.checklist.totalItems).toBe('number');
  });
});

// ─── Contract: Negotiation-points endpoint ──────────────────────

describe('Contract: GET /api/listings/:id/negotiation-points', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prepare();
  });

  it('responde con forma de negotiation points cuando el listing existe', async () => {
    const listingId = '00000000-0000-0000-0000-000000000001';
    mockPrisma.analyzedListing.findFirst.mockResolvedValue({
      id: 'list-neg', processId: 'proc-1', url: 'https://example.com/piso',
      sourceHash: 'h', previousHash: null, diff: null,
      price: 200000, squareMeters: 80, transparencyScore: 38,
      scoreLabel: 'baja', omissions: {}, positiveSignals: {},
      summary: null, declaredAddress: 'Calle Test', coordinates: null,
      catastroMatch: null, createdAt: ANY_DATE,
      redFlags: [
        { id: 'rf-1', flag: 'vague_location', severity: 'medium', reasoning: 'Dirección imprecisa' },
        { id: 'rf-2', flag: 'missing_energy_certificate', severity: 'high', reasoning: 'Sin CEE' },
      ],
      process: { userId: 'test-user' },
    });

    const res = await supertest(app)
      .get(`/api/listings/${listingId}/negotiation-points`)
      .set('X-Session-Id', TEST_SESSION);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('points');
    expect(Array.isArray(res.body.points)).toBe(true);
    expect(res.body.points.length).toBeGreaterThanOrEqual(5);
    expect(res.body.points.length).toBeLessThanOrEqual(8);

    const point = res.body.points[0];
    expect(point).toHaveProperty('category');
    expect(point).toHaveProperty('question');
    expect(point).toHaveProperty('rationale');
  });

  it('devuelve 404 para listing que no existe', async () => {
    mockPrisma.analyzedListing.findFirst.mockResolvedValue(null);

    const res = await supertest(app)
      .get('/api/listings/00000000-0000-0000-0000-00000000abcd/negotiation-points')
      .set('X-Session-Id', TEST_SESSION);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'NOT_FOUND' });
  });
});
