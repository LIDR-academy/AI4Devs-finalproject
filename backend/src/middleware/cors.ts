import cors from 'cors';

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  throw new Error('CORS_ORIGIN environment variable is required in production');
}

export const corsMiddleware = cors({
  origin: corsOrigin,
  credentials: true,
});
