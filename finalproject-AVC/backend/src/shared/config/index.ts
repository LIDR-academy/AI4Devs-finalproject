import dotenv from 'dotenv';

dotenv.config();

export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    databaseUrl: process.env.DATABASE_URL || '',
    jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    court: {
        businessHoursStart: 8, // 8:00 AM
        businessHoursEnd: 22, // 10:00 PM
        slotDurationMinutes: 90,
    },
    payment: {
        defaultAmount: 50.0, // Fixed amount for Phase 0 (USD)
        mockGatewayUrl: 'https://mock-payment-gateway.com',
    },
} as const;
