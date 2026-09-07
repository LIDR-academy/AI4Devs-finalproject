# CI/CD — Optimize-DB: squashing / consolidating migrations

> **Not applicable yet.** There is no migration in this repository — the chain starts with
> **`T-C10-17`**. Squashing a chain of zero or one migration is meaningless. Keep this procedure for
> when the chain has grown, and say so plainly if asked to run it today.

## When it applies (activation signals)

- The chain has accumulated many migrations that only exist because the model was still moving —
  add a column, rename it, drop it again — and none of that history is meaningful.
- The user says *"recreate the database"*, *"simplify the migrations"*, *"squash the migrations"*,
  or *"consolidate before release"*.
- A fresh environment takes an unreasonable time to migrate from empty.

**When it does NOT apply:** any environment already carries data that the chain produced, and that
environment is not being rebuilt. Squashing rewrites history; if a live database has already run the
old chain, the new one will not match what it recorded.

## Safety gate — before anything

State plainly, and get an explicit confirmation:

1. **Which environments have already run the current chain**, and whether each is being rebuilt from
   empty.
2. That squashing is **not reversible** through the chain itself — the old migrations disappear.
3. That any environment not rebuilt will need its `migrations` table reconciled by hand, which is
   the exact operation this project avoids everywhere else.

If any long-lived environment is not being rebuilt, **stop and recommend against it**.

## Procedure

**1 — Inventory.** List the chain in order (`migration:show`), and record the current schema as the
target: the squash must produce exactly this, not an improved version of it. Refactoring the schema
and squashing the chain are two changes; do not combine them.

**2 — Verify the starting point.** From an empty database, run the full existing chain and capture
the resulting schema. That capture is the oracle for step 5.

**3 — Consolidate.** Generate one migration from an empty database against the current entity model.
Remove the superseded migration files. Keep any migration that carries **data**, not just structure —
a data migration is not reproducible from the entity model and must survive the squash.

**4 — Update everything that names a migration.** Runbooks, `.env.example` if a variable moved,
documentation that quotes a migration name, and `docs/product/DATA-MODEL.md` if the schema statement
there drifted.

**5 — Verify against the oracle.** From an empty database, run the new chain and diff the resulting
schema against the capture from step 2. **They must be identical** — tables, columns, types,
nullability, defaults, constraints, indexes. A difference is a defect in the squash, not an
acceptable simplification.

Then re-run the normal gates: `pnpm nx run-many -t lint test build`, and the acceptance suites once
they exist.

**6 — Report.** Which migrations were removed, which survived and why, the diff result from step 5,
and the exact steps each environment needs.

## Rules

- **Never squash while a live environment keeps the old chain.**
- **Never change the schema during a squash.** Same schema, fewer files.
- **Data migrations survive.** Structure regenerates from the model; data does not.
- **The oracle diff is not optional.** "It looked right" is not a verification.
- `synchronize` stays `false` throughout. A squash is never an excuse to let TypeORM generate the
  schema directly.
