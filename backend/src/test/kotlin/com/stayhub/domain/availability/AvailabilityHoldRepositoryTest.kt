package com.stayhub.domain.availability

import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.Instant
import java.time.LocalDate
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/**
 * In-memory fake implementation of [AvailabilityHoldRepository] used exclusively
 * in unit tests.  The production implementation lives in infrastructure.
 */
private class InMemoryAvailabilityHoldRepository : AvailabilityHoldRepository {

    private val store = ConcurrentHashMap<UUID, AvailabilityHold>()

    override suspend fun createHold(
        propertyId: UUID,
        guestId: UUID,
        checkIn: LocalDate,
        checkOut: LocalDate,
    ): AvailabilityHold {
        val now = Instant.now()
        val hold = AvailabilityHold(
            id = UUID.randomUUID(),
            propertyId = propertyId,
            guestId = guestId,
            checkIn = checkIn,
            checkOut = checkOut,
            heldUntil = now.plusSeconds(600), // 10 minutes
            createdAt = now,
        )
        store[hold.id] = hold
        return hold
    }

    override suspend fun releaseHold(holdId: UUID) {
        store.remove(holdId)
    }

    override suspend fun findActiveHoldForDates(
        propertyId: UUID,
        checkIn: LocalDate,
        checkOut: LocalDate,
    ): AvailabilityHold? {
        val now = Instant.now()
        return store.values.firstOrNull { hold ->
            hold.propertyId == propertyId &&
                hold.heldUntil.isAfter(now) &&
                hold.checkIn < checkOut &&
                hold.checkOut > checkIn
        }
    }
}

class AvailabilityHoldRepositoryTest {

    private lateinit var repo: AvailabilityHoldRepository

    private val propertyId: UUID = UUID.randomUUID()
    private val guestId: UUID = UUID.randomUUID()

    private val checkIn: LocalDate = LocalDate.of(2026, 8, 1)
    private val checkOut: LocalDate = LocalDate.of(2026, 8, 5)

    @BeforeEach
    fun setUp() {
        repo = InMemoryAvailabilityHoldRepository()
    }

    // ─── createHold ──────────────────────────────────────────────────────────

    @Test
    fun `createHold returns a hold with correct property, guest, and date fields`() {
        val hold = kotlinx.coroutines.runBlocking {
            repo.createHold(propertyId, guestId, checkIn, checkOut)
        }

        hold.propertyId shouldBe propertyId
        hold.guestId shouldBe guestId
        hold.checkIn shouldBe checkIn
        hold.checkOut shouldBe checkOut
        hold.id.shouldNotBeNull()
        hold.createdAt.shouldNotBeNull()
    }

    @Test
    fun `createHold sets heldUntil to approximately 10 minutes in the future`() {
        val before = Instant.now()
        val hold = kotlinx.coroutines.runBlocking {
            repo.createHold(propertyId, guestId, checkIn, checkOut)
        }
        val after = Instant.now()

        // heldUntil must be strictly after current time
        hold.heldUntil.isAfter(after) shouldBe true
        // and it must be within 10 minutes + a small margin (1 second)
        val expectedMax = before.plusSeconds(601)
        hold.heldUntil.isBefore(expectedMax) shouldBe true
    }

    // ─── releaseHold ─────────────────────────────────────────────────────────

    @Test
    fun `releaseHold removes hold so findActiveHoldForDates returns null`() {
        val hold = kotlinx.coroutines.runBlocking {
            repo.createHold(propertyId, guestId, checkIn, checkOut)
        }

        kotlinx.coroutines.runBlocking {
            repo.releaseHold(hold.id)
        }

        val found = kotlinx.coroutines.runBlocking {
            repo.findActiveHoldForDates(propertyId, checkIn, checkOut)
        }
        found.shouldBeNull()
    }

    // ─── findActiveHoldForDates ───────────────────────────────────────────────

    @Test
    fun `findActiveHoldForDates returns null when no holds exist`() {
        val found = kotlinx.coroutines.runBlocking {
            repo.findActiveHoldForDates(propertyId, checkIn, checkOut)
        }
        found.shouldBeNull()
    }

    @Test
    fun `findActiveHoldForDates returns active hold when dates overlap`() {
        kotlinx.coroutines.runBlocking {
            repo.createHold(propertyId, guestId, checkIn, checkOut)
        }

        val found = kotlinx.coroutines.runBlocking {
            // Overlapping range: Aug 3 – Aug 7 overlaps with Aug 1 – Aug 5
            repo.findActiveHoldForDates(
                propertyId,
                LocalDate.of(2026, 8, 3),
                LocalDate.of(2026, 8, 7),
            )
        }
        found.shouldNotBeNull()
    }

    @Test
    fun `findActiveHoldForDates returns null for non-overlapping dates`() {
        kotlinx.coroutines.runBlocking {
            repo.createHold(propertyId, guestId, checkIn, checkOut) // Aug 1 – Aug 5
        }

        val found = kotlinx.coroutines.runBlocking {
            // Aug 10 – Aug 15 does NOT overlap with Aug 1 – Aug 5
            repo.findActiveHoldForDates(
                propertyId,
                LocalDate.of(2026, 8, 10),
                LocalDate.of(2026, 8, 15),
            )
        }
        found.shouldBeNull()
    }

    @Test
    fun `findActiveHoldForDates returns null for expired holds`() {
        val expiredHold = AvailabilityHold(
            id = UUID.randomUUID(),
            propertyId = propertyId,
            guestId = guestId,
            checkIn = checkIn,
            checkOut = checkOut,
            heldUntil = Instant.now().minusSeconds(60), // expired 1 minute ago
            createdAt = Instant.now().minusSeconds(700),
        )

        // Use an anonymous implementation that injects the expired hold directly
        // (bypassing createHold which always sets heldUntil in the future)
        val repoWithExpiredEntry = object : AvailabilityHoldRepository {
            private val entries = listOf(expiredHold)

            override suspend fun createHold(
                propertyId: UUID,
                guestId: UUID,
                checkIn: LocalDate,
                checkOut: LocalDate,
            ): AvailabilityHold = throw UnsupportedOperationException()

            override suspend fun releaseHold(holdId: UUID) = throw UnsupportedOperationException()

            override suspend fun findActiveHoldForDates(
                propertyId: UUID,
                checkIn: LocalDate,
                checkOut: LocalDate,
            ): AvailabilityHold? {
                val now = Instant.now()
                return entries.firstOrNull { hold ->
                    hold.propertyId == propertyId &&
                        hold.heldUntil.isAfter(now) &&
                        hold.checkIn < checkOut &&
                        hold.checkOut > checkIn
                }
            }
        }

        val found = kotlinx.coroutines.runBlocking {
            repoWithExpiredEntry.findActiveHoldForDates(propertyId, checkIn, checkOut)
        }
        found.shouldBeNull()
    }
}
