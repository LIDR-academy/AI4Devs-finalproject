'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface AdminMetricsResponse {
  summary: {
    totalReservations: number;
    totalCompletedAppointments: number;
    totalCancellations: number;
    cancellationRate: number;
    averageRating: number;
    activeDoctors: number;
    activePatients: number;
  };
  reservationsSeries: Array<{ date: string; total: number }>;
  cancellationsSeries: Array<{ date: string; total: number }>;
  cancellationsByReason: Array<{ reason: string; total: number }>;
  ratingsBySpecialty: Array<{
    specialtyId: string;
    specialty: string;
    average: number;
    totalReviews: number;
  }>;
  topDoctorsByAppointments: Array<{
    doctorId: string;
    doctorName: string;
    specialty: string;
    totalAppointments: number;
    averageRating: number;
    totalReviews: number;
  }>;
  topDoctorsByRating: Array<{
    doctorId: string;
    doctorName: string;
    specialty: string;
    totalAppointments: number;
    averageRating: number;
    totalReviews: number;
  }>;
  generatedAt: string;
  stale?: boolean;
}

export interface AdminVerificationDoctor {
  doctorId: string;
  userId: string;
  fullName: string;
  email: string;
  specialty: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  verificationNotes?: string;
}

export interface AdminReviewModerationItem {
  reviewId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  appointmentId: string;
  moderationStatus: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function parseOrThrow(response: Response, fallbackError: string) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || fallbackError);
  }
  return data;
}

export async function getAdminMetrics(token: string): Promise<AdminMetricsResponse> {
  const response = await fetch(`${API_URL}/api/v1/admin/metrics`, {
    headers: authHeaders(token),
  });
  return parseOrThrow(response, 'Error al cargar métricas');
}

export async function getAdminReservations(
  token: string,
  params?: Record<string, string | number | undefined>
): Promise<{ items: unknown[]; pagination: PaginationMeta }> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(
    `${API_URL}/api/v1/admin/reservations?${searchParams.toString()}`,
    {
      headers: authHeaders(token),
    }
  );
  return parseOrThrow(response, 'Error al cargar reservas');
}

export async function getAdminCancellations(
  token: string,
  params?: Record<string, string | number | undefined>
): Promise<{ items: unknown[]; pagination: PaginationMeta }> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(
    `${API_URL}/api/v1/admin/cancellations?${searchParams.toString()}`,
    {
      headers: authHeaders(token),
    }
  );
  return parseOrThrow(response, 'Error al cargar cancelaciones');
}

export async function getAdminRatings(token: string): Promise<{
  ratingsBySpecialty: AdminMetricsResponse['ratingsBySpecialty'];
  topDoctorsByAppointments: AdminMetricsResponse['topDoctorsByAppointments'];
  topDoctorsByRating: AdminMetricsResponse['topDoctorsByRating'];
  generatedAt: string;
}> {
  const response = await fetch(`${API_URL}/api/v1/admin/ratings`, {
    headers: authHeaders(token),
  });
  return parseOrThrow(response, 'Error al cargar ratings');
}

export async function getAdminVerificationList(
  token: string,
  params?: Record<string, string | number | undefined>
): Promise<{ items: AdminVerificationDoctor[]; pagination: PaginationMeta }> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(
    `${API_URL}/api/v1/admin/verification?${searchParams.toString()}`,
    {
      headers: authHeaders(token),
    }
  );
  return parseOrThrow(response, 'Error al cargar verificación');
}

export async function getDoctorVerificationDocuments(
  token: string,
  doctorId: string
): Promise<{
  documents: Array<{
    id: string;
    status: string;
    documentType: string;
    originalFilename: string;
    createdAt: string;
  }>;
}> {
  const response = await fetch(
    `${API_URL}/api/v1/admin/verification/${doctorId}/documents`,
    {
      headers: authHeaders(token),
    }
  );
  return parseOrThrow(response, 'Error al cargar documentos');
}

export async function getVerificationDocumentSignedUrl(
  token: string,
  documentId: string
): Promise<{ signedUrl: string; expiresInSeconds: number }> {
  const response = await fetch(
    `${API_URL}/api/v1/admin/verification/documents/${documentId}/signed-url`,
    {
      headers: authHeaders(token),
    }
  );
  return parseOrThrow(response, 'Error al generar URL firmada');
}

export async function approveDoctorVerification(
  token: string,
  doctorId: string,
  notes?: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/v1/admin/verification/${doctorId}/approve`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ notes }),
  });
  return parseOrThrow(response, 'Error al aprobar médico');
}

export async function rejectDoctorVerification(
  token: string,
  doctorId: string,
  notes: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/v1/admin/verification/${doctorId}/reject`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ notes }),
  });
  return parseOrThrow(response, 'Error al rechazar médico');
}

export async function getReviewsModerationQueue(
  token: string,
  params?: Record<string, string | number | undefined>
): Promise<{ items: AdminReviewModerationItem[]; pagination: PaginationMeta }> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(
    `${API_URL}/api/v1/admin/reviews/moderation?${searchParams.toString()}`,
    {
      headers: authHeaders(token),
    }
  );
  return parseOrThrow(response, 'Error al cargar reseñas pendientes');
}

export async function approveReviewModeration(
  token: string,
  reviewId: string,
  notes?: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/v1/admin/reviews/${reviewId}/approve`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ notes }),
  });
  return parseOrThrow(response, 'Error al aprobar reseña');
}

export async function rejectReviewModeration(
  token: string,
  reviewId: string,
  notes: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/v1/admin/reviews/${reviewId}/reject`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ notes }),
  });
  return parseOrThrow(response, 'Error al rechazar reseña');
}
