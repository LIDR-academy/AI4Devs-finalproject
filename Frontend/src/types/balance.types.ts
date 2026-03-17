/**
 * Type definitions for Balance-related entities
 */

/**
 * Supported trip currencies (re-exported for use in balance components).
 */
export type TripCurrency = 'COP' | 'USD';

/**
 * Participant balance information
 * Contains balance details for a single participant
 */
export interface ParticipantBalance {
  user_id: string;
  user_name: string;
  user_email: string;
  total_spent: number;
  total_owed: number;
  balance: number; // total_spent - total_owed (positive = creditor, negative = debtor)
}

/**
 * Balances response from backend
 * Contains all participant balances for a trip
 */
export interface BalancesResponse {
  trip_id: string;
  total_expenses: number;
  participant_count: number;
  balances: ParticipantBalance[];
}

/**
 * Settlement transaction between two users
 * Represents a simplified debt transaction
 */
export interface SettleTransaction {
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  amount: number;
}

/**
 * Settle balances response from backend
 * Contains simplified debt transactions
 */
export interface SettleResponse {
  trip_id: string;
  transactions: SettleTransaction[];
  total_transactions: number;
}
