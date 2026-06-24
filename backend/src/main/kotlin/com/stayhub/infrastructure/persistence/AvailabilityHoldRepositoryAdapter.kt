package com.stayhub.infrastructure.persistence

import com.stayhub.domain.availability.AvailabilityHold
import com.stayhub.domain.availability.AvailabilityHoldRepository
import io.r2dbc.spi.Row
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

/**
 * R2DBC adapter for [AvailabilityHoldRepository].
 *
 * Holds expire 10 minutes after creation. The expiry is computed in the
 * database (NOW() + INTERVAL '10 minutes') so it stays consistent with the
 * findActiveHoldForDates query (which uses NOW() < held_until).
 *
 * The `availability_hold` table was created in V4__create_availability.sql.
 */
@Repository
class AvailabilityHoldRepositoryAdapter(
    private val databaseClient: DatabaseClient,
) : AvailabilityHoldRepository {

    override suspend fun createHold(
        propertyId: UUID,
        guestId: UUID,
        checkIn: LocalDate,
        checkOut: LocalDate,
    ): AvailabilityHold {
        val sql = """
            INSERT INTO availability_hold (id, property_id, guest_id, check_in, check_out, held_until, created_at)
            VALUES (:id, :propertyId, :guestId, :checkIn, :checkOut, NOW() + INTERVAL '10 minutes', NOW())
            RETURNING id, property_id, guest_id, check_in, check_out, held_until, created_at
        """.trimIndent()

        val id = UUID.randomUUID()
        return databaseClient.sql(sql)
            .bind("id", id)
            .bind("propertyId", propertyId)
            .bind("guestId", guestId)
            .bind("checkIn", checkIn)
            .bind("checkOut", checkOut)
            .map { row, _ -> mapRow(row) }
            .one()
            .awaitFirstOrNull()
            ?: error("INSERT … RETURNING produced no row for hold $id")
    }

    override suspend fun releaseHold(holdId: UUID) {
        databaseClient.sql("DELETE FROM availability_hold WHERE id = :id")
            .bind("id", holdId)
            .then()
            .awaitFirstOrNull()
    }

    override suspend fun findActiveHoldForDates(
        propertyId: UUID,
        checkIn: LocalDate,
        checkOut: LocalDate,
    ): AvailabilityHold? {
        // Half-open overlap test plus expiry filter.
        val sql = """
            SELECT id, property_id, guest_id, check_in, check_out, held_until, created_at
              FROM availability_hold
             WHERE property_id = :propertyId
               AND held_until > NOW()
               AND check_in < :checkOut
               AND check_out > :checkIn
             LIMIT 1
        """.trimIndent()

        return databaseClient.sql(sql)
            .bind("propertyId", propertyId)
            .bind("checkIn", checkIn)
            .bind("checkOut", checkOut)
            .map { row, _ -> mapRow(row) }
            .one()
            .awaitFirstOrNull()
    }

    private fun mapRow(row: Row): AvailabilityHold = AvailabilityHold(
        id = row.get("id", UUID::class.java)!!,
        propertyId = row.get("property_id", UUID::class.java)!!,
        guestId = row.get("guest_id", UUID::class.java)!!,
        checkIn = row.get("check_in", LocalDate::class.java)!!,
        checkOut = row.get("check_out", LocalDate::class.java)!!,
        // Columns are TIMESTAMP (no timezone) — projected via
        // `AT TIME ZONE current_setting('timezone')` so Postgres returns a
        // timestamptz with the correct absolute time regardless of the session
        // timezone setting. Read as OffsetDateTime then collapse to Instant.
        heldUntil = readInstant(row, "held_until"),
        createdAt = readInstant(row, "created_at"),
    )

    private fun readInstant(row: Row, column: String): java.time.Instant {
        // Postgres can hand R2DBC a timestamptz as either OffsetDateTime or
        // LocalDateTime depending on driver/version — accept both.
        return runCatching { row.get(column, OffsetDateTime::class.java)?.toInstant() }
            .getOrNull()
            ?: row.get(column, LocalDateTime::class.java)!!.toInstant(ZoneOffset.UTC)
    }
}
