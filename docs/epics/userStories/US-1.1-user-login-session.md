# US-1.1: User Login & Session Management

**Part of:** US-1.1 — User Login & Session Management
**Epic:** EP-01 — Auth & User Foundation

## Tasks

- [ ] T-1.1.1: **Backend** — Set up Express + TypeScript + Prisma project structure with folder layout (domain/application/infrastructure/config)
- [ ] T-1.1.2: **Database** — Create User schema (id, email, password_hash, name, phone, role, status, timestamps) + Level schema + initial migration
- [ ] T-1.1.3: **Backend** — Implement JWT middleware (token verification, extraction from Authorization header) and RBAC role guard middleware
- [ ] T-1.1.4: **Backend** — Implement `POST /auth/login` with bcrypt password verification (cost factor 12), rate limiting (10 req/min per IP), consistent "Invalid credentials" response
- [ ] T-1.1.5: **Backend** — Implement `POST /auth/refresh` — validate refresh token, issue new access + refresh token pair, invalidate old refresh token
- [ ] T-1.1.6: **Backend** — Implement `POST /auth/logout` — revoke refresh token server-side, return 204 No Content
- [ ] T-1.1.7: **Backend** — Set up global error handler (standard `{ error: { code, message, ref } }` envelope), helmet security headers, CORS, health check endpoint (`GET /health`)
- [ ] T-1.1.8: **Frontend** — Set up React + Vite + TypeScript + TailwindCSS + React Router, build login page with form validation, error display, loading state, and auth state management (context/useReducer)
