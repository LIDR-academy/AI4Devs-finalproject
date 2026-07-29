process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/coacher_test";
process.env.COACH_FINANCIAL_ENCRYPTION_KEY = "abcdef1234567890abcdef1234567890";
process.env.GOOGLE_CALENDAR_SA_EMAIL = "test-sa@test.iam.gserviceaccount.com";
process.env.GOOGLE_CALENDAR_SA_KEY_PATH = "secrets/test-sa-key.json";
process.env.GOOGLE_CALENDAR_ID_DEV = "test@group.calendar.google.com";
