# JWT Secret + `.env` Config Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `backend/.env` actually load via Spring's `spring.config.import`, and make the Spring context refuse to start when `JWT_SECRET` is missing or shorter than 32 bytes — so `quickstart.md` works without manual `set -a` and `POST /auth/register` cannot 500 on a misconfigured boot.

**Architecture:** No new dependencies on the `.env`-loading side — Spring Boot's built-in `spring.config.import=optional:file:./.env[.properties]` does the work. On the validation side, `JwtProperties` becomes a constructor-bound, `@Validated` data class with `@NotBlank` + `@Size(min = 32)` on `secret`, fronted by `spring-boot-starter-validation` (newly added; currently only the API jar is on the classpath, so existing `@NotBlank` annotations on DTOs are decorative — out of scope for this PR but documented in the spec).

**Tech Stack:** Kotlin 2.0.21, Spring Boot 3.5.0 (WebFlux + R2DBC), Hibernate Validator (via `spring-boot-starter-validation`), JUnit 5, Kotest assertions, MockK, Spring Boot Test's `ApplicationContextRunner`.

**Spec:** `docs/superpowers/specs/2026-06-18-jwt-env-config-hardening-design.md`

---

## File map

| File | Change | Owner task |
|---|---|---|
| `backend/build.gradle.kts` | Add `spring-boot-starter-validation` | T2 |
| `backend/src/test/kotlin/com/stayhub/infrastructure/config/JwtPropertiesValidationTest.kt` | **Create** — verify boot fails on blank/short secret, succeeds on valid one | T3 |
| `backend/src/main/kotlin/com/stayhub/infrastructure/config/JwtProperties.kt` | Rewrite as validated `data class` with constructor binding | T4 |
| `backend/src/test/resources/application-test.yml` | Add `stayhub.jwt.secret` so existing `@ActiveProfiles("test")` tests still boot | T4 |
| `backend/src/main/kotlin/com/stayhub/infrastructure/config/JwtAuthFilter.kt` | Drop dead `if (jwtProperties.secret.isBlank()) return null` guard | T5 |
| `backend/src/main/kotlin/com/stayhub/infrastructure/auth/JwtTokenService.kt` | Refresh Kdoc to reflect validated invariant | T6 |
| `backend/src/test/kotlin/com/stayhub/infrastructure/config/ApplicationYmlConfigImportTest.kt` | **Create** — assert `application.yml` declares the dotenv import line | T7 |
| `backend/src/main/resources/application.yml` | Add `spring.config.import: optional:file:./.env[.properties]` | T8 |
| `backend/.env` | Add `JWT_SECRET` placeholder + `JWT_ISSUER` + properties-syntax header comment | T9 |
| `specs/001-guest-search-booking/quickstart.md` | Document `JWT_SECRET` and `.env` properties-syntax constraint | T10 |

Out of scope (tracked elsewhere or follow-up): Stripe / Mapbox / Mail empty-default validation, `.env` gitignore strategy.

---

## Working branch

We continue on the existing branch `spec/jwt-env-config-hardening` (which already carries the spec doc commit) and rename it to `fix/jwt-env-config-hardening` to better reflect the PR shape. The rename happens in T1.

---

### Task 1: Branch setup + sanity check

**Files:** none modified — branch operations + smoke check only.

- [ ] **Step 1: Verify current branch**

```bash
cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL
git status -sb
```

Expected first line: `## spec/jwt-env-config-hardening`. If on `main`, stop and consult — the spec commit must already exist on this branch.

- [ ] **Step 2: Rename branch**

```bash
git branch -m spec/jwt-env-config-hardening fix/jwt-env-config-hardening
```

Expected: silent success. `git status -sb` now shows `## fix/jwt-env-config-hardening`.

- [ ] **Step 3: Confirm spec commit is present**

```bash
git log --oneline -3
```

Expected: top commit is `9c42f39 docs(spec): JWT secret + .env config hardening` (or whatever the local SHA was after the spec was committed). If it isn't, stop and surface the issue.

- [ ] **Step 4: Confirm working tree**

```bash
git status --short
```

Expected: `M backend/.env` (modified during the manual fix earlier) and `?? .worktrees/`. We will overwrite `backend/.env` properly in T9; do not stage it yet.

- [ ] **Step 5: Confirm baseline test suite is green**

```bash
cd backend
./gradlew test 2>&1 | tail -25
```

Expected: `BUILD SUCCESSFUL`. If anything is red on a clean checkout, stop and report — we need a green baseline before TDD.

No commit in this task.

---

### Task 2: Add `spring-boot-starter-validation` dependency

**Files:**
- Modify: `backend/build.gradle.kts` (around the Spring Boot starters block, ~line 34–38)

- [ ] **Step 1: Confirm validator is missing**

```bash
cd backend
./gradlew dependencies --configuration runtimeClasspath 2>/dev/null | grep -E "hibernate-validator|spring-boot-starter-validation" | head
```

Expected: empty output (validator not on classpath; only `jakarta.validation-api` is). If it already shows `hibernate-validator`, this task is a no-op — skip to Step 4.

- [ ] **Step 2: Add the starter**

In `backend/build.gradle.kts`, locate the block:

```kotlin
    // Spring Boot starters
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-data-r2dbc")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-mail")
```

Insert after the `mail` line:

```kotlin
    implementation("org.springframework.boot:spring-boot-starter-validation")
```

- [ ] **Step 3: Verify the validator is now resolved**

```bash
./gradlew dependencies --configuration runtimeClasspath 2>/dev/null | grep -E "hibernate-validator" | head -3
```

Expected: at least one line containing `org.hibernate.validator:hibernate-validator:<version>`.

- [ ] **Step 4: Build still compiles**

```bash
./gradlew compileKotlin compileTestKotlin 2>&1 | tail -10
```

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 5: Commit**

```bash
git add build.gradle.kts
git commit -m "$(cat <<'EOF'
build(backend): add spring-boot-starter-validation

Brings hibernate-validator onto the runtime classpath so @Validated /
@NotBlank annotations are actually enforced. Required by the upcoming
JwtProperties validation; also retroactively makes the @NotBlank
annotations on existing booking DTOs non-decorative.
EOF
)"
```

Expected: commit succeeds. `git log --oneline -1` shows the new commit.

---

### Task 3: TDD — `JwtPropertiesValidationTest` (red)

**Files:**
- Create: `backend/src/test/kotlin/com/stayhub/infrastructure/config/JwtPropertiesValidationTest.kt`

This test will be RED at the end of this task — `JwtProperties` still allows blank/short secrets. T4 turns it green.

- [ ] **Step 1: Write the failing test file**

Create `backend/src/test/kotlin/com/stayhub/infrastructure/config/JwtPropertiesValidationTest.kt` with this content:

```kotlin
package com.stayhub.infrastructure.config

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration
import org.springframework.boot.context.properties.ConfigurationPropertiesBindException
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.test.context.runner.ApplicationContextRunner
import org.springframework.context.annotation.Configuration

/**
 * Verifies that JwtProperties refuses to bind a blank or short secret, so the
 * Spring context fails fast at boot rather than 500-ing on the first /auth
 * request. Symmetric with the validator-side defensiveness already present in
 * JwtAuthFilter.
 */
class JwtPropertiesValidationTest {

    private val runner = ApplicationContextRunner()
        .withConfiguration(
            org.springframework.boot.autoconfigure.AutoConfigurations.of(
                PropertyPlaceholderAutoConfiguration::class.java,
            ),
        )
        .withUserConfiguration(EnableJwtPropertiesConfig::class.java)

    @Configuration
    @EnableConfigurationProperties(JwtProperties::class)
    class EnableJwtPropertiesConfig

    @Test
    fun `context fails when secret is blank`() {
        runner
            .withPropertyValues("stayhub.jwt.secret=")
            .run { context ->
                assertThat(context).hasFailed()
                val rootCause = generateSequence(context.startupFailure) { it.cause }.last()
                assertThat(rootCause.message).contains("secret")
            }
    }

    @Test
    fun `context fails when secret is shorter than 32 characters`() {
        runner
            .withPropertyValues("stayhub.jwt.secret=too-short-secret")
            .run { context ->
                assertThat(context).hasFailed()
                val failure = context.startupFailure
                assertThat(failure).isInstanceOf(ConfigurationPropertiesBindException::class.java)
                assertThat(failure.message).contains("secret")
            }
    }

    @Test
    fun `context starts and binds properties when secret is valid`() {
        runner
            .withPropertyValues(
                "stayhub.jwt.secret=test-secret-test-secret-test-secret-test-secret-0123456789",
                "stayhub.jwt.issuer=stayhub",
            )
            .run { context ->
                assertThat(context).hasNotFailed()
                val props = context.getBean(JwtProperties::class.java)
                assertThat(props.issuer).isEqualTo("stayhub")
                assertThat(props.secret).hasSizeGreaterThanOrEqualTo(32)
            }
    }
}
```

- [ ] **Step 2: Run the test, expect RED**

```bash
./gradlew test --tests "com.stayhub.infrastructure.config.JwtPropertiesValidationTest" 2>&1 | tail -40
```

Expected: at least the `blank` and `short` tests FAIL — the context will start successfully because `JwtProperties` currently has no validation. The `valid` test will pass (binding works either way). Failure messages will include `Expecting context to have failed but it has not failed`. **Confirm both failures explicitly** before moving on. If both already pass, the validation may already be in place — stop and investigate.

No commit in this task — the failing test is committed together with its fix in T4.

---

### Task 4: Convert `JwtProperties` to validated `data class` + update `application-test.yml`

**Files:**
- Modify: `backend/src/main/kotlin/com/stayhub/infrastructure/config/JwtProperties.kt` (full rewrite)
- Modify: `backend/src/test/resources/application-test.yml` (add `stayhub.jwt.secret`)

- [ ] **Step 1: Rewrite `JwtProperties.kt`**

Replace the **entire contents** of `backend/src/main/kotlin/com/stayhub/infrastructure/config/JwtProperties.kt` with:

```kotlin
package com.stayhub.infrastructure.config

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.validation.annotation.Validated

/**
 * JWT validation settings.
 *
 * Values bind from `stayhub.jwt.*` in application.yml, sourced from
 * environment variables (`JWT_SECRET`, `JWT_ISSUER`). The secret is
 * validated at context refresh — a missing or too-short secret fails the
 * boot with a clear error rather than letting the application start and
 * 500 on the first /auth request.
 */
@Validated
@ConfigurationProperties(prefix = "stayhub.jwt")
data class JwtProperties(
    @field:NotBlank
    @field:Size(
        min = 32,
        message = "stayhub.jwt.secret must be at least 32 characters (256 bits) for HS256",
    )
    val secret: String,
    val issuer: String = "stayhub",
)
```

Notes for the implementer:
- Spring Boot 3.x uses constructor binding automatically when `@ConfigurationProperties` has a single non-default constructor — no `@ConstructorBinding` annotation needed.
- `@EnableConfigurationProperties(JwtProperties::class)` already exists on `SecurityConfig`; do **not** remove or duplicate it.
- `@field:` is required because Kotlin properties have multiple annotation sites; we want the validator to see the JSR-380 annotations on the underlying field.

- [ ] **Step 2: Update `application-test.yml` so existing tests still boot**

Open `backend/src/test/resources/application-test.yml` and add a `stayhub:` block at the bottom (or extend the existing one if present). The full updated file should look like:

```yaml
spring:
  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration
      - org.springframework.boot.autoconfigure.mail.MailSenderValidatorAutoConfiguration
  r2dbc:
    url: r2dbc:postgresql://localhost:5432/testdb
    username: testuser
    password: testpass
  flyway:
    enabled: false
  test:
    context:
      cache:
        maxSize: 1

mapbox:
  api-key: test-token

stayhub:
  jwt:
    # Hardcoded test secret — exists ONLY to satisfy JwtProperties validation
    # in tests that don't override stayhub.jwt.secret via @TestPropertySource.
    # 56 chars; same string the existing SecurityConfigTest uses.
    secret: test-secret-test-secret-test-secret-test-secret-0123456789
    issuer: stayhub
```

- [ ] **Step 3: Run the validation test, expect all three GREEN**

```bash
cd backend
./gradlew test --tests "com.stayhub.infrastructure.config.JwtPropertiesValidationTest" 2>&1 | tail -15
```

Expected: 3 passed, 0 failed.

- [ ] **Step 4: Run the full test suite to catch regressions**

```bash
./gradlew test 2>&1 | tail -25
```

Expected: `BUILD SUCCESSFUL`. If a `@SpringBootTest`-class test now fails because it doesn't set the secret AND doesn't use `@ActiveProfiles("test")`, that's a regression we must fix in this task. Add a `@TestPropertySource(properties = ["stayhub.jwt.secret=test-secret-test-secret-test-secret-test-secret-0123456789"])` to that specific test (do not remove existing `@TestPropertySource` blocks — just merge the property in).

- [ ] **Step 5: Commit**

```bash
git add src/main/kotlin/com/stayhub/infrastructure/config/JwtProperties.kt \
        src/test/kotlin/com/stayhub/infrastructure/config/JwtPropertiesValidationTest.kt \
        src/test/resources/application-test.yml
git commit -m "$(cat <<'EOF'
fix(auth): fail fast when JWT_SECRET is missing or weak

Convert JwtProperties to a constructor-bound, @Validated data class with
@NotBlank + @Size(min = 32) on secret. Spring now refuses to refresh the
context with a ConfigurationPropertiesBindException at boot instead of
letting JwtTokenService throw WeakKeyException on the first /auth
request.

Tests:
- new JwtPropertiesValidationTest verifies blank/short → fail; valid → start
- application-test.yml gains a default secret so existing
  @ActiveProfiles("test") suites still boot without per-test setup
EOF
)"
```

---

### Task 5: Drop dead `isBlank` guard in `JwtAuthFilter`

**Files:**
- Modify: `backend/src/main/kotlin/com/stayhub/infrastructure/config/JwtAuthFilter.kt:55-56`

The filter's defensive check `if (jwtProperties.secret.isBlank()) return null` is unreachable now that the property cannot bind blank. Remove it so the code reads honestly.

- [ ] **Step 1: Remove the guard**

In `backend/src/main/kotlin/com/stayhub/infrastructure/config/JwtAuthFilter.kt`, locate `parseClaims`:

```kotlin
    private fun parseClaims(token: String): Claims? {
        if (jwtProperties.secret.isBlank()) return null
        return runCatching {
            val key: SecretKey = Keys.hmacShaKeyFor(jwtProperties.secret.toByteArray())
            ...
        }.getOrNull()
    }
```

Replace with:

```kotlin
    private fun parseClaims(token: String): Claims? = runCatching {
        val key: SecretKey = Keys.hmacShaKeyFor(jwtProperties.secret.toByteArray())
        Jwts.parser()
            .verifyWith(key)
            .requireIssuer(jwtProperties.issuer)
            .build()
            .parseSignedClaims(token)
            .payload
    }.getOrNull()
```

(That is: drop the `isBlank` line and inline the body since it's now a single expression.)

- [ ] **Step 2: Run security tests**

```bash
./gradlew test --tests "com.stayhub.infrastructure.config.SecurityConfigTest" \
              --tests "com.stayhub.presentation.api.integration.AuthIntegrationTest" 2>&1 | tail -20
```

Expected: all green. Both tests already provide a valid secret, so the dropped guard makes no behavioural difference at runtime — only at boot, which T4 already covered.

- [ ] **Step 3: Commit**

```bash
git add src/main/kotlin/com/stayhub/infrastructure/config/JwtAuthFilter.kt
git commit -m "$(cat <<'EOF'
refactor(auth): drop dead isBlank guard in JwtAuthFilter

The guard is unreachable now that JwtProperties.secret has @NotBlank and
@Size(min = 32) — the context cannot start with a blank secret. Removing
the line makes the filter's intent clear: any non-null token is parsed
and validated, errors caught by runCatching.
EOF
)"
```

---

### Task 6: Refresh `JwtTokenService` Kdoc

**Files:**
- Modify: `backend/src/main/kotlin/com/stayhub/infrastructure/auth/JwtTokenService.kt:11-16`

Pure documentation change — the body stays.

- [ ] **Step 1: Update the Kdoc**

Replace lines 11–16 of `backend/src/main/kotlin/com/stayhub/infrastructure/auth/JwtTokenService.kt`:

```kotlin
/**
 * Issues 30-day signed JWTs using the same secret and issuer as [JwtAuthFilter].
 *
 * Algorithm: HMAC-SHA256 via [Keys.hmacShaKeyFor].
 * The secret is read from [JwtProperties.secret] — never hardcoded.
 */
```

with:

```kotlin
/**
 * Issues 30-day signed JWTs using the same secret and issuer as [JwtAuthFilter].
 *
 * Algorithm: HMAC-SHA256 via [Keys.hmacShaKeyFor].
 *
 * [JwtProperties] guarantees the secret is non-blank and ≥ 32 characters
 * (validated at context refresh), so this issuer can hash it directly
 * without re-checking length.
 */
```

- [ ] **Step 2: Verify it still compiles**

```bash
./gradlew compileKotlin 2>&1 | tail -5
```

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 3: Commit**

```bash
git add src/main/kotlin/com/stayhub/infrastructure/auth/JwtTokenService.kt
git commit -m "$(cat <<'EOF'
docs(auth): refresh JwtTokenService Kdoc to reference validated invariant

JwtProperties.secret is now guaranteed non-blank and ≥ 32 chars by
@Validated bean validation, so this issuer can rely on that without
re-checking. Comment-only change.
EOF
)"
```

---

### Task 7: TDD — assert `application.yml` declares the dotenv import (red)

**Files:**
- Create: `backend/src/test/kotlin/com/stayhub/infrastructure/config/ApplicationYmlConfigImportTest.kt`

A literal-content test against `application.yml`. Failing-red comes from the line not yet existing in production yaml. T8 turns it green.

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/kotlin/com/stayhub/infrastructure/config/ApplicationYmlConfigImportTest.kt` with this content:

```kotlin
package com.stayhub.infrastructure.config

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.core.io.ClassPathResource

/**
 * Asserts the production application.yml declares the dotenv config import.
 *
 * The line `spring.config.import: optional:file:./.env[.properties]` is what
 * makes `backend/.env` load when developers run `./gradlew bootRun` per the
 * documented quickstart. Removing it would silently break local auth flows
 * again — this test is the regression guard.
 */
class ApplicationYmlConfigImportTest {

    @Test
    fun `application yml imports backend dotenv as optional properties file`() {
        val yaml = ClassPathResource("application.yml")
            .inputStream
            .bufferedReader()
            .use { it.readText() }

        assertThat(yaml)
            .`as`("application.yml must declare spring.config.import for backend/.env")
            .contains("optional:file:./.env[.properties]")
    }
}
```

- [ ] **Step 2: Run, expect RED**

```bash
./gradlew test --tests "com.stayhub.infrastructure.config.ApplicationYmlConfigImportTest" 2>&1 | tail -15
```

Expected: 1 test fails with an AssertionError mentioning `optional:file:./.env[.properties]`.

No commit in this task — the failing test commits together with its fix in T8.

---

### Task 8: Add `spring.config.import` to `application.yml`

**Files:**
- Modify: `backend/src/main/resources/application.yml` (top of the `spring:` block, after `application.name`)

- [ ] **Step 1: Add the import line**

In `backend/src/main/resources/application.yml`, locate:

```yaml
spring:
  application:
    name: stayhub

  # Reactive datasource used by the application at runtime.
```

Insert a `config:` block between `application` and the `# Reactive datasource...` comment, so that the resulting block reads:

```yaml
spring:
  application:
    name: stayhub

  # Optionally import key=value lines from backend/.env so the documented
  # quickstart (create backend/.env, run ./gradlew bootRun) works without
  # any manual `set -a` dance. The [.properties] hint forces Spring to
  # parse the file as plain Java properties — so `.env` must stay plain
  # KEY=VALUE: no `export`, no quoted values, no shell interpolation.
  # `optional:` keeps the context starting in CI / prod where envs are
  # injected directly and no .env file exists.
  config:
    import: optional:file:./.env[.properties]

  # Reactive datasource used by the application at runtime.
```

- [ ] **Step 2: Run the YAML assertion test, expect GREEN**

```bash
./gradlew test --tests "com.stayhub.infrastructure.config.ApplicationYmlConfigImportTest" 2>&1 | tail -10
```

Expected: 1 test passed.

- [ ] **Step 3: Run the full suite to confirm no regression**

```bash
./gradlew test 2>&1 | tail -25
```

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 4: Commit**

```bash
git add src/main/resources/application.yml \
        src/test/kotlin/com/stayhub/infrastructure/config/ApplicationYmlConfigImportTest.kt
git commit -m "$(cat <<'EOF'
feat(config): load backend/.env via spring.config.import

Adds spring.config.import=optional:file:./.env[.properties] so the
documented quickstart (write backend/.env, run ./gradlew bootRun) works
without a manual `set -a` dance. `optional:` keeps CI / prod working
where envs are injected directly. The [.properties] hint requires `.env`
to stay plain KEY=VALUE — no `export`, no quoted values, no
interpolation.

Test: ApplicationYmlConfigImportTest is a regression guard that asserts
the line is present.
EOF
)"
```

---

### Task 9: Update `backend/.env` with placeholder secret + syntax comment

**Files:**
- Modify: `backend/.env` (currently has the random local secret added during the manual fix earlier — overwrite with a placeholder before committing).

- [ ] **Step 1: Overwrite with the canonical content**

Replace the **entire contents** of `backend/.env` with:

```
# This file is loaded by Spring as `optional:file:./.env[.properties]`.
# Use plain KEY=VALUE lines — no `export`, no quoted values, no shell
# interpolation. Regenerate JWT_SECRET locally with:
#   openssl rand -base64 48

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=stayhub
POSTGRES_USER=stayhub
POSTGRES_PASSWORD=stayhub_dev

STRIPE_API_KEY=sk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_test_dummy

MAPBOX_API_KEY=pk_test_4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x

MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=noreply@stayhub.local

JWT_SECRET=replace_me_with_a_32_plus_character_local_dev_secret
JWT_ISSUER=stayhub
```

Note: this preserves every line that was already committed in `b245bc0`, plus adds the comment header, `JWT_SECRET`, and `JWT_ISSUER`.

- [ ] **Step 2: Confirm Spring binds `.env` at boot — manual smoke**

Stop any running backend, then:

```bash
cd backend
./gradlew bootRun > /tmp/stayhub-run/backend.log 2>&1 &
echo $! > /tmp/stayhub-run/backend.pid
# wait up to 90s for health
for i in 1 2 3 4 5 6 7 8 9; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null)
  if [ "$code" = "200" ]; then echo "up after ${i}0s"; break; fi
  sleep 10
done

# register a fresh user — this is the flow that crashed before the fix
curl -sS -i -X POST http://localhost:8080/api/v1/auth/register \
  -H "content-type: application/json" \
  -d '{"email":"smoke-'"$(date +%s)"'@example.com","password":"pass1234","first_name":"Smoke","last_name":"Test"}' \
  | head -3
```

Expected: first line `HTTP/1.1 201 Created`. **The placeholder `replace_me_with_a_32_plus_character_local_dev_secret` is exactly 52 characters**, so it satisfies the new validator. If you see `WeakKeyException` or 401/500 from this endpoint, stop — `.env` did not load and we need to debug.

Verify the **negative case** (boot fails on bad secret):

```bash
# Stop running backend
kill $(cat /tmp/stayhub-run/backend.pid) 2>/dev/null

# Temporarily blank the secret
sed -i.bak 's/^JWT_SECRET=.*/JWT_SECRET=/' backend/.env

# Boot — must fail
cd backend && ./gradlew bootRun > /tmp/stayhub-run/backend-fail.log 2>&1 &
fail_pid=$!
# Wait up to 60s for the JVM to either crash or stay up
for i in 1 2 3 4 5 6; do sleep 10; if ! kill -0 $fail_pid 2>/dev/null; then break; fi; done
kill $fail_pid 2>/dev/null
grep -E "ConfigurationPropertiesBindException|stayhub.jwt.secret|must not be blank|at least 32" /tmp/stayhub-run/backend-fail.log | head -5

# Restore good .env
mv backend/.env.bak backend/.env
```

Expected: at least one matching line, naming `stayhub.jwt.secret`. If the JVM kept running, the validation didn't fire — investigate before proceeding.

- [ ] **Step 3: Commit**

```bash
cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL
git add backend/.env
git commit -m "$(cat <<'EOF'
chore(env): add JWT_SECRET placeholder and properties-syntax header

Local-dev .env now ships with JWT_SECRET / JWT_ISSUER (placeholder values
matching the existing `_dummy` / `_test_` pattern in this file) and a
header comment documenting the properties-syntax constraint introduced
by spring.config.import=optional:file:./.env[.properties].

Developers regenerate the secret locally with `openssl rand -base64 48`
before any non-local use.
EOF
)"
```

---

### Task 10: Update `quickstart.md`

**Files:**
- Modify: `specs/001-guest-search-booking/quickstart.md` (the `Environment Variables` section, ~lines 11–34)

- [ ] **Step 1: Find the section**

```bash
grep -n "JWT_SECRET\|backend/.env\|MAPBOX_ACCESS_TOKEN" /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/specs/001-guest-search-booking/quickstart.md | head
```

Expected: lines around 11–34 for the env-var section. If the file structure is meaningfully different, fall back to reading the file with `Read` and identifying the matching block.

- [ ] **Step 2: Update the env section**

Replace the existing `Create backend/.env:` block with:

````markdown
Create `backend/.env`. The file is loaded automatically by Spring via
`spring.config.import=optional:file:./.env[.properties]` — so it must use
plain Java properties syntax: `KEY=VALUE` lines only, no `export`, no
quoted values, no shell-style interpolation.

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=stayhub
POSTGRES_USER=stayhub
POSTGRES_PASSWORD=stayhub_dev

STRIPE_API_KEY=sk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_test_dummy

MAPBOX_API_KEY=pk_test_...

MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=noreply@stayhub.local

# 32+ character secret. Generate with: openssl rand -base64 48
JWT_SECRET=replace_me_with_a_32_plus_character_local_dev_secret
JWT_ISSUER=stayhub
```

The Spring context refuses to start if `JWT_SECRET` is unset or shorter
than 32 characters — boot fails fast with a clear binding error rather
than 500-ing on the first `/api/v1/auth/*` request.
````

(Adapt fenced-code-block formatting to match the rest of the file if it differs — e.g. the file may already use ` ```env ` rather than ` ```bash `.)

- [ ] **Step 3: Sanity check the markdown rendering**

```bash
grep -n "JWT_SECRET\|spring.config.import" /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/specs/001-guest-search-booking/quickstart.md | head
```

Expected: at least 2 lines, naming `JWT_SECRET` and `spring.config.import`.

- [ ] **Step 4: Commit**

```bash
git add specs/001-guest-search-booking/quickstart.md
git commit -m "$(cat <<'EOF'
docs(quickstart): document JWT_SECRET and .env properties syntax

Quickstart now reflects the new boot-time invariant (JWT_SECRET must be
≥ 32 chars or the context refuses to start) and the .env syntax
constraint introduced by spring.config.import=...[.properties].
EOF
)"
```

---

### Task 11: Final verification

**Files:** none modified — verification only.

- [ ] **Step 1: Full test suite green**

```bash
cd backend
./gradlew test 2>&1 | tail -25
```

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 2: ArchUnit still green**

```bash
./gradlew test --tests "com.stayhub.architecture.CleanArchitectureTest" 2>&1 | tail -10
```

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 3: bootRun smoke (positive path)**

Stop any running backend first.

```bash
kill $(lsof -tiTCP:8080 -sTCP:LISTEN 2>/dev/null) 2>/dev/null
sleep 2
cd backend
./gradlew bootRun > /tmp/stayhub-run/backend.log 2>&1 &
echo $! > /tmp/stayhub-run/backend.pid
for i in 1 2 3 4 5 6 7 8 9; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null)
  if [ "$code" = "200" ]; then echo "up after ~${i}0s"; break; fi
  sleep 10
done

curl -sS -i -X POST http://localhost:8080/api/v1/auth/register \
  -H "content-type: application/json" \
  -d '{"email":"final-'"$(date +%s)"'@example.com","password":"pass1234","first_name":"Final","last_name":"Smoke"}' \
  | head -3
```

Expected: `HTTP/1.1 201 Created`. If 500 or any 4xx, stop and debug.

- [ ] **Step 4: Frontend register flow (UI)**

With backend still running and the dev server on `:3000` (started earlier in this session), open `http://localhost:3000/register` and submit a fresh email + password. Expected: redirected to `/search` (or wherever the auth slice lands a registered user) with a JWT cookie/local-storage token. If the frontend dev server isn't running, run `cd frontend && npm run dev` in a separate terminal.

- [ ] **Step 5: Stop backend**

```bash
kill $(cat /tmp/stayhub-run/backend.pid) 2>/dev/null
```

No commit in this task.

---

### Task 12: Push branch and open PR

**Files:** none modified.

- [ ] **Step 1: Push the branch**

```bash
cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL
git push -u origin fix/jwt-env-config-hardening
```

Expected: branch is pushed and tracking set.

- [ ] **Step 2: Open the PR**

```bash
gh pr create \
  --title "fix(auth): load backend/.env and fail fast on missing JWT_SECRET" \
  --body "$(cat <<'EOF'
## Summary

- `spring.config.import=optional:file:./.env[.properties]` so `backend/.env` actually loads — the documented quickstart works without `set -a`.
- `JwtProperties` becomes a `@Validated` constructor-bound data class; missing or `< 32`-char `JWT_SECRET` now fails the context at refresh time instead of 500-ing on `/api/v1/auth/*` with `WeakKeyException: 0 bits`.
- Adds `spring-boot-starter-validation` so `@NotBlank`/`@Size` are actually enforced (previously only the API jar was on the classpath).
- Drops the now-dead `isBlank` guard in `JwtAuthFilter`.

Spec: `docs/superpowers/specs/2026-06-18-jwt-env-config-hardening-design.md`
Plan: `docs/superpowers/plans/2026-06-18-jwt-env-config-hardening.md`

## Test plan

- [ ] `./gradlew test` green (unit + integration + ArchUnit)
- [ ] New `JwtPropertiesValidationTest` covers blank / short / valid secret
- [ ] New `ApplicationYmlConfigImportTest` regression-guards the `.env` import line
- [ ] Manual: `./gradlew bootRun` (no `set -a`) → `POST /api/v1/auth/register` returns 201
- [ ] Manual: blank `JWT_SECRET` in `.env` → boot fails with `ConfigurationPropertiesBindException` naming `stayhub.jwt.secret`
- [ ] Manual: register flow at `http://localhost:3000/register` succeeds end-to-end

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed. Open it; CI should kick off (Backend + Frontend gates).

- [ ] **Step 3: Wait for CI and report back**

```bash
gh pr checks --watch
```

Expected: both `Backend` and `Frontend` checks turn green. If either fails, post the failure log into the PR thread, fix on the branch, and let CI re-run. Do **not** force-push or commit to `main`.

---

## Self-review notes

- Spec coverage: every requirement in the spec maps to a task — `.env` loading (T2/T7/T8/T9), fail-fast validation (T2/T3/T4), filter cleanup (T5), Kdoc refresh (T6), docs (T10), verification (T11), PR workflow (T12). The "out of scope" items (Stripe / Mapbox / Mail validation, `.env` gitignore decision) are not implemented here, matching the spec.
- No placeholders: every step has concrete code, exact paths, and expected output.
- Type consistency: `JwtProperties.secret`, `.issuer`, and the `@field:NotBlank` / `@field:Size(min = 32)` annotations are referenced consistently across T3 (test), T4 (rewrite), T5 (filter), and T6 (Kdoc).
- The branch rename in T1 is the only mildly risky early step — if it fails on a remote-tracking ref, the recovery is `git branch -m fix/jwt-env-config-hardening` from the same SHA and pushing fresh.
