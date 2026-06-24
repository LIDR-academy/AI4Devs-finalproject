package com.stayhub.infrastructure.persistence

import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingRepository
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.booking.TripCategory
import com.stayhub.domain.common.DomainPageRequest
import com.stayhub.domain.common.PagedResult
import io.r2dbc.spi.Row
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.UUID

/**
 * R2DBC adapter for [BookingRepository].
 *
 * The `status` DB column stores the BookingStatus enum as lowercase strings —
 * the V5 / V8 migrations enforce a CHECK constraint of
 * 'pending', 'confirmed', 'cancelled', 'completed'.
 *
 * Implementation notes:
 *  - `created_at`, `updated_at`, `cancelled_at` columns are TIMESTAMP (no zone),
 *    so we map via LocalDateTime ↔ Instant assuming UTC.
 *  - `findByPropertyAndDates` returns bookings with overlapping date ranges
 *    excluding cancelled ones (the use case treats cancelled overlaps as no-op).
 */
@Repository
class BookingRepositoryAdapter(
    private val databaseClient: DatabaseClient,
) : BookingRepository {

    override suspend fun save(booking: Booking): Booking {
        // UPSERT-style: insert a new row, or update on conflict by id.
        val sql = """
            INSERT INTO booking (
                id, property_id, guest_id, reference_number,
                check_in, check_out, guest_count, nights,
                nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur, total_eur,
                status, stripe_payment_intent_id,
                cancellation_reason, cancelled_at,
                created_at, updated_at
            ) VALUES (
                :id, :propertyId, :guestId, :referenceNumber,
                :checkIn, :checkOut, :guestCount, :nights,
                :nightlyRate, :cleaningFee, :serviceFee, :tax, :total,
                :status, :stripePaymentIntentId,
                :cancellationReason, :cancelledAt,
                :createdAt, :updatedAt
            )
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                cancellation_reason = EXCLUDED.cancellation_reason,
                cancelled_at = EXCLUDED.cancelled_at,
                updated_at = EXCLUDED.updated_at
        """.trimIndent()

        var spec = databaseClient.sql(sql)
            .bind("id", booking.id)
            .bind("propertyId", booking.propertyId)
            .bind("guestId", booking.guestId)
            .bind("referenceNumber", booking.referenceNumber)
            .bind("checkIn", booking.checkIn)
            .bind("checkOut", booking.checkOut)
            .bind("guestCount", booking.guestCount)
            .bind("nights", booking.nights)
            .bind("nightlyRate", booking.nightlyRateEur)
            .bind("cleaningFee", booking.cleaningFeeEur)
            .bind("serviceFee", booking.serviceFeeEur)
            .bind("tax", booking.taxEur)
            .bind("total", booking.totalEur)
            .bind("status", booking.status.name.lowercase())
            .bind("stripePaymentIntentId", booking.stripePaymentIntentId)
            .bind("createdAt", booking.createdAt.atOffset(ZoneOffset.UTC).toLocalDateTime())
            .bind("updatedAt", booking.updatedAt.atOffset(ZoneOffset.UTC).toLocalDateTime())

        spec = if (booking.cancellationReason == null) {
            spec.bindNull("cancellationReason", String::class.java)
        } else {
            spec.bind("cancellationReason", booking.cancellationReason)
        }

        spec = if (booking.cancelledAt == null) {
            spec.bindNull("cancelledAt", LocalDateTime::class.java)
        } else {
            spec.bind("cancelledAt", booking.cancelledAt.atOffset(ZoneOffset.UTC).toLocalDateTime())
        }

        spec.then().awaitFirstOrNull()

        return booking
    }

    override suspend fun findById(id: UUID): Booking? {
        val sql = """
            SELECT id, property_id, guest_id, reference_number,
                   check_in, check_out, guest_count, nights,
                   nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur, total_eur,
                   status, stripe_payment_intent_id,
                   cancellation_reason, cancelled_at,
                   created_at, updated_at
              FROM booking
             WHERE id = :id
        """.trimIndent()

        return databaseClient.sql(sql)
            .bind("id", id)
            .map { row, _ -> mapRow(row) }
            .one()
            .awaitFirstOrNull()
    }

    override suspend fun findByGuestId(guestId: UUID, pageable: DomainPageRequest): PagedResult<Booking> {
        val sql = """
            SELECT id, property_id, guest_id, reference_number,
                   check_in, check_out, guest_count, nights,
                   nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur, total_eur,
                   status, stripe_payment_intent_id,
                   cancellation_reason, cancelled_at,
                   created_at, updated_at,
                   COUNT(*) OVER() AS total_count
              FROM booking
             WHERE guest_id = :guestId
             ORDER BY check_in DESC
             LIMIT :pageSize OFFSET :offset
        """.trimIndent()

        val results = databaseClient.sql(sql)
            .bind("guestId", guestId)
            .bind("pageSize", pageable.size)
            .bind("offset", pageable.offset)
            .map { row, _ ->
                Pair(mapRow(row), row.get("total_count", Long::class.java) ?: 0L)
            }
            .all()
            .collectList()
            .awaitSingle()

        val bookings = results.map { it.first }
        val total = results.firstOrNull()?.second ?: 0L
        return PagedResult(bookings, pageable.page, pageable.size, total)
    }

    override suspend fun findByGuestIdAndCategory(
        guestId: UUID,
        category: TripCategory,
        today: LocalDate,
        pageable: DomainPageRequest,
    ): PagedResult<Booking> {
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
            .bind("pageSize", pageable.size)
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
        return PagedResult(bookings, pageable.page, pageable.size, total)
    }

    override suspend fun findByPropertyAndDates(
        propertyId: UUID,
        checkIn: LocalDate,
        checkOut: LocalDate,
    ): List<Booking> {
        // Overlap test (half-open intervals): existing.checkIn < requested.checkOut
        // AND existing.checkOut > requested.checkIn. Excludes cancelled bookings.
        val sql = """
            SELECT id, property_id, guest_id, reference_number,
                   check_in, check_out, guest_count, nights,
                   nightly_rate_eur, cleaning_fee_eur, service_fee_eur, tax_eur, total_eur,
                   status, stripe_payment_intent_id,
                   cancellation_reason, cancelled_at,
                   created_at, updated_at
              FROM booking
             WHERE property_id = :propertyId
               AND status IN ('pending', 'confirmed')
               AND check_in < :checkOut
               AND check_out > :checkIn
        """.trimIndent()

        return databaseClient.sql(sql)
            .bind("propertyId", propertyId)
            .bind("checkIn", checkIn)
            .bind("checkOut", checkOut)
            .map { row, _ -> mapRow(row) }
            .all()
            .collectList()
            .awaitSingle()
    }

    private fun mapRow(row: Row): Booking {
        val statusStr = row.get("status", String::class.java)!!
        val status = BookingStatus.valueOf(statusStr.uppercase())

        val createdAt = row.get("created_at", LocalDateTime::class.java)!!
            .toInstant(ZoneOffset.UTC)
        val updatedAt = row.get("updated_at", LocalDateTime::class.java)!!
            .toInstant(ZoneOffset.UTC)
        val cancelledAt: Instant? = row.get("cancelled_at", LocalDateTime::class.java)
            ?.toInstant(ZoneOffset.UTC)

        return Booking(
            id = row.get("id", UUID::class.java)!!,
            propertyId = row.get("property_id", UUID::class.java)!!,
            guestId = row.get("guest_id", UUID::class.java)!!,
            referenceNumber = row.get("reference_number", String::class.java)!!,
            checkIn = row.get("check_in", LocalDate::class.java)!!,
            checkOut = row.get("check_out", LocalDate::class.java)!!,
            guestCount = row.get("guest_count", Int::class.java)!!,
            nights = row.get("nights", Int::class.java)!!,
            nightlyRateEur = row.get("nightly_rate_eur", BigDecimal::class.java)!!,
            cleaningFeeEur = row.get("cleaning_fee_eur", BigDecimal::class.java)!!,
            serviceFeeEur = row.get("service_fee_eur", BigDecimal::class.java)!!,
            taxEur = row.get("tax_eur", BigDecimal::class.java)!!,
            totalEur = row.get("total_eur", BigDecimal::class.java)!!,
            status = status,
            stripePaymentIntentId = row.get("stripe_payment_intent_id", String::class.java)!!,
            cancellationReason = row.get("cancellation_reason", String::class.java),
            cancelledAt = cancelledAt,
            createdAt = createdAt,
            updatedAt = updatedAt,
        )
    }
}
