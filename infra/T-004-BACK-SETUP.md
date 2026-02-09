# T-004-BACK Setup Instructions

## Automated Database Migration

The `events` table creation is **fully automated** via direct PostgreSQL connection.

### Prerequisites

1. **Add SUPABASE_DATABASE_URL to .env**:
   ```bash
   # Copy from .env.example if you haven't already
   cp .env.example .env
   ```

2. **Get your SUPABASE_DATABASE_URL from Supabase**:
   - Go to: Settings → Database → Connection string → URI
   - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - Add it to your `.env` file as `SUPABASE_DATABASE_URL`
   - 📖 **Need help?** See detailed guide: [SUPABASE_DATABASE_URL_GUIDE.md](./SUPABASE_DATABASE_URL_GUIDE.md)

### Automatic Setup (Recommended)

Simply run:

```bash
make setup-events
```

This command will:
1. Connect to your Supabase PostgreSQL database
2. Execute the migration SQL automatically
3. Verify the table was created
4. Show the table structure and indexes

### Manual Options

#### Option 1: Run Python Script Directly

```bash
python infra/setup_events_table.py
```

#### Option 2: Supabase Dashboard

If you prefer to run SQL manually:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy content from [`infra/create_events_table.sql`](create_events_table.sql)
4. Execute the SQL

#### Option 3: psql Command Line

```bash
psql $SUPABASE_DATABASE_URL < infra/create_events_table.sql
```

## Running Tests

After creating the table:

```bash
# Run T-004-BACK tests
docker compose run --rm backend pytest tests/integration/test_confirm_upload.py -v

# Or run all tests
make test
```

## Expected Result (FASE VERDE)

```
tests/integration/test_confirm_upload.py::test_confirm_upload_happy_path PASSED
tests/integration/test_confirm_upload.py::test_confirm_upload_file_not_found PASSED
tests/integration/test_confirm_upload.py::test_confirm_upload_invalid_payload PASSED
tests/integration/test_confirm_upload.py::test_confirm_upload_creates_event_record PASSED

4 passed
```

## Table Schema

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Troubleshooting

**Error: "Events table not found"**
- Make sure you ran the SQL migration in Supabase
- Verify your SUPABASE_URL and SUPABASE_KEY are correct

**Error: "File not found in storage"**
- The test creates files in the `raw-uploads` bucket
- Ensure the bucket exists (created in T-005-INFRA)
