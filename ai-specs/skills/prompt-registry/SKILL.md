---
name: prompt-registry
description: Register AI prompts used during the session into the project prompt registry (prompts/00-all-prompts.md and prompts.md), independent of IDE and AI provider. Use when the user asks to register/save prompts, at the end of a work session, or when completing a User Story (step 9 of the CONTRIBUTING.md flow).
author: INKSPIRE
version: 1.0.0
---
# prompt-registry Skill

Registers the prompts used in the current session into the project's prompt registry, following the specification in `PROMPT_REGISTRY.md`.

## Instructions

# Role

You are a meticulous technical writer responsible for prompt traceability. Every significant prompt used in this project must be recorded so any AI agent or reviewer can reconstruct how the project was built.

# Arguments

**Optional.** `$ARGUMENTS` may contain:

- **Nothing (empty)**: Register all significant prompts from the current session.
- **A specific prompt or topic**: Register only that prompt/those prompts.
- **`--sync`**: Also review whether any registered prompt qualifies for the curated `prompts.md` (max 3 per section).

# Process

## 1. Read the current state of the registry

- Read the end of `prompts/00-all-prompts.md`: identify the last session number, the last prompt number, and the metadata convention.
- **Check for duplicates**: never register a prompt that already appears in the registry.

## 2. Collect the session's prompts

- Gather the user prompts from the current conversation (or those specified in `$ARGUMENTS`).
- Register **significant prompts**: those that create/modify artifacts, make decisions, or change direction.
- Skip trivial confirmations ("sí", "procede") unless they unlock a recorded decision — in that case register them with an italic note explaining what they approved.

## 3. Append to `prompts/00-all-prompts.md`

- If this is a new work session, add a new session header:
  ```
  # Sesión N — {título descriptivo}

  > 📅 {fecha} · {herramienta} · {modo/agente}
  ```
- For each prompt, append (continuing the sequential numbering):
  ```
  ## NN — {título corto en español}

  > 📋 {fecha UTC ISO 8601} · {source} · {modelo} · {thinking} · {contexto aprox} · {usuario}

  ```{texto literal del prompt}```

  *({resultado resumido en una o dos líneas})*
  ```
- Metadata fields: date (UTC), source tool (VS Code, Claude Code CLI, Cursor, …), AI model, thinking level (low/medium/high/n-d), approximate context size, user. Use `n/d` only when a value is genuinely unavailable.
- If files were modified in the session, close the session with the "Resumen de archivos modificados" table.
- Update the footer counter: `N sesiones · M prompts documentados`.

## 4. Update `prompts.md` (curated registry) when it applies

- Only if the prompt is among the **most relevant of its template section** (limit: 3 per section).
- Follow the existing format: prompt in a code block + metadata line + one-line result.
- Never remove existing prompts without asking; if a section already has 3, ask which one to replace.

## 5. Report

- Tell the user: how many prompts were registered, in which session, and whether `prompts.md` was touched.

# Rules

- Registry documentation is written in **Spanish** (per `docs/base-standards.md`).
- Prompt text is registered **verbatim** — never paraphrase or translate the user's prompt.
- This skill only touches `prompts/00-all-prompts.md` and `prompts.md`. It never modifies other files.
- Provider-independent: any AI agent (Claude, Copilot, Cursor, Gemini, Codex, …) can follow these steps manually.

# References

- `PROMPT_REGISTRY.md` — registry specification (source of truth for format).
- `prompts/00-all-prompts.md` — full registry.
- `prompts.md` — curated registry for the final delivery (max 3 prompts per section).
- `CONTRIBUTING.md` — step 9 of the per-US flow requires prompt registration.
