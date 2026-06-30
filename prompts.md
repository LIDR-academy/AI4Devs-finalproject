# prompts.md — EyeMaster V2

> How `readme.md` for EyeMaster V2 was built with the help of **Claude (Anthropic)**.

---

## Phase 1 — Iterative construction of the initial README

Before the key prompt, a first README was built **dialogically**, in short sessions, validating one decision at a time. It was not a single prompt: it was small, verified steps.

### Steps followed

1. **Problem definition.** The domain was described to Claude: two ERPs (ADMIN and PEOPLE) with the same structure, a dispersed commercial operation, and the need to centralize relationships and reports without touching the ERPs.
2. **ERP reverse engineering.** The ERP master source code was analyzed to extract the actual billing rules (plan status, outstanding balance calculation, VAT handling, monthly billing cycles). The result was documented in `reglas_cobranza.md` with file and line citations, and attached as input to Claude so it would **not invent rules**.
3. **Domain decisions closed one by one.** Company identity (`proyecto + id_externo`), VAT calculated on top of the subtotal, complimentary plans excluded from the sales report, billing level always per company, plan validity separate from assignment validity, etc.
4. **Incremental model design.** First the commercial structure (client, group, distributor, time-bounded assignments), then the ERP financial cache (plan, empresa_plan, payment, billing cycle), and finally the reporting engine (star model, flexible engine + predefined catalog).
5. **Result.** A first extensive README with project details, architecture, model, API, user stories, and tickets — the base on which Phase 2 was applied.

### Principles that guided this phase

- **One domain correction at a time.** Short phrases like *"ADMIN and PEOPLE were once together, today they are two separate databases with the same schema"* changed modeling decisions cleanly.
- **Not accepting tacit assumptions.** When Claude assumed something (e.g., that billing could be multi-level), it was explicitly corrected.
- **Separating decided from pending.** Everything not confirmed was recorded as a pending item, not an assumption.

---

## Phase 2 — Refinement with Senior Functional Analyst profile

Once the initial README was consolidated, the following prompt was applied to elevate the documentation to a professional standard understandable by all audiences (client, analysts, developers, QA, new team members).

### Prompt used

```text
Act as a Senior Functional Analyst, Software Architect, and Technical Writer.
Analyze the project's README.md file and rewrite all documentation so that it can be
understood by clients, analysts, developers, QA, and new team members.

Do not limit yourself to correcting the writing; analyze the content as a functional owner.

For each module describe: objective, problem it solves, how it works, complete flow,
business rules, dependencies, external data, own data, error scenarios, and validations.

If you detect issues do not invent information: create a "Pending items" section.
If you find improvements (architecture, model, APIs, user stories, rules,
nomenclature, structure), propose them at the end with justification.

Deliver a completely rewritten README.md.
```

### Result

- Document of ~1,500 lines with 8 detailed modules.
- Numbered business rules (`R-SEG-`, `R-CLI-`, `R-EMP-`, etc.).
- Data model integrity rules (`RI-01..RI-13`).
- 20 consolidated open items (`PD-01..PD-20`).
- Justified improvement proposals in architecture, model, API, user stories, nomenclature, and structure.
- Saved as `documentacion-funcional.md`.

Subsequently, that document served as input to build the official `readme.md` following the **Master template** (Phase 3).

---

## Phase 3 — Formatting according to the official repository template

The expanded document from Phase 2 was too long and did not follow the exact structure required by the Master template. The following prompt was applied to produce the `readme.md` being submitted.

### Prompt used

```text
Repository URL: https://github.com/jairosanchez90/AI4Devs-finalproject.git

There is information that will not apply because for now it is pure documentation.
Replace the readme.md file following the official structure of the repository template.

The task requires the following sections (0–7):
0. Project details
1. General product description (objective, features, design and UX, installation)
2. System architecture (diagram, components, file structure,
   infrastructure and deployment, security, tests)
3. Data model (diagram and entity description)
4. API specification (OpenAPI format, maximum 3 endpoints)
5. User stories (3 main ones)
6. Work tickets (3: one backend, one frontend, one database,
   with all the detail required to develop the task from start to finish)
7. Pull Requests

For sections that do not apply in this delivery (being documentation only),
state it explicitly and justify why.
```

### Result

- Official `readme.md` following the Master template to the letter.
- Architecture with explicit **benefits and trade-offs** table of the chosen pattern.
- API documented in **OpenAPI 3.0** format with 3 representative endpoints.
- User stories with acceptance criteria in **Gherkin**.
- Detailed tickets with description, objectives, technical tasks, dependencies, notes, and *Definition of done* (one BE, one FE, one DB).
- Non-applicable sections justified (UX and video tutorial, installation, file structure, tests, future PRs).
- Pull Request #1 documented as "Initial project documentation", corresponding to this delivery.

---

## References

- `readme.md` — official delivery following the Master template.
- `documentacion-funcional.md` — expanded document generated in Phase 2.
- `reglas_cobranza.md` — rules verified against the ERP code.
- Assistant: **Claude (Anthropic)** via claude.ai.
