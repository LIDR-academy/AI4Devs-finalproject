if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/projectscope_ai?schema=public";
}

if (!process.env.AZURE_OPENAI_ENABLED) {
  process.env.AZURE_OPENAI_ENABLED = "false";
}

process.env.AUTH_ENABLED = "false";

if (!process.env.AUTH_TOKEN_SECRET) {
  process.env.AUTH_TOKEN_SECRET = "test-token-secret-value-1234";
}

if (!process.env.AUTH_LOGIN_PASSWORD) {
  process.env.AUTH_LOGIN_PASSWORD = "test-password";
}

if (!process.env.AUTH_TOKEN_TTL_SECONDS) {
  process.env.AUTH_TOKEN_TTL_SECONDS = "3600";
}

if (!process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS) {
  process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS = "604800";
}

if (!process.env.AUTH_SUPERADMIN_ACTOR_IDS) {
  process.env.AUTH_SUPERADMIN_ACTOR_IDS = "local-dev-actor";
}

if (!process.env.AUTH_ADMIN_ACTOR_IDS) {
  process.env.AUTH_ADMIN_ACTOR_IDS = "";
}