# Tasks — KAN-49 Import ISBN enrichment

Jira: KAN-49 (US-14 / KAN-48)

## 0. Setup

- [x] 0.1 Branch `feature/KAN-49-import-isbn-enrichment`
- [x] 0.2 OpenSpec change `kan-49-import-isbn-enrichment`

## 1. Backend

- [x] 1.1 `CatalogService.lookupByIsbn`
- [x] 1.2 `ImportIsbnEnrichmentService` + wire in processor
- [x] 1.3 Unit tests

## 2. Verification

- [x] 2.1 `npm test` catalog + enrichment + processor specs
