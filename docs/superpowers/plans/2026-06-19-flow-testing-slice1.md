# Flow Testing — Slice 1 Implementation Plan (per-endpoint)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the backend **per-endpoint integration-test** pattern — a shared `AbstractApiIntegrationTest` harness plus per-endpoint integration tests for the **booking endpoints** (`POST /bookings`, `POST /bookings/{id}/confirm`), covering the happy path and key error paths through the real Spring context, HTTP codecs, security chain, and database.

**Architecture:** Full-context `@SpringBootTest(RANDOM_PORT)` with a `WebTestClient` bound to the real server (`bindToServer` + `@LocalServerPort`) so requests cross a real socket through the real WebFlux filter chain and Jackson codecs. Postgres/PostGIS from the existing Testcontainers singleton. Payments via the wired `StubPaymentAdapter` (auto-succeeds; unknown intent → FAILED). Each test targets **one endpoint + one behavior** — these are endpoint-contract tests, **not** chained journeys (the whole journey is Playwright's job, Slice 3). A test may create a booking as *setup* for a confirm test; that is setup, not a journey assertion.

**Tech Stack:** Kotlin, Spring WebFlux, JUnit 5, `WebTestClient`, Testcontainers (Postgres/PostGIS), Flyway, Gradle, AssertJ.

**Scope:** Slice 1 of 4 (`docs/superpowers/specs/2026-06-19-e2e-flow-testing-strategy-design.md`). Slice 2 = per-endpoint tests for the other controllers; Slice 3 = Playwright whole-journey + Dockerfiles + compose + CI; Slice 4 = enforcement.

**Repurpose note:** This supersedes the earlier "backend journey test" approach. PR #138 currently contains `com/stayhub/flow/AbstractFlowTest.kt` + `com/stayhub/flow/BookingJourneyFlowTest.kt`; this plan moves the base into the existing `presentation/api/integration/` package (renamed `AbstractApiIntegrationTest`), replaces the chained journey test with per-endpoint booking tests, and deletes the `com/stayhub/flow/` package.

---

### Task 1: Shared per-endpoint integration base

**Files:**
- Create: `backend/src/test/kotlin/com/stayhub/presentation/api/integration/AbstractApiIntegrationTest.kt`
- Delete: `backend/src/test/kotlin/com/stayhub/flow/AbstractFlowTest.kt`

- [ ] **Step 1: Create the base** (same mechanics as the prior `AbstractFlowTest`, renamed and relocated next to the existing integration tests)

```kotlin
package com.stayhub.presentation.api.integration

import com.stayhub.infrastructure.config.TestContainersConfiguration
import org.junit.jupiter.api.BeforeEach
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.reactive.server.WebTestClient
import java.time.Duration

/**
 * Base for per-endpoint API integration tests — each test verifies one endpoint
 * against the full Spring context over real HTTP (`bindToServer` +
 * [LocalServerPort]), so requests cross a real socket through the real WebFlux
 * filter chain, Jackson codecs, and security. This is the layer that catches
 * the wiring/codec/CORS bugs mocked slice tests miss (issues #130, #132).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(TestContainersConfiguration::class)
@TestPropertySource(
    properties = [
        "spring.flyway.enabled=true",
        "stayhub.jwt.secret=test-secret-key-for-integration-tests-minimum-32-chars",
        "stayhub.jwt.issuer=stayhub",
    ]
)
abstract class AbstractApiIntegrationTest {

    @LocalServerPort
    private var port: Int = 0

    protected lateinit var http: WebTestClient

    @BeforeEach
    fun initWebTestClient() {
        http = WebTestClient.bindToServer()
            .baseUrl("http://localhost:$port")
            .responseTimeout(Duration.ofSeconds(30))
            .build()
    }

    /** Registers a brand-new guest (unique email) and returns the issued JWT. */
    protected fun registerGuest(
        email: String = "it-${System.nanoTime()}@example.com",
        password: String = "pass1234",
    ): String =
        http.post()
            .uri("/api/v1/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(
                """{"email":"$email","password":"$password","first_name":"Itest","last_name":"User"}"""
            )
            .exchange()
            .expectStatus().isCreated
            .expectBody(Map::class.java)
            .returnResult()
            .responseBody?.get("token") as? String
            ?: error("register did not return a token")
}
```

- [ ] **Step 2: Remove the old flow base**

```bash
git rm backend/src/test/kotlin/com/stayhub/flow/AbstractFlowTest.kt
```

- [ ] **Step 3: Verify compile**

Run: `cd backend && ./gradlew compileTestKotlin`
Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test(it): add AbstractApiIntegrationTest base in integration package (#137)"
```

---

### Task 2: Per-endpoint booking integration tests

**Files:**
- Create: `backend/src/test/kotlin/com/stayhub/presentation/api/integration/BookingApiIntegrationTest.kt`
- Delete: `backend/src/test/kotlin/com/stayhub/flow/BookingJourneyFlowTest.kt`

Mechanics (verified against the controllers / `StubPaymentAdapter`):
- Seed availability `CURRENT_DATE .. +89`; seed bookings at `+10..14, +20..23, +40..45`. A per-call offset of `50..79` (3-night stay → checkout ≤ +82) is free, in-window, and avoids cross-test 409s in the shared DB.
- Create response: `stripe_client_secret = "pi_stub_secret_<paymentIntentId>"`; the stub stores intents `SUCCEEDED`. An **unknown** intent id → `getPaymentStatus` returns `FAILED`.
- Error-code envelope (`$.error.code`): `DATES_UNAVAILABLE` (409), `NOT_FOUND` (404), `FORBIDDEN` (403), `PAYMENT_FAILED` (400) — per `GlobalExceptionHandler`.

- [ ] **Step 1: Write the per-endpoint tests**

```kotlin
package com.stayhub.presentation.api.integration

import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import java.time.LocalDate
import java.util.UUID

/**
 * Per-endpoint integration tests for the booking endpoints, exercised over the
 * real stack (codecs — #132; JWT security — #130; DB). Each test targets one
 * endpoint + one behavior; creating a booking inside a confirm test is setup.
 */
class BookingApiIntegrationTest : AbstractApiIntegrationTest() {

    // Seeded property (V7): "Cosy Eixample Apartment", Barcelona.
    private val propertyId = "cccccccc-cccc-cccc-cccc-000000001001"

    /** Free, in-window dates, unique per call to avoid cross-test 409s in the shared DB. */
    private fun freeDates(): Pair<LocalDate, LocalDate> {
        val checkIn = LocalDate.now().plusDays(50 + (System.nanoTime() % 30))
        return checkIn to checkIn.plusDays(3)
    }

    private fun bookingBody(checkIn: LocalDate, checkOut: LocalDate, guests: Int = 2, property: String = propertyId) =
        """{"property_id":"$property","check_in":"$checkIn","check_out":"$checkOut","guest_count":$guests}"""

    // --- POST /api/v1/bookings ------------------------------------------------

    @Test
    fun `create returns 201 with booking details and ISO-date pricing`() {
        val token = registerGuest()
        val (checkIn, checkOut) = freeDates()

        http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut))
            .exchange()
            .expectStatus().isCreated
            .expectBody()
            .jsonPath("$.booking_id").exists()
            .jsonPath("$.reference_number").exists()
            .jsonPath("$.stripe_client_secret").exists()
            .jsonPath("$.hold_expires_at").exists()
            .jsonPath("$.price_breakdown.nights").isEqualTo(3)
    }

    @Test
    fun `create returns 401 without a token`() {
        val (checkIn, checkOut) = freeDates()
        http.post().uri("/api/v1/bookings")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut))
            .exchange()
            .expectStatus().isUnauthorized
    }

    @Test
    fun `create returns 400 when property_id is missing`() {
        val token = registerGuest()
        http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"check_in":"2030-06-01","check_out":"2030-06-05","guest_count":2}""")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `create returns 404 when the property does not exist`() {
        val token = registerGuest()
        val (checkIn, checkOut) = freeDates()
        http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut, property = UUID.randomUUID().toString()))
            .exchange()
            .expectStatus().isNotFound
            .expectBody().jsonPath("$.error.code").isEqualTo("NOT_FOUND")
    }

    @Test
    fun `create returns 409 when the dates are already held`() {
        val (checkIn, checkOut) = freeDates()
        // First booking holds the dates.
        http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer ${registerGuest()}")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut))
            .exchange()
            .expectStatus().isCreated
        // Second booking for the same property + dates conflicts.
        http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer ${registerGuest()}")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut))
            .exchange()
            .expectStatus().isEqualTo(409)
            .expectBody().jsonPath("$.error.code").isEqualTo("DATES_UNAVAILABLE")
    }

    // --- POST /api/v1/bookings/{id}/confirm -----------------------------------

    /** Creates a booking and returns (bookingId, paymentIntentId). Setup for confirm tests. */
    private fun createBooking(token: String): Pair<String, String> {
        val (checkIn, checkOut) = freeDates()
        val body = http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut))
            .exchange()
            .expectStatus().isCreated
            .expectBody(Map::class.java).returnResult().responseBody!!
        val bookingId = body["booking_id"] as String
        val paymentIntentId = (body["stripe_client_secret"] as String).removePrefix("pi_stub_secret_")
        return bookingId to paymentIntentId
    }

    @Test
    fun `confirm returns 200 and marks the booking confirmed`() {
        val token = registerGuest()
        val (bookingId, paymentIntentId) = createBooking(token)
        http.post().uri("/api/v1/bookings/$bookingId/confirm")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"payment_intent_id":"$paymentIntentId"}""")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(bookingId)
            .jsonPath("$.status").isEqualTo("confirmed")
    }

    @Test
    fun `confirm returns 403 when the booking belongs to another guest`() {
        val (bookingId, paymentIntentId) = createBooking(registerGuest())
        http.post().uri("/api/v1/bookings/$bookingId/confirm")
            .header("Authorization", "Bearer ${registerGuest()}")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"payment_intent_id":"$paymentIntentId"}""")
            .exchange()
            .expectStatus().isForbidden
            .expectBody().jsonPath("$.error.code").isEqualTo("FORBIDDEN")
    }

    @Test
    fun `confirm returns 400 when the payment did not succeed`() {
        val token = registerGuest()
        val (bookingId, _) = createBooking(token)
        // Unknown intent id -> stub reports FAILED.
        http.post().uri("/api/v1/bookings/$bookingId/confirm")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"payment_intent_id":"pi_stub_unknown_not_succeeded"}""")
            .exchange()
            .expectStatus().isBadRequest
            .expectBody().jsonPath("$.error.code").isEqualTo("PAYMENT_FAILED")
    }
}
```

- [ ] **Step 2: Remove the old journey test**

```bash
git rm backend/src/test/kotlin/com/stayhub/flow/BookingJourneyFlowTest.kt
```

- [ ] **Step 3: Run the booking integration tests, expect PASS**

Run: `cd backend && ./gradlew test --tests "com.stayhub.presentation.api.integration.BookingApiIntegrationTest" --rerun-tasks`
Expected: `BUILD SUCCESSFUL`, 8 tests passing.

**If an error-path test does not produce the asserted status/code** (the confirm-ownership-vs-payment order and the validation/404 codes are the least certain): read `ConfirmBookingUseCase`, `CreateBookingUseCase`, and `GlobalExceptionHandler` to confirm the real contract. Adjust the **setup** to reach the intended precondition if needed, but do **not** weaken a contract assertion to make a test pass — if the real status/code differs from the spec, report it as a finding (it may be a real bug).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test(it): per-endpoint booking integration tests (create/confirm, happy + errors) (#137)"
```

---

### Task 3: Verify full suite & confirm the flow package is gone

- [ ] **Step 1: Confirm no `com/stayhub/flow` files remain**

Run: `ls backend/src/test/kotlin/com/stayhub/flow 2>/dev/null || echo "flow package removed"`
Expected: `flow package removed` (both files deleted in Tasks 1–2).

- [ ] **Step 2: Run the full suite**

Run: `cd backend && ./gradlew test --rerun-tasks`
Expected: `BUILD SUCCESSFUL`, 0 failures.

- [ ] **Step 3: Commit (only if anything was outstanding)** — otherwise skip.

---

### Task 4: Push and open/refresh the PR

- [ ] **Step 1: Push** `git push` (branch `issue-137-flow-slice1` already exists / PR #138 open).
- [ ] **Step 2: Update the PR #138 description** to reflect per-endpoint booking integration tests (not a journey test): list the 8 endpoint behaviors covered; note it replaces the create-only `BookingIntegrationTest` and the interim journey test; references issue #137, spec, epic #134.
- [ ] **Step 3: Report** the test count and PR URL. Do not close the issue.

---

## Roadmap (future plans)

- **Slice 2:** per-endpoint integration tests for search, geocode, property (details/availability/reviews/price), auth (register/login), webhook; migrate `AuthIntegrationTest` + `CorsPreflightIntegrationTest` onto `AbstractApiIntegrationTest`; strengthen the weak `!= 401` assertion; close #134.
- **Slice 3:** `backend/Dockerfile` + `frontend/Dockerfile`, `docker-compose.e2e.yml`, Playwright harness + the single whole-journey browser spec, non-blocking CI job.
- **Slice 4:** skills + `implement-issue` DoD + PR-template enforcement; promote the Layer-B CI job to required once stable.

## Self-review

- **Spec coverage:** per-endpoint base ✓ (Task 1); booking endpoint behaviors — create 201/401/400/404/409, confirm 200/403/400 ✓ (Task 2); old journey/flow artifacts removed ✓ (Tasks 1–3); runs in existing Backend gate ✓.
- **Placeholder scan:** all code complete; `#137` is the tracking issue (real), not a placeholder. The two least-certain error paths carry an explicit verify-don't-weaken instruction rather than a guessed assertion left as TODO.
- **Identifier consistency:** base exposes `http: WebTestClient` + `registerGuest(): String`; `BookingApiIntegrationTest` uses exactly those, plus local helpers `freeDates()`, `bookingBody(...)`, `createBooking(...)`. Endpoint paths, the `pi_stub_secret_` derivation, and error codes match the controllers / stub / `GlobalExceptionHandler`.
