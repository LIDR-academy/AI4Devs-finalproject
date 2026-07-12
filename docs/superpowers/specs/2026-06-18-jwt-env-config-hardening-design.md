# Spec: JWT secret + `.env` config hardening

**Date:** 2026-06-18
**Status:** Approved (pending user review of this doc)
**Author:** jordi (paired with Claude)

## Problem

Two related defects surfaced when registering a user against a freshly-started backend:

1. **`backend/.env` is documented but not loaded.** `specs/001-guest-search-booking/quickstart.md` instructs developers to create `backend/.env` and lists `STRIPE_SECRET_KEY`, `MAPBOX_ACCESS_TOKEN`, etc. Nothing in `backend/build.gradle.kts` or `backend/src/main/resources/application.yml` loads that file. Postgres connectivity worked only because `application.yml` defaults (`stayhub` / `stayhub_dev`) coincide with the docker-compose defaults; `STRIPE_API_KEY` and `MAPBOX_API_KEY` were silently no-ops.
2. **`JWT_SECRET` defaults to empty and the issuer side is naïve.** `application.yml:59` declares `secret: ${JWT_SECRET:}`. `JwtTokenService.kt:23` calls `Keys.hmacShaKeyFor(jwtProperties.secret.toByteArray())` unconditionally, which throws `WeakKeyException: 0 bits` on the first `/api/v1/auth/register` (or `/login`) request. The validator side (`JwtAuthFilter.kt:56`) guards with `if (jwtProperties.secret.isBlank()) return null`, but the issuer does not, so the app boots green and 500s on first auth.

## Goals

- `backend/.env` becomes a real source of environment configuration that works for `./gradlew bootRun`, `java -jar`, and IntelliJ Run configs — without per-developer shell incantations.
- The Spring context refuses to start when `JWT_SECRET` is missing or shorter than 32 bytes, with a clear startup error message.
- After this change, `JwtTokenService` and `JwtAuthFilter` can rely on `jwtProperties.secret` being a valid HS256 key (`isBlank()` defense in the filter becomes dead code and is removed).
- The documented quickstart works end-to-end without modification.

## Non-goals

- Rotating or managing JWT secrets at runtime.
- Centralised secret management (Vault, AWS SSM, etc.) — out of scope.
- Validation of any other configuration property (Stripe, Mapbox). Those silently-no-op envs are real bugs but tracked separately.
- Algorithm changes (HS256 stays).

## Approach

### A. `backend/.env` loading

Use Spring Boot's built-in config import mechanism instead of a Gradle plugin or custom build script.

In `application.yml`, add at the top level:

```yaml
spring:
  config:
    import: optional:file:./.env[.properties]
```

- `optional:` — context still starts in environments where `.env` is absent (CI, prod, anywhere envs are injected directly).
- `file:./.env` — relative to the working directory, which is `backend/` for `bootRun` and the run-config working directory in IntelliJ.
- `[.properties]` — explicit format hint; Spring parses the file as a Java `.properties` file.

Constraint we accept and document: `backend/.env` must remain plain `KEY=VALUE` properties syntax — no `export`, no shell interpolation (`$OTHER_VAR`), no quoted values. Today's `.env` already complies. We add a one-line comment at the top of `.env` documenting the constraint.

We will **not**:
- introduce a Gradle dotenv plugin (extra dep, only solves the `bootRun` path);
- read `.env` from build script Kotlin (only solves `bootRun`, fragile parsing).

### B. Fail-fast on missing/weak `JWT_SECRET`

Convert `JwtProperties` to constructor-bound, validated configuration:

```kotlin
@ConfigurationProperties(prefix = "stayhub.jwt")
@Validated
data class JwtProperties(
    @field:NotBlank
    @field:Size(min = 32, message = "JWT_SECRET must be at least 32 characters (256 bits) for HS256")
    val secret: String,
    val issuer: String = "stayhub",
)
```

`@EnableConfigurationProperties(JwtProperties::class)` already exists on `SecurityConfig`; `@Validated` makes Spring fail context refresh with a `ConfigurationPropertiesBindException` listing the offending property and constraint message when the secret is missing or short. The error surfaces at boot, before any HTTP traffic.

Cleanup once the property is validated:
- `JwtAuthFilter.parseClaims:56` drops `if (jwtProperties.secret.isBlank()) return null` — dead code, since the property can no longer be blank.
- `JwtTokenService.issue:23` keeps its single line but the comment is updated to reflect the validation guarantee.

### C. `.env` content updates

- `backend/.env` is **already tracked in git** (committed in `b245bc0`) and currently holds dummy/placeholder values like `STRIPE_API_KEY=sk_test_dummy`. Project pattern, for better or worse, is "committed local-dev `.env` with placeholder values." This PR follows that pattern.
- Add to `backend/.env`:
  ```
  # JWT — replace the secret with a fresh 32+ character string before any non-local use.
  JWT_SECRET=replace_me_with_a_32_plus_character_local_dev_secret
  JWT_ISSUER=stayhub
  ```
- Add a one-line comment at the top of `backend/.env` documenting the properties-syntax constraint introduced by approach A1: "This file is loaded by Spring as `.env[.properties]`. Use plain `KEY=VALUE` lines — no `export`, no quoted values, no shell interpolation."
- Update `specs/001-guest-search-booking/quickstart.md` to mention `JWT_SECRET` (32-byte minimum) and the properties-syntax constraint.
- The `.env` shipped to git **must use a placeholder secret**, not the random base64 one generated during the manual fix in this session. Developers regenerate locally with `openssl rand -base64 48`.

Out of this PR's scope: deciding whether `backend/.env` should be gitignored project-wide (it would change the workflow for other env vars too — track separately).

## Tests (TDD, written first)

1. **`JwtPropertiesValidationTest`** (new, `backend/src/test/kotlin/com/stayhub/infrastructure/config/`)
   - Boots a minimal Spring context with `@SpringBootTest` and overrides `stayhub.jwt.secret` via `@TestPropertySource`.
   - Case 1: secret unset → context fails with `ConfigurationPropertiesBindException` whose message names `secret` and `NotBlank`.
   - Case 2: secret set to `"short"` (5 chars) → context fails with `Size` violation.
   - Case 3: secret set to a valid 48-char base64 string → context starts; `JwtTokenService.issue(uuid)` returns a parseable token.
2. **`DotenvImportTest`** (new, same package)
   - Creates a temp `test-dotenv.env` file with `STAYHUB_TEST_PROPERTY=hello`.
   - Boots context with `spring.config.import=optional:file:<temp>[.properties]`.
   - Asserts the property is bound to a test `@ConfigurationProperties` bean.
   - Confirms the dotenv loading mechanism works in this project, independent of any specific env var name.
3. **`JwtAuthFilterTest`** (existing — verify still green after removing `isBlank` guard, or extend with a case proving the filter never sees a blank secret because the context wouldn't start).

All three tests must be red before any production code change, per repo convention.

## Risk + rollback

- **Risk:** existing developers running `./gradlew bootRun` without a `JWT_SECRET` in `.env` or env vars will now see a context-refresh failure instead of a working server that 500s on auth. Migration message: "set `JWT_SECRET` in `backend/.env` (32+ chars). See `quickstart.md`." This is a strict improvement — silent broken auth is worse than loud broken boot.
- **Risk:** `.env` syntax constraint surprises a developer who adds `export FOO=bar` or quoted values. Mitigation: comment at top of `.env` plus quickstart note. If we ever need shell-style `.env`, revisit option A2/A3.
- **Rollback:** revert the PR. No data migrations, no API contract changes, no client coordination required.

## Out of scope / follow-ups

- Stripe / Mapbox / Mailbox env vars are equally silently-empty. Same `@Validated` pattern would catch them — track as a follow-up issue.
- Production secret rotation strategy.

## Affected files

- `backend/src/main/resources/application.yml` — add `spring.config.import`
- `backend/src/main/kotlin/com/stayhub/infrastructure/config/JwtProperties.kt` — convert to validated data class
- `backend/src/main/kotlin/com/stayhub/infrastructure/config/JwtAuthFilter.kt` — drop `isBlank` guard
- `backend/src/main/kotlin/com/stayhub/infrastructure/auth/JwtTokenService.kt` — comment refresh only
- `backend/src/test/kotlin/com/stayhub/infrastructure/config/JwtPropertiesValidationTest.kt` — new
- `backend/src/test/kotlin/com/stayhub/infrastructure/config/DotenvImportTest.kt` — new
- `backend/.env` — add `JWT_SECRET` (placeholder), `JWT_ISSUER`, properties-syntax header comment (file is committed; use placeholder values)
- `specs/001-guest-search-booking/quickstart.md` — document `JWT_SECRET` + `.env` syntax constraint

## Definition of done

- All new tests red first, then green.
- `./gradlew test` passes (Backend CI gate).
- ArchUnit `CleanArchitectureTest` still passes (no layering violation introduced).
- Manually verified: `kill` backend, `./gradlew bootRun` (no manual `set -a`), `POST /api/v1/auth/register` returns 201 with a JWT.
- Manually verified: temporarily blank out `JWT_SECRET` in `.env`, restart, observe boot failure with a clear message naming the property — not a 500 at request time.
- PR opened from feature branch, CI green, reviewed.
