# Security Report

## Executive Summary

MecaTrack shows an acceptable security baseline for an internal MVP, but the current implementation and deployment contain several high-risk issues. The most important problems are operational: production startup behavior, default credentials, predictable secrets, and destructive scripts without strong safeguards.

No obvious SQL injection or direct guard bypass was identified in the reviewed application code. However, the current configuration can still allow full compromise of the system if the deployment is started with insecure defaults or if environment-specific scripts are executed against the wrong database.

## Findings

### 1. API container reseeds privileged users with known passwords

- **Severity:** Critical
- **Area:** Authentication / Deployment / Database
- **Description:** The production API entrypoint runs the seed script automatically on startup. That seed performs `upsert` operations for privileged users and resets their password hashes to known values such as `AdminPass123` and `MechanicPass123`.
- **Evidence:** `C:\Despliegues\AI4Devs-finalproject\apps\api\docker-entrypoint.sh`, `apps/api/prisma/seed.ts`
- **Impact:** A normal restart or redeploy can silently restore predictable credentials for privileged accounts.
- **Example failure scenario:** After a container restart, an attacker logs in with the seeded administrator credentials and gains full administrative access.
- **Recommendation:** Remove automatic seeding from the production startup flow, separate development seed data from production bootstrap logic, and ensure production seeds never overwrite existing real user credentials.

### 2. PostgreSQL is exposed with trivial static credentials

- **Severity:** High
- **Area:** Database / Infrastructure
- **Description:** The production database is published to the host on port `5434` and uses static credentials: `mecatrack / mecatrack`.
- **Evidence:** `C:\Despliegues\AI4Devs-finalproject\docker-compose.yml`
- **Impact:** Any local process, and potentially any reachable network peer depending on host exposure, can attempt direct database access with highly guessable credentials.
- **Example failure scenario:** A user on the same machine or network connects with pgAdmin, DBeaver, or `psql` and gains read/write access to production data.
- **Recommendation:** Avoid publishing the database port unless strictly necessary. If host access is required, bind it to `127.0.0.1`, rotate credentials, and restrict access through firewall or network controls.

### 3. JWT secrets fall back to predictable defaults in production compose

- **Severity:** High
- **Area:** Authentication / Secrets Management
- **Description:** The production compose file defines fallback JWT secrets when environment variables are not explicitly provided.
- **Evidence:** `C:\Despliegues\AI4Devs-finalproject\docker-compose.yml`
- **Impact:** If the stack runs with those defaults, an attacker can forge valid JWTs offline and impersonate privileged users.
- **Example failure scenario:** An attacker signs a token with the default secret and sets the payload role to `ADMIN`, then accesses protected API endpoints.
- **Recommendation:** Remove insecure secret fallbacks from production configuration, require explicit secret injection, and rotate secrets immediately if defaults may have been used.

### 4. Destructive database cleanup script lacks environment safeguards

- **Severity:** High
- **Area:** Database / Operations / Administrative Scripts
- **Description:** The cleanup script deletes large parts of the dataset and resets the administrator password to a known value, but it does not enforce environment protections.
- **Evidence:** `apps/api/prisma/clean-db-admin-only.ts`
- **Impact:** Running the script against the wrong database can destroy production data and reintroduce predictable administrative credentials.
- **Example failure scenario:** An operator accidentally executes the cleanup script while connected to the production database and wipes operational records.
- **Recommendation:** Add hard environment checks such as `NODE_ENV !== 'production'`, require an explicit confirmation flag, and isolate destructive scripts from normal operational flows.

### 5. Role changes and deactivations are not enforced immediately

- **Severity:** Medium
- **Area:** Authorization / Session Management
- **Description:** Access tokens are stateless and include the user role in the JWT payload. Authorization checks trust the token payload instead of verifying the current database state on each request.
- **Evidence:** `apps/api/src/common/guards/roles.guard.ts`, `apps/api/src/modules/auth/auth.service.ts`
- **Impact:** A user whose account was deactivated or downgraded can retain access until the current access token expires.
- **Example failure scenario:** An administrator is downgraded to mechanic, but their still-valid token continues to authorize administrator-only routes until expiration.
- **Recommendation:** Validate current user state for sensitive operations, shorten token lifetime further if needed, or introduce per-user session revocation/versioning.

### 6. Refresh tokens are not rotated on refresh

- **Severity:** Medium
- **Area:** Session Management
- **Description:** The refresh endpoint returns a new access token but does not issue a replacement refresh token or invalidate the previous one during refresh.
- **Evidence:** `apps/api/src/modules/auth/auth.service.ts`
- **Impact:** A stolen refresh token remains reusable until it expires or is revoked manually.
- **Example failure scenario:** If a refresh token is compromised, an attacker can continue refreshing sessions for up to the full refresh window.
- **Recommendation:** Implement refresh token rotation, invalidate the previous token when a new one is issued, and consider reuse detection.

### 7. Login responses allow partial user state enumeration

- **Severity:** Low
- **Area:** Authentication
- **Description:** Invalid credentials return `401`, while inactive accounts return `403` with a specific message indicating account inactivity.
- **Evidence:** `apps/api/src/modules/auth/auth.service.ts`
- **Impact:** An attacker can distinguish some valid accounts from invalid guesses based on response behavior.
- **Example failure scenario:** A malicious user tests a list of likely employee emails and learns which ones belong to inactive real accounts.
- **Recommendation:** Return a uniform external login error message and keep detailed failure reasons only in internal logs.

### 8. Missing HTTP hardening headers in the backend

- **Severity:** Low
- **Area:** API / Defense in Depth
- **Description:** The backend does not show evidence of `helmet` or equivalent explicit hardening headers such as HSTS, X-Frame-Options, or a defined CSP strategy.
- **Evidence:** `apps/api/src/main.ts`
- **Impact:** The application loses useful defense-in-depth protections for browser-facing traffic.
- **Example failure scenario:** Browser clients rely on framework defaults instead of an explicit hardened HTTP security policy.
- **Recommendation:** Add `helmet` to the NestJS app and configure the relevant security headers according to the frontend requirements.

### 9. The API container runs as root

- **Severity:** Low
- **Area:** Container Hardening
- **Description:** The API Docker image does not switch to a non-root runtime user, unlike the web container.
- **Evidence:** `C:\Despliegues\AI4Devs-finalproject\apps\api\Dockerfile`
- **Impact:** Any future container compromise could have a higher impact because the process runs with elevated privileges inside the container.
- **Example failure scenario:** A dependency or runtime exploit gives code execution inside the container with root privileges.
- **Recommendation:** Create and use a dedicated non-root user for the API runtime image and adjust file permissions accordingly.

## Existing Positive Controls

- Passwords are hashed with `bcrypt`.
- Refresh tokens are stored hashed in the database.
- Refresh cookies are set as `httpOnly` and `sameSite: 'strict'`.
- Access tokens are kept in memory on the frontend instead of browser persistent storage.
- Backend authorization uses JWT guards and role guards.
- Request validation uses a global `ValidationPipe` with `whitelist` and `forbidNonWhitelisted`.
- Login is rate limited.
- Protected frontend routes redirect unauthenticated and unauthorized users.

## Recommended Remediation Order

1. Remove production auto-seeding and stop resetting real credentials on startup.
2. Rotate administrator passwords, JWT secrets, and database credentials.
3. Restrict or remove direct PostgreSQL host exposure.
4. Add environment protections to destructive scripts.
5. Implement refresh token rotation.
6. Improve immediate revocation behavior for role changes and user deactivation.
7. Add HTTP and container hardening improvements.

## Residual Risk Note

Even after the highest-priority fixes are applied, some residual risk will remain because the system relies on stateless JWT authorization and shares development and production concerns on the same physical machine. Those risks can be reduced, but they require stronger operational separation and more mature secret and environment management.
