'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Specialty {
  id: string;
  nameEs: string;
  nameEn: string;
  isActive: boolean;
}

export interface DoctorSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  specialties: Array<{
    id: string;
    nameEs: string;
    nameEn: string;
    isPrimary: boolean;
  }>;
  address: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  ratingAverage?: number;
  totalReviews: number;
  verificationStatus: string;
}

export interface SearchResult {
  doctors: DoctorSearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  specialty?: string;
  lat?: number;
  lng?: number;
  postalCode?: string;
  radius?: number;
  date?: string;
  page?: number;
  limit?: number;
}

export async function searchDoctors(
  filters: SearchFilters,
  token: string
): Promise<SearchResult> {
  const params = new URLSearchParams();

  if (filters.specialty) {
    params.append('specialty', filters.specialty);
  }
  if (filters.lat !== undefined && filters.lng !== undefined) {
    params.append('lat', filters.lat.toString());
    params.append('lng', filters.lng.toString());
  }
  if (filters.postalCode) {
    params.append('postalCode', filters.postalCode);
  }
  if (filters.radius) {
    params.append('radius', filters.radius.toString());
  }
  if (filters.date) {
    params.append('date', filters.date);
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }

  const response = await fetch(`${API_URL}/api/v1/doctors?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error al buscar médicos');
  }

  return response.json();
}

export async function getSpecialties(): Promise<Specialty[]> {
  const response = await fetch(`${API_URL}/api/v1/specialties`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener especialidades');
  }

  const data = await response.json();
  return data.specialties || [];
}

export interface DoctorDetail {
  id: string;
  firstName: string;
  lastName: string;
  specialties: Array<{
    id: string;
    nameEs: string;
    nameEn: string;
  }>;
  address: string;
  postalCode: string;
  ratingAverage?: number;
  totalReviews: number;
  verificationStatus: string;
}

export interface SlotResponse {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  lockedUntil: string | null;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  address: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  verificationStatus: string;
  ratingAverage?: number;
  totalReviews: number;
  specialties: Array<{
    id: string;
    nameEs: string;
    nameEn: string;
  }>;
  updatedAt: string;
}

export interface UpdateDoctorProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  address?: string;
  postalCode?: string;
}

export interface UpdateDoctorProfileResponse {
  message: string;
  doctor: DoctorProfile;
  warnings?: string[];
}

export async function getDoctorById(
  doctorId: string,
  token: string
): Promise<DoctorDetail> {
  const response = await fetch(`${API_URL}/api/v1/doctors/${doctorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Médico no encontrado');
    }
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error al obtener médico');
  }

  return response.json();
}

export async function getDoctorSlots(
  doctorId: string,
  date: string,
  token: string
): Promise<SlotResponse[]> {
  const params = new URLSearchParams({ date });
  const response = await fetch(
    `${API_URL}/api/v1/doctors/${doctorId}/slots?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error al obtener slots');
  }

  const data = await response.json();
  return data.slots || [];
}

export async function getMyDoctorProfile(token: string): Promise<DoctorProfile> {
  const response = await fetch(`${API_URL}/api/v1/doctors/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error al obtener perfil médico');
  }

  return response.json();
}

export async function updateMyDoctorProfile(
  payload: UpdateDoctorProfilePayload,
  token: string
): Promise<UpdateDoctorProfileResponse> {
  const response = await fetch(`${API_URL}/api/v1/doctors/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error al actualizar perfil médico');
  }

  return response.json();
}
