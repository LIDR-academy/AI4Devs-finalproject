// Environment variables for Vite
// Vite replaces import.meta.env.VITE_* at build time
export const env = {
  appName: (import.meta.env.VITE_APP_NAME ?? 'bonÀreaGo') as string,
  oidcIssuer: (import.meta.env.VITE_OIDC_ISSUER ?? import.meta.env.VITE_OIDC_ISSUER_URI ?? '') as string,
  oidcClientId: (import.meta.env.VITE_OIDC_CLIENT_ID ?? '') as string,
  oidcRedirectUri: (import.meta.env.VITE_OIDC_REDIRECT_URI ?? (typeof window !== 'undefined' ? window.location.origin : '')) as string,
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080') as string,
  usersApiBaseUrl: (import.meta.env.VITE_USERS_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8082/api') as string,
  tripsApiBaseUrl: (import.meta.env.VITE_TRIPS_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api') as string,
  bookingApiBaseUrl: (import.meta.env.VITE_BOOKING_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8083/api') as string,
  matchingApiBaseUrl: (import.meta.env.VITE_MATCHING_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8084/api') as string,
  VITE_API_NOTIFICATIONS: (import.meta.env.VITE_NOTIFICATIONS_API_BASE_URL ?? 'http://localhost:8085/api') as string,
  VAPID_PUBLIC_KEY: (import.meta.env.VITE_VAPID_PUBLIC_KEY ?? '') as string,
  mapTilesUrl: (import.meta.env.VITE_MAP_TILES_URL ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png') as string,
  authDisabled: (import.meta.env.VITE_AUTH_DISABLED === 'true') as boolean,
};

