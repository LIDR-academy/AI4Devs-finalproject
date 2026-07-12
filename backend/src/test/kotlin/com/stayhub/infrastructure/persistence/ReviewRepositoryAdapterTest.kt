package com.stayhub.infrastructure.persistence

import com.stayhub.domain.common.DomainPageRequest
import com.stayhub.infrastructure.config.TestContainersConfiguration
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import java.util.UUID

/**
 * Integration test for ReviewRepositoryAdapter (TEST-1).
 *
 * Uses the shared TestContainersConfiguration singleton (real PostgreSQL with Flyway).
 *
 * The seed data contains reviews only for properties:
 *   - cccccccc-cccc-cccc-cccc-000000002001 (Sol Central Apartment, Madrid, 1 review)
 *   - cccccccc-cccc-cccc-cccc-000000001003 (Gracia Family House, Barcelona, 1 review)
 *
 * Tests that insert additional reviews use a "clean" property with no seed reviews
 * and tear them down via @AfterEach so tests don't interfere with each other.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Import(TestContainersConfiguration::class)
@TestPropertySource(properties = ["spring.flyway.enabled=true"])
class ReviewRepositoryAdapterTest {

    @Autowired
    lateinit var databaseClient: DatabaseClient

    @Autowired
    lateinit var adapter: ReviewRepositoryAdapter

    // Property with no seed reviews (Eixample Apartment, Barcelona).
    private val cleanPropertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001")

    // Property that already has one seeded review (Sol Central Apartment, Madrid).
    private val seededPropertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000002001")

    // Seeded guest IDs for FK constraints.
    private val guestId1 = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000001")
    private val guestId2 = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000002")
    private val guestId3 = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000003")

    // Track inserted booking IDs so we can delete them in teardown.
    private val insertedBookingIds = mutableListOf<UUID>()
    private val insertedReviewIds  = mutableListOf<UUID>()

    @BeforeEach
    fun cleanReviewRows() {
        // Guard against dirty state left by aborted runs.
        databaseClient.sql("DELETE FROM review WHERE property_id = :id")
            .bind("id", cleanPropertyId)
            .then().block()
    }

    @AfterEach
    fun cleanInsertedRows() {
        // Keep DB clean for other suites after each test.
        databaseClient.sql("DELETE FROM review WHERE property_id = :id")
            .bind("id", cleanPropertyId)
            .then().block()
        insertedReviewIds.clear()
        databaseClient.sql("DELETE FROM booking WHERE property_id = :id")
            .bind("id", cleanPropertyId)
            .then().block()
        insertedBookingIds.clear()
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /**
     * Inserts a completed booking + review pair and records their IDs for teardown.
     * Returns the review UUID that was inserted.
     */
    private fun insertReview(
        propertyId: UUID,
        guestId: UUID,
        rating: Int,
        comment: String,
        createdAtExpr: String = "NOW()",   // SQL expression for created_at
    ): UUID {
        val bookingId = UUID.randomUUID()
        val reviewId  = UUID.randomUUID()
        val refNum    = "BK-TEST-${bookingId.toString().take(8)}"

        // Insert a minimal completed booking (required by review FK).
        databaseClient.sql(
            """
            INSERT INTO booking (
                id, property_id, guest_id, reference_number,
                check_in, check_out, guest_count, nights,
                nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur, total_eur,
                status, stripe_payment_intent_id,
                created_at, updated_at
            ) VALUES (
                :bid, :pid, :gid, :ref,
                CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '27 days', 2, 3,
                90.00, 30.00, 32.40, 0.00, 332.40,
                'completed', 'pi_test_${bookingId.toString().replace("-", "").take(20)}',
                NOW(), NOW()
            )
            """.trimIndent(),
        )
            .bind("bid", bookingId)
            .bind("pid", propertyId)
            .bind("gid", guestId)
            .bind("ref", refNum)
            .then()
            .block()

        // Insert the review.
        databaseClient.sql(
            """
            INSERT INTO review (id, booking_id, property_id, guest_id, rating, comment, created_at)
            VALUES (:rid, :bid, :pid, :gid, :rating, :comment, $createdAtExpr)
            """.trimIndent(),
        )
            .bind("rid", reviewId)
            .bind("bid", bookingId)
            .bind("pid", propertyId)
            .bind("gid", guestId)
            .bind("rating", rating)
            .bind("comment", comment)
            .then()
            .block()

        insertedBookingIds.add(bookingId)
        insertedReviewIds.add(reviewId)
        return reviewId
    }

    // ------------------------------------------------------------------
    // Test: property with no reviews returns empty page
    // ------------------------------------------------------------------
    @Test
    fun `returns empty page when property has no reviews`() = runTest {
        val page = adapter.findByPropertyId(cleanPropertyId, DomainPageRequest(0, 10))

        page.content.shouldBeEmpty()
        page.totalElements shouldBe 0L
    }

    // ------------------------------------------------------------------
    // Test: seeded review is returned
    // ------------------------------------------------------------------
    @Test
    fun `returns seeded review for property that already has reviews`() = runTest {
        val page = adapter.findByPropertyId(seededPropertyId, DomainPageRequest(0, 10))

        page.content shouldHaveSize 1
        page.totalElements shouldBe 1L
        page.content[0].propertyId shouldBe seededPropertyId
        page.content[0].rating shouldBe 5
        page.content[0].guestFirstName shouldBe "Test" // guest first_name from seed
        page.content[0].guestId shouldBe UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000005")
    }

    // ------------------------------------------------------------------
    // Test: pagination — correct page size and metadata
    // ------------------------------------------------------------------
    @Test
    fun `returns correct page metadata when multiple reviews exist`() = runTest {
        // Insert 3 reviews for the clean property.
        insertReview(cleanPropertyId, guestId1, 5, "Excellent!")
        insertReview(cleanPropertyId, guestId2, 4, "Very good")
        insertReview(cleanPropertyId, guestId3, 3, "OK")

        val page = adapter.findByPropertyId(cleanPropertyId, DomainPageRequest(0, 2))

        page.content shouldHaveSize 2
        page.totalElements shouldBe 3L
        page.totalPages shouldBe 2
    }

    // ------------------------------------------------------------------
    // Test: second page returns remaining reviews
    // ------------------------------------------------------------------
    @Test
    fun `returns second page when reviews exceed page size`() = runTest {
        insertReview(cleanPropertyId, guestId1, 5, "Page-one review 1")
        insertReview(cleanPropertyId, guestId2, 4, "Page-one review 2")
        insertReview(cleanPropertyId, guestId3, 3, "Page-two review")

        val page = adapter.findByPropertyId(cleanPropertyId, DomainPageRequest(1, 2))

        page.content shouldHaveSize 1
        page.totalElements shouldBe 3L
        page.number shouldBe 1
    }

    // ------------------------------------------------------------------
    // Test: reviews are ordered by created_at DESC
    // ------------------------------------------------------------------
    @Test
    fun `orders reviews by created_at descending`() = runTest {
        // Insert with explicit timestamps: newer first in expected ordering.
        val olderReviewId  = insertReview(
            cleanPropertyId, guestId1, 4, "Older review",
            createdAtExpr = "NOW() - INTERVAL '10 days'",
        )
        val newerReviewId  = insertReview(
            cleanPropertyId, guestId2, 5, "Newer review",
            createdAtExpr = "NOW() - INTERVAL '1 day'",
        )

        val page = adapter.findByPropertyId(cleanPropertyId, DomainPageRequest(0, 10))

        page.content shouldHaveSize 2
        // First result should be the newer review (DESC order).
        page.content[0].id shouldBe newerReviewId
        page.content[1].id shouldBe olderReviewId
    }

    // ------------------------------------------------------------------
    // Test: Review fields are correctly mapped (JOIN to guest table)
    // ------------------------------------------------------------------
    @Test
    fun `maps all review fields correctly including guest name and avatar`() = runTest {
        val reviewId = insertReview(cleanPropertyId, guestId1, 5, "Great place!")

        val page = adapter.findByPropertyId(cleanPropertyId, DomainPageRequest(0, 10))

        page.content shouldHaveSize 1
        val review = page.content[0]
        review.id          shouldBe reviewId
        review.propertyId  shouldBe cleanPropertyId
        review.guestId     shouldBe guestId1
        review.rating      shouldBe 5
        review.comment     shouldBe "Great place!"
        // Guest seed data: first_name = "Test", avatar_url = placehold.co image
        review.guestFirstName shouldBe "Test"
        review.guestAvatarUrl shouldBe "https://placehold.co/200x200?text=Guest+1"
    }
}
