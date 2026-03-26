/**
 * Expense service
 * Handles expense-related API calls
 */

import type {
  CreateExpenseRequest,
  CreateExpenseResponse,
  ExpenseCategory,
  ExpenseListResponse,
  ExpenseListQuery,
} from '@/types/expense.types';
import type { ApiError } from '@/types/api.types';
import { API_BASE_URL } from '@/config/api';

/**
 * Creates a new expense for a trip
 * @param trip_id - ID of the trip
 * @param data - Expense data (without trip_id and payer_id, as they come from URL and token respectively)
 * @returns Promise with created expense on success
 * @throws Error with status code and message on failure
 */
export async function createExpense(
  trip_id: string,
  data: CreateExpenseRequest,
): Promise<CreateExpenseResponse> {
  const token = localStorage.getItem('travelsplit_token');

  if (!token) {
    const error: ApiError = {
      message: 'No se encontró token de autenticación',
      statusCode: 401,
    };
    throw error;
  }

  const response = await fetch(`${API_BASE_URL}/trips/${trip_id}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText || 'Error desconocido',
      statusCode: response.status,
    }));

    let message = errorData.message || 'Error al crear el gasto';

    // Provide specific error messages based on status code
    if (response.status === 400) {
      message = errorData.message || 'Datos de entrada inválidos';
    } else if (response.status === 403) {
      message = 'No eres participante de este viaje';
    } else if (response.status === 404) {
      message = 'El viaje no existe o está cerrado, o la categoría no existe';
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
 * Gets all expenses for a trip with pagination and optional filters
 * @param trip_id - ID of the trip
 * @param query - Optional query parameters (page, limit, category_id)
 * @returns Promise with paginated list of expenses
 * @throws Error with status code and message on failure
 */
export async function getExpensesByTrip(
  trip_id: string,
  query?: ExpenseListQuery,
): Promise<ExpenseListResponse> {
  const token = localStorage.getItem('travelsplit_token');

  if (!token) {
    const error: ApiError = {
      message: 'No se encontró token de autenticación',
      statusCode: 401,
    };
    throw error;
  }

  // Build query string
  const params = new URLSearchParams();
  if (query?.page) params.append('page', String(query.page));
  if (query?.limit) params.append('limit', String(query.limit));
  if (query?.category_id) params.append('category_id', String(query.category_id));

  const query_string = params.toString();
  const url = `${API_BASE_URL}/trips/${trip_id}/expenses${query_string ? `?${query_string}` : ''}`;

  const response = await fetch(url, {
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

    let message = errorData.message || 'Error al obtener los gastos';

    // Provide specific error messages based on status code
    if (response.status === 400) {
      message = 'Parámetros de consulta inválidos';
    } else if (response.status === 403) {
      message = 'No eres participante de este viaje';
    } else if (response.status === 404) {
      message = 'El viaje no existe';
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
 * Gets all expense categories
 * @returns Promise with array of expense categories
 * @throws Error with status code and message on failure
 */
export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const token = localStorage.getItem('travelsplit_token');

  const response = await fetch(`${API_BASE_URL}/expense-categories`, {
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

    const error: ApiError = {
      message: errorData.message || 'Error al obtener categorías',
      statusCode: response.status,
    };

    throw error;
  }

  return response.json();
}

/**
 * Uploads a receipt image
 * @param file - Image file to upload
 * @returns Promise with image URL on success
 * @throws Error with status code and message on failure
 */
export async function uploadReceiptImage(file: File): Promise<{ url: string }> {
  const token = localStorage.getItem('travelsplit_token');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/expenses/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText || 'Error desconocido',
      statusCode: response.status,
    }));

    const error: ApiError = {
      message: errorData.message || 'Error al subir la imagen',
      statusCode: response.status,
    };

    throw error;
  }

  return response.json();
}
