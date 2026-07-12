package com.stayhub.infrastructure.persistence

import com.stayhub.infrastructure.config.TestContainersConfiguration
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import java.time.Instant
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID

/**
 * Integration test for AvailabilityHoldRepositoryAdapter against a real
 * PostgreSQL container.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Import(TestContainersConfiguration::class)
@TestPropertySource(properties = ["spring.flyway.enabled=true"])
class AvailabilityHoldRepositoryAdapterTest {

    @Autowired
    lateinit var databaseClient: DatabaseClient

    @Autowired
    lateinit var adapter: AvailabilityHoldRepositoryAdapter

    private val propertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001")
    private val guestId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000001")

    @BeforeEach
    fun cleanTestRows() {
        databaseClient.sql("DELETE FROM availability_hold WHERE property_id = :pid")
            .bind("pid", propertyId)
            .then().block()
    }

    @Test
    fun `createHold returns hold with heldUntil approximately 10 minutes in the future`() = runTest {
        val before = Instant.now()
        val hold = adapter.createHold(
            propertyId,
            guestId,
            LocalDate.of(2030, 6, 1),
            LocalDate.of(2030, 6, 5),
        )

        hold.propertyId shouldBe propertyId
        hold.guestId shouldBe guestId
        hold.checkIn shouldBe LocalDate.of(2030, 6, 1)
        hold.checkOut shouldBe LocalDate.of(2030, 6, 5)

        // heldUntil should be ~10 minutes (600s) past creation. Strict assertion
        // (Postgres session timezone defaults to UTC in the official postgis image,
        // matching what the adapter assumes when converting LocalDateTime → Instant).
        val deltaSeconds = ChronoUnit.SECONDS.between(before, hold.heldUntil)
        assert(deltaSeconds in 540..660) {
            "expected heldUntil 9-11 minutes after `before`, got delta=${deltaSeconds}s " +
                "(before=$before heldUntil=${hold.heldUntil})"
        }
    }

    @Test
    fun `findActiveHoldForDates returns the active hold when dates overlap`() = runTest {
        adapter.createHold(propertyId, guestId, LocalDate.of(2030, 6, 1), LocalDate.of(2030, 6, 5))

        val found = adapter.findActiveHoldForDates(
            propertyId,
            LocalDate.of(2030, 6, 3),
            LocalDate.of(2030, 6, 7),
        )

        found.shouldNotBeNull()
        found.propertyId shouldBe propertyId
    }

    @Test
    fun `findActiveHoldForDates returns null for non-overlapping dates`() = runTest {
        adapter.createHold(propertyId, guestId, LocalDate.of(2030, 6, 1), LocalDate.of(2030, 6, 5))

        val found = adapter.findActiveHoldForDates(
            propertyId,
            LocalDate.of(2030, 6, 10),
            LocalDate.of(2030, 6, 15),
        )

        found.shouldBeNull()
    }

    @Test
    fun `findActiveHoldForDates returns null for adjacent dates (exclusive end)`() = runTest {
        adapter.createHold(propertyId, guestId, LocalDate.of(2030, 6, 1), LocalDate.of(2030, 6, 5))

        // Search starts on the exclusive checkout day → no overlap
        val found = adapter.findActiveHoldForDates(
            propertyId,
            LocalDate.of(2030, 6, 5),
            LocalDate.of(2030, 6, 10),
        )

        found.shouldBeNull()
    }

    @Test
    fun `findActiveHoldForDates ignores expired holds`() = runTest {
        // Insert an expired hold directly (bypassing createHold which always
        // sets held_until in the future).
        databaseClient.sql(
            """
            INSERT INTO availability_hold (id, property_id, guest_id, check_in, check_out, held_until, created_at)
            VALUES (:id, :propertyId, :guestId, :checkIn, :checkOut, NOW() - INTERVAL '1 minute', NOW())
            """.trimIndent(),
        )
            .bind("id", UUID.randomUUID())
            .bind("propertyId", propertyId)
            .bind("guestId", guestId)
            .bind("checkIn", LocalDate.of(2030, 6, 1))
            .bind("checkOut", LocalDate.of(2030, 6, 5))
            .then().block()

        val found = adapter.findActiveHoldForDates(
            propertyId,
            LocalDate.of(2030, 6, 1),
            LocalDate.of(2030, 6, 5),
        )

        found.shouldBeNull()
    }

    @Test
    fun `releaseHold deletes the hold so findActiveHoldForDates returns null`() = runTest {
        val hold = adapter.createHold(propertyId, guestId, LocalDate.of(2030, 6, 1), LocalDate.of(2030, 6, 5))

        adapter.releaseHold(hold.id)

        val found = adapter.findActiveHoldForDates(
            propertyId,
            LocalDate.of(2030, 6, 1),
            LocalDate.of(2030, 6, 5),
        )
        found.shouldBeNull()
    }
}
