/**
 * Shared loader and types for case bundle (data/2026-03-16-expenses.json).
 * Reads seed from global-setup (tests/e2e/.auth/seed.json) so no env is required.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const BUNDLE_PATH = resolve(process.cwd(), 'data', '2026-03-16-expenses.json');
const SEED_PATH = resolve(process.cwd(), 'tests', 'e2e', '.auth', 'seed.json');

/** E2E test user credentials; must match global-setup so login works in browser. */
export const E2E_TEST_EMAIL = 'e2e-test@travelsplit.local';
export const E2E_TEST_PASSWORD = 'E2eTest123';

export interface Seed {
  AUTH_TOKEN?: string;
  TEST_TRIP_ID?: string;
  TEST_EXPENSE_ID?: string;
  TEST_USER_ID?: string;
  error?: string;
}

let cachedSeed: Seed | null = null;

function readSeed(): Seed {
  if (cachedSeed !== null) return cachedSeed;
  if (!existsSync(SEED_PATH)) {
    cachedSeed = {};
    return cachedSeed;
  }
  try {
    cachedSeed = JSON.parse(readFileSync(SEED_PATH, 'utf8')) as Seed;
  } catch {
    cachedSeed = {};
  }
  return cachedSeed;
}

export function getSeed(): Seed {
  return readSeed();
}

export function getAuthToken(): string {
  const seed = readSeed();
  return seed.AUTH_TOKEN ?? process.env.AUTH_TOKEN ?? '';
}

export interface ExpectedNetwork {
  status: number;
}

export interface ExpectedUiToast {
  toast: string;
}

export interface ExpectedUiErrorFields {
  errorFields: Record<string, string>;
}

export interface ExpectedState {
  route?: string;
  screen?: string;
  [key: string]: unknown;
}

export interface CaseExpected {
  network: ExpectedNetwork;
  ui: ExpectedUiToast | ExpectedUiErrorFields;
  state: ExpectedState;
}

export interface ApiRequest {
  method: string;
  path: string;
  body?: Record<string, unknown>;
  query?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

export interface E2EStep {
  order: number;
  action: string;
  target?: string;
  value?: string;
  expected?: string;
}

export interface BundleCase {
  id: string;
  name: string;
  description: string;
  type: string;
  request?: ApiRequest;
  expect?: { statusCode: number };
  steps?: E2EStep[];
  expected: CaseExpected;
}

export interface Bundle {
  id: string;
  name: string;
  version: string;
  cases: BundleCase[];
}

export function loadBundle(): Bundle {
  const raw = readFileSync(BUNDLE_PATH, 'utf8');
  const bundle = JSON.parse(raw) as Bundle;
  if (!bundle.cases || !Array.isArray(bundle.cases)) {
    throw new Error('Invalid bundle: missing or invalid cases array');
  }
  return bundle;
}

export function substitutePath(path: string): string {
  const seed = readSeed();
  const tripId = seed.TEST_TRIP_ID ?? process.env.TEST_TRIP_ID ?? '00000000-0000-0000-0000-000000000001';
  const expenseId = seed.TEST_EXPENSE_ID ?? process.env.TEST_EXPENSE_ID ?? '00000000-0000-0000-0000-000000000002';
  return path
    .replace(/\{trip_id\}/g, tripId)
    .replace(/\{expense_id\}/g, expenseId);
}

export function hasErrorFields(ui: CaseExpected['ui']): ui is ExpectedUiErrorFields {
  return typeof ui === 'object' && ui !== null && 'errorFields' in ui;
}

export function hasToast(ui: CaseExpected['ui']): ui is ExpectedUiToast {
  return typeof ui === 'object' && ui !== null && 'toast' in ui;
}
