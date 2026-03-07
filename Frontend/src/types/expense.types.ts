/**
 * Type definitions for Expense-related entities
 */

export interface ExpenseCategory {
  id: number;
  name: string;
  icon: string;
  is_active: boolean;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount_owed: number;
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  payer_id: string;
  category_id: number;
  title: string;
  amount: number;
  receipt_url?: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Relations
  category?: ExpenseCategory;
  payer?: {
    id: string;
    nombre: string;
    email: string;
  };
}

/**
 * Beneficiary information for expense creation.
 * Represents a user who should pay part of an expense.
 */
export interface CreateExpenseBeneficiary {
  user_id: string;
  amount_owed?: number; // Optional: if not provided, will be calculated as fair share
}

/**
 * Request data for creating a new expense.
 * trip_id is sent in the URL, not in the body.
 * payer_id is obtained from the authenticated user token, not sent in the body.
 */
export interface CreateExpenseRequest {
  title: string;
  amount: number; // Positive number with max 2 decimal places
  category_id: number;
  expense_date: string; // Required, ISO format (YYYY-MM-DD)
  receipt_url?: string; // Optional, valid URL
  beneficiaries: CreateExpenseBeneficiary[]; // Array of beneficiaries, minimum 1
}

/**
 * Beneficiary information in expense response.
 */
export interface ExpenseBeneficiaryResponse {
  user_id: string;
  amount_owed: number;
}

/**
 * Response data after creating a new expense.
 */
export interface CreateExpenseResponse {
  id: string;
  trip_id: string;
  payer_id: string;
  category_id: number;
  category_name: string;
  title: string;
  amount: number;
  receipt_url: string | null;
  expense_date: Date | string; // Backend returns Date, but JSON parsing converts to string
  beneficiaries: ExpenseBeneficiaryResponse[];
  createdAt: Date | string; // Backend returns Date, but JSON parsing converts to string
  updatedAt: Date | string; // Backend returns Date, but JSON parsing converts to string
}

/**
 * Expense item in list response.
 * Contains all public fields of an expense from the backend.
 */
export interface ExpenseListItem {
  id: string;
  trip_id: string;
  payer_id: string;
  category_id: number;
  category_name: string;
  title: string;
  amount: number;
  receipt_url: string | null;
  expense_date: Date | string; // Backend returns Date, but JSON parsing converts to string
  beneficiaries: ExpenseBeneficiaryResponse[];
  createdAt: Date | string; // Backend returns Date, but JSON parsing converts to string
  updatedAt: Date | string; // Backend returns Date, but JSON parsing converts to string
}

/**
 * Pagination metadata for expense list.
 */
export interface ExpensePaginationMeta {
  total: number; // Total number of expenses in the trip
  page: number; // Current page number
  limit: number; // Number of expenses per page
  hasMore: boolean; // Indicates if there are more expenses in following pages
}

/**
 * Response data for expense list query.
 */
export interface ExpenseListResponse {
  expenses: ExpenseListItem[];
  meta: ExpensePaginationMeta;
}

/**
 * Query parameters for expense list.
 * All fields are optional.
 */
export interface ExpenseListQuery {
  page?: number; // Page number (default: 1)
  limit?: number; // Items per page (default: 20, max: 100)
  category_id?: number; // Filter by category ID
}
