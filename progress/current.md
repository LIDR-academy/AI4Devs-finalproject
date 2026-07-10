# Current session

**Active feature:** pdf-upload-extraction
**Folder:** docs/features/pdf-upload-extraction/
**Phase:** approved
**Status:** Spec + Gherkin contract (16+1 scenarios, @s1-@s17) approved at the combined human gate. 15 tasks across 3 slices. Starting Phase 2 (implementator, TDD, Slice 1).
**Notes:** Locked decisions: 10MB/20-page limits (tunable `PDF_EXTRACTION_LIMITS` constant), mupdf-wasm (AGPL, accepted) behind `PdfExtractionAdapter`, analytics included (task-15, @s17), schema (documents+document_images, pdf-uploads/pdf-images buckets) + downscale targets (1024px/JPEG q80) as proposed. Branch: feat/pdf-upload-extraction (worktree .worktrees/pdf-upload-extraction), off feature-entrega2-HernanLaura.
