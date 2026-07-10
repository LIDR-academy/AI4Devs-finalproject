if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/projectscope_ai?schema=public";
}

if (!process.env.AZURE_OPENAI_ENABLED) {
  process.env.AZURE_OPENAI_ENABLED = "false";
}