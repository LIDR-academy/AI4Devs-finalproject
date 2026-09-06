# Backend Implementation Plan: US-O4 Grafana Dashboards

## Overview

**NestJS application code: none.**

US-O4 provisions Grafana (Compose profile `observability`), Prometheus datasource, and dashboard JSON under `infra/observability/grafana/`. Host port **`127.0.0.1:3001`** (avoid conflict with MecaTrack web `3000`).

**User story:** [`us/monitoreo y observabilidad/US-O4-grafana-dashboards.md`](../../us/monitoreo%20y%20observabilidad/US-O4-grafana-dashboards.md)

## Backend coupling (read-only)

Dashboard PromQL must match US-O2 metric names:

- `mecatrack_http_requests_total`
- `mecatrack_http_request_duration_seconds` (+ `_bucket` for histograms)
- `up{job="mecatrack-api"}`

If metric names change in `apps/api`, update dashboard JSON in the same epic — still not Nest code.

## Branch

Ops-oriented: `feature/US-O4-observability` (or `feature/US-O4-backend` only if process requires the suffix).

## Nest checklist

- [ ] N/A — no `apps/api` changes expected

## Next

US-O5 alert rules / runbook.
