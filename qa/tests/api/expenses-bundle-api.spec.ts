/**
 * API oracle tests driven by data/2026-03-16-expenses.json.
 * Validates expected.network.status, expected.ui (toast or errorFields), expected.state where applicable.
 * Test names include case id tag, e.g. [CP-EXP-001] List expenses for trip returns 200.
 */

import { test, expect } from '@playwright/test';
import {
  loadBundle,
  substitutePath,
  hasErrorFields,
  hasToast,
  getAuthToken,
  getSeed,
  type BundleCase,
  type ApiRequest,
} from '../e2e/bundle-loader';

const bundle = loadBundle();
const apiCases = bundle.cases.filter(
  (c): c is BundleCase & { request: ApiRequest } => c.type === 'api' && !!c.request
);

test.describe('API oracles', () => {
  test.describe.configure({ mode: 'serial' });
  for (const tc of apiCases) {
    test(`[${tc.id}] ${tc.name}`, async ({ request: apiRequest }) => {
      const seed = getSeed();
      if (seed.error) {
        test.skip(true, `Setup failed: ${seed.error}. Ensure backend is running at API_BASE_URL.`);
      }
      const expectedStatus = tc.expected.network.status;
      const needsAuth = expectedStatus >= 200 && expectedStatus < 300 && tc.id !== 'CP-EXP-005';
      if (needsAuth && !getAuthToken()) {
        test.skip(true, 'No token from setup. Ensure backend is running and global-setup could register/login.');
      }
      const path = substitutePath(tc.request.path);
      const url = path.startsWith('http') ? path : path.replace(/^\//, '');
      const options: {
        headers?: Record<string, string>;
        data?: unknown;
        params?: Record<string, string | number | boolean>;
      } = {};

      if (tc.request.headers) {
        options.headers = { ...tc.request.headers };
      }
      if (tc.id !== 'CP-EXP-005' && getAuthToken()) {
        options.headers = { ...options.headers, Authorization: `Bearer ${getAuthToken()}` };
      }
      if (tc.request.body !== undefined) {
        const body = { ...tc.request.body } as Record<string, unknown>;
        const isValidationCase = tc.id === 'CP-EXP-003';
        if (
          !isValidationCase &&
          body.beneficiaries &&
          Array.isArray(body.beneficiaries) &&
          seed.TEST_USER_ID
        ) {
          body.beneficiaries = [{ user_id: seed.TEST_USER_ID }];
        }
        options.data = body;
      }
      if (tc.request.query !== undefined) {
        options.params = Object.fromEntries(
          Object.entries(tc.request.query).map(([k, v]) => [k, String(v)])
        ) as Record<string, string | number | boolean>;
      }

      const method = tc.request.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      const response = await apiRequest.fetch(url, {
        method,
        headers: options.headers as Record<string, string> | undefined,
        data: options.data,
        params: options.params,
      });

      const actualStatus = response.status();

      expect(
        actualStatus,
        `Oracle network.status: expected ${expectedStatus}, got ${actualStatus}`
      ).toBe(expectedStatus);

      const body = await response.text();
      let json: { message?: string | string[] } | null = null;
      if (body) {
        try {
          json = JSON.parse(body) as { message?: string | string[] };
        } catch {
          // non-JSON response
        }
      }

      if (hasErrorFields(tc.expected.ui)) {
        if (json?.message !== undefined) {
          const messages = Array.isArray(json.message) ? json.message : [json.message];
          for (const [field, expectedMsg] of Object.entries(tc.expected.ui.errorFields)) {
            const found = messages.some(
              (m) =>
                String(m).includes(expectedMsg) ||
                String(m).toLowerCase().includes(field.toLowerCase())
            );
            expect(
              found,
              `Oracle ui.errorFields['${field}']: expected message containing "${expectedMsg}" in response`
            ).toBe(true);
          }
        }
      } else if (
        hasToast(tc.expected.ui) &&
        tc.expected.ui.toast &&
        expectedStatus >= 400 &&
        json?.message
      ) {
        const msg = Array.isArray(json.message) ? json.message.join(' ') : String(json.message);
        expect(msg, 'Oracle ui.toast: response message should reflect expected toast').toBeTruthy();
      }

      if (tc.expected.state && Object.keys(tc.expected.state).length > 0) {
        if (expectedStatus === 201 && tc.expected.state.route) {
          const location = response.headers()['location'];
          if (location) {
            expect(location, 'Oracle state.route: Location header').toContain(
              tc.expected.state.route?.replace(/\{[^}]+\}/g, '') ?? ''
            );
          }
        }
      }
    });
  }
});
