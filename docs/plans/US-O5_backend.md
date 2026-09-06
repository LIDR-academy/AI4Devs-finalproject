# Backend Implementation Plan: US-O5 Basic Alerts

## Overview

**NestJS application code: none.**

US-O5 adds Prometheus rule files (`MecaTrackApiDown`, `MecaTrackHighHttp5xx`, `MecaTrackHighLatencyP95`), wires `rule_files` in Prometheus config, and a runbook under `infra/observability/runbooks/alerts.md`. MVP notification = Grafana/Prometheus UI (no PagerDuty).

**User story:** [`us/monitoreo y observabilidad/US-O5-alertas-basicas.md`](../../us/monitoreo%20y%20observabilidad/US-O5-alertas-basicas.md)

## Backend coupling (read-only)

Alert PromQL must match US-O2 series and US-O3 job name `mecatrack-api`. Runbook should reference US-O1 probes:

- `GET /api/health/live`
- `GET /api/health/ready`

No new Nest endpoints for alerting.

## Branch

Ops-oriented: `feature/US-O5-observability`.

## Nest checklist

- [ ] N/A — no `apps/api` changes expected
- [ ] If alert expr fails in staging, fix **metric names/labels in US-O2** (Nest) or fix PromQL in rules — prefer aligning rules to shipped metrics

## Verification (ops)

1. Stop `api` >2m → `MecaTrackApiDown` fires.
2. Start `api` → alert resolves.
3. Rules visible at Prometheus `/rules`.
