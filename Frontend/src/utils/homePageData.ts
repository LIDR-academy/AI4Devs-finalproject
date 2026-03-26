/**
 * Utility functions for transforming data for HomePage display
 */

import type { Balance } from '@/types/trip.types';
import type { SettleTransaction } from '@/types/balance.types';
import type { TripListItem } from '@/types/trip.types';

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
