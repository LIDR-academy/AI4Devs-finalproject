import axios from 'axios';
import { getKeycloak } from '../auth/keycloak';
import { env } from '../env';
import type { BookingDto, BookingCreateDto } from '../types/api';

const bookingsApi = axios.create({
  baseURL: env.bookingApiBaseUrl,
});

bookingsApi.interceptors.request.use(async (config) => {
  const keycloak = getKeycloak();
  if (keycloak) {
    try {
      await keycloak.updateToken(5);
    } catch (_) {}
    const token = keycloak.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export class BookingsService {
  /**
   * Get all bookings for the current user
   */
  static async getMyBookings(): Promise<BookingDto[]> {
    const response = await bookingsApi.get<BookingDto[]>('/bookings');
    return response.data;
  }

  /**
   * Get a specific booking by ID
   */
  static async getBookingById(id: string): Promise<BookingDto> {
    const response = await bookingsApi.get<BookingDto>(`/bookings/${id}`);
    return response.data;
  }

  /**
   * Create a new booking
   */
  static async createBooking(bookingData: BookingCreateDto): Promise<BookingDto> {
    const response = await bookingsApi.post<BookingDto>('/bookings', bookingData);
    return response.data;
  }

  /**
   * Confirm a booking
   */
  static async confirmBooking(id: string): Promise<BookingDto> {
    const response = await bookingsApi.put<BookingDto>(`/bookings/${id}/confirm`);
    return response.data;
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(id: string): Promise<BookingDto> {
    const response = await bookingsApi.put<BookingDto>(`/bookings/${id}/cancel`);
    return response.data;
  }
}
