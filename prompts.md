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

## Phase 4 — Redefinition of ERP connectivity (DB → webservices)

After Delivery 1, the integration strategy changed: EyeMaster will no longer connect to each ERP through a direct database connection, but through **REST/JSON webservices**. As the external webservices do not exist yet, their consumption and response are **simulated**.

### Prompt used

```text
We are going to redefine the specification regarding connectivity: we will no longer
connect to each ERP through the database, now it will be through webservices. As we
will not have the external webservices for now, we will simulate the consumption and
the response.
```

### Design decisions closed in the dialogue

- **Protocol:** REST/JSON for every ERP webservice (data + client catalog), replacing SOAP/`zeep`.
- **Simulation:** an internal **ERP Gateway** with two interchangeable implementations behind one interface — `real` (`httpx` HTTP client) and `mock` (returns local JSON fixtures) — selected by the `ERP_MODE` setting. No separate stub server.

### Result

- Both documents (`readme.md` and `documentacion-funcional.md`) updated coherently: architecture diagrams, external integrations, components, file structure, deployment, security, tests, glossary, decisions, modules, and tickets.
- Direct-DB concepts removed: Django read-only routers, `master → instance` resolution (now resolved by the webservice), VPN to the databases, and `zeep`/SOAP.
- New concepts introduced: **ERP Gateway**, **Mock provider**, `ERP_MODE=mock|real`, and the `services/erp/` layer (`gateway.py`, `rest.py`, `mock.py`, `fixtures/`).
- ERP isolation is now argued by the **absence of a writable surface** (EyeMaster holds no ERP DB credentials), and a new trade-off is documented: **dependency on webservice availability**, mitigated by the local cache, timeouts/retries, and graceful degradation.

---

## Phase 5 — Full implementation via OpenSpec

With the documentation and connectivity spec settled, the project moved from documentation-only to a working implementation, conducted through OpenSpec (proposal → design → specs → tasks per change, archived on completion).

### Prompt used

```text
empieza a implementar el proyecto siguiendo openspec, tu objetivo es realizar el
desarrollo de lo plasmado y yo al final revisare
```

### Result

- 11 OpenSpec changes proposed, implemented, and archived in dependency order: `bootstrap-project`, `add-erp-gateway`, `add-auth-rbac`, `add-audit-log`, `add-client-registration`, `add-company-retrieval`, `add-commercial-structure`, `add-financial-cache`, `add-status-and-balance`, `add-reporting-engine`, `harden-and-deploy`.
- Full Django + DRF backend and React + Vite frontend, both runnable against `ERP_MODE=mock`.
- 10 capability specs promoted to `openspec/specs/`; roadmap tracked in `docs/plan-implementacion.md`.
- Two real bugs found and fixed during implementation (not just written and forgotten): a `DateTimeField` vs. `date` comparison bug in "as of date" queries, and a SQLite decimal-scale bug in report aggregation.
- Explicit, documented scope reductions where full coverage wasn't feasible in this environment (reporting engine limited to `adeudo`/`pagado` measures; no Playwright E2E; no real cloud infra provisioned) — recorded as open items, not silently dropped.
- 140+ backend tests, frontend build/lint/tests, all passing at each change's completion.

---

## Phase 6 — Visual design pass (navy identity, light, responsive)

Once the app was functionally running, a design pass was requested to give it a real visual identity instead of the default Vite template look.

### Prompt used

```text
eres un experto en diseño web, mejora la interfaz, usa fondos claros, no oscuros y la
identidad del proyecto deberia ser azul marino para que lo tengas en cuenta, tambien
checa la parte de que sea intuitivo y responsivo
```

### Result

- Full design-token rewrite in `frontend/src/index.css`: navy blue brand palette, light surfaces only (removed the Vite template's automatic dark-mode media query).
- New `AppLayout` component: fixed sidebar on desktop, collapsible drawer with a ☰ toggle under 900px.
- Card-based (`<section>`) grouping applied consistently across every screen; consistent button/badge/input/table styles.
- Login screen redesigned as a centered card over a navy gradient background.

---

## Phase 7 — Debugging session (CORS, missing UI, session refresh, report readability)

A round of hands-on testing by the user surfaced several concrete defects and missing UI, fixed one at a time.

### Issues found and fixed

- **CORS misconfigured** — the backend had no `django-cors-headers`, so the browser silently blocked every request from the frontend (curl-based testing didn't catch this, since CORS is only enforced by browsers).
- **Missing navigation menu** — pages existed but there was no way to reach them from the UI.
- **Missing CRUD screens** — `Group`/`Distributor` creation and `Role`/`Permission` management existed in the backend but had no frontend; found by systematically diffing every backend URL against frontend service coverage (see "profundiza para no dejar huecos" below).
- **Session auto-refresh bug** — the 15-minute access token expiring mid-session wasn't retried; added a 401 → silent-refresh → retry-once flow in the HTTP client.
- **Report rows showed raw ids instead of names** — fixed at the reporting engine level (batch name resolution), not just in the frontend, so every consumer benefits.

### Prompt that drove the most thorough pass

```text
PROFUNDIZA PARA NO DEJAR HUECOS
```

This one-line instruction triggered a systematic backend-endpoint-vs-frontend-coverage audit rather than fixing only the single symptom reported, which is what actually surfaced the missing Groups/Distributors and Roles/Permissions screens.

---

## Phase 8 — Business rule change: EyeMaster creates plans locally

A previously documented, cross-cutting business rule (R-PLN-08: EyeMaster never writes plans to the ERP) was explicitly overridden by the product owner.

### Prompt used

```text
eyemaster debe crear los planes ya que el centralizara todo cambia esa regla
```

Followed by a clarifying exchange on scope (local-only vs. also writing to the ERP; catalog-only vs. catalog + subscription) before implementation, given the size of the change and how many already-built modules it touched (ERP Gateway, financial cache, reporting).

### Result

- `Plan` gained `precio_base` and `origen` (`erp` | `eyemaster`); `proyecto`/`id_externo` became nullable so a plan can exist with no ERP counterpart.
- New `PlanComplemento` catalog model (plan → add-on → consumption limit).
- `EmpresaPlan` (subscription) also gained `origen` and a nullable `id_externo`, so a company can carry both ERP-synced and EyeMaster-created subscriptions side by side.
- New permission `financiero.crear_plan`, new endpoints, and a new "Catalogo de planes" screen plus a plan-assignment form on the company detail page.
- The read-only relationship with the ERP is preserved for everything that still comes from ADMIN/PEOPLE — this change only adds a second, local source of plans, it does not make EyeMaster write back to the ERP.

---

## References

- `readme.md` — official delivery following the Master template.
- `documentacion-funcional.md` — expanded document generated in Phase 2.
- `reglas_cobranza.md` — rules verified against the ERP code.
- Assistant: **Claude (Anthropic)** via claude.ai.
