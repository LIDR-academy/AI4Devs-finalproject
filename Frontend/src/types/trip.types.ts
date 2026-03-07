/**
 * Type definitions for Trip-related entities
 */

export type TripParticipantRole = 'CREATOR' | 'MEMBER';

/**
 * Supported currencies for trips
 */
export type TripCurrency = 'COP' | 'USD';

export interface TripParticipant {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripParticipantRole;
  joined_at?: string;
  is_active?: boolean;
  // Relations
  user?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  deleted_at?: string;
  // Relations
  participants?: TripParticipant[];
}

/**
 * Backend response format for trips (uses camelCase)
 */
export interface TripResponse {
  id: string;
  name: string;
  currency: TripCurrency; // Currency of the trip (COP or USD)
  status: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  totalAmount?: number; // Optional: Total amount of expenses in the trip (in trip currency)
  // For backward compatibility
  created_at?: string;
  updated_at?: string;
  // Trip detail specific fields (when fetching single trip)
  userRole?: TripParticipantRole;
  participants?: TripParticipantDetail[];
  participantsMeta?: ParticipantsPaginationMeta;
}

/**
 * User summary within a participant
 */
export interface UserSummary {
  id: string;
  nombre: string;
  email: string;
}

/**
 * Participant detail from backend
 */
export interface TripParticipantDetail {
  id: string;
  userId: string;
  role: TripParticipantRole;
  user: UserSummary;
}

/**
 * Pagination metadata for participants list
 */
export interface ParticipantsPaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateTripRequest {
  name: string;
  currency?: TripCurrency; // Optional: Currency for the trip (COP or USD). Defaults to COP if not specified.
  memberEmails?: string[];
}

export interface TripListItem extends TripResponse {
  userRole: TripParticipantRole;
  participantCount: number;
  totalAmount: number;
}

/**
 * Balance/Debt between two users
 * Used in HomePage to display who owes whom
 */
export interface Balance {
  id: string; // Unique identifier for the balance
  fromName: string; // Person who owes
  toName: string; // Person who is owed
  amount: number; // Amount in trip currency
  badgeColor: 'red' | 'green' | 'blue'; // Badge color based on debt type
}

/**
 * Expense category types
 */
export type ExpenseCategory = 'food' | 'transport' | 'lodging' | 'entertainment' | 'other';

/**
 * Recent expense item for HomePage display
 */
export interface RecentExpense {
  id: string;
  category: ExpenseCategory;
  title: string;
  paidBy: string; // Name of the person who paid
  date: string; // ISO date string
  amount: number; // Amount in trip currency
  participantCount: number; // Number of people involved
}
