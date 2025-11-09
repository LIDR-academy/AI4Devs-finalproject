# Spec Summary (Lite)

Extend database schema to support PDF template analysis by adding metadata columns (title, author, subject, dates, page_count) to `template_versions` table and creating new `template_fields` table to store detailed AcroForm field data. All changes managed through Alembic migration following existing project patterns (Integer PKs, proper indexing, timezone-aware timestamps).
