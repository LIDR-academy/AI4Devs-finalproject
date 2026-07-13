# Role

You are a senior software architect and AI-agentic workflow specialist with deep expertise in GitHub's **spec-kit** and Spec-Driven Development (SDD) methodology.

# Objective

Fully configure this project's spec-kit setup by:

1. Populating `.specify/memory/constitution.md` with project-specific governing principles.
2. Creating `AGENTS.md` at the project root with practical, operational guidance for AI coding agents.
3. Identifying and creating any Claude Code Skills that would materially improve this project's development workflow.
4. Auditing the rest of the spec-kit setup and applying any additional best-practice configuration needed to get full value from the toolkit.

# Context

- Spec-kit has just been installed in this repository (the `.specify/` folder and agent command integrations are present).
- No project-specific content exists yet in the constitution or in AGENTS.md.
- The repository may already contain useful signal for these files: README, existing PRDs, architecture diagrams, ER diagrams, API specifications, git history, package manifests, linters, and test configuration.

# Step-by-Step Instructions

## Step 1 — Discover before writing
- Inspect the repository structure, tech stack (`package.json`, `pyproject.toml`, etc.), existing docs (README, PRD, architecture/ER diagrams, API specs), test setup, linters, and CI config.
- Check whether `.specify/memory/constitution.md` already contains the template (from `constitution-template.md`) with placeholder tokens (e.g. `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`) — use that template's structure rather than inventing a new one.
- Note any quality/security conventions already implied by the code (e.g. existing references to OWASP Top 10, testing frameworks in use).

## Step 2 — Populate the constitution (`.specify/memory/constitution.md`)
- Fill in the existing template placeholders with concrete, project-specific principles.
- Keep the constitution to **non-negotiable, high-level governing principles** only — the "why" and "must always" of the project. Cover at minimum:
  - Code quality standards
  - Testing standards and minimum coverage expectations
  - UX/consistency requirements (if applicable)
  - Performance requirements
  - Security requirements (reference OWASP Top 10 where relevant)
  - Governance: how principles are amended, versioned, and enforced (constitution supersedes other docs; deviations require documented justification)
- Use declarative MUST/SHOULD language — avoid vague wording like "should probably."
- Do **not** include operational details (folder structure, commands, tech stack) here — that belongs in AGENTS.md (Step 3).
- If the command template requires it, prepend a Sync Impact Report (as an HTML comment) summarizing what changed, per spec-kit's own convention.

## Step 3 — Create `AGENTS.md`
- Place it at the project root, following the community AGENTS.md convention (this is the same file spec-kit itself manages as its `context_file`).
- Treat it as the operational "table of contents" for any AI agent working in the repo. Include:
  - Project overview and purpose (one paragraph)
  - Tech stack and key dependencies
  - Folder/module structure
  - Build, run, test, and lint commands
  - Coding conventions and patterns already used in the repo
  - Branch naming and commit message conventions
  - PR process, including agent-disclosure practice if agents author PRs
  - A short pointer to `.specify/memory/constitution.md` for governing principles — do not restate the principles here
- Explicitly avoid duplicating anything already stated in the constitution; AGENTS.md should **reference** it, not repeat it.

## Step 4 — Identify and create Claude Code Skills
- Based on what you find in Step 1 (recurring workflows, repetitive documentation patterns, domain complexity), identify 1–4 skills that would genuinely save effort on this project. Only create a skill if it is justified by something you actually observed in the repo, for example:
  - Keeping ER diagrams / data models in sync with the spec
  - Generating or validating API specs from a PRD
  - Checking new specs/plans against the constitution's security section
- For each skill created, include a `SKILL.md` with a clear trigger description, so it is invoked only when relevant.
- Do not create speculative skills "just to have them."

## Step 5 — Audit the rest of the spec-kit setup
Check for and address any of the following, since these are commonly missed after installation:
- Confirm all spec-kit slash commands are available (`/speckit.constitution`, `/speckit.specify`, `/speckit.clarify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.analyze`, `/speckit.implement`).
- Verify `.specify/templates/` (spec, plan, tasks) are present and consistent with any constitution changes made in Step 2.
- Check for `.specify/extensions.yml` and confirm any hooks are valid/enabled as intended.
- Confirm a `specs/` directory convention is in place for feature specs.
- Recommend (and set up if appropriate) a commit-message template and branch-naming convention consistent with what's documented in AGENTS.md.
- Flag anything else you find, during the audit, that would materially improve the team's ability to get value from spec-kit.

# Constraints

- Do not invent or duplicate content between the constitution and AGENTS.md — each has a distinct role (Step 2 vs Step 3).
- Base all content on what you actually find in the repo; do not fabricate project details you can't verify.
- If critical information is missing (e.g. no discoverable tech stack, no existing docs), **ask me before proceeding** rather than guessing.
- Follow the spec-kit conventions and templates as actually installed in this repo, rather than a generic or outdated structure.

# Output Format

- Make the actual file edits/creations directly in the repository (`constitution.md`, `AGENTS.md`, any `SKILL.md` files, and any other config changes from Step 5).
- After completing the changes, give me a summary covering:
  1. What was written into the constitution, and why.
  2. What was written into AGENTS.md, and why.
  3. Any skills created, with a one-line justification for each.
  4. Any additional best-practice fixes applied in Step 5.
  5. Any open questions or recommendations you didn't act on but think I should decide on.