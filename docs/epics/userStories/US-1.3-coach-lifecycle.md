# US-1.3: Coach Lifecycle & Financial Data

**Part of:** US-1.3 — Coach Lifecycle & Financial Data
**Epic:** EP-01 — Auth & User Foundation

## Tasks

- [ ] T-1.3.1: **Backend** — Implement `POST /coaches` — validate profile + financial fields (bankAccount, ssn, dni), encrypt financial data with AES-256-GCM before storage, create user with role=coach, return 201 (financial data excluded from response)
- [ ] T-1.3.2: **Backend** — Implement `GET /coaches` (paginated, status filter, no financial data) and `GET /coaches/:id` (full profile, no financial data)
- [ ] T-1.3.3: **Backend** — Implement `PUT /coaches/:id` (partial update, non-financial fields) and `PATCH /coaches/:id/status` (activate/deactivate)
- [ ] T-1.3.4: **Backend** — Implement `GET /coaches/:id/financial` — decrypt financial data, log access as security event (actor ID, action, resource, outcome), Admin only
- [ ] T-1.3.5: **Backend** — Seed 5 training levels (Principiante, Básico, Intermedio, Avanzado, Experto) with colors and sort_order
- [ ] T-1.3.6: **Frontend** — Build Coaches page: table with columns (Name, Email, Phone, Status), pagination, status filter, three-dot action menu (View Details, Activate/Deactivate)
- [ ] T-1.3.7: **Frontend** — Build Add Coach modal, Coach detail view, and financial data access section with audit awareness
