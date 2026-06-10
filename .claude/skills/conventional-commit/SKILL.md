---
name: conventional-commit
description: Format every git commit following the Conventional Commits specification — type(scope): description, imperative mood, English, concise. Applied automatically whenever Claude makes a commit in this repo.
---

# Conventional Commit

Apply this skill every time you create a git commit in this repository.

---

## Format

```
type(scope): short description

[optional body]

[optional footer(s)]
```

### Rules

- **type**: lowercase, one of the types listed below. Required.
- **scope**: lowercase noun, in parentheses, optional but recommended. Names the
  module, layer or feature area affected.
- **`: `**: exactly one colon and one space.
- **short description**: imperative mood (`add`, `fix`, `remove` — not `added` /
  `fixes` / `removed`); lowercase; no period at the end; max 72 characters total
  for the subject line.
- **body**: optional; explains *why*, not *what*; wrapped at 72 characters; separated
  from subject by a blank line.
- **footer**: optional; `BREAKING CHANGE: <description>` or `Closes #<issue>`.

---

## Types

| Type | When to use |
|---|---|
| `feat` | New user-facing feature or capability |
| `fix` | Bug fix |
| `docs` | Documentation only (md files, comments) |
| `style` | Formatting, whitespace — no logic change |
| `refactor` | Code change that neither adds a feature nor fixes a bug |
| `test` | Add or update tests |
| `chore` | Build config, tooling, dependency updates, repo housekeeping |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |
| `build` | Changes to build system or external dependencies |

---

## Scopes for RunMarket

Use the area of the codebase or domain affected:

`catalog` · `product` · `cart` · `checkout` · `orders` · `filters` ·
`api` · `db` · `auth` · `ui` · `config` · `deps` · `docs` · `infra`

---

## Examples

```
feat(catalog): add multi-dimensional running filters

fix(cart): prevent negative quantity on item update

refactor(checkout): extract stock validation into CheckoutService

test(catalog): add Supertest coverage for GET /api/products filters

docs(sdd): add SDD workflow documentation

chore(deps): upgrade Prisma to 5.14
```

---

## What to avoid

| Bad | Why | Good |
|---|---|---|
| `Fixed bug in cart` | No type, past tense, no scope | `fix(cart): prevent duplicate item on rapid add` |
| `feat: added new filter` | Past tense | `feat(filters): add surface-type filter` |
| `WIP` | Not descriptive | `chore(catalog): scaffold product repository` |
| `update stuff` | No type, vague | `refactor(api): normalise error response shape` |
| Subject line > 72 chars | Truncated in git log | Split into subject + body |

---

## Co-author footer

Always append the co-author line when Claude generates the commit:

```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```
