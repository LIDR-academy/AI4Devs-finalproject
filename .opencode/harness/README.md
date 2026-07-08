# Realista Harness

This directory documents the **technical support** of the Realista project: the stack, environment, testing strategy, and operational procedures that the AI agents and human developers use to build and run the system.

## What is a "harness"?

In AI engineering, a **harness** is the collection of tools, scripts, configuration, and documentation that surrounds the model and enables it to operate reliably. Without a good harness, an LLM produces inconsistent, unreproducible output. With a good harness, the LLM becomes a predictable component in a deterministic pipeline.

For Realista, the harness covers:

- **Stack** (languages, frameworks, libraries) — what we build with
- **Environment** (env vars, secrets) — what the system needs to know
- **Testing** (TDD, coverage, E2E) — how we verify
- **Local run** (Docker, dev server) — how to start
- **Troubleshooting** (common errors) — what to do when things break

## Documents in this directory

| File | Purpose |
|---|---|
| [stack.md](./stack.md) | Exact versions, compatibility matrix, why each choice |
| [env-vars.md](./env-vars.md) | All environment variables: required, optional, with example values |
| [test-strategy.md](./test-strategy.md) | TDD workflow, coverage targets, Vitest + Playwright setup |
| [run-locally.md](./run-locally.md) | `docker compose up -d && npm install && npm run db:migrate && npm run dev` |
| [troubleshooting.md](./troubleshooting.md) | Common errors and their fixes |

## Related directories

- [`.opencode/agents/`](../agents/) — high-level AI agents
- [`.opencode/commands/`](../commands/) — slash commands
- [`.opencode/skills/`](../skills/) — encapsulated behaviours
- [`.opencode/hooks/`](../hooks/) — automation triggers
- [`.opencode/playbooks/`](../playbooks/) — multi-step flows
- [`.opencode/prompts/`](../prompts/) — LLM prompt-runs
- [`docs/evidence/`](../../evidence/) — per-task evidence (self-documentation)
- [`specs/001-realista-mvp/`](../../../specs/001-realista-mvp/) — spec-kit artefacts

## Versioning

The harness evolves with the project. Bump the harness version (`harness_version` in `config.yaml`) when:

- A new major library is added or removed
- A new external API is integrated
- The deployment target changes
- The testing framework changes

## Contributing to the harness

When you change the harness (e.g., add a new env var, change the test framework), update the relevant doc here AND mention it in the next `auto-evidence` invocation. The harness is documentation-as-code.
