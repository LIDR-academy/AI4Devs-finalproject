# Spec Summary (Lite)

Refactor the database structure to apply version atomicity by moving version-specific attributes (`file_path`, `file_size_bytes`, `field_count`, `sepe_url`) from the `pdf_templates` table to the `template_versions` table. This ensures each version stores its own complete metadata, eliminates data inconsistency where parent template attributes don't match the current version, and enables accurate historical tracking across all template versions.
