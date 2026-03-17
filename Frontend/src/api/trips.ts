import axios from 'axios';
import { getKeycloak } from '../auth/keycloak';
import { env } from '../env';
import type { TripDto, TripCreateDto } from '../types/api';

const tripsApi = axios.create({
  baseURL: env.tripsApiBaseUrl,
});

tripsApi.interceptors.request.use(async (config) => {
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

export class TripsService {
  /**
   * Get all trips
   */
  static async getAllTrips(): Promise<TripDto[]> {
    const response = await tripsApi.get<TripDto[]>('/trips');
    return response.data;
  }

  /**
   * Get trips by destination
   */
  static async getTripsByDestination(destinationSedeId: string): Promise<TripDto[]> {
    const response = await tripsApi.get<TripDto[]>(`/trips?destinationSedeId=${destinationSedeId}`);
    return response.data;
  }

  /**
   * Get a specific trip by ID
   */
  static async getTripById(id: string): Promise<TripDto> {
    const response = await tripsApi.get<TripDto>(`/trips/${id}`);
    return response.data;
  }

  /**
   * Create a new trip
   */
  static async createTrip(tripData: TripCreateDto): Promise<TripDto> {
    const response = await tripsApi.post<TripDto>('/trips', tripData);
    return response.data;
  }

  /**
   * Update an existing trip
   */
  static async updateTrip(id: string, tripData: Partial<TripCreateDto>): Promise<TripDto> {
    const response = await tripsApi.put<TripDto>(`/trips/${id}`, tripData);
    return response.data;
  }

  /**
   * Delete a trip
   */
  static async deleteTrip(id: string): Promise<void> {
    await tripsApi.delete(`/trips/${id}`);
  }

  /**
   * Get trips created by the current user
   */
  static async getMyTrips(): Promise<TripDto[]> {
    const response = await tripsApi.get<TripDto[]>('/trips/my-trips');
    return response.data;
  }
}
