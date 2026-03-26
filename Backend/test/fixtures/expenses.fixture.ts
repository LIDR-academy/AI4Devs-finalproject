/**
 * Reusable expense payloads for E2E tests. No HTTP or DB calls.
 * Caller must pass beneficiaries with at least one user_id (API requires it).
 */

export function buildCreateExpensePayload(
  beneficiaries: { user_id: string; amount_owed?: number }[],
  overrides: {
    title?: string;
    amount?: number;
    category_id?: number;
    expense_date?: string;
  } = {},
) {
  return {
    title: 'E2E Expense',
    amount: 100_000,
    category_id: 1,
    expense_date: '2024-01-15',
    beneficiaries,
    ...overrides,
  };
}
