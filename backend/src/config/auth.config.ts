import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  keycloak: {
    baseUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.KEYCLOAK_REALM || 'sistema-quirurgico',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'backend-api',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
    adminUser: process.env.KEYCLOAK_ADMIN_USER || 'admin',
    adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  mfa: {
    enabled: process.env.MFA_ENABLED !== 'false',
    required: process.env.MFA_REQUIRED === 'true',
  },
}));
