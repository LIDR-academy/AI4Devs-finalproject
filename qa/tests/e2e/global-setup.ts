/**
 * Playwright global setup: creates a test user, trip, and expense so API tests need no manual env.
 * Writes AUTH_TOKEN, TEST_TRIP_ID, TEST_EXPENSE_ID to tests/e2e/.auth/seed.json.
 * If the backend is unreachable, writes { error } so tests can skip with a clear message.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';

const SEED_PATH = resolve(process.cwd(), 'tests', 'e2e', '.auth', 'seed.json');
const API_BASE = (process.env.API_BASE_URL ?? 'http://localhost:3000/api').replace(/\/?$/, '');

const TEST_USER = {
  nombre: 'E2E Test User',
  email: 'e2e-test@travelsplit.local',
  contraseña: 'E2eTest123',
};

async function fetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ status: number; data?: T; message?: string; raw?: string }> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  let data: T | undefined;
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      // ignore
    }
  }
  const msg = data && (data as { message?: string | string[] }).message;
  const message =
    typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join('; ') : undefined;
  return { status: res.status, data, message, raw: text };
}

function parseUrl(url: string): { protocol: string; hostname: string; port: number; path: string } {
  const u = new URL(url);
  const protocol = u.protocol.replace(':', '');
  const port = u.port ? parseInt(u.port, 10) : protocol === 'https' ? 443 : 80;
  return { protocol, hostname: u.hostname, port, path: u.pathname + u.search };
}

async function requestJson<T>(
  url: string,
  method: string,
  body: unknown,
  headers: Record<string, string>
): Promise<{ status: number; data?: T; message?: string; raw?: string }> {
  const { protocol, hostname, port, path } = parseUrl(url);
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  const h = { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr, 'utf8') };
  return new Promise((resolve, reject) => {
    const req = (protocol === 'https' ? httpsRequest : httpRequest)(
      { hostname, port, path, method, headers: h },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let data: T | undefined;
          if (text) {
            try {
              data = JSON.parse(text) as T;
            } catch {
              // ignore
            }
          }
          const msg = data && (data as { message?: string | string[] }).message;
          const message =
            typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join('; ') : undefined;
          resolve({ status: res.statusCode ?? 0, data, message, raw: text });
        });
      }
    );
    req.on('error', reject);
    req.write(bodyStr, 'utf8');
    req.end();
  });
}

export default async function globalSetup(): Promise<void> {
  const seed: {
    AUTH_TOKEN?: string;
    TEST_TRIP_ID?: string;
    TEST_EXPENSE_ID?: string;
    TEST_USER_ID?: string;
    error?: string;
  } = {};

  console.log(`[global-setup] API_BASE=${API_BASE}`);

  try {
    let token: string;
    let userId: string;

    const loginRes = await fetchJson<{ accessToken?: string; user?: { id?: string } }>(
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({
          email: TEST_USER.email,
          contraseña: TEST_USER.contraseña,
        }),
      }
    );

    if (loginRes.status === 200 && loginRes.data?.accessToken && loginRes.data?.user?.id) {
      token = loginRes.data.accessToken;
      userId = loginRes.data.user.id;
      console.log('[global-setup] Login OK');
    } else {
      console.log(`[global-setup] Login ${loginRes.status}, trying register...`);
      const registerRes = await fetchJson<{ accessToken?: string; user?: { id?: string } }>(
        `${API_BASE}/auth/register`,
        {
          method: 'POST',
          body: JSON.stringify(TEST_USER),
        }
      );
      if (registerRes.status !== 201 || !registerRes.data?.accessToken || !registerRes.data?.user?.id) {
        seed.error = `Register failed: ${registerRes.status} ${registerRes.message ?? ''}`;
        console.error(`[global-setup] ${seed.error}`);
        writeSeed(seed);
        return;
      }
      token = registerRes.data.accessToken;
      userId = registerRes.data.user.id;
      console.log('[global-setup] Register OK');
    }

    seed.AUTH_TOKEN = token;
    seed.TEST_USER_ID = userId;
    const authHeader = { Authorization: `Bearer ${token}` };

    const tripRes = await requestJson<{ id?: string }>(
      `${API_BASE}/trips`,
      'POST',
      { name: 'E2E Test Trip' },
      authHeader
    );
    if (tripRes.status !== 201 || !tripRes.data?.id) {
      const detail = tripRes.message ?? (tripRes.raw ? tripRes.raw.slice(0, 200) : '');
      seed.error = `Create trip failed: ${tripRes.status} ${detail}`.trim();
      console.error(`[global-setup] ${seed.error}`);
      writeSeed(seed);
      return;
    }
    seed.TEST_TRIP_ID = tripRes.data.id;
    console.log('[global-setup] Trip created');

    const expenseBody = {
      title: 'E2E seed expense',
      amount: 10000,
      category_id: 1,
      expense_date: new Date().toISOString().slice(0, 10),
      beneficiaries: [{ user_id: userId }],
    };
    const expenseRes = await requestJson<{ id?: string }>(
      `${API_BASE}/trips/${seed.TEST_TRIP_ID}/expenses`,
      'POST',
      expenseBody,
      authHeader
    );
    if (expenseRes.status === 201 && expenseRes.data?.id) {
      seed.TEST_EXPENSE_ID = expenseRes.data.id;
      console.log('[global-setup] Expense created');
    } else {
      console.log(`[global-setup] Expense create ${expenseRes.status} (optional)`);
    }
  } catch (err) {
    seed.error = err instanceof Error ? err.message : String(err);
    console.error('[global-setup]', seed.error);
  }

  writeSeed(seed);
  if (seed.error) {
    console.error('[global-setup] Seed has error; API tests will be skipped. Fix and re-run.');
  } else {
    console.log('[global-setup] Seed written successfully');
  }
}

function writeSeed(seed: Record<string, string | undefined>): void {
  mkdirSync(resolve(process.cwd(), 'tests', 'e2e', '.auth'), { recursive: true });
  writeFileSync(SEED_PATH, JSON.stringify(seed, null, 0), 'utf8');
}
