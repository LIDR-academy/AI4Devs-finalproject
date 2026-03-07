/**
 * Utility functions for transforming data for HomePage display
 */

import type { ExpenseListItem } from '@/types/expense.types';
import type { Balance, RecentExpense, TripCurrency, ExpenseCategory } from '@/types/trip.types';
import type { BalancesResponse, SettleTransaction } from '@/types/balance.types';
import type { TripListItem } from '@/types/trip.types';

/**
 * Maps category name (string) to ExpenseCategory type
 * @param categoryName - Category name from backend (e.g., "Comida", "Transporte")
 * @returns ExpenseCategory type
 */
function mapCategoryNameToExpenseCategory(categoryName: string): ExpenseCategory {
  const name = categoryName.toLowerCase().trim();

  if (name.includes('comida') || name.includes('food')) {
    return 'food';
  }
  if (name.includes('transporte') || name.includes('transport')) {
    return 'transport';
  }
  if (name.includes('alojamiento') || name.includes('lodging') || name.includes('hotel')) {
    return 'lodging';
  }
  if (name.includes('entretenimiento') || name.includes('entertainment')) {
    return 'entertainment';
  }

  // Default to 'other' for any other category
  return 'other';
}

/**
 * Maps ExpenseListItem to RecentExpense format
 * @param expense - Expense list item from backend
 * @param tripName - Name of the trip (for context)
 * @param currency - Currency of the trip
 * @returns RecentExpense object
 */
export function mapExpenseListItemToRecentExpense(
  expense: ExpenseListItem,
  tripName: string,
  currency: TripCurrency,
): RecentExpense {
  // Get payer name - try to get from expense data if available
  // For now, we'll use a placeholder since ExpenseListItem doesn't include payer name
  // This should be enhanced when backend includes payer info in list response
  const paidBy = 'Usuario'; // TODO: Get actual payer name from expense data

  // Calculate participant count from beneficiaries
  const participantCount = expense.beneficiaries?.length || 1;

  // Map category name to ExpenseCategory type
  const category = mapCategoryNameToExpenseCategory(expense.category_name);

  // Format date - use expense_date if available, otherwise createdAt
  const dateString =
    typeof expense.expense_date === 'string'
      ? expense.expense_date
      : expense.expense_date instanceof Date
        ? expense.expense_date.toISOString()
        : typeof expense.createdAt === 'string'
          ? expense.createdAt
          : expense.createdAt instanceof Date
            ? expense.createdAt.toISOString()
            : new Date().toISOString();

  return {
    id: expense.id,
    category,
    title: expense.title,
    paidBy,
    date: dateString,
    amount: expense.amount,
    participantCount,
    tripId: expense.trip_id,
    tripName,
  };
}

/**
 * Aggregates balances from multiple trips
 * Filters balances where the current user is involved
 * @param settleResponses - Array of settle responses from multiple trips
 * @param currentUserId - ID of the current user
 * @returns Array of aggregated Balance objects
 */
export function aggregateBalancesFromTrips(
  settleResponses: Array<{ tripId: string; tripName: string; transactions: SettleTransaction[] }>,
  currentUserId: string,
): Balance[] {
  const allBalances: Balance[] = [];

  settleResponses.forEach(({ tripId, tripName, transactions }) => {
    transactions.forEach((transaction, index) => {
      // Only include balances where current user is involved
      if (transaction.from_user_id === currentUserId || transaction.to_user_id === currentUserId) {
        // Determine badge color based on whether user owes or is owed
        const badgeColor: 'red' | 'green' | 'blue' =
          transaction.from_user_id === currentUserId ? 'red' : 'green';

        allBalances.push({
          id: `${tripId}-${transaction.from_user_id}-${transaction.to_user_id}-${index}`,
          fromName: transaction.from_user_name,
          toName: transaction.to_user_name,
          amount: transaction.amount,
          badgeColor,
          tripId,
          tripName,
        });
      }
    });
  });

  return allBalances;
}

/**
 * Calculates total spent from all trips
 * @param trips - Array of trip list items
 * @returns Total amount spent across all trips
 */
export function getTotalSpentFromTrips(trips: TripListItem[]): number {
  return trips.reduce((total, trip) => {
    return total + (trip.totalAmount || 0);
  }, 0);
}

/**
 * Gets the most recent trips (up to limit)
 * @param trips - Array of trip list items
 * @param limit - Maximum number of trips to return (default: 3)
 * @returns Array of most recent trips
 */
export function getRecentTrips(trips: TripListItem[], limit: number = 3): TripListItem[] {
  // Sort by createdAt descending (most recent first)
  const sorted = [...trips].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.created_at || '').getTime();
    const dateB = new Date(b.createdAt || b.created_at || '').getTime();
    return dateB - dateA;
  });

  return sorted.slice(0, limit);
}
