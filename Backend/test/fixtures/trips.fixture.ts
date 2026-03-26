/**
 * Reusable trip payloads for E2E tests. No HTTP or DB calls.
 */

export const defaultCreateTripPayload = {
  name: 'E2E Test Trip',
  currency: 'COP' as const,
};

export function buildCreateTripPayload(
  overrides: {
    name?: string;
    currency?: 'COP' | 'USD';
    memberEmails?: string[];
  } = {},
) {
  return { ...defaultCreateTripPayload, ...overrides };
}

export const defaultJoinTripPayload = {
  code: 'XXXXXXXX',
};

export function buildJoinTripPayload(overrides: { code?: string } = {}) {
  return { ...defaultJoinTripPayload, ...overrides };
}

export function buildUpdateTripPayload(overrides: { name?: string } = {}) {
  return { name: 'E2E Trip Updated', ...overrides };
}
