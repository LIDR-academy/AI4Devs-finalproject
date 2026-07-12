package com.stayhub.infrastructure.persistence

import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Test
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.r2dbc.core.FetchSpec
import reactor.core.publisher.Mono

/**
 * Unit test for [HoldCleanupScheduler].
 *
 * Verifies that [HoldCleanupScheduler.cleanExpiredHolds] issues the expected
 * DELETE SQL via [DatabaseClient] without connecting to a real database.
 *
 * The scheduler method is non-suspend (Spring @Scheduled doesn't support
 * coroutines directly), so it calls `.then().block()`.
 */
class HoldCleanupSchedulerTest {

    @Test
    fun `cleanExpiredHolds executes DELETE expired holds SQL`() {
        // Arrange — build a mocked DatabaseClient chain that returns Mono.empty()
        val databaseClient = mockk<DatabaseClient>()
        val genericExecuteSpec = mockk<DatabaseClient.GenericExecuteSpec>()

        every { databaseClient.sql(any<String>()) } returns genericExecuteSpec
        every { genericExecuteSpec.then() } returns Mono.empty()

        val scheduler = HoldCleanupScheduler(databaseClient)

        // Act
        scheduler.cleanExpiredHolds()

        // Assert — the scheduler must call sql("DELETE FROM availability_hold WHERE held_until < NOW()")
        verify(exactly = 1) {
            databaseClient.sql(match<String> { sql ->
                sql.contains("DELETE", ignoreCase = true) &&
                    sql.contains("availability_hold", ignoreCase = true) &&
                    sql.contains("held_until", ignoreCase = true)
            })
        }
        verify(exactly = 1) { genericExecuteSpec.then() }
    }
}
