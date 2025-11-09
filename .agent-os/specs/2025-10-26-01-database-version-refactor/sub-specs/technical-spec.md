# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-26-01-database-version-refactor/spec.md

## Technical Requirements

### Backend: SQLAlchemy Model Changes

**File:** `backend/app/models/template.py`

**PDFTemplate Model Changes:**

- Rename column: `version` → `current_version` (VARCHAR(50), NOT NULL, indexed)
- Add column: `comment` (TEXT, nullable) for administrative notes
- Remove columns: `file_path`, `file_size_bytes`, `field_count`, `sepe_url` (moved to TemplateVersion)

**TemplateVersion Model Changes:**

- Add column: `file_path` (VARCHAR(500), NOT NULL)
- Add column: `file_size_bytes` (INTEGER, NOT NULL)
- Add column: `field_count` (INTEGER, NOT NULL, default=0)
- Add column: `sepe_url` (VARCHAR(1000), nullable)

### Backend: Pydantic Schema Updates

**File:** `backend/app/schemas/template.py`

**TemplateBase Schema:**

- Rename field: `version` → `current_version`
- Add field: `comment` (Optional[str])
- Remove fields: `file_path`, `file_size_bytes`, `field_count`, `sepe_url`

**TemplateResponse Schema:**

- Should derive version-specific data from the current version relationship
- Include: `id`, `name`, `current_version`, `comment`, `uploaded_by`, `created_at`, `updated_at`
- For backward compatibility, optionally include computed fields that fetch from current version: `file_path`, `file_size_bytes`, `field_count`, `sepe_url`

**TemplateVersionResponse Schema:**

- Add fields: `file_path`, `file_size_bytes`, `field_count`, `sepe_url`
- Maintain existing fields: `id`, `template_id`, `version_number`, `change_summary`, `is_current`, `created_at`, PDF metadata fields

### Backend: API Endpoint Updates

**File:** `backend/app/api/v1/endpoints/templates.py`

**Affected Endpoints:**

- `GET /api/v1/templates/` - Update query to join with current version for file metadata
- `GET /api/v1/templates/{template_id}` - Fetch version-specific data from related version
- `GET /api/v1/templates/{template_id}/download` - Use file_path from current version
- `PUT /api/v1/templates/{template_id}` - Update only parent template fields (name, comment), not version-specific data
- `DELETE /api/v1/templates/{template_id}` - No changes (cascade delete still works)

**File:** `backend/app/api/v1/endpoints/ingest.py`

**Affected Endpoints:**

- `POST /api/v1/templates/ingest` - When creating/updating templates:
  1. Create/update PDFTemplate with `name`, `current_version`, `comment`
  2. Create TemplateVersion with `file_path`, `file_size_bytes`, `field_count`, `sepe_url`, and all PDF metadata
  3. Set `is_current=True` for the new version, `is_current=False` for previous versions
  4. Update parent template's `current_version` to match new version's `version_number`

### Backend: Service Layer Updates

**File:** `backend/app/services/pdf_analysis_service.py`

- Update any logic that directly accesses `file_path` from PDFTemplate to access it through the version relationship
- Update file storage logic to associate file paths with specific versions

### Frontend: TypeScript Interface Updates

**File:** `frontend/src/types/templates.types.ts`

**Template Interface:**

```typescript
export interface Template {
  id: number;
  name: string;
  current_version: string; // renamed from 'version'
  comment: string | null; // new field
  uploaded_by: number | null;
  created_at: string;
  updated_at: string | null;
  // For backward compatibility, include these from current version:
  file_path?: string;
  file_size_bytes?: number;
  field_count?: number;
  sepe_url?: string | null;
}
```

**TemplateVersion Interface:**

```typescript
export interface TemplateVersion {
  id: number;
  template_id: number;
  version_number: string;
  file_path: string; // new field
  file_size_bytes: number; // new field
  field_count: number; // new field
  sepe_url: string | null; // new field
  change_summary: string | null;
  is_current: boolean;
  created_at: string;
  // PDF Document Metadata
  title: string | null;
  author: string | null;
  subject: string | null;
  creation_date: string | null;
  modification_date: string | null;
  page_count: number;
}
```

### Frontend: Component Updates

**Files to Update:**

- `frontend/src/components/templates/TemplatesTable.tsx` - Use `template.current_version` (already done)
- `frontend/src/components/templates/VersionHistoryModal.tsx` - Display `file_size_bytes` and `sepe_url` from version data
- `frontend/src/pages/templates/TemplatesPage.tsx` - No changes needed if using existing hooks
- `frontend/src/hooks/useTemplates.ts` - Update to handle new field names

### Data Migration Strategy

**Alembic Migration Logic:**

1. **Add new columns to template_versions** (with nullable constraints temporarily):

   - `file_path` (VARCHAR(500), temporarily nullable)
   - `file_size_bytes` (INTEGER, temporarily nullable)
   - `field_count` (INTEGER, temporarily nullable)
   - `sepe_url` (VARCHAR(1000), nullable)

2. **Rename column in pdf_templates**:

   - `version` → `current_version`

3. **Add new column to pdf_templates**:

   - `comment` (TEXT, nullable)

4. **Data migration** (Python code in migration):

   ```python
   # For each PDFTemplate, copy data to its current version
   for template in db.query(PDFTemplate).all():
       current_version = db.query(TemplateVersion).filter(
           TemplateVersion.template_id == template.id,
           TemplateVersion.is_current == True
       ).first()

       if current_version:
           current_version.file_path = template.file_path
           current_version.file_size_bytes = template.file_size_bytes
           current_version.field_count = template.field_count
           current_version.sepe_url = template.sepe_url

   db.commit()
   ```

5. **Make new columns NOT NULL** (except sepe_url):

   - Alter `template_versions.file_path` to NOT NULL
   - Alter `template_versions.file_size_bytes` to NOT NULL
   - Alter `template_versions.field_count` to NOT NULL

6. **Drop old columns from pdf_templates**:
   - Drop `file_path`, `file_size_bytes`, `field_count`, `sepe_url`

### Testing Requirements

**Backend Tests:**

- Unit tests for updated SQLAlchemy models
- Integration tests for all modified API endpoints
- Migration test to ensure data is correctly transferred
- Test that current version data is accessible through parent template

**Frontend Tests:**

- Update existing component tests with new field names
- Test that version-specific data displays correctly
- Test backward compatibility if template includes version data

### Error Handling

- **Migration Rollback:** Ensure migration can be safely rolled back if issues occur
- **Null Safety:** Handle cases where a template might not have a current version (data integrity check)
- **API Validation:** Validate that required version fields are present when creating versions
- **Frontend Fallbacks:** Display placeholder or error message if version data is unavailable

### Performance Considerations

- **Database Joins:** Monitor query performance when fetching templates with version data (add indexes if needed)
- **API Response Time:** Ensure template list endpoint remains fast with additional joins
- **Migration Duration:** Estimate and test migration time for large datasets (should complete within reasonable timeframe)

### Backward Compatibility

To maintain API compatibility during transition:

- **Option 1:** Include computed fields in TemplateResponse that fetch from current version
- **Option 2:** Explicitly document breaking changes and require frontend updates
- **Recommended:** Use Option 1 to avoid breaking existing integrations

### Documentation Updates

- Update API documentation in FastAPI Swagger/OpenAPI
- Update database schema documentation
- Document the migration process and rollback procedures
- Update developer README with new model structure
