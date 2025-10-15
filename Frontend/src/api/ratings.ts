import axios from 'axios';
import { env } from '../env';
import { getKeycloak } from '../auth/keycloak';

// Create a dedicated client for users service (ratings)
const usersApi = axios.create({
  baseURL: env.usersApiBaseUrl,
});

// Add auth interceptor
usersApi.interceptors.request.use(async (config) => {
  const keycloak = getKeycloak();
  if (keycloak?.authenticated && keycloak.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});

export interface RatingDto {
  id: string;
  raterId: string;
  ratedId: string;
  tripId?: string;
  ratingType: 'THUMBS_UP' | 'THUMBS_DOWN';
  tags: string[];
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingCreateDto {
  ratedId: string;
  tripId?: string;
  ratingType: 'THUMBS_UP' | 'THUMBS_DOWN';
  tags: string[];
  comment?: string;
}

export interface TrustStats {
  totalRatings: number;
  thumbsUp: number;
  thumbsDown: number;
  trustScore: number;
  mostCommonTags: string[];
}

export class RatingsService {
  /**
   * Create a new rating
   */
  static async createRating(rating: RatingCreateDto): Promise<RatingDto> {
    const response = await usersApi.post('/ratings', rating);
    return response.data;
  }

  /**
   * Get ratings given by current user
   */
  static async getMyRatings(): Promise<RatingDto[]> {
    const response = await usersApi.get('/ratings/my-ratings');
    return response.data;
  }

  /**
   * Get ratings received by a specific user
   */
  static async getRatingsForUser(userId: string): Promise<RatingDto[]> {
    const response = await usersApi.get(`/ratings/user/${userId}`);
    return response.data;
  }

  /**
   * Get trust score for a user
   */
  static async getTrustScore(userId: string): Promise<number> {
    const response = await usersApi.get(`/ratings/user/${userId}/trust-score`);
    return response.data;
  }

  /**
   * Get trust statistics for a user
   */
  static async getTrustStats(userId: string): Promise<TrustStats> {
    const response = await usersApi.get(`/ratings/user/${userId}/trust-stats`);
    return response.data;
  }
}
