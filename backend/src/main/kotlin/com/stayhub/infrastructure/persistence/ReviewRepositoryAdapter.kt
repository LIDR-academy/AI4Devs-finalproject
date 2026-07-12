package com.stayhub.infrastructure.persistence

import com.stayhub.domain.common.DomainPageRequest
import com.stayhub.domain.common.PagedResult
import com.stayhub.domain.review.Review
import com.stayhub.domain.review.ReviewRepository
import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.stereotype.Repository
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.UUID

@Repository
class ReviewRepositoryAdapter(
    private val databaseClient: DatabaseClient,
) : ReviewRepository {

    override suspend fun findByPropertyId(
        propertyId: UUID,
        pageable: DomainPageRequest,
    ): PagedResult<Review> {
        val query = """
            SELECT r.id, r.property_id, r.guest_id, r.booking_id,
                   r.rating, r.comment, r.created_at,
                   g.first_name as guest_first_name,
                   g.avatar_url as guest_avatar_url,
                   COUNT(*) OVER() as total_count
            FROM review r
            JOIN guest g ON g.id = r.guest_id
            WHERE r.property_id = :propertyId
            ORDER BY r.created_at DESC
            LIMIT :pageSize OFFSET :offset
        """.trimIndent()

        val results = databaseClient.sql(query)
            .bind("propertyId", propertyId)
            .bind("pageSize", pageable.size)
            .bind("offset", pageable.offset)
            .map { row, _ ->
                val totalCount = row.get("total_count", Long::class.java) ?: 0L
                val review = Review(
                    id = row.get("id", UUID::class.java)!!,
                    propertyId = row.get("property_id", UUID::class.java)!!,
                    guestId = row.get("guest_id", UUID::class.java)!!,
                    bookingId = row.get("booking_id", UUID::class.java)!!,
                    rating = row.get("rating", Int::class.java)!!,
                    comment = row.get("comment", String::class.java),
                    createdAt = row.get("created_at", LocalDateTime::class.java)
                        ?.toInstant(ZoneOffset.UTC)
                        ?: Instant.now(),
                    guestFirstName = row.get("guest_first_name", String::class.java) ?: "",
                    guestAvatarUrl = row.get("guest_avatar_url", String::class.java),
                )
                Pair(review, totalCount)
            }
            .all()
            .collectList()
            .awaitSingle()

        val reviews = results.map { it.first }
        val count = results.firstOrNull()?.second ?: 0L

        return PagedResult(reviews, pageable.page, pageable.size, count)
    }
}
