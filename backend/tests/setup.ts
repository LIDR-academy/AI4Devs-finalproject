// Test setup: ensure tests use a clean environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.MOCK_OPENROUTER = process.env.MOCK_OPENROUTER ?? 'true';
process.env.MOCK_NOMINATIM = process.env.MOCK_NOMINATIM ?? 'true';
process.env.MOCK_CATASTRO = process.env.MOCK_CATASTRO ?? 'true';
