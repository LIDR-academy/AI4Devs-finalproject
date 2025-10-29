import axios from 'axios';
import { env } from '../env';
import { getKeycloak } from '../auth/keycloak';

export const api = axios.create({
  baseURL: env.apiBaseUrl,
});

api.interceptors.request.use(async (config) => {
  const keycloak = getKeycloak();
  if (keycloak) {
    try {
      const refreshed = await keycloak.updateToken(5);
      if (refreshed) {
        // token refreshed internally
      }
    } catch (_) {
      // ignore refresh errors; request may proceed unauthenticated if no token
    }
    const token = keycloak.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

