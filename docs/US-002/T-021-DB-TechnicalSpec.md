# Technical Specification: T-021-DB - Extend Block Status Enum

**Author:** AI Assistant (Prompt #070)  
**Date:** 2026-02-12  
**Ticket:** T-021-DB  
**Type:** Database Migration  
**Priority:** 🔴 CRITICAL  
**Dependencies:** T-020-DB (COMPLETED ✅)  
**Blocks:** T-024-AGENT (Rhino Ingestion Service)

---

## 1. Ticket Summary

**Scope:** Extend the `block_status` PostgreSQL ENUM type with 3 new lifecycle states required by "The Librarian" validation agent.

**Current ENUM Values** (as of migration `20260211155000_create_blocks_table.sql`):
- `uploaded`
- `validated`
- `in_fabrication`
- `completed`
- `archived`

**New Values to Add:**
- `processing` - Indicates The Librarian agent is actively validating the file  
- `rejected` - Validation failed (nomenclature/geometry errors detected)  
- `error_processing` - Unexpected error during validation (corrupt file, timeout, etc.)

**Rationale:**  
The current `uploaded` → `validated` transition lacks intermediate states. The new values enable:
1. **Real-time status tracking**: Frontend can display "Processing..." spinner  
2. **Error differentiation**: `rejected` (fixable) vs `error_processing` (requires manual intervention)  
3. **Celery job monitoring**: Agents can update status to `processing` when task starts  

**Dependencies:**
- ✅ **T-020-DB COMPLETED**: `blocks` table exists with `status` column of type `block_status`  
- ✅ **PostgreSQL 15**: Supports `ALTER TYPE ... ADD VALUE` (introduced in PG 9.1)  

**Blocks Downstream:**
- **T-024-AGENT** (Rhino Ingestion Service): Requires `processing` state to update on job start  
- **T-026-AGENT** (Nomenclature Validator): Requires `rejected` state for failed validations  
- **T-031-FRONT** (Real-Time Status Listener): Requires all 3 states for UI rendering  

---

## 2. Data Structures & Contracts

### Database Changes (SQL)

#### Migration File: `supabase/migrations/20260212100000_extend_block_status_enum.sql`

**⚠️ CRITICAL PostgreSQL Constraint:**  
- `ALTER TYPE ... ADD VALUE` **CANNOT run inside a transaction block** (BEGIN...COMMIT)  
- Each `ADD VALUE` command **MUST** be executed separately in autocommit mode  
- ENUM values are **immutable** once added (no `DROP VALUE` command exists in PostgreSQL)  

**Migration Strategy:**
```sql
-- Migration: Extend block_status ENUM with validation lifecycle states
-- Ticket: T-021-DB
-- Author: AI Assistant
-- Date: 2026-02-12
-- 
-- CRITICAL: This migration does NOT use BEGIN...COMMIT wrapper
-- ALTER TYPE ADD VALUE cannot run inside a transaction in PostgreSQL
-- Each ADD VALUE is executed separately in autocommit mode

-- Add new status: processing (agent actively validating)
ALTER TYPE block_status ADD VALUE IF NOT EXISTS 'processing';

-- Add new status: rejected (validation failed - fixable errors)
ALTER TYPE block_status ADD VALUE IF NOT EXISTS 'rejected';

-- Add new status: error_processing (validation failed - system error)
ALTER TYPE block_status ADD VALUE IF NOT EXISTS 'error_processing';

-- Add comment explaining transition rules
COMMENT ON TYPE block_status IS 
'Lifecycle states for blocks (pieces). 
Valid transitions:
  uploaded -> processing -> validated | rejected | error_processing
  validated -> in_fabrication -> completed -> archived
  rejected -> uploaded (after fixes)
  error_processing -> uploaded (after manual review)';

-- Verification query (to be used in tests)
-- This confirms all 8 values exist in the ENUM
DO $$
DECLARE
  enum_values text[];
  required_values text[] := ARRAY[
    'uploaded', 'validated', 'in_fabrication', 'completed', 'archived',
    'processing', 'rejected', 'error_processing'
  ];
  missing_value text;
BEGIN
  SELECT array_agg(enumlabel::text ORDER BY enumlabel) 
  INTO enum_values
  FROM pg_enum 
  WHERE enumtypid = 'block_status'::regtype;

  FOREACH missing_value IN ARRAY required_values
  LOOP
    IF NOT (missing_value = ANY(enum_values)) THEN
      RAISE EXCEPTION 'Missing ENUM value: %', missing_value;
    END IF;
  END LOOP;

  RAISE NOTICE 'All required block_status values present: %', enum_values;
END $$;
```

**Rollback Strategy** (non-standard due to ENUM limitations):

PostgreSQL **does not support removing ENUM values** natively. Rollback requires:
1. **Option A (Safe - Keep Values):** Do nothing. Extra ENUM values don't break existing code.  
2. **Option B (Complex - Remove Type):** Drop and recreate entire ENUM + migrate data. **NOT RECOMMENDED**.  

```sql
-- Rollback: Drop and recreate ENUM (DANGEROUS - requires data migration)
-- WARNING: Only use if absolutely necessary (e.g., typo in value name)
-- This requires downtime and careful coordination

-- Step 1: Create temporary ENUM with old values only
CREATE TYPE block_status_old AS ENUM (
    'uploaded',
    'validated', 
    'in_fabrication',
    'completed',
    'archived'
);

-- Step 2: Alter blocks table to use temporary ENUM
ALTER TABLE blocks 
  ALTER COLUMN status TYPE block_status_old 
  USING status::text::block_status_old;

-- Step 3: Drop new ENUM
DROP TYPE block_status;

-- Step 4: Rename temporary ENUM back
ALTER TYPE block_status_old RENAME TO block_status;

-- NOTE: This rollback will FAIL if any blocks have status in {processing, rejected, error_processing}
-- Must first migrate those rows to 'uploaded' or 'validated'
```

**Recommendation:** Use **Option A** for rollback. ENUM values are harmless if unused.

---

## 3. API Interface

**This ticket does NOT create or modify API endpoints.**

However, **existing endpoints** that return or accept `status` field will now include the new values:

### Affected Schema: `blocks` table

**Column:** `status block_status NOT NULL DEFAULT 'uploaded'`

**New Valid Values:**  
All existing endpoints accepting/returning `status` must now handle:
```json
{
  "status": "processing" | "rejected" | "error_processing" | "uploaded" | "validated" | "in_fabrication" | "completed" | "archived"
}
```

### Backend Schema (Pydantic) - Future Update

**File:** `src/backend/schemas.py` (to be updated in T-024-AGENT or T-028-BACK)

```python
from enum import Enum

class BlockStatus(str, Enum):
    """Block lifecycle status ENUM matching PostgreSQL block_status type.
    
    Transition rules:
      uploaded -> processing -> {validated | rejected | error_processing}
      validated -> in_fabrication -> completed -> archived
      rejected -> uploaded (after fixes)
      error_processing -> uploaded (after manual review)
    """
    UPLOADED = "uploaded"
    PROCESSING = "processing"           # NEW
    VALIDATED = "validated"
    REJECTED = "rejected"               # NEW
    ERROR_PROCESSING = "error_processing"  # NEW
    IN_FABRICATION = "in_fabrication"
    COMPLETED = "completed"
    ARCHIVED = "archived"

# Usage in schemas
class BlockRead(BaseModel):
    id: UUID
    iso_code: str
    status: BlockStatus  # Now includes new values
    # ... other fields

class BlockUpdate(BaseModel):
    status: Optional[BlockStatus] = None  # Validation logic enforces transitions
    # ... other fields
```

### Frontend Types (TypeScript) - Future Update

**File:** `src/frontend/src/types/blocks.ts` (to be updated in T-031-FRONT)

```typescript
/**
 * Block lifecycle status matching PostgreSQL block_status ENUM.
 * 
 * Valid transitions:
 *   uploaded -> processing -> validated | rejected | error_processing
 *   validated -> in_fabrication -> completed -> archived
 *   rejected -> uploaded (after fixes)
 *   error_processing -> uploaded (after manual review)
 */
export type BlockStatus = 
  | 'uploaded'
  | 'processing'          // NEW
  | 'validated'
  | 'rejected'            // NEW
  | 'error_processing'    // NEW
  | 'in_fabrication'
  | 'completed'
  | 'archived';

export interface Block {
  id: string;
  iso_code: string;
  status: BlockStatus;  // Now includes 3 new values
  // ... other fields
}

// Helper function for UI rendering
export function getStatusColor(status: BlockStatus): string {
  const colorMap: Record<BlockStatus, string> = {
    uploaded: 'gray',
    processing: 'blue',           // NEW - spinner/loading state
    validated: 'green',
    rejected: 'red',              // NEW - error state
    error_processing: 'orange',   // NEW - warning state
    in_fabrication: 'purple',
    completed: 'teal',
    archived: 'gray',
  };
  return colorMap[status];
}

export function getStatusLabel(status: BlockStatus): string {
  const labelMap: Record<BlockStatus, string> = {
    uploaded: 'Uploaded',
    processing: 'Processing...',             // NEW
    validated: 'Validated',
    rejected: 'Validation Failed',           // NEW
    error_processing: 'Processing Error',    // NEW
    in_fabrication: 'In Fabrication',
    completed: 'Completed',
    archived: 'Archived',
  };
  return labelMap[status];
}
```

**Contract Verification:**  
✅ Pydantic `BlockStatus` enum values match TypeScript `BlockStatus` union type **exactly** (1:1 mapping)

---

## 4. Component Contract

**This ticket does NOT create or modify UI components.**

However, future components will consume the new status values:

### T-031-FRONT: Real-Time Status Listener

**Expected Behavior:**
```tsx
// Component will subscribe to blocks table changes
useSupabaseRealtime('blocks', part_id);

// On status change event
if (newStatus === 'processing') {
  // Show spinner overlay
  showToast('Validation in progress...', { type: 'info' });
} else if (newStatus === 'validated') {
  // Show success
  showToast('Validation passed!', { type: 'success' });
} else if (newStatus === 'rejected') {
  // Show error + link to validation report
  showToast('Validation failed. View report.', { type: 'error', action: openReport });
} else if (newStatus === 'error_processing') {
  // Show system error
  showToast('Processing error. Contact support.', { type: 'warning' });
}
```

### T-032-FRONT: Validation Report Visualizer

**Status Badge Component:**
```tsx
<StatusBadge status={block.status} />

// Renders:
// 'processing' → 🔵 Processing... (with spinner)
// 'rejected' → 🔴 Validation Failed
// 'error_processing' → 🟠 Processing Error
```

---

## 5. Test Cases Checklist

### ✅ Happy Path (ENUM Extension)

- [ ] **Test 1: ADD VALUE processing succeeds**
  - **Setup:** PostgreSQL 15 database with `block_status` ENUM (5 original values)
  - **Action:** Execute `ALTER TYPE block_status ADD VALUE 'processing'`
  - **Expected:** Command succeeds without error, value added to ENUM
  
- [ ] **Test 2: ADD VALUE rejected succeeds**
  - **Setup:** Same as Test 1 + 'processing' already added
  - **Action:** Execute `ALTER TYPE block_status ADD VALUE 'rejected'`
  - **Expected:** Command succeeds, ENUM now has 7 values
  
- [ ] **Test 3: ADD VALUE error_processing succeeds**
  - **Setup:** Same as Test 2 + 'rejected' already added
  - **Action:** Execute `ALTER TYPE block_status ADD VALUE 'error_processing'`
  - **Expected:** Command succeeds, ENUM now has 8 values total

- [ ] **Test 4: All 8 ENUM values present**
  - **Setup:** After migration execution
  - **Action:** Query `pg_enum` for `block_status` type values
  - **Expected:** Result contains all values: `['uploaded', 'validated', 'in_fabrication', 'completed', 'archived', 'processing', 'rejected', 'error_processing']` (order may vary)

### ⚠️ Edge Cases (Idempotency & Constraints)

- [ ] **Test 5: ADD VALUE IF NOT EXISTS is idempotent**
  - **Setup:** Migration already executed once
  - **Action:** Execute migration again (re-run scenario)
  - **Expected:** All `ADD VALUE IF NOT EXISTS` commands succeed silently (no duplicate error)
  - **PostgreSQL Version Note:** `IF NOT EXISTS` supported in PG 9.6+

- [ ] **Test 6: INSERT block with new status 'processing'**
  - **Setup:** Migrated database
  - **Action:** `INSERT INTO blocks (iso_code, status, ...) VALUES ('SF-TEST-001', 'processing', ...)`
  - **Expected:** Row inserted successfully, `status` column accepts 'processing'
  
- [ ] **Test 7: UPDATE block to new status 'rejected'**
  - **Setup:** Existing block with status='uploaded'
  - **Action:** `UPDATE blocks SET status='rejected' WHERE iso_code='SF-TEST-001'`
  - **Expected:** Update succeeds, status changes to 'rejected'

- [ ] **Test 8: Invalid status value rejected**
  - **Setup:** Migrated database
  - **Action:** `INSERT INTO blocks (..., status) VALUES (..., 'invalid_status')`
  - **Expected:** PostgreSQL error `invalid input value for enum block_status: "invalid_status"`

### 🛡️ Security/Error Handling

- [ ] **Test 9: Migration executes outside transaction**
  - **Setup:** Automated migration runner (e.g., Supabase CLI)
  - **Action:** Execute migration file
  - **Expected:** No error about `ALTER TYPE cannot run inside transaction block`
  - **Implementation Note:** If using `psql`, must NOT wrap in `BEGIN...COMMIT`

- [ ] **Test 10: Verify existing blocks unaffected**
  - **Setup:** Database with existing blocks (status='uploaded', 'validated', etc.)
  - **Action:** Run migration, then query all blocks
  - **Expected:** Existing rows retain their status values, no data corruption

- [ ] **Test 11: RLS policies still apply to new statuses**
  - **Setup:** User with 'workshop' role (can only see blocks with workshop_id matching theirs)
  - **Action:** Query blocks with status='processing' or 'rejected'
  - **Expected:** RLS policies filter results correctly (same behavior as other statuses)

### 🔗 Integration (Migration Verification)

- [ ] **Test 12: Verification query passes**
  - **Setup:** After migration execution
  - **Action:** Execute the `DO $$` verification block from migration file
  - **Expected:** `RAISE NOTICE` confirms all 8 values present, no exception raised

- [ ] **Test 13: pg_enum catalog updated correctly**
  - **Setup:** After migration
  - **Action:** Query `SELECT enumlabel, enumsortorder FROM pg_enum WHERE enumtypid = 'block_status'::regtype ORDER BY enumsortorder`
  - **Expected:** All 8 labels present with sequential sort order

- [ ] **Test 14: Type comment updated**
  - **Setup:** After migration
  - **Action:** Query `SELECT obj_description('block_status'::regtype, 'pg_type')`
  - **Expected:** Comment includes transition rules mentioning 'processing', 'rejected', 'error_processing'

---

## 6. Files to Create/Modify

### Create:

- **`supabase/migrations/20260212100000_extend_block_status_enum.sql`**  
  - ENUM extension migration (3x `ALTER TYPE ADD VALUE` commands)  
  - Verification query  
  - Updated type comment with transition rules  

- **`tests/integration/test_block_status_enum_extension.py`**  
  - Integration tests (Test 4, 5, 6, 7, 8, 10, 12, 13, 14 from checklist)  
  - Uses `psycopg2` for direct SQL queries (same pattern as T-020-DB tests)  

- **`docs/US-002/T-021-DB-TechnicalSpec.md`** ✅ (this document)  
  - Complete technical specification for TDD workflow  

### Modify:

**⚠️ Deferred to Future Tickets:**

These files will need updates but **NOT in T-021-DB** (database-only ticket):

- **`src/backend/schemas.py`** (T-024-AGENT or T-028-BACK)  
  - Add `BlockStatus` Pydantic enum with 3 new values  

- **`src/frontend/src/types/blocks.ts`** (T-031-FRONT)  
  - Extend `BlockStatus` TypeScript union type  
  - Add helper functions: `getStatusColor()`, `getStatusLabel()`  

- **`docs/05-data-model.md`** (T-021-DB - Documentation Only)  
  - Update `blocks` table description to include 3 new status values  
  - Update transition diagram in "Lifecycle States" section  

- **`memory-bank/systemPatterns.md`** (T-021-DB - Documentation Only)  
  - Document ENUM extension pattern (migration + verification query)  

---

## 7. Reusable Components/Patterns

### Pattern: PostgreSQL ENUM Extension (Non-Transactional)

This ticket establishes the **canonical pattern** for extending PostgreSQL ENUMs:

```sql
-- ✅ CORRECT: Outside transaction, with IF NOT EXISTS
ALTER TYPE my_enum ADD VALUE IF NOT EXISTS 'new_value';

-- ❌ INCORRECT: Inside transaction
BEGIN;
  ALTER TYPE my_enum ADD VALUE 'new_value';  -- ERROR!
COMMIT;
```

**Key Lessons:**
1. **Autocommit Mode Required:** Use `psql` with default autocommit or ensure migration runner doesn't wrap in transaction  
2. **Idempotency:** Always use `IF NOT EXISTS` (PG 9.6+) for safe re-runs  
3. **Verification:** Include `DO $$` block to confirm values exist after migration  
4. **No Rollback:** ENUM values are permanent; plan carefully before adding  

### Reuse in Future Tickets:
- **T-XXX-DB** (Future ENUM extensions): Copy migration structure verbatim  
- **Any TypeScript/Pydantic Enum Sync**: Use 1:1 mapping pattern from Section 3  

---

## 8. Next Steps - Handoff for PHASE TDD-RED

**This specification is READY for TDD-RED phase.**

Use the following prompt: `:tdd-red` (or custom TDD-RED prompt) with these values:

```plaintext
=============================================
READY FOR TDD-RED PHASE - T-021-DB
=============================================
Ticket ID:       T-021-DB
Feature name:    Extend Block Status Enum
Migration file:  supabase/migrations/20260212100000_extend_block_status_enum.sql
Test file:       tests/integration/test_block_status_enum_extension.py

Key test cases (4 critical):
  1. All 8 ENUM values present after migration (Test 4)
  2. ADD VALUE IF NOT EXISTS is idempotent (Test 5)
  3. INSERT block with new status 'processing' succeeds (Test 6)
  4. Verification query passes (Test 12)

Special considerations:
  - ALTER TYPE cannot run in transaction
  - Migration file must NOT use BEGIN...COMMIT
  - Use psycopg2 autocommit mode in tests
  - ENUM values are immutable (no rollback needed)

Files to create:
  - supabase/migrations/20260212100000_extend_block_status_enum.sql
  - tests/integration/test_block_status_enum_extension.py
  - tests/fixtures/blocks_with_new_statuses.sql (optional test data)

Pattern established by:
  - T-020-DB migration structure
  - docs/05-data-model.md ENUM definition
  - supabase/migrations/20260211155000_create_blocks_table.sql

Unblocks:
  - T-024-AGENT (Rhino Ingestion Service - needs 'processing' status)
  - T-026-AGENT (Nomenclature Validator - needs 'rejected' status)
  - T-031-FRONT (Real-Time Listener - needs all 3 statuses for UI)
=============================================
```

**Proceed to TDD-RED only after:**
- ✅ This spec reviewed and approved by user  
- ✅ `activeContext.md` updated with T-021-DB status: "Enrichment Complete → Ready for TDD-RED"  
- ✅ Branch `T-021-DB` created (or confirmed existing)  

---

## Appendix A: State Transition Diagram

**Before T-021-DB:**
```
uploaded → validated → in_fabrication → completed → archived
           ↓
        (no intermediate states)
```

**After T-021-DB:**
```
                     ┌─── validated ────┐
                     │                  ↓
uploaded → processing ├─── rejected ────┴→ (can reupload)
                     │
                     └─── error_processing → (manual review)

validated → in_fabrication → completed → archived
```

**Transition Rules:**
| From             | To                    | Trigger                          |
|------------------|-----------------------|----------------------------------|
| uploaded         | processing            | Agent job starts (T-024-AGENT)   |
| processing       | validated             | Validation passed                |
| processing       | rejected              | Validation failed (fixable)      |
| processing       | error_processing      | System error (corrupt file, etc.)|
| rejected         | uploaded              | User re-uploads fixed file       |
| error_processing | uploaded              | User re-uploads after review     |

---

## Appendix B: PostgreSQL ENUM Internals

**Query to inspect current ENUM:**
```sql
SELECT enumlabel, enumsortorder
FROM pg_enum
WHERE enumtypid = 'block_status'::regtype
ORDER BY enumsortorder;
```

**Before migration output:**
```
  enumlabel      | enumsortorder
-----------------+---------------
 uploaded        | 1
 validated       | 2
 in_fabrication  | 3
 completed       | 4
 archived        | 5
```

**After migration output:**
```
  enumlabel        | enumsortorder
-------------------+---------------
 uploaded          | 1
 validated         | 2
 in_fabrication    | 3
 completed         | 4
 archived          | 5
 processing        | 6
 rejected          | 7
 error_processing  | 8
```

**Note:** PostgreSQL assigns sequential `enumsortorder` automatically. New values are appended (order = existing max + 1).

---

## Appendix C: Estimated Effort

**Complexity:** 🟢 LOW (simple ENUM extension, no application logic changes)

**Effort Breakdown:**
| Phase | Task | Time Estimate |
|-------|------|---------------|
| Enrichment | Create this spec | 30 min ✅ |
| TDD-RED | Write 4 critical integration tests | 20 min |
| TDD-GREEN | Create migration SQL + run tests | 15 min |
| TDD-REFACTOR | Update docs/05-data-model.md | 10 min |
| TDD-AUDIT | Verify DoD + update Memory Bank | 15 min |
| **Total** | | **~1.5 hours** |

**Comparison to T-020-DB:**
- T-020-DB: 3 hours (complex migration + JSONB schema + 4 tests)
- T-021-DB: 1.5 hours (simpler, established patterns reused)

---

**END OF TECHNICAL SPECIFICATION**

