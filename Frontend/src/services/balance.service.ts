/**
 * Balance service
 * Handles balance-related API calls
 */

import type { BalancesResponse, SettleResponse, SettleTransaction } from '@/types/balance.types';
import type { Balance } from '@/types/trip.types';
import type { ApiError } from '@/types/api.types';
import { API_BASE_URL } from '@/config/api';

function getAuthToken(): string {
  const token = localStorage.getItem('travelsplit_token');

  if (!token) {
    const error: ApiError = {
      message: 'No se encontró token de autenticación',
      statusCode: 401,
    };
    throw error;
  }

  return token;
}

/**
 * Gets balances for all participants in a trip
 * @param tripId - Trip ID
 * @returns Promise with balances response including all participant balances
 * @throws Error with status code and message on failure
 */
export async function getTripBalances(tripId: string): Promise<BalancesResponse> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/balances`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText || 'Error desconocido',
      statusCode: response.status,
    }));

    let message = errorData.message || 'Error al obtener los balances';

    if (response.status === 404) {
      message = 'El viaje no existe';
    } else if (response.status === 403) {
      message = 'No tienes permisos para ver los balances de este viaje';
    } else if (response.status === 401) {
      message = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
    }

    const error: ApiError = {
      message,
      statusCode: response.status,
    };

    throw error;
  }

  return response.json();
}

/**
 * Gets settled balances (simplified debt transactions) for a trip
 * @param tripId - Trip ID
 * @returns Promise with settle response including simplified transactions
 * @throws Error with status code and message on failure
 */
export async function getTripSettledBalances(tripId: string): Promise<SettleResponse> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/balances/settle`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText || 'Error desconocido',
      statusCode: response.status,
    }));

    let message = errorData.message || 'Error al obtener los saldos simplificados';

    if (response.status === 404) {
      message = 'El viaje no existe';
    } else if (response.status === 403) {
      message = 'No tienes permisos para ver los saldos de este viaje';
    } else if (response.status === 401) {
      message = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
    }

    const error: ApiError = {
      message,
      statusCode: response.status,
    };

    throw error;
  }

  return response.json();
}

/**
 * Maps settle transactions to Balance format for BalanceCard component
 * @param transactions - Array of settle transactions
 * @returns Array of Balance objects
 */
export function mapSettleTransactionsToBalances(transactions: SettleTransaction[]): Balance[] {
  return transactions.map((transaction, index) => ({
    id: `${transaction.from_user_id}-${transaction.to_user_id}-${index}`,
    fromName: transaction.from_user_name,
    toName: transaction.to_user_name,
    amount: transaction.amount,
    badgeColor: 'red' as const, // Default to red for debts
  }));
}
