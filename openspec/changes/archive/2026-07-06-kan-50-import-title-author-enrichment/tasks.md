# Tasks — KAN-50 Import title+author enrichment

Jira: KAN-50 (US-14 / KAN-48)

## 0. Setup

- [x] 0.1 Branch `feature/KAN-50-import-title-author-enrichment`
- [x] 0.2 OpenSpec change `kan-50-import-title-author-enrichment`

## 1. Backend

- [x] 1.1 `CatalogService.lookupByTitleAuthor`
- [x] 1.2 `ImportCatalogEnrichmentService` + enrichment_failed in processor
- [x] 1.3 Unit tests + api-spec

## 2. Verification

- [x] 2.1 `npm test` catalog + enrichment + processor specs
