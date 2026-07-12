package com.stayhub.infrastructure.persistence

import org.slf4j.LoggerFactory
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

/**
 * Periodically removes expired availability holds from the database.
 *
 * Holds are created with a 10-minute TTL (held_until = NOW() + INTERVAL '10 minutes').
 * Any hold whose held_until has passed is stale and should be purged so the
 * dates become bookable again.
 *
 * Runs every 5 minutes via [Scheduled]. Because Spring `@Scheduled` does not
 * support Kotlin suspend functions, this method is a regular blocking function
 * that calls `.block()` on the reactive pipeline.
 *
 * `@EnableScheduling` is declared in [SchedulingConfig].
 */
@Component
class HoldCleanupScheduler(private val databaseClient: DatabaseClient) {

    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(fixedDelay = 300_000) // every 5 minutes
    fun cleanExpiredHolds() {
        log.debug("Running expired hold cleanup…")

        databaseClient
            .sql("DELETE FROM availability_hold WHERE held_until < NOW()")
            .then()
            .block()

        log.debug("Expired hold cleanup complete")
    }
}
