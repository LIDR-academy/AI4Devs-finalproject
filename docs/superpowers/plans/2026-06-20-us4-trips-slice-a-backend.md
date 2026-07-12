# US4 — My Trips & Cancellation (Slice A: Backend) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the three guest-facing trip endpoints — list my trips (filterable), get a booking's full detail (with on-the-fly `can_cancel` / refund), and cancel a confirmed booking (stub refund + status→cancelled) — through the real Clean-Architecture stack, with per-endpoint integration tests and unit tests.

**Architecture:** New application use cases (`GetMyTripsUseCase`, `GetBookingDetailsUseCase`, `CancelBookingUseCase`) over the existing `BookingRepository` (extended with a category-aware paginated query) and a new `PaymentService.refund` port. The 48-hour refund rule lives in a pure `CancellationPolicy` object reused by detail + cancel. Controller stays humble (parse → use case → map DTO). No schema change (the `cancellation_reason` / `cancelled_at` columns and the `cancelled` status already exist).

**Tech Stack:** Kotlin 2.0 / JVM 21, Spring Boot WebFlux + coroutines, R2DBC `DatabaseClient` (PostgreSQL/PostGIS), JUnit 5 + Kotest + MockK, Testcontainers, `WebTestClient.bindToServer`, Gradle.

**Scope:** Slice A of 3 (`docs/superpowers/specs/2026-06-20-us4-my-trips-cancellation-design.md`). Slice B = frontend (`tripsService`, `TripCard`, `CancellationModal`, `/trips`, `/trips/[id]`); Slice C = Playwright cancellation journey. Issues: #67–#71 (T066–T071).

**Branch:** `issue-67-us4-trips-backend` (create before the first commit; one PR for the whole slice — never commit to `main`).

**Cancellation policy (fixed by spec FR-012):** Only `CONFIRMED` bookings are cancellable (else **422 BOOKING_CANNOT_CANCEL**). Refund = full `total_eur` if `now ≤ checkIn@00:00 UTC − 48h`, else `0.00`. `refund_status` = `full_refund` when the refund is the full total, else `no_refund`. Cancelling frees the dates automatically (the conflict check excludes cancelled bookings) — no `availability`-table write.

---

### Task 1: Payment refund port + stub adapter

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/domain/booking/RefundResult.kt`
- Modify: `backend/src/main/kotlin/com/stayhub/domain/booking/PaymentService.kt`
- Modify: `backend/src/main/kotlin/com/stayhub/infrastructure/payment/StubPaymentAdapter.kt`
- Test: `backend/src/test/kotlin/com/stayhub/infrastructure/payment/StubPaymentAdapterTest.kt`

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/kotlin/com/stayhub/infrastructure/payment/StubPaymentAdapterTest.kt`:

```kotlin
package com.stayhub.infrastructure.payment

import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldStartWith
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.util.UUID

class StubPaymentAdapterTest {

    private val adapter = StubPaymentAdapter()

    @Test
    fun `refund echoes the requested amount and returns a stub refund id`() = runBlocking {
        val intent = adapter.createPaymentIntent(BigDecimal("486.00"), UUID.randomUUID())

        val result = adapter.refund(intent.id, BigDecimal("486.00"))

        result.refundId shouldStartWith "re_stub_"
        result.amountEur.compareTo(BigDecimal("486.00")) shouldBe 0
    }

    @Test
    fun `refund of zero amount is allowed and echoes zero`() = runBlocking {
        val result = adapter.refund("pi_stub_whatever", BigDecimal.ZERO)

        result.amountEur.compareTo(BigDecimal.ZERO) shouldBe 0
    }
}
```

- [ ] **Step 2: Run the test, expect a compile failure**

Run: `cd backend && ./gradlew compileTestKotlin`
Expected: FAIL — `RefundResult` and `PaymentService.refund` are unresolved.

- [ ] **Step 3: Create `RefundResult`**

Create `backend/src/main/kotlin/com/stayhub/domain/booking/RefundResult.kt`:

```kotlin
package com.stayhub.domain.booking

import java.math.BigDecimal

/**
 * Outcome of a payment refund operation as reported by the payment provider
 * (stubbed for v1). The policy-level decision of how much to refund is made by
 * the application layer; this type just carries what was actually refunded.
 */
data class RefundResult(
    val refundId: String,
    val amountEur: BigDecimal,
)
```

- [ ] **Step 4: Add `refund` to the port**

In `backend/src/main/kotlin/com/stayhub/domain/booking/PaymentService.kt`, add the method:

```kotlin
package com.stayhub.domain.booking

import java.math.BigDecimal
import java.util.UUID

interface PaymentService {
    suspend fun createPaymentIntent(amountEur: BigDecimal, bookingId: UUID): PaymentIntent
    suspend fun getPaymentStatus(paymentIntentId: String): PaymentStatus
    suspend fun refund(paymentIntentId: String, amountEur: BigDecimal): RefundResult
}
```

- [ ] **Step 5: Implement `refund` in the stub**

In `backend/src/main/kotlin/com/stayhub/infrastructure/payment/StubPaymentAdapter.kt`, add the override (after `getPaymentStatus`):

```kotlin
    override suspend fun refund(paymentIntentId: String, amountEur: BigDecimal): RefundResult {
        // Stub: always "succeeds". A real Stripe adapter (issue #53) would call
        // the Refunds API here and translate failures into PaymentFailedException.
        val refundId = "re_stub_${UUID.randomUUID().toString().replace("-", "").take(24)}"
        return RefundResult(refundId = refundId, amountEur = amountEur)
    }
```

Add the import at the top of the file:

```kotlin
import com.stayhub.domain.booking.RefundResult
```

- [ ] **Step 6: Run the test, expect PASS**

Run: `cd backend && ./gradlew test --tests "com.stayhub.infrastructure.payment.StubPaymentAdapterTest"`
Expected: `BUILD SUCCESSFUL`, 2 tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(booking): add PaymentService.refund port + stub adapter (#69)"
```

---

### Task 2: CancellationPolicy (pure 48-hour rule)

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/application/booking/CancellationPolicy.kt`
- Test: `backend/src/test/kotlin/com/stayhub/application/booking/CancellationPolicyTest.kt`

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/kotlin/com/stayhub/application/booking/CancellationPolicyTest.kt`:

```kotlin
package com.stayhub.application.booking

import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingStatus
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset

class CancellationPolicyTest {

    private val checkIn = LocalDate.of(2030, 6, 10)
    private val checkInInstant = checkIn.atStartOfDay(ZoneOffset.UTC).toInstant()

    private fun booking(status: BookingStatus) = Booking(
        id = java.util.UUID.randomUUID(),
        propertyId = java.util.UUID.randomUUID(),
        guestId = java.util.UUID.randomUUID(),
        referenceNumber = "BK-20300101-ABC123",
        checkIn = checkIn,
        checkOut = checkIn.plusDays(3),
        guestCount = 2,
        nights = 3,
        nightlyRateEur = BigDecimal("100.00"),
        cleaningFeeEur = BigDecimal("50.00"),
        serviceFeeEur = BigDecimal("36.00"),
        taxEur = BigDecimal("0.00"),
        totalEur = BigDecimal("386.00"),
        status = status,
        stripePaymentIntentId = "pi_stub_abc",
        cancellationReason = null,
        cancelledAt = null,
        createdAt = Instant.now(),
        updatedAt = Instant.now(),
    )

    @Test
    fun `only CONFIRMED bookings are cancellable`() {
        CancellationPolicy.canCancel(booking(BookingStatus.CONFIRMED)) shouldBe true
        CancellationPolicy.canCancel(booking(BookingStatus.PENDING)) shouldBe false
        CancellationPolicy.canCancel(booking(BookingStatus.CANCELLED)) shouldBe false
        CancellationPolicy.canCancel(booking(BookingStatus.COMPLETED)) shouldBe false
    }

    @Test
    fun `full refund when more than 48h before check-in`() {
        val now = checkInInstant.minusSeconds(49 * 3600)
        CancellationPolicy.refundAmountEur(booking(BookingStatus.CONFIRMED), now)
            .compareTo(BigDecimal("386.00")) shouldBe 0
    }

    @Test
    fun `exactly 48h before check-in still gives a full refund`() {
        val now = checkInInstant.minusSeconds(48 * 3600)
        CancellationPolicy.refundAmountEur(booking(BookingStatus.CONFIRMED), now)
            .compareTo(BigDecimal("386.00")) shouldBe 0
    }

    @Test
    fun `no refund when within 48h of check-in`() {
        val now = checkInInstant.minusSeconds(47 * 3600)
        CancellationPolicy.refundAmountEur(booking(BookingStatus.CONFIRMED), now)
            .compareTo(BigDecimal.ZERO) shouldBe 0
    }
}
```

- [ ] **Step 2: Run the test, expect a compile failure**

Run: `cd backend && ./gradlew compileTestKotlin`
Expected: FAIL — `CancellationPolicy` unresolved.

- [ ] **Step 3: Implement the policy**

Create `backend/src/main/kotlin/com/stayhub/application/booking/CancellationPolicy.kt`:

```kotlin
package com.stayhub.application.booking

import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingStatus
import java.math.BigDecimal
import java.time.Duration
import java.time.Instant
import java.time.ZoneOffset

/**
 * Platform cancellation policy (spec FR-012), framework-free so both
 * GetBookingDetailsUseCase and CancelBookingUseCase can reuse it:
 *  - only CONFIRMED bookings are cancellable;
 *  - full refund if cancelled 48+ hours before check-in (measured against
 *    check-in at 00:00 UTC), otherwise no refund.
 */
object CancellationPolicy {

    val FREE_CANCELLATION_WINDOW: Duration = Duration.ofHours(48)

    fun canCancel(booking: Booking): Boolean =
        booking.status == BookingStatus.CONFIRMED

    fun isWithinFreeWindow(booking: Booking, now: Instant): Boolean {
        val checkInInstant = booking.checkIn.atStartOfDay(ZoneOffset.UTC).toInstant()
        return !now.isAfter(checkInInstant.minus(FREE_CANCELLATION_WINDOW))
    }

    /** Refund the guest would receive if the booking were cancelled at [now]. */
    fun refundAmountEur(booking: Booking, now: Instant): BigDecimal =
        if (isWithinFreeWindow(booking, now)) booking.totalEur else BigDecimal.ZERO.setScale(2)
}
```

- [ ] **Step 4: Run the test, expect PASS**

Run: `cd backend && ./gradlew test --tests "com.stayhub.application.booking.CancellationPolicyTest"`
Expected: `BUILD SUCCESSFUL`, 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(booking): add CancellationPolicy (48h refund rule) (#67)"
```

---

### Task 3: TripCategory + category-aware repository query

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/domain/booking/TripCategory.kt`
- Modify: `backend/src/main/kotlin/com/stayhub/domain/booking/BookingRepository.kt`
- Modify: `backend/src/main/kotlin/com/stayhub/infrastructure/persistence/BookingRepositoryAdapter.kt`
- Test: `backend/src/test/kotlin/com/stayhub/infrastructure/persistence/BookingRepositoryAdapterTest.kt` (extend)

- [ ] **Step 1: Write the failing test (extend the existing adapter test)**

Append these tests inside `BookingRepositoryAdapterTest` (before the closing brace). They reuse the existing `makeBooking(...)` helper and `guestId`:

```kotlin
    @Test
    fun `findByGuestIdAndCategory UPCOMING excludes cancelled and past, by check_out`() = runTest {
        val today = LocalDate.of(2030, 6, 15)
        // Upcoming: check_out today or later, not cancelled
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 14), checkOut = LocalDate.of(2030, 6, 20), status = BookingStatus.CONFIRMED))
        // Past: check_out before today
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 1), checkOut = LocalDate.of(2030, 6, 5), status = BookingStatus.CONFIRMED))
        // Cancelled (future) must be excluded from UPCOMING
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 25), checkOut = LocalDate.of(2030, 6, 28), status = BookingStatus.CANCELLED))

        val page = adapter.findByGuestIdAndCategory(guestId, TripCategory.UPCOMING, today, PageRequest.of(0, 10))

        page.totalElements shouldBe 1L
        page.content.single().checkOut shouldBe LocalDate.of(2030, 6, 20)
    }

    @Test
    fun `findByGuestIdAndCategory PAST returns only non-cancelled with check_out before today`() = runTest {
        val today = LocalDate.of(2030, 6, 15)
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 1), checkOut = LocalDate.of(2030, 6, 5), status = BookingStatus.COMPLETED))
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 20), checkOut = LocalDate.of(2030, 6, 23), status = BookingStatus.CONFIRMED))

        val page = adapter.findByGuestIdAndCategory(guestId, TripCategory.PAST, today, PageRequest.of(0, 10))

        page.totalElements shouldBe 1L
        page.content.single().checkOut shouldBe LocalDate.of(2030, 6, 5)
    }

    @Test
    fun `findByGuestIdAndCategory CANCELLED returns only cancelled bookings`() = runTest {
        val today = LocalDate.of(2030, 6, 15)
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 20), checkOut = LocalDate.of(2030, 6, 23), status = BookingStatus.CANCELLED))
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 21), checkOut = LocalDate.of(2030, 6, 24), status = BookingStatus.CONFIRMED))

        val page = adapter.findByGuestIdAndCategory(guestId, TripCategory.CANCELLED, today, PageRequest.of(0, 10))

        page.totalElements shouldBe 1L
        page.content.single().status shouldBe BookingStatus.CANCELLED
    }

    @Test
    fun `findByGuestIdAndCategory ALL returns every booking for the guest`() = runTest {
        val today = LocalDate.of(2030, 6, 15)
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 1), checkOut = LocalDate.of(2030, 6, 5), status = BookingStatus.COMPLETED))
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 20), checkOut = LocalDate.of(2030, 6, 23), status = BookingStatus.CANCELLED))
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 25), checkOut = LocalDate.of(2030, 6, 28), status = BookingStatus.CONFIRMED))

        val page = adapter.findByGuestIdAndCategory(guestId, TripCategory.ALL, today, PageRequest.of(0, 10))

        page.totalElements shouldBe 3L
    }
```

Add the import at the top of the test file:

```kotlin
import com.stayhub.domain.booking.TripCategory
```

- [ ] **Step 2: Run the test, expect a compile failure**

Run: `cd backend && ./gradlew compileTestKotlin`
Expected: FAIL — `TripCategory` and `findByGuestIdAndCategory` unresolved.

- [ ] **Step 3: Create the `TripCategory` enum**

Create `backend/src/main/kotlin/com/stayhub/domain/booking/TripCategory.kt`:

```kotlin
package com.stayhub.domain.booking

/**
 * Filter for "My Trips". UPCOMING/PAST split is by check-out date (a mid-stay
 * trip still counts as upcoming); CANCELLED is purely status-based; ALL is
 * unfiltered. The reference date ("today") is supplied by the caller so the
 * boundary is testable and the clock stays in the application layer.
 */
enum class TripCategory {
    ALL,
    UPCOMING,
    PAST,
    CANCELLED,
}
```

- [ ] **Step 4: Add the port method**

In `backend/src/main/kotlin/com/stayhub/domain/booking/BookingRepository.kt`, add the method and import:

```kotlin
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import java.time.LocalDate
import java.util.UUID

interface BookingRepository {
    suspend fun save(booking: Booking): Booking
    suspend fun findById(id: UUID): Booking?
    suspend fun findByGuestId(guestId: UUID, pageable: Pageable): Page<Booking>
    suspend fun findByGuestIdAndCategory(
        guestId: UUID,
        category: TripCategory,
        today: LocalDate,
        pageable: Pageable,
    ): Page<Booking>
    suspend fun findByPropertyAndDates(propertyId: UUID, checkIn: LocalDate, checkOut: LocalDate): List<Booking>
}
```

- [ ] **Step 5: Implement in the adapter**

In `backend/src/main/kotlin/com/stayhub/infrastructure/persistence/BookingRepositoryAdapter.kt`, add the import `import com.stayhub.domain.booking.TripCategory` and this method (e.g. after `findByGuestId`):

```kotlin
    override suspend fun findByGuestIdAndCategory(
        guestId: UUID,
        category: TripCategory,
        today: LocalDate,
        pageable: Pageable,
    ): Page<Booking> {
        // `filter` fragments are compile-time constants (no user input) — safe to
        // interpolate. `:today` is only referenced for UPCOMING/PAST, so bind it
        // conditionally (R2DBC rejects a bound parameter absent from the SQL).
        val (filter, needsToday) = when (category) {
            TripCategory.ALL -> "guest_id = :guestId" to false
            TripCategory.UPCOMING -> "guest_id = :guestId AND status <> 'cancelled' AND check_out >= :today" to true
            TripCategory.PAST -> "guest_id = :guestId AND status <> 'cancelled' AND check_out < :today" to true
            TripCategory.CANCELLED -> "guest_id = :guestId AND status = 'cancelled'" to false
        }

        val sql = """
            SELECT id, property_id, guest_id, reference_number,
                   check_in, check_out, guest_count, nights,
                   nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur, total_eur,
                   status, stripe_payment_intent_id,
                   cancellation_reason, cancelled_at,
                   created_at, updated_at,
                   COUNT(*) OVER() AS total_count
              FROM booking
             WHERE $filter
             ORDER BY check_in DESC
             LIMIT :pageSize OFFSET :offset
        """.trimIndent()

        var spec = databaseClient.sql(sql)
            .bind("guestId", guestId)
            .bind("pageSize", pageable.pageSize)
            .bind("offset", pageable.offset)
        if (needsToday) {
            spec = spec.bind("today", today)
        }

        val results = spec
            .map { row, _ ->
                Pair(mapRow(row), row.get("total_count", Long::class.java) ?: 0L)
            }
            .all()
            .collectList()
            .awaitSingle()

        val bookings = results.map { it.first }
        val total = results.firstOrNull()?.second ?: 0L
        return PageImpl(bookings, pageable, total)
    }
```

- [ ] **Step 6: Run the adapter test, expect PASS**

Run: `cd backend && ./gradlew test --tests "com.stayhub.infrastructure.persistence.BookingRepositoryAdapterTest"`
Expected: `BUILD SUCCESSFUL`, all tests pass (4 new + the existing ones).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(booking): category-aware findByGuestIdAndCategory query (#67)"
```

---

### Task 4: GetMyTripsUseCase

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/application/booking/GetMyTripsResult.kt`
- Create: `backend/src/main/kotlin/com/stayhub/application/booking/GetMyTripsUseCase.kt`
- Test: `backend/src/test/kotlin/com/stayhub/application/booking/GetMyTripsUseCaseTest.kt`

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/kotlin/com/stayhub/application/booking/GetMyTripsUseCaseTest.kt`:

```kotlin
package com.stayhub.application.booking

import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.booking.TripCategory
import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

class GetMyTripsUseCaseTest {

    private val bookingRepository = mockk<BookingRepository>()
    private val propertyRepository = mockk<PropertyRepository>()
    private val useCase = GetMyTripsUseCase(bookingRepository, propertyRepository)

    private val guestId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000001")
    private val propertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001")

    private val booking = Booking(
        id = UUID.randomUUID(),
        propertyId = propertyId,
        guestId = guestId,
        referenceNumber = "BK-20300101-ABC123",
        checkIn = LocalDate.of(2030, 6, 10),
        checkOut = LocalDate.of(2030, 6, 13),
        guestCount = 2,
        nights = 3,
        nightlyRateEur = BigDecimal("100.00"),
        cleaningFeeEur = BigDecimal("50.00"),
        serviceFeeEur = BigDecimal("36.00"),
        taxEur = BigDecimal("0.00"),
        totalEur = BigDecimal("386.00"),
        status = BookingStatus.CONFIRMED,
        stripePaymentIntentId = "pi_stub_abc",
        cancellationReason = null,
        cancelledAt = null,
        createdAt = Instant.now(),
        updatedAt = Instant.now(),
    )

    private val property = Property(
        id = propertyId,
        hostId = UUID.randomUUID(),
        title = "Cosy Eixample Apartment",
        description = "",
        propertyType = "apartment",
        location = Property.Location(41.39, 2.16, "Barcelona", "Catalonia", "Spain", "Carrer 1"),
        maxGuests = 4,
        bedrooms = 2,
        bathrooms = 1,
        nightlyRateEur = 100.0,
        cleaningFeeEur = 50.0,
        amenities = emptyList(),
        houseRules = emptyList(),
        photos = listOf(Property.Photo("https://img/1.jpg", "front")),
        avgRating = 4.8,
        reviewCount = 12,
    )

    @Test
    fun `maps bookings to enriched summaries with pagination`() = runBlocking {
        coEvery {
            bookingRepository.findByGuestIdAndCategory(eq(guestId), eq(TripCategory.UPCOMING), any(), any<Pageable>())
        } returns PageImpl(listOf(booking), PageRequest.of(0, 10), 1L)
        coEvery { propertyRepository.findById(propertyId) } returns property

        val result = useCase.execute(guestId, TripCategory.UPCOMING, page = 1, size = 10)

        result.page shouldBe 1
        result.size shouldBe 10
        result.totalResults shouldBe 1L
        result.totalPages shouldBe 1
        val summary = result.bookings.single()
        summary.referenceNumber shouldBe "BK-20300101-ABC123"
        summary.propertyTitle shouldBe "Cosy Eixample Apartment"
        summary.propertyPhotoUrl shouldBe "https://img/1.jpg"
        summary.city shouldBe "Barcelona"
        summary.status shouldBe BookingStatus.CONFIRMED
        summary.totalEur.compareTo(BigDecimal("386.00")) shouldBe 0
    }

    @Test
    fun `tolerates a missing property with blank enrichment`() = runBlocking {
        coEvery {
            bookingRepository.findByGuestIdAndCategory(eq(guestId), any(), any(), any<Pageable>())
        } returns PageImpl(listOf(booking), PageRequest.of(0, 10), 1L)
        coEvery { propertyRepository.findById(propertyId) } returns null

        val result = useCase.execute(guestId, TripCategory.ALL, page = 1, size = 10)

        val summary = result.bookings.single()
        summary.propertyTitle shouldBe ""
        summary.propertyPhotoUrl shouldBe ""
        summary.city shouldBe ""
    }
}
```

- [ ] **Step 2: Run the test, expect a compile failure**

Run: `cd backend && ./gradlew compileTestKotlin`
Expected: FAIL — `GetMyTripsUseCase` / `GetMyTripsResult` unresolved.

- [ ] **Step 3: Create the result types**

Create `backend/src/main/kotlin/com/stayhub/application/booking/GetMyTripsResult.kt`:

```kotlin
package com.stayhub.application.booking

import com.stayhub.domain.booking.BookingStatus
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

/** One row in the "My Trips" list (domain-typed; mapped to DTO in the controller). */
data class TripSummary(
    val id: UUID,
    val referenceNumber: String,
    val propertyTitle: String,
    val propertyPhotoUrl: String,
    val city: String,
    val checkIn: LocalDate,
    val checkOut: LocalDate,
    val status: BookingStatus,
    val totalEur: BigDecimal,
)

data class MyTripsResult(
    val bookings: List<TripSummary>,
    val page: Int,
    val size: Int,
    val totalResults: Long,
    val totalPages: Int,
)
```

- [ ] **Step 4: Implement the use case**

Create `backend/src/main/kotlin/com/stayhub/application/booking/GetMyTripsUseCase.kt`:

```kotlin
package com.stayhub.application.booking

import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.TripCategory
import com.stayhub.domain.property.PropertyRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

/**
 * Lists the authenticated guest's bookings for the requested [TripCategory],
 * paginated, enriching each with its property's title/photo/city for the
 * summary card. `page` is 1-based (contract); converted to a 0-based PageRequest.
 */
@Service
class GetMyTripsUseCase(
    private val bookingRepository: BookingRepository,
    private val propertyRepository: PropertyRepository,
) {
    suspend fun execute(guestId: UUID, category: TripCategory, page: Int, size: Int): MyTripsResult {
        val pageable = PageRequest.of(page - 1, size)
        val result = bookingRepository.findByGuestIdAndCategory(guestId, category, LocalDate.now(), pageable)

        val summaries = result.content.map { booking ->
            val property = runCatching { propertyRepository.findById(booking.propertyId) }.getOrNull()
            TripSummary(
                id = booking.id,
                referenceNumber = booking.referenceNumber,
                propertyTitle = property?.title ?: "",
                propertyPhotoUrl = property?.photos?.firstOrNull()?.url ?: "",
                city = property?.location?.city ?: "",
                checkIn = booking.checkIn,
                checkOut = booking.checkOut,
                status = booking.status,
                totalEur = booking.totalEur,
            )
        }

        return MyTripsResult(
            bookings = summaries,
            page = page,
            size = size,
            totalResults = result.totalElements,
            totalPages = result.totalPages,
        )
    }
}
```

- [ ] **Step 5: Run the test, expect PASS**

Run: `cd backend && ./gradlew test --tests "com.stayhub.application.booking.GetMyTripsUseCaseTest"`
Expected: `BUILD SUCCESSFUL`, 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(booking): GetMyTripsUseCase (paginated, enriched, filtered) (#67)"
```

---

### Task 5: GetBookingDetailsUseCase

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/application/booking/GetBookingDetailsResult.kt`
- Create: `backend/src/main/kotlin/com/stayhub/application/booking/GetBookingDetailsUseCase.kt`
- Test: `backend/src/test/kotlin/com/stayhub/application/booking/GetBookingDetailsUseCaseTest.kt`

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/kotlin/com/stayhub/application/booking/GetBookingDetailsUseCaseTest.kt`:

```kotlin
package com.stayhub.application.booking

import com.stayhub.application.error.ForbiddenException
import com.stayhub.application.error.NotFoundException
import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.property.PropertyRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

class GetBookingDetailsUseCaseTest {

    private val bookingRepository = mockk<BookingRepository>()
    private val propertyRepository = mockk<PropertyRepository>(relaxed = true)
    private val useCase = GetBookingDetailsUseCase(bookingRepository, propertyRepository)

    private val bookingId = UUID.randomUUID()
    private val guestId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000001")

    private fun booking(
        status: BookingStatus = BookingStatus.CONFIRMED,
        guest: UUID = guestId,
        checkIn: LocalDate = LocalDate.now().plusDays(30),
    ) = Booking(
        id = bookingId,
        propertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001"),
        guestId = guest,
        referenceNumber = "BK-20300101-ABC123",
        checkIn = checkIn,
        checkOut = checkIn.plusDays(3),
        guestCount = 2,
        nights = 3,
        nightlyRateEur = BigDecimal("100.00"),
        cleaningFeeEur = BigDecimal("50.00"),
        serviceFeeEur = BigDecimal("36.00"),
        taxEur = BigDecimal("0.00"),
        totalEur = BigDecimal("386.00"),
        status = status,
        stripePaymentIntentId = "pi_stub_abc",
        cancellationReason = null,
        cancelledAt = null,
        createdAt = Instant.now(),
        updatedAt = Instant.now(),
    )

    @Test
    fun `throws NotFound when the booking does not exist`() = runBlocking {
        coEvery { bookingRepository.findById(bookingId) } returns null
        shouldThrow<NotFoundException> { useCase.execute(bookingId, guestId) }
    }

    @Test
    fun `throws Forbidden when the booking belongs to another guest`() = runBlocking {
        coEvery { bookingRepository.findById(bookingId) } returns booking(guest = UUID.randomUUID())
        shouldThrow<ForbiddenException> { useCase.execute(bookingId, guestId) }
    }

    @Test
    fun `confirmed booking far in the future is cancellable with a full refund`() = runBlocking {
        coEvery { bookingRepository.findById(bookingId) } returns booking(checkIn = LocalDate.now().plusDays(30))

        val result = useCase.execute(bookingId, guestId)

        result.canCancel shouldBe true
        result.refundAmountEur!!.compareTo(BigDecimal("386.00")) shouldBe 0
    }

    @Test
    fun `confirmed booking within 48h is cancellable but refund is zero`() = runBlocking {
        coEvery { bookingRepository.findById(bookingId) } returns booking(checkIn = LocalDate.now().plusDays(1))

        val result = useCase.execute(bookingId, guestId)

        result.canCancel shouldBe true
        result.refundAmountEur!!.compareTo(BigDecimal.ZERO) shouldBe 0
    }

    @Test
    fun `cancelled booking is not cancellable and exposes no refund amount`() = runBlocking {
        coEvery { bookingRepository.findById(bookingId) } returns booking(status = BookingStatus.CANCELLED)

        val result = useCase.execute(bookingId, guestId)

        result.canCancel shouldBe false
        result.refundAmountEur.shouldBeNull()
    }
}
```

- [ ] **Step 2: Run the test, expect a compile failure**

Run: `cd backend && ./gradlew compileTestKotlin`
Expected: FAIL — `GetBookingDetailsUseCase` / `BookingDetailResult` unresolved.

- [ ] **Step 3: Create the result type**

Create `backend/src/main/kotlin/com/stayhub/application/booking/GetBookingDetailsResult.kt`:

```kotlin
package com.stayhub.application.booking

import com.stayhub.domain.booking.Booking
import com.stayhub.domain.property.Property
import java.math.BigDecimal

/**
 * Booking + its property + the on-the-fly cancellation outcome. [refundAmountEur]
 * is the amount the guest would get if cancelling now, or null when the booking
 * is not cancellable.
 */
data class BookingDetailResult(
    val booking: Booking,
    val property: Property?,
    val canCancel: Boolean,
    val refundAmountEur: BigDecimal?,
)
```

- [ ] **Step 4: Implement the use case**

Create `backend/src/main/kotlin/com/stayhub/application/booking/GetBookingDetailsUseCase.kt`:

```kotlin
package com.stayhub.application.booking

import com.stayhub.application.error.ForbiddenException
import com.stayhub.application.error.NotFoundException
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.property.PropertyRepository
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

/**
 * Returns full detail for a booking the calling guest owns, computing
 * `canCancel` and the would-be refund per [CancellationPolicy].
 *  - 404 if the booking is missing.
 *  - 403 if it belongs to another guest.
 */
@Service
class GetBookingDetailsUseCase(
    private val bookingRepository: BookingRepository,
    private val propertyRepository: PropertyRepository,
) {
    suspend fun execute(bookingId: UUID, guestId: UUID): BookingDetailResult {
        val booking = bookingRepository.findById(bookingId)
            ?: throw NotFoundException("Booking not found: $bookingId")
        if (booking.guestId != guestId) {
            throw ForbiddenException("You do not have access to this booking")
        }

        val property = runCatching { propertyRepository.findById(booking.propertyId) }.getOrNull()
        val canCancel = CancellationPolicy.canCancel(booking)
        val refundAmountEur = if (canCancel) CancellationPolicy.refundAmountEur(booking, Instant.now()) else null

        return BookingDetailResult(booking, property, canCancel, refundAmountEur)
    }
}
```

- [ ] **Step 5: Run the test, expect PASS**

Run: `cd backend && ./gradlew test --tests "com.stayhub.application.booking.GetBookingDetailsUseCaseTest"`
Expected: `BUILD SUCCESSFUL`, 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(booking): GetBookingDetailsUseCase with ownership + refund computation (#68)"
```

---

### Task 6: CancelBookingUseCase

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/application/booking/CancellationResult.kt`
- Create: `backend/src/main/kotlin/com/stayhub/application/booking/CancelBookingUseCase.kt`
- Test: `backend/src/test/kotlin/com/stayhub/application/booking/CancelBookingUseCaseTest.kt`

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/kotlin/com/stayhub/application/booking/CancelBookingUseCaseTest.kt`:

```kotlin
package com.stayhub.application.booking

import com.stayhub.application.error.BookingCannotCancelException
import com.stayhub.application.error.ForbiddenException
import com.stayhub.application.error.NotFoundException
import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.booking.RefundResult
import com.stayhub.domain.booking.PaymentService
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.slot
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

class CancelBookingUseCaseTest {

    private val bookingRepository = mockk<BookingRepository>()
    private val paymentService = mockk<PaymentService>()
    private val useCase = CancelBookingUseCase(bookingRepository, paymentService)

    private val bookingId = UUID.randomUUID()
    private val guestId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000001")

    private fun booking(
        status: BookingStatus = BookingStatus.CONFIRMED,
        guest: UUID = guestId,
        checkIn: LocalDate = LocalDate.now().plusDays(30),
    ) = Booking(
        id = bookingId,
        propertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001"),
        guestId = guest,
        referenceNumber = "BK-20300101-ABC123",
        checkIn = checkIn,
        checkOut = checkIn.plusDays(3),
        guestCount = 2,
        nights = 3,
        nightlyRateEur = BigDecimal("100.00"),
        cleaningFeeEur = BigDecimal("50.00"),
        serviceFeeEur = BigDecimal("36.00"),
        taxEur = BigDecimal("0.00"),
        totalEur = BigDecimal("386.00"),
        status = status,
        stripePaymentIntentId = "pi_stub_abc",
        cancellationReason = null,
        cancelledAt = null,
        createdAt = Instant.now(),
        updatedAt = Instant.now(),
    )

    @Test
    fun `cancels a far-future confirmed booking with a full refund`() = runBlocking {
        coEvery { bookingRepository.findById(bookingId) } returns booking(checkIn = LocalDate.now().plusDays(30))
        coEvery { paymentService.refund("pi_stub_abc", any()) } returns RefundResult("re_stub_1", BigDecimal("386.00"))
        val saved = slot<Booking>()
        coEvery { bookingRepository.save(capture(saved)) } answers { saved.captured }

        val result = useCase.execute(bookingId, guestId, reason = "change of plans")

        result.fullRefund shouldBe true
        result.refundAmountEur.compareTo(BigDecimal("386.00")) shouldBe 0
        saved.captured.status shouldBe BookingStatus.CANCELLED
        saved.captured.cancellationReason shouldBe "change of plans"
        coVerify(exactly = 1) { paymentService.refund("pi_stub_abc", any()) }
    }

    @Test
    fun `cancels a within-48h confirmed booking with no refund and no payment call`() = runBlocking {
        coEvery { bookingRepository.findById(bookingId) } returns booking(checkIn = LocalDate.now().plusDays(1))
        coEvery { bookingRepository.save(any()) } answers { firstArg() }

        val result = useCase.execute(bookingId, guestId, reason = null)

        result.fullRefund shouldBe false
        result.refundAmountEur.compareTo(BigDecimal.ZERO) shouldBe 0
        coVerify(exactly = 0) { paymentService.refund(any(), any()) }
    }

    @Test
    fun `throws NotFound when the booking does not exist`() = runBlocking {
        coEvery { bookingRepository.findById(bookingId) } returns null
        shouldThrow<NotFoundException> { useCase.execute(bookingId, guestId, null) }
        coVerify(exactly = 0) { bookingRepository.save(any()) }
    }

    @Test
    fun `throws Forbidden for another guest`() = runBlocking {
        coEvery { bookingRepository.findById(bookingId) } returns booking(guest = UUID.randomUUID())
        shouldThrow<ForbiddenException> { useCase.execute(bookingId, guestId, null) }
        coVerify(exactly = 0) { bookingRepository.save(any()) }
        coVerify(exactly = 0) { paymentService.refund(any(), any()) }
    }

    @Test
    fun `throws BookingCannotCancel when the booking is not confirmed`() = runBlocking {
        coEvery { bookingRepository.findById(bookingId) } returns booking(status = BookingStatus.CANCELLED)
        shouldThrow<BookingCannotCancelException> { useCase.execute(bookingId, guestId, null) }
        coVerify(exactly = 0) { bookingRepository.save(any()) }
    }
}
```

- [ ] **Step 2: Run the test, expect a compile failure**

Run: `cd backend && ./gradlew compileTestKotlin`
Expected: FAIL — `CancelBookingUseCase` / `CancellationResult` unresolved.

- [ ] **Step 3: Create the result type**

Create `backend/src/main/kotlin/com/stayhub/application/booking/CancellationResult.kt`:

```kotlin
package com.stayhub.application.booking

import java.math.BigDecimal
import java.util.UUID

/** Outcome of cancelling a booking. [fullRefund] → "full_refund" else "no_refund". */
data class CancellationResult(
    val bookingId: UUID,
    val refundAmountEur: BigDecimal,
    val fullRefund: Boolean,
)
```

- [ ] **Step 4: Implement the use case**

Create `backend/src/main/kotlin/com/stayhub/application/booking/CancelBookingUseCase.kt`:

```kotlin
package com.stayhub.application.booking

import com.stayhub.application.error.BookingCannotCancelException
import com.stayhub.application.error.ForbiddenException
import com.stayhub.application.error.NotFoundException
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.PaymentService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

/**
 * Cancels a CONFIRMED booking the calling guest owns, applying the refund
 * policy and issuing a (stub) refund. Dates free up automatically because the
 * booking-conflict check ignores cancelled bookings — no availability write.
 *  - 404 if missing, 403 if not owner, 422 if not CONFIRMED.
 */
@Service
class CancelBookingUseCase(
    private val bookingRepository: BookingRepository,
    private val paymentService: PaymentService,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    suspend fun execute(bookingId: UUID, guestId: UUID, reason: String?): CancellationResult {
        val booking = bookingRepository.findById(bookingId)
            ?: throw NotFoundException("Booking not found: $bookingId")
        if (booking.guestId != guestId) {
            throw ForbiddenException("You do not have access to this booking")
        }
        if (!CancellationPolicy.canCancel(booking)) {
            throw BookingCannotCancelException(
                "Booking $bookingId cannot be cancelled (status=${booking.status.name.lowercase()})"
            )
        }

        val refundAmount = CancellationPolicy.refundAmountEur(booking, Instant.now())
        val fullRefund = refundAmount > BigDecimal.ZERO
        if (fullRefund) {
            paymentService.refund(booking.stripePaymentIntentId, refundAmount)
        }

        val cancelled = bookingRepository.save(booking.cancel(reason))
        log.info("Cancelled booking {} (refund={} full={})", cancelled.id, refundAmount, fullRefund)

        return CancellationResult(
            bookingId = cancelled.id,
            refundAmountEur = refundAmount,
            fullRefund = fullRefund,
        )
    }
}
```

- [ ] **Step 5: Run the test, expect PASS**

Run: `cd backend && ./gradlew test --tests "com.stayhub.application.booking.CancelBookingUseCaseTest"`
Expected: `BUILD SUCCESSFUL`, 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(booking): CancelBookingUseCase (policy refund + 422 guard) (#69)"
```

---

### Task 7: Response/request DTOs

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/presentation/dto/booking/MyTripsResponse.kt`
- Create: `backend/src/main/kotlin/com/stayhub/presentation/dto/booking/CancellationResponse.kt`
- Create: `backend/src/main/kotlin/com/stayhub/presentation/dto/booking/CancelBookingRequest.kt`

> No test in this task — these are passive data holders, exercised by the controller tests in Task 9.

- [ ] **Step 1: Create `MyTripsResponse`**

Create `backend/src/main/kotlin/com/stayhub/presentation/dto/booking/MyTripsResponse.kt`:

```kotlin
package com.stayhub.presentation.dto.booking

/**
 * Response body for GET /api/v1/bookings/my-trips. Matches MyTripsResponse +
 * BookingSummary in contracts/booking-api.yml (snake_case JSON).
 */
data class MyTripsResponse(
    val bookings: List<BookingSummaryDto>,
    val pagination: PaginationDto,
) {
    data class BookingSummaryDto(
        val id: String,
        val reference_number: String,
        val property_title: String,
        val property_photo_url: String,
        val city: String,
        val check_in: String,
        val check_out: String,
        val status: String,
        val total_eur: Double,
    )

    data class PaginationDto(
        val page: Int,
        val size: Int,
        val total_results: Long,
        val total_pages: Int,
    )
}
```

- [ ] **Step 2: Create `CancellationResponse`**

Create `backend/src/main/kotlin/com/stayhub/presentation/dto/booking/CancellationResponse.kt`:

```kotlin
package com.stayhub.presentation.dto.booking

/**
 * Response body for POST /api/v1/bookings/{id}/cancel. Matches
 * CancellationResponse in contracts/booking-api.yml.
 * `status` is always "cancelled"; `refund_status` is "full_refund" | "no_refund".
 */
data class CancellationResponse(
    val booking_id: String,
    val status: String,
    val refund_amount_eur: Double,
    val refund_status: String,
)
```

- [ ] **Step 3: Create `CancelBookingRequest`**

Create `backend/src/main/kotlin/com/stayhub/presentation/dto/booking/CancelBookingRequest.kt`:

```kotlin
package com.stayhub.presentation.dto.booking

import jakarta.validation.constraints.Size

/** Optional body for POST /api/v1/bookings/{id}/cancel. */
data class CancelBookingRequest(
    @field:Size(max = 500, message = "reason must be at most 500 characters")
    val reason: String? = null,
)
```

- [ ] **Step 4: Verify compile**

Run: `cd backend && ./gradlew compileKotlin`
Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(booking): trip DTOs (MyTripsResponse, CancellationResponse, CancelBookingRequest) (#71)"
```

---

### Task 8: Wire the three endpoints in BookingController

**Files:**
- Modify: `backend/src/main/kotlin/com/stayhub/presentation/api/BookingController.kt`

This task wires the new endpoints and replaces the hardcoded `can_cancel`/`refund_amount_eur` in the detail mapper with the real policy computation. Replace the **entire file** with the following (same package, existing create/confirm behavior preserved):

- [ ] **Step 1: Replace `BookingController.kt`**

```kotlin
package com.stayhub.presentation.api

import com.stayhub.application.booking.BookingPriceBreakdown
import com.stayhub.application.booking.CancelBookingUseCase
import com.stayhub.application.booking.CancellationPolicy
import com.stayhub.application.booking.ConfirmBookingUseCase
import com.stayhub.application.booking.CreateBookingCommand
import com.stayhub.application.booking.CreateBookingResult
import com.stayhub.application.booking.CreateBookingUseCase
import com.stayhub.application.booking.GetBookingDetailsUseCase
import com.stayhub.application.booking.GetMyTripsUseCase
import com.stayhub.application.booking.MyTripsResult
import com.stayhub.application.error.UnauthorizedException
import com.stayhub.application.error.ValidationException
import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.TripCategory
import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.presentation.dto.booking.BookingDetailResponse
import com.stayhub.presentation.dto.booking.CancelBookingRequest
import com.stayhub.presentation.dto.booking.CancellationResponse
import com.stayhub.presentation.dto.booking.ConfirmBookingRequest
import com.stayhub.presentation.dto.booking.CreateBookingRequest
import com.stayhub.presentation.dto.booking.CreateBookingResponse
import com.stayhub.presentation.dto.booking.MyTripsResponse
import jakarta.validation.Valid
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

/**
 * Booking endpoints. All require a Bearer JWT (enforced by SecurityConfig);
 * the JWT subject is the guestId (UUID), a malformed subject yields 401.
 *
 *  POST /api/v1/bookings                  — create + Stripe PaymentIntent
 *  POST /api/v1/bookings/{id}/confirm     — confirm after payment
 *  GET  /api/v1/bookings/my-trips         — list the caller's bookings (US4)
 *  GET  /api/v1/bookings/{id}             — booking detail (US4)
 *  POST /api/v1/bookings/{id}/cancel      — cancel a confirmed booking (US4)
 */
@RestController
@RequestMapping("/api/v1/bookings")
class BookingController(
    private val createBookingUseCase: CreateBookingUseCase,
    private val confirmBookingUseCase: ConfirmBookingUseCase,
    private val getMyTripsUseCase: GetMyTripsUseCase,
    private val getBookingDetailsUseCase: GetBookingDetailsUseCase,
    private val cancelBookingUseCase: CancelBookingUseCase,
    private val propertyRepository: PropertyRepository,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    suspend fun create(
        @Valid @RequestBody request: CreateBookingRequest,
    ): CreateBookingResponse {
        val guestId = currentGuestId()

        val propertyId = request.property_id ?: throw ValidationException("property_id is required")
        val checkIn = request.check_in ?: throw ValidationException("check_in is required")
        val checkOut = request.check_out ?: throw ValidationException("check_out is required")

        log.info(
            "Create booking: guestId={} propertyId={} checkIn={} checkOut={} guestCount={}",
            guestId, propertyId, checkIn, checkOut, request.guest_count,
        )

        val result = createBookingUseCase.execute(
            CreateBookingCommand(
                propertyId = propertyId,
                guestId = guestId,
                checkIn = checkIn,
                checkOut = checkOut,
                guestCount = request.guest_count,
            )
        )

        return result.toResponse()
    }

    @PostMapping("/{bookingId}/confirm")
    suspend fun confirm(
        @PathVariable bookingId: UUID,
        @Valid @RequestBody request: ConfirmBookingRequest,
    ): BookingDetailResponse {
        val guestId = currentGuestId()
        val paymentIntentId = request.payment_intent_id
            ?: throw ValidationException("payment_intent_id is required")

        log.info("Confirm booking: bookingId={} guestId={} paymentIntentId={}", bookingId, guestId, paymentIntentId)

        val confirmed = confirmBookingUseCase.execute(bookingId, paymentIntentId, guestId)
        val property = runCatching { propertyRepository.findById(confirmed.propertyId) }.getOrNull()
        return confirmed.toDetailResponse(property)
    }

    @GetMapping("/my-trips")
    suspend fun myTrips(
        @RequestParam(required = false, defaultValue = "all") status: String,
        @RequestParam(required = false, defaultValue = "1") page: Int,
        @RequestParam(required = false, defaultValue = "10") size: Int,
    ): MyTripsResponse {
        val guestId = currentGuestId()
        if (page < 1) throw ValidationException("page must be >= 1")
        if (size < 1 || size > 50) throw ValidationException("size must be between 1 and 50")

        val category = parseCategory(status)
        val result = getMyTripsUseCase.execute(guestId, category, page, size)
        return result.toResponse()
    }

    @GetMapping("/{bookingId}")
    suspend fun detail(@PathVariable bookingId: UUID): BookingDetailResponse {
        val guestId = currentGuestId()
        val result = getBookingDetailsUseCase.execute(bookingId, guestId)
        return result.booking.toDetailResponse(
            property = result.property,
            canCancel = result.canCancel,
            refundAmountEur = result.refundAmountEur,
        )
    }

    @PostMapping("/{bookingId}/cancel")
    suspend fun cancel(
        @PathVariable bookingId: UUID,
        @Valid @RequestBody(required = false) request: CancelBookingRequest?,
    ): CancellationResponse {
        val guestId = currentGuestId()
        val result = cancelBookingUseCase.execute(bookingId, guestId, request?.reason)
        return CancellationResponse(
            booking_id = result.bookingId.toString(),
            status = "cancelled",
            refund_amount_eur = result.refundAmountEur.toDouble(),
            refund_status = if (result.fullRefund) "full_refund" else "no_refund",
        )
    }

    private fun parseCategory(status: String): TripCategory = when (status.lowercase()) {
        "all" -> TripCategory.ALL
        "upcoming" -> TripCategory.UPCOMING
        "past" -> TripCategory.PAST
        "cancelled" -> TripCategory.CANCELLED
        else -> throw ValidationException(
            "Invalid status filter: $status (allowed: upcoming, past, cancelled, all)"
        )
    }

    /**
     * Reads the JWT subject (set by JwtAuthFilter) from the reactive security
     * context and converts it to the guest UUID. 401 if absent or malformed.
     */
    private suspend fun currentGuestId(): UUID {
        val authentication = ReactiveSecurityContextHolder.getContext()
            .map { it.authentication }
            .awaitSingleOrNull()
            ?: throw UnauthorizedException()

        val raw = when (val principal = authentication.principal) {
            is String -> principal
            is org.springframework.security.core.userdetails.UserDetails -> principal.username
            else -> principal?.toString()
        } ?: throw UnauthorizedException()

        return runCatching { UUID.fromString(raw) }
            .getOrElse {
                throw UnauthorizedException("JWT subject is not a valid UUID: $raw")
            }
    }

    private fun CreateBookingResult.toResponse(): CreateBookingResponse =
        CreateBookingResponse(
            booking_id = bookingId.toString(),
            reference_number = referenceNumber,
            price_breakdown = priceBreakdown.toDto(),
            stripe_client_secret = stripeClientSecret,
            hold_expires_at = holdExpiresAt.toString(),
        )

    private fun BookingPriceBreakdown.toDto(): CreateBookingResponse.PriceBreakdownDto =
        CreateBookingResponse.PriceBreakdownDto(
            nights = nights,
            nightly_rate_eur = nightlyRateEur,
            subtotal_eur = subtotalEur,
            cleaning_fee_eur = cleaningFeeEur,
            service_fee_eur = serviceFeeEur,
            tax_eur = taxEur,
            total_eur = totalEur,
        )

    private fun MyTripsResult.toResponse(): MyTripsResponse =
        MyTripsResponse(
            bookings = bookings.map {
                MyTripsResponse.BookingSummaryDto(
                    id = it.id.toString(),
                    reference_number = it.referenceNumber,
                    property_title = it.propertyTitle,
                    property_photo_url = it.propertyPhotoUrl,
                    city = it.city,
                    check_in = it.checkIn.toString(),
                    check_out = it.checkOut.toString(),
                    status = it.status.name.lowercase(),
                    total_eur = it.totalEur.toDouble(),
                )
            },
            pagination = MyTripsResponse.PaginationDto(
                page = page,
                size = size,
                total_results = totalResults,
                total_pages = totalPages,
            ),
        )

    /**
     * Maps a booking to the detail response. When [canCancel]/[refundAmountEur]
     * are not supplied (confirm flow), they're computed here via CancellationPolicy.
     */
    private fun Booking.toDetailResponse(
        property: Property?,
        canCancel: Boolean = CancellationPolicy.canCancel(this),
        refundAmountEur: BigDecimal? =
            if (CancellationPolicy.canCancel(this)) CancellationPolicy.refundAmountEur(this, Instant.now()) else null,
    ): BookingDetailResponse {
        val subtotal = (nightlyRateEur.toDouble() * nights)
        return BookingDetailResponse(
            id = id.toString(),
            reference_number = referenceNumber,
            property = property?.let {
                BookingDetailResponse.PropertyDto(
                    id = it.id.toString(),
                    title = it.title,
                    photo_url = it.photos.firstOrNull()?.url ?: "",
                    city = it.location.city,
                    country = it.location.country,
                    address = it.location.address,
                )
            },
            check_in = checkIn.toString(),
            check_out = checkOut.toString(),
            guest_count = guestCount,
            status = status.name.lowercase(),
            price_breakdown = BookingDetailResponse.PriceBreakdownDto(
                nights = nights,
                nightly_rate_eur = nightlyRateEur.toDouble(),
                subtotal_eur = subtotal,
                cleaning_fee_eur = cleaningFeeEur.toDouble(),
                service_fee_eur = serviceFeeEur.toDouble(),
                tax_eur = taxEur.toDouble(),
                total_eur = totalEur.toDouble(),
            ),
            cancellation_policy = "Full refund if cancelled 48+ hours before check-in",
            can_cancel = canCancel,
            refund_amount_eur = refundAmountEur?.toDouble(),
            created_at = createdAt.toString(),
        )
    }
}
```

- [ ] **Step 2: Verify compile**

Run: `cd backend && ./gradlew compileKotlin`
Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(booking): wire my-trips/detail/cancel endpoints in BookingController (#70)"
```

---

### Task 9: Per-endpoint integration tests (full stack)

**Files:**
- Modify: `backend/src/test/kotlin/com/stayhub/presentation/api/integration/AbstractApiIntegrationTest.kt` (raise the date-window cap)
- Create: `backend/src/test/kotlin/com/stayhub/presentation/api/integration/TripsApiIntegrationTest.kt`

**Why the cap change:** `nextStayWindow()` is a JVM-wide singleton shared across all integration classes. Adding `TripsApiIntegrationTest` (which creates several confirmed bookings) plus the existing `BookingApiIntegrationTest` can exceed the current 11-window cap. Booking *creation* never consults the seeded `availability` table (only holds + non-cancelled overlapping bookings), so windows may safely extend beyond +89 days. Raise the cap.

- [ ] **Step 1: Raise the window cap in the base**

In `AbstractApiIntegrationTest.kt`, change the `require(slot <= 10)` guard and its comment in `nextStayWindow`:

Replace:
```kotlin
        val slot = stayWindowCounter.getAndIncrement()
        require(slot <= 10) {
            "nextStayWindow() exhausted (>11 windows in one JVM run — tests retried in the same process?)"
        }
        val checkIn = LocalDate.now().plusDays(46 + slot * 4L)
        return checkIn to checkIn.plusDays(nights)
```
With:
```kotlin
        val slot = stayWindowCounter.getAndIncrement()
        require(slot <= 60) {
            "nextStayWindow() exhausted (>61 windows in one JVM run — tests retried in the same process?)"
        }
        // Windows start at +46 days (clear of the seed bookings at ≤ +45) and step
        // by 4. Booking creation does NOT consult the seeded availability table
        // (only holds + non-cancelled overlapping bookings), so windows may extend
        // beyond the +89-day seeded availability horizon without affecting creation.
        val checkIn = LocalDate.now().plusDays(46 + slot * 4L)
        return checkIn to checkIn.plusDays(nights)
```

- [ ] **Step 2: Write the integration tests**

Create `backend/src/test/kotlin/com/stayhub/presentation/api/integration/TripsApiIntegrationTest.kt`:

```kotlin
package com.stayhub.presentation.api.integration

import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import java.time.LocalDate
import java.util.UUID

/**
 * Per-endpoint integration tests for the US4 trip endpoints, exercised over the
 * real stack (codecs, JWT security, DB). Each test targets one endpoint + one
 * behavior; creating/confirming a booking inside a test is setup.
 */
class TripsApiIntegrationTest : AbstractApiIntegrationTest() {

    // Seeded property (V7): "Cosy Eixample Apartment", Barcelona.
    private val propertyId = "cccccccc-cccc-cccc-cccc-000000001001"

    private fun bookingBody(checkIn: LocalDate, checkOut: LocalDate, guests: Int = 2) =
        """{"property_id":"$propertyId","check_in":"$checkIn","check_out":"$checkOut","guest_count":$guests}"""

    /** Creates and confirms a booking; returns its id. */
    private fun createAndConfirm(token: String, checkIn: LocalDate, checkOut: LocalDate): String {
        val body = http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut))
            .exchange()
            .expectStatus().isCreated
            .expectBody(Map::class.java).returnResult().responseBody!!
        val bookingId = body["booking_id"] as? String
            ?: error("create response missing 'booking_id'; body=$body")
        val paymentIntentId = (body["stripe_client_secret"] as String).removePrefix("pi_stub_secret_")

        http.post().uri("/api/v1/bookings/$bookingId/confirm")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"payment_intent_id":"$paymentIntentId"}""")
            .exchange()
            .expectStatus().isOk
        return bookingId
    }

    // --- GET /api/v1/bookings/my-trips ----------------------------------------

    @Test
    fun `my-trips returns the caller's confirmed booking`() {
        val token = registerGuest()
        val (checkIn, checkOut) = nextStayWindow()
        val bookingId = createAndConfirm(token, checkIn, checkOut)

        http.get().uri("/api/v1/bookings/my-trips?status=upcoming&page=1&size=10")
            .header("Authorization", "Bearer $token")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.pagination.total_results").isEqualTo(1)
            .jsonPath("$.pagination.page").isEqualTo(1)
            .jsonPath("$.bookings[0].id").isEqualTo(bookingId)
            .jsonPath("$.bookings[0].status").isEqualTo("confirmed")
    }

    @Test
    fun `my-trips returns 401 without a token`() {
        http.get().uri("/api/v1/bookings/my-trips")
            .exchange()
            .expectStatus().isUnauthorized
    }

    // --- GET /api/v1/bookings/{id} --------------------------------------------

    @Test
    fun `detail returns 200 for the owner with cancel info`() {
        val token = registerGuest()
        val (checkIn, checkOut) = nextStayWindow()
        val bookingId = createAndConfirm(token, checkIn, checkOut)

        http.get().uri("/api/v1/bookings/$bookingId")
            .header("Authorization", "Bearer $token")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(bookingId)
            .jsonPath("$.status").isEqualTo("confirmed")
            .jsonPath("$.can_cancel").isEqualTo(true)
            .jsonPath("$.refund_amount_eur").exists()
    }

    @Test
    fun `detail returns 403 for another guest`() {
        val (checkIn, checkOut) = nextStayWindow()
        val bookingId = createAndConfirm(registerGuest(), checkIn, checkOut)

        http.get().uri("/api/v1/bookings/$bookingId")
            .header("Authorization", "Bearer ${registerGuest()}")
            .exchange()
            .expectStatus().isForbidden
            .expectBody().jsonPath("$.error.code").isEqualTo("FORBIDDEN")
    }

    @Test
    fun `detail returns 404 for an unknown booking`() {
        http.get().uri("/api/v1/bookings/${UUID.randomUUID()}")
            .header("Authorization", "Bearer ${registerGuest()}")
            .exchange()
            .expectStatus().isNotFound
            .expectBody().jsonPath("$.error.code").isEqualTo("NOT_FOUND")
    }

    // --- POST /api/v1/bookings/{id}/cancel ------------------------------------

    @Test
    fun `cancel returns 200 with a full refund for a far-future booking`() {
        val token = registerGuest()
        val (checkIn, checkOut) = nextStayWindow() // +46 days → well beyond 48h
        val bookingId = createAndConfirm(token, checkIn, checkOut)

        http.post().uri("/api/v1/bookings/$bookingId/cancel")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"reason":"plans changed"}""")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.booking_id").isEqualTo(bookingId)
            .jsonPath("$.status").isEqualTo("cancelled")
            .jsonPath("$.refund_status").isEqualTo("full_refund")
    }

    @Test
    fun `cancel returns 200 with no refund within 48h of check-in`() {
        val token = registerGuest()
        // Check-in tomorrow → within the 48h window → no refund. Near dates don't
        // collide with seed bookings (+10..45) or the +46-day windows.
        val checkIn = LocalDate.now().plusDays(1)
        val bookingId = createAndConfirm(token, checkIn, checkIn.plusDays(1))

        http.post().uri("/api/v1/bookings/$bookingId/cancel")
            .header("Authorization", "Bearer $token")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.refund_status").isEqualTo("no_refund")
            .jsonPath("$.refund_amount_eur").isEqualTo(0.0)
    }

    @Test
    fun `cancel returns 422 when the booking is already cancelled`() {
        val token = registerGuest()
        val (checkIn, checkOut) = nextStayWindow()
        val bookingId = createAndConfirm(token, checkIn, checkOut)

        // First cancel succeeds.
        http.post().uri("/api/v1/bookings/$bookingId/cancel")
            .header("Authorization", "Bearer $token")
            .exchange()
            .expectStatus().isOk
        // Second cancel is rejected.
        http.post().uri("/api/v1/bookings/$bookingId/cancel")
            .header("Authorization", "Bearer $token")
            .exchange()
            .expectStatus().isEqualTo(422)
            .expectBody().jsonPath("$.error.code").isEqualTo("BOOKING_CANNOT_CANCEL")
    }

    @Test
    fun `cancel returns 403 for another guest`() {
        val (checkIn, checkOut) = nextStayWindow()
        val bookingId = createAndConfirm(registerGuest(), checkIn, checkOut)

        http.post().uri("/api/v1/bookings/$bookingId/cancel")
            .header("Authorization", "Bearer ${registerGuest()}")
            .exchange()
            .expectStatus().isForbidden
            .expectBody().jsonPath("$.error.code").isEqualTo("FORBIDDEN")
    }

    @Test
    fun `cancel returns 404 for an unknown booking`() {
        http.post().uri("/api/v1/bookings/${UUID.randomUUID()}/cancel")
            .header("Authorization", "Bearer ${registerGuest()}")
            .exchange()
            .expectStatus().isNotFound
            .expectBody().jsonPath("$.error.code").isEqualTo("NOT_FOUND")
    }
}
```

- [ ] **Step 3: Run the trip integration tests, expect PASS**

Run: `cd backend && ./gradlew test --tests "com.stayhub.presentation.api.integration.TripsApiIntegrationTest"`
Expected: `BUILD SUCCESSFUL`, 9 tests pass.

**If a test fails on status/code:** read `BookingController`, the use case, and `GlobalExceptionHandler` to confirm the real contract. Adjust the **setup** to reach the precondition, but do **not** weaken a contract assertion to make a test pass — if the real status/code differs from the contract, report it as a finding (it may be a real bug).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test(it): per-endpoint integration tests for my-trips/detail/cancel (#70)"
```

---

### Task 10: Full verification + boot check + PR

- [ ] **Step 1: Run the full test suite (incl. ArchUnit)**

Run: `cd backend && ./gradlew clean test`
Expected: `BUILD SUCCESSFUL`, 0 failures, ArchUnit green.

- [ ] **Step 2: Boot the app and smoke-test the new endpoint shape**

```bash
cd backend && ./gradlew bootRun &
sleep 35
curl -s http://localhost:8080/actuator/health   # expect {"status":"UP"}
# my-trips without a token must be 401 (not 500/403-with-wrong-shape):
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/v1/bookings/my-trips   # expect 401
pkill -f bootRun
```
Expected: health UP; my-trips returns 401 unauthenticated.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin issue-67-us4-trips-backend
gh pr create --title "US4 Slice A — My Trips & Cancellation backend (#67-#71)" --body "$(cat <<'EOF'
## What
Backend for US4 — My Trips & Cancellation:
- `PaymentService.refund` port + `StubPaymentAdapter` impl
- `CancellationPolicy` (48h refund rule), `TripCategory`, `findByGuestIdAndCategory`
- `GetMyTripsUseCase`, `GetBookingDetailsUseCase`, `CancelBookingUseCase`
- `GET /api/v1/bookings/my-trips`, `GET /api/v1/bookings/{id}`, `POST /api/v1/bookings/{id}/cancel`
- Trip DTOs; populated `can_cancel`/`refund_amount_eur` on `BookingDetailResponse`

## Why
US4 (spec.md) — guests view and cancel bookings. Design: `docs/superpowers/specs/2026-06-20-us4-my-trips-cancellation-design.md`.

## Impact
- No schema change (status `cancelled` + `cancellation_reason`/`cancelled_at` already exist).
- New outbound port method on `PaymentService` (stub only; real Stripe = #53).
- Cancel frees dates automatically (conflict check excludes cancelled bookings); no email (deferred to #54).

## References
- User Story: US4 — Manage Bookings (spec.md)
- Tasks: T066–T071
- Issues: #67, #68, #69, #70, #71

## Checklist
- [x] Clean Architecture layers respected (ArchUnit green)
- [x] Acceptance scenarios covered (list / detail / cancel)
- [x] Flow/test coverage: per-endpoint integration tests (full context, `bindToServer`) for all 3 endpoints; unit tests for the 48h policy. Playwright cancellation journey lands in Slice C.
- [x] API contract changes already in `contracts/booking-api.yml`
- [x] No secrets/PII in code or logs
EOF
)"
```

- [ ] **Step 4: Report** the test count and PR URL. Do **not** close the issues (the user closes them).

---

## Roadmap (future slices)

- **Slice B (frontend):** `services/tripsService.ts` (`useMyTrips`/`useBookingDetail`/`useCancelBooking`), `TripCard`, `CancellationModal`, `/trips`, `/trips/[id]`, enable the confirmation "View My Trips" button; vitest. (#72–#76)
- **Slice C (E2E):** Playwright cancellation journey — book → confirm → My Trips → open trip → cancel → assert cancelled + refund.

## Self-review

- **Spec coverage:** refund port (Task 1 ✓), 48h policy (Task 2 ✓), category query / upcoming-past-by-checkout (Task 3 ✓), my-trips use case (Task 4 ✓), detail w/ can_cancel+refund (Task 5 ✓), cancel w/ 422 + stub refund + auto-free dates (Task 6 ✓), DTOs (Task 7 ✓), 3 endpoints + populated detail fields (Task 8 ✓), per-endpoint integration tests incl. 200/401/403/404/422 + full_refund/no_refund (Task 9 ✓), boot check (Task 10 ✓). Email intentionally deferred to #54 (non-goal). No availability-table write (verified unnecessary).
- **Placeholder scan:** no TBD/TODO; every code step shows complete code; the two least-certain integration assertions carry a verify-don't-weaken instruction.
- **Type consistency:** `RefundResult(refundId, amountEur)`; `PaymentService.refund(paymentIntentId, amountEur)`; `CancellationPolicy.canCancel(booking)` / `refundAmountEur(booking, now)`; `BookingRepository.findByGuestIdAndCategory(guestId, category, today, pageable)`; `TripCategory{ALL,UPCOMING,PAST,CANCELLED}`; `MyTripsResult(bookings,page,size,totalResults,totalPages)` + `TripSummary`; `BookingDetailResult(booking,property,canCancel,refundAmountEur)`; `CancellationResult(bookingId,refundAmountEur,fullRefund)`. Controller calls exactly these. DTO field names match `contracts/booking-api.yml` (snake_case).
