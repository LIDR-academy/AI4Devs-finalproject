/**
 * Reusable user payloads for E2E tests. No HTTP or DB calls.
 */

export const defaultRegisterPayload = {
  nombre: 'E2E Test User',
  email: 'e2e-user@travelsplit.test',
  contraseña: 'TestPass123',
};

export const defaultLoginPayload = {
  email: defaultRegisterPayload.email,
  contraseña: defaultRegisterPayload.contraseña,
};

export function buildRegisterPayload(
  overrides: {
    nombre?: string;
    email?: string;
    contraseña?: string;
  } = {},
) {
  return { ...defaultRegisterPayload, ...overrides };
}

export function buildUpdateUserPayload(overrides: { nombre?: string } = {}) {
  return { nombre: 'Updated Name', ...overrides };
}
