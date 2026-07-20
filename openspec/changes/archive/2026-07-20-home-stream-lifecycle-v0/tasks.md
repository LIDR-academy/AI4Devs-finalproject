<!-- Orchestration tasks owned by the team lead. Implementation detail lives in each teammate's own change. -->

## 1. Record and delegate

- [x] 1.1 Record the resolved contract (§6), Topology 2, and ratified decisions in this root change (proposal + design + specs)
- [x] 1.2 Delegate the three deliverables; each teammate runs its own `/opsx:propose` in its own scope against §6 + Topology 2 + the ratified decisions
- [x] 1.3 Confirm `security` and `users` are not engaged and their scopes are untouched

## 2. Teammate proposals accepted (proposal → design → tasks in each scope)

- [x] 2.1 qc-portal proposal accepted
- [x] 2.2 streamer proposal accepted
- [x] 2.3 devops proposal accepted

## 3. Cross-scope coordination settled

- [x] 3.1 Proxy routing finalized: literal `/streams*` → streamer, else → portal static (`portal:3000`); SPA fallback owned inside the portal image
- [x] 3.2 Valkey env vars identical (streamer reads / devops supplies); healthcheck via streamer's in-image `streamer healthcheck` subcommand
- [x] 3.3 Description length counting confirmed as code points on both sides; both boundary-tested at 100/101

## 4. Implementation race (each teammate applied its own change, with evidence)

- [x] 4.1 streamer done + verified: gofmt/vet/golangci-lint clean, `go test -race ./...` pass, tidy; §6 + `/healthz`+`/readyz`; error body `{"error"}`; distroless build; go-redis/v9 justified; scope-clean, strict-valid
- [x] 4.2 qc-portal done + verified: `tsc --noEmit` strict clean, `bun test` 49 pass, Biome clean, no `any`/`@ts-ignore` in prod; multi-stage build + `docker run` verified; style spot-check clean; explicit style-law statement (AC9); scope-clean, strict-valid
- [x] 4.3 devops done + verified: both images build; `docker compose up` succeeds; readiness-gated ordering; full lifecycle E2E through single origin (verbatim `/streams`, no CORS); Valkey-down→503 path; clean ephemeral teardown; pinned images, no secrets; scope-clean, strict-valid

## 5. Acceptance criteria verified (PRD §8)

- [x] 5.1 Empty Home shows empty state + Start streaming (AC1) — qc-portal home tests
- [x] 5.2 Start with valid title (with/without description) creates, redirects to `/stream/{id}`, appears on Home (AC2) — qc-portal + streamer + devops E2E
- [x] 5.3 Empty title blocked client-side and rejected server-side with `400` (AC3)
- [x] 5.4 Description over 100 code points blocked client-side and rejected server-side (AC4)
- [x] 5.5 Cancel creates nothing (AC5)
- [x] 5.6 End stream removes it and redirects to `/`; ending an already-ended stream redirects without error (AC6)
- [x] 5.7 `docker compose up` brings Valkey + streamer wired; portal works end to end (AC7) — devops command output
- [x] 5.8 Full suites pass with evidence (AC8); qc-portal done report states style-law compliance (AC9)

## 6. Close

- [x] 6.1 All three teammate changes report done with evidence; every §8 criterion verified
- [x] 6.2 Consolidate evidence and present the final summary to the human
- [ ] 6.3 Human gives the final word on shipped; archive this change and the teammate changes on approval
