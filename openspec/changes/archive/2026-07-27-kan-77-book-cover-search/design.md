## Context

KAN-9 implemented `GET /v1/books/catalog/search` and `GET /v1/books/catalog/covers`. KAN-77 composes them for edit flow without persisting catalog data.

## Goals / Non-Goals

**Goals:** Owned-book cover search endpoint; reuse existing catalog services; empty 200 on no covers.

**Non-goals:** Frontend picker UI (KAN-78); persisting selection (KAN-79); new catalog providers.

## Decisions

### 1. Dedicated orchestrator service

`BookCoverSearchService` keeps controller thin and is unit-testable with mocked catalog/covers services.

### 2. Filter editions without covers

Return only editions with `covers.length > 0` in `items` to match BDD "empty list when no covers".

### 3. Default query

`{title} {authors}` trimmed; optional `q` overrides when user refines search.

### 4. Search limit

Reuse catalog default limit (20 editions per request).

## Migration Plan

None — additive API.
