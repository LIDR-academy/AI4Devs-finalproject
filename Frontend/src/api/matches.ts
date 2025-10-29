import axios from 'axios';
import { getKeycloak } from '../auth/keycloak';
import { env } from '../env';
import type { MatchDto } from '../types/api';

export interface MatchSearchParams {
  destinationSedeId?: string;
  originSedeId?: string;
  direction?: 'TO_SEDE' | 'FROM_SEDE';
  time?: string;
  origin?: string;
}

const matchesApi = axios.create({
  baseURL: env.matchingApiBaseUrl,
});

matchesApi.interceptors.request.use(async (config) => {
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

export class MatchesService {
  /**
   * Find matches for a specific destination and criteria
   */
  static async findMatches(params: MatchSearchParams): Promise<MatchDto[]> {
    const searchParams = new URLSearchParams();

    if (params.direction) {
      searchParams.append('direction', params.direction);
    }

    // Depending on direction, one sedeId is required. Keep backward compatibility when only destination is used
    if (params.destinationSedeId) {
      searchParams.append('destinationSedeId', params.destinationSedeId);
    }
    if (params.originSedeId) {
      searchParams.append('originSedeId', params.originSedeId);
    }

    if (params.time) {
      searchParams.append('time', params.time);
    }

    if (params.origin) {
      searchParams.append('origin', params.origin);
    }

    const response = await matchesApi.get<MatchDto[]>(`/matches?${searchParams.toString()}`);
    return response.data;
  }

  /**
   * Get matches for the current user
   */
  static async getMyMatches(): Promise<MatchDto[]> {
    const response = await matchesApi.get<MatchDto[]>('/matches/my-matches');
    return response.data;
  }

  /**
   * Get a specific match by ID
   */
  static async getMatchById(id: string): Promise<MatchDto> {
    const response = await matchesApi.get<MatchDto>(`/matches/${id}`);
    return response.data;
  }
}
