'use client';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(
  /\/api\/v1\/?$/,
  ''
);

export interface CreateReviewPayload {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  rating: number;
  comment: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderatedBy?: string | null;
  moderatedAt?: string | null;
  moderationNotes?: string | null;
  createdAt: string;
  updatedAt?: string;
  message?: string;
}

export async function getAppointmentReview(
  appointmentId: string,
  token: string
): Promise<ReviewResponse> {
  const response = await fetch(`${API_URL}/api/v1/appointments/${appointmentId}/reviews`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data.error ||
      (response.status === 404
        ? 'No existe reseña para esta cita'
        : 'Error al consultar reseña');
    const error = new Error(message) as Error & { status?: number; code?: string };
    error.status = response.status;
    error.code = data.code;
    throw error;
  }

  return data;
}

export async function createAppointmentReview(
  appointmentId: string,
  payload: CreateReviewPayload,
  token: string
): Promise<ReviewResponse> {
  const response = await fetch(`${API_URL}/api/v1/appointments/${appointmentId}/reviews`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fallbackByStatus: Record<number, string> = {
      400: 'Datos inválidos para crear reseña',
      403: 'No tienes permiso para crear una reseña de esta cita',
      404: 'Cita no encontrada',
      409: 'Ya existe una reseña para esta cita',
    };
    const error = new Error(
      data.error || fallbackByStatus[response.status] || 'Error al crear reseña'
    ) as Error & { status?: number; code?: string };
    error.status = response.status;
    error.code = data.code;
    throw error;
  }

  return data;
}
