# Skill: prisma-migrate

## Purpose

Creates safe Prisma migrations with a consistent naming convention and a documented rollback procedure. The schema lives in `backend/prisma/schema.prisma`.

## When to invoke

- After any change to `backend/prisma/schema.prisma`
- When a new aggregate or value object needs a DB representation
- During Foundational phase (T011)

## Inputs

- The schema diff (before/after)
- A migration name (kebab-case, descriptive)

## Outputs

- `backend/prisma/migrations/<timestamp>_<name>/migration.sql`
- Updated `backend/prisma/schema.prisma`
- Updated Prisma client

## Naming convention

`<timestamp>_<kebab-case-descriptor>.sql`

Examples:
- `20260708_init.sql` — initial migration
- `20260715_add_redflag_table.sql` — adds RedFlag entity
- `20260722_add_session_userindex.sql` — adds index on User.sessionId

## Workflow

```bash
cd backend

# 1. Edit schema.prisma

# 2. Generate the migration
npx prisma migrate dev --name <descriptive-name>

# 3. Review the generated SQL
cat prisma/migrations/<timestamp>_<name>/migration.sql

# 4. Test the migration
npx prisma migrate reset  # DESTRUCTIVE — only in dev
npx prisma migrate deploy  # apply in non-dev

# 5. Generate the Prisma client
npx prisma generate
```

## Safety rules

1. **Never edit a migration after it has been applied in production.** Create a new migration instead.
2. **Always include both `up` and `down` in your head** — Prisma doesn't generate rollbacks, so document the reverse operation in the migration's comment block.
3. **For destructive changes** (column drops, type changes), use a multi-step migration:
   - Step 1: Add new column
   - Step 2: Backfill data
   - Step 3: Switch reads
   - Step 4: Drop old column
4. **Never store third-party content** (FR-011) — don't add fields like `rawHtml`, `extractedText`, `pageContent`.

## Example migration

```sql
-- 20260715_add_redflag_table.sql
-- Adds RedFlag entity normalized from AnalyzedListing.redFlags JSON.
-- References: FR-028 (Normalización RedFlag a tabla propia).

CREATE TABLE "RedFlag" (
  "id" TEXT NOT NULL,
  "analyzedListingId" TEXT NOT NULL,
  "flag" TEXT NOT NULL,
  "reasoning" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RedFlag_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RedFlag_analyzedListingId_idx" ON "RedFlag"("analyzedListingId");

ALTER TABLE "RedFlag" ADD CONSTRAINT "RedFlag_analyzedListingId_fkey" FOREIGN KEY ("analyzedListingId") REFERENCES "AnalyzedListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Rollback (manual)

```sql
-- Reverse of above
DROP TABLE IF EXISTS "RedFlag";
```

## Validation

After applying, run:

```bash
npx prisma validate
npx prisma studio  # visual check
npm run db:test    # integration test that uses the schema
```
