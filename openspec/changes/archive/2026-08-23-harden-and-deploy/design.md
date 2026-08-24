## Context

Nine functional changes have landed (F1–F9). The two remaining gaps from the plan are operational, not functional: resilience under sustained ERP failure, and documentation for someone other than the original author to run the system.

## Goals / Non-Goals

**Goals:**
- A minimal, well-tested circuit breaker that composes with the existing timeout+retry logic in `RestGateway` without changing its public interface.
- A root README that lets a new developer go from clone to running app in a few commands.
- A deployment runbook precise enough to execute mechanically when real hosting accounts exist.

**Non-Goals:**
- Actually provisioning Render/Railway/Vercel/managed Postgres — no accounts exist for this project; provisioning is out of scope here and documented as a follow-up.
- Playwright E2E tests — requires downloading browser binaries, not available in this environment; documented as a follow-up rather than attempted and left broken.
- Scheduled/periodic ERP sync (Celery beat) — still the open item from `add-financial-cache` (PD-10), unrelated to hardening the gateway itself.

## Decisions

- **In-process, per-ERP circuit breaker state** (`_BreakerState` per `proyecto` key: `consecutive_failures`, `opened_at`) held on the `RestGateway` instance — matches the existing per-process singleton lifecycle of the gateway (`get_erp_gateway()` caches one instance per process). *Alternative considered:* a shared cache (Redis) — rejected as overkill; a single-process Django deployment's in-memory breaker is sufficient at this scale, and the interface allows swapping the storage later without touching call sites.
- **Breaker check happens in `_request` before the retry loop.** If open, raise `ERPUnavailableError` immediately with a message indicating the breaker is open (distinguishable in logs from a fresh timeout). Every failure that exhausts retries increments the counter; every success resets it to zero.
- **Configuration via existing settings pattern**: `ERP_CIRCUIT_BREAKER_THRESHOLD` (default 5) and `ERP_CIRCUIT_BREAKER_COOLDOWN_SECONDS` (default 30), alongside the existing `ERP_HTTP_TIMEOUT_SECONDS`/`ERP_HTTP_MAX_RETRIES`.
- **Root README vs delivery `readme.md`**: the existing `readme.md` is the Master-template delivery document (kept as-is, per prior conventions). A new root `README.md` — actually, to avoid a naming collision on case-insensitive filesystems, this is written as `docs/getting-started.md` and linked from the top of `readme.md`, rather than a second root-level file that could collide with or shadow the delivery document.
- **`docs/deployment.md`** mirrors `readme.md` §2.4's steps as an actual checklist with the specific commands (`docker build`, environment variable list, `python manage.py migrate`, frontend `npm run build` + static hosting upload) rather than prose.

## Risks / Trade-offs

- **In-memory breaker resets on process restart** — acceptable; a restart is itself a form of recovery attempt, and losing breaker state on restart errs toward retrying rather than staying falsely open.
- **No real infrastructure provisioned** — by design for this delivery phase; the runbook exists so this is a mechanical next step, not a research task, when accounts are available.
- **No E2E browser tests** — mitigated by the extensive unit/integration test suite already built per module (113+ backend tests, frontend component tests); E2E remains a documented gap, not an untested code path.

## Migration Plan

No data migration. The circuit breaker is a behavior change within `RestGateway`; `MockGateway` is unaffected (mock mode has no network failures to break the circuit on). Rollback: revert the breaker check (a small, isolated diff) if it misbehaves in a real ERP integration.

## Open Questions

- Whether the breaker cooldown should be exponential-backoff rather than fixed — start with a fixed cooldown; revisit if real ERP latency data suggests otherwise.
