'use client';

import { getApiBaseUrl } from './base-url';

const API_URL = getApiBaseUrl();

export interface CreateAppointmentPayload {
  doctorId: string;
  slotId: string;
  appointmentDate: string;
  notes?: string;
}

export interface CreateAppointmentResponse {
  id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  appointmentDate: string;
  status: string;
  notes?: string;
  createdAt: string;
  message: string;
}

export interface AppointmentItem {
  id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  appointmentDate: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface AppointmentsResponse {
  appointments: AppointmentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CancelAppointmentPayload {
  status: 'cancelled';
  cancellationReason?: string;
}

export interface RescheduleAppointmentPayload {
  slotId: string;
  appointmentDate: string;
}

export interface ConfirmAppointmentPayload {
  status: 'confirmed';
}

export async function createAppointment(
  payload: CreateAppointmentPayload,
  token: string
): Promise<CreateAppointmentResponse> {
  const response = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.error ||
      (response.status === 409
        ? 'Este horario acaba de ser reservado por otro paciente. Elige otro slot.'
        : response.status === 400
          ? data.error || 'Error al reservar la cita'
          : 'Error al reservar la cita');
    throw new Error(message);
  }

  return data;
}

export async function getAppointments(
  token: string,
  status?: string,
  page = 1,
  limit = 10
): Promise<AppointmentsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status && status !== 'all') {
    params.set('status', status);
  }

  const response = await fetch(`${API_URL}/appointments?${params}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener citas');
  }

  return data;
}

export async function cancelAppointment(
  appointmentId: string,
  payload: CancelAppointmentPayload,
  token: string
): Promise<{ message: string; status: string }> {
  const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Error al cancelar cita');
  }

  return data;
}

export async function rescheduleAppointment(
  appointmentId: string,
  payload: RescheduleAppointmentPayload,
  token: string
): Promise<{ message: string; status: string; slotId: string }> {
  const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Error al reprogramar cita');
  }

  return data;
}

export async function confirmAppointmentByDoctor(
  appointmentId: string,
  payload: ConfirmAppointmentPayload,
  token: string
): Promise<{ message: string; status: string }> {
  const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Error al confirmar cita');
  }

  return data;
}
