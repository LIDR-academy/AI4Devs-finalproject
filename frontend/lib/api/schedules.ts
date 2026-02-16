'use client';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(
  /\/api\/v1\/?$/,
  ''
);

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  breakDurationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface UpsertSchedulePayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  breakDurationMinutes: number;
  isActive: boolean;
}

type ApiError = Error & { status?: number; code?: string };

async function parseOrThrow(response: Response): Promise<any> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Error en gestión de horarios') as ApiError;
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export async function getMySchedules(token: string): Promise<DoctorSchedule[]> {
  const response = await fetch(`${API_URL}/api/v1/doctors/me/schedules`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await parseOrThrow(response);
  return (data.schedules || []) as DoctorSchedule[];
}

export async function createSchedule(
  payload: UpsertSchedulePayload,
  token: string,
): Promise<DoctorSchedule> {
  const response = await fetch(`${API_URL}/api/v1/doctors/me/schedules`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return (await parseOrThrow(response)) as DoctorSchedule;
}

export async function updateSchedule(
  scheduleId: string,
  payload: Partial<UpsertSchedulePayload>,
  token: string,
): Promise<DoctorSchedule> {
  const response = await fetch(`${API_URL}/api/v1/doctors/me/schedules/${scheduleId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return (await parseOrThrow(response)) as DoctorSchedule;
}

export async function deleteSchedule(
  scheduleId: string,
  token: string,
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/v1/doctors/me/schedules/${scheduleId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return (await parseOrThrow(response)) as { message: string };
}
