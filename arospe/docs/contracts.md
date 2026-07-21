# Contracts

Behavioral contracts that govern what actions an AI agent working in this repository is allowed or forbidden to take, and how it should make decisions when working here. This is distinct from [architecture/authorization.md](architecture/authorization.md) (application-level roles/permissions enforced by the running app) and [conventions/](conventions/) (code style) — those govern the *product*; this file governs the *agent*.

New contracts are appended below as additional `###` sections; nothing here is removed without the change being visible in this file's history.

### Uncertainty Handling Rule

When you are not sufficiently confident that you understand the user's intent or have all the information required to complete a task correctly, **do not make assumptions or choose an option on the user's behalf**.

Follow this protocol:

1. **Proceed only when the request has a single, clear, and well-supported interpretation.**
2. **If any required information is missing, ambiguous, or open to multiple reasonable interpretations, stop before taking action.**
3. **Ask concise, specific clarifying questions to resolve the ambiguity.**
4. **Whenever appropriate, present multiple possible answers or courses of action. Clearly label the option you believe is the best fit for the project as _**(recommended)**_, and briefly explain why you recommend it.**
5. **Wait for the user's response before continuing with any action that depends on the answer.**
6. **Never invent missing information, infer user preferences, or make irreversible decisions without explicit confirmation.**
7. **When in doubt, asking a clarifying question is always preferred over making an assumption.**

Your goal is to maximize correctness rather than speed. It is better to ask one clarifying question than to complete the wrong task. When providing options, your role is to guide the user with a recommendation—not to make the final decision on their behalf.

### Commit Approval Rule

You must **never commit anything on behalf of the user**. Committing is a human decision that requires a human to review the actual staged changes first — even a direct, explicit-seeming instruction to "commit" is a request to prepare a commit for review, not to run `git commit` yourself.

Follow this protocol:

1. **Stage only the intended changes explicitly** with `git add <files>`, naming the specific files. Never stage with `git add -A`, `git add .`, or any other bulk/catch-all form.
2. **Prepare a draft commit message** for the staged changes.
3. **Present both to a human for review**: what was staged and the proposed commit message, so the human can inspect the actual staged changes (e.g. via `git diff --staged` / `git status`) before deciding.
4. **Wait for explicit human approval before running `git commit`.** Do not run `git commit` until a human has reviewed the staged changes and explicitly approved. Absent that approval, stop at staging plus a proposed message.
5. **Treat even an explicit "commit this" as stopping at staging plus a proposed message for review** — do not interpret it as pre-approval to run `git commit`. The approval must come *after* the human has seen the actual staged changes.

This contract is intentionally stricter than the general "only commit when explicitly asked" git-safety guidance: here the boundary is that you never run `git commit` at all without a human first reviewing the staged diff and explicitly approving.

_Last updated: 2026-07-19 — Added the Commit Approval Rule: never run `git commit` on the user's behalf; always stop at explicit staging plus a proposed message and wait for human review/approval._
