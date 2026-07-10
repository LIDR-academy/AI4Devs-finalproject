import { config as loadDotenv } from 'dotenv';

loadDotenv();

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.MOCK_OPENROUTER = process.env.MOCK_OPENROUTER ?? 'true';
process.env.MOCK_NOMINATIM = process.env.MOCK_NOMINATIM ?? 'true';
process.env.MOCK_CATASTRO = process.env.MOCK_CATASTRO ?? 'true';

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test';
process.env.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? 'sk-or-v1-test-placeholder-key-1234';
