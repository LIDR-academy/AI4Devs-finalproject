# Risks — ai-lesson-generation

| # | Risk | Type | L | I | Mitigation / Status |
|---|---|---|---|---|---|
| R1 | First LLM call in the repo, in Deno — no Vercel AI SDK/`@ai-sdk/groq` usage yet; Edge runtime quirks possible. | technical | M | H | Time-boxed spike (task-4) proving `@ai-sdk/groq`+`generateObject` run in the real Edge runtime; pure Jest-testable modules behind a thin SDK adapter; fallback to plain `fetch` if SDK misbehaves. **Resolved**: Deno CLI present in sandbox; `deno check`/`deno run` verified SDK + mirrors compile/execute (task-4.md spike note); only the live-network round trip remains an open manual step. |
| R2 | Deno function outside Jest/Stryker harness. | technical | H | M | Decision logic as pure TS in `libs/supabase-services` (Jest+Stryker), hand-mirrored into `_shared/`; function is thin glue, verified manually post-deploy. |
| R3 | Malformed/non-conforming AI output — invalid JSON, wrong shapes, broken `correctOptionId`, composition violation. | technical | H | M | `generateObject` + strict zod deck schema + invariants; failure → typed `generation_failed` (@s15), atomic. Composition enforced in-prompt + post-parse filter. |
| R4 | Generation latency/Edge wall-clock — chapter PDF + 70B model (+ vision) may approach ~30s target. | technical/product | M | M | Input capped (20pg/10MB, R1); vision is rare fallback only; model is a tunable constant. `timeout` surfaces as readable, retryable error (@s15). |
| R5 | Vault decrypted-read availability on hosted project (inherited from R6) — not human-confirmed. | technical | L | H | Same fallback as R6: `pgcrypto`/`pgsodium` `bytea` + symmetric secret if unavailable; RPC signature/higher layers unaffected. Verify early in task-3. |
| R6 | Provider swap regresses shipped R6 tests — `AiProvider` `'openai'→'groq'` breaks ~dozen fixtures + copy. | technical | M | M | One atomic task (task-1): type, both mirrors, copy, all 4 locales, every fixture, in one commit; repo-wide check-types+test before proceeding. |
| R7 | Key exposure/logging leak — careless log/error passthrough could leak the decrypted key (@s8). | security | L | H | Key read only inside function via service-role RPC; never in request/response body or logs; errors normalized to typed codes; explicit "no key in logs" test. |
| R8 | Cost of the learner's own key — retry storm/huge deck multiplies Groq spend. | product | L | M | Deck size bounded by input caps+prompt; one synchronous call per Generate; retries are explicit user actions. Metering out of scope. |
| R9 | Progress fidelity vs. reality — stepper over a single black-box invoke reflects pipeline order, not real-time completion. | product/technical | M | L | Steps mirror true pipeline order, settle deterministically; UI contract (ordered steps + index) stable for a future server-driven upgrade. |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| R1 — PDF upload & extraction | done | Generation input via `documentId`; images carry `page_number`/`position_index`; `description` reserved, currently null. |
| R6 — AI key management | done, **modified** | Adds `get_api_key` service-role read RPC; swaps `AiProvider`/copy to Groq. Validation probe already removed 2026-07-13 — invalid keys surface at generation time. |
| R6 — `ApiKeyGate` guard rail | done | Primary "no key" UX; generation adds only the call-time `missing_key` backstop. |
| R3 — activity slide types | done, **extended** | Adds `SlideImageRef` + optional `SlideBase.image`. |
| R4 — lesson player | pending | Consumes generated deck; hand-off is a placeholder nav until R4 lands. |
| R5 — lesson persistence (`lessons` table) | pending (Phase 2) | Not built here; generation returns an in-memory deck with a minted `lessonId`. |
| R7 — score/results | done | Instructional-only composition (@s4) → zero activity slides → `isScorable === false` naturally. |
| Vercel AI SDK + `@ai-sdk/groq` | not yet installed | First LLM integration; lives in the Deno function's imports only. |
