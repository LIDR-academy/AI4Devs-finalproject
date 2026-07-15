# Research: Google Calendar Infrastructure Setup

**Phase**: 0 — Technical Research
**Date**: 2026-07-15

## Overview

This feature provisions GCP infrastructure for Calendar API integration. No technical unknowns requiring research — the scope (GCP project + Calendar API + Service Account + system calendar) is well-documented by Google and follows standard patterns.

## Known Decisions

### GCP Project ID Convention
- **Decision**: `coacher-scheduling-engine`
- **Rationale**: Descriptive, reflects the application name and purpose
- **Alternatives**: `coacher-gcal-sync`, `coacher-calendar-sa`

### Service Account Naming
- **Decision**: `scheduling-engine-calendar-sa`
- **Rationale**: Clearly identifies the SA's purpose and what system uses it
- **Alternatives**: `gcal-sa`, `calendar-service`, `coacher-calendar-bot`

### Environment Variable Schema
- **Decision**: `GOOGLE_CALENDAR_SA_EMAIL`, `GOOGLE_CALENDAR_SA_KEY_PATH`, `GOOGLE_CALENDAR_ID_*`
- **Rationale**: Clear prefix (`GOOGLE_CALENDAR_`) groups all calendar-related config; suffix per environment (`_DEV`, `_STAGING`, `_PROD`) enables per-environment Calendar ID selection
- **Alternatives**: Single `GOOGLE_CALENDAR_ID` + env-based override, YAML config file

### Calendar Sharing via Google Calendar UI (not API)
- **Decision**: Manual UI-based sharing in Google Calendar web interface
- **Rationale**: The Google Calendar API does not support adding Service Account email addresses programmatically to calendar ACLs in a straightforward manner — the UI is the documented approach for this operation
- **Alternatives**: Calendar API `acl.insert` endpoint (requires domain-wide delegation of authority, which adds complexity and security risk)

### Environment Isolation Strategy
- **Decision**: Shared GCP project + Service Account, separate calendars per environment
- **Rationale**: Avoids managing multiple SA keys while maintaining data isolation between environments
- **Alternatives**: Per-environment GCP projects (stronger isolation, higher overhead); single calendar for all environments (weaker isolation)

### Secret Rotation Procedure
- **Decision**: SA key rotated by deleting old key and generating new one via `gcloud iam service-accounts keys delete` + `keys create`
- **Rationale**: Standard GCP procedure, no need to recreate the SA itself
- **Alternatives**: Create a new SA entirely (updates calendar sharing permissions needed)

## Calendar API Quota

- **Free tier**: 1,000,000 queries/day
- **Expected usage**: Low (gym class scheduling — likely <1,000 queries/day per environment)
- **Decision**: Free tier is sufficient for the foreseeable future
- **Fallback**: If exceeded, request quota increase via GCP Console → IAM & Admin → Quotas
