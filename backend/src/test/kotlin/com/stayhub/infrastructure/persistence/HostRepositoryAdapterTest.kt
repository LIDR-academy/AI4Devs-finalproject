package com.stayhub.infrastructure.persistence

import com.stayhub.infrastructure.config.TestContainersConfiguration
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import java.util.UUID

/**
 * Integration test for HostRepositoryAdapter (TEST-1).
 *
 * Uses the shared TestContainersConfiguration singleton (real PostgreSQL with Flyway).
 * Relies on seed data from V7__seed_sample_data.sql which inserts 3 hosts with
 * deterministic UUIDs: aaaaaaaa-aaaa-aaaa-aaaa-00000000000{1,2,3}.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Import(TestContainersConfiguration::class)
@TestPropertySource(properties = ["spring.flyway.enabled=true"])
class HostRepositoryAdapterTest {

    @Autowired
    lateinit var adapter: HostRepositoryAdapter

    private val seededHostId1 = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-000000000001")
    private val seededHostId3 = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-000000000003")

    // ------------------------------------------------------------------
    // Test: seeded host returned and all fields mapped correctly
    // ------------------------------------------------------------------
    @Test
    fun `returns host when it exists in database`() = runTest {
        val host = adapter.findById(seededHostId1)

        host shouldNotBe null
        host!!.id shouldBe seededHostId1
    }

    @Test
    fun `maps all host fields correctly`() = runTest {
        val host = adapter.findById(seededHostId1)

        host shouldNotBe null
        host!!.id          shouldBe seededHostId1
        host.firstName     shouldBe "Test"
        host.lastName      shouldBe "Host One"
        host.avatarUrl     shouldBe "https://placehold.co/200x200?text=Host+1"
        host.isVerified    shouldBe true
    }

    @Test
    fun `maps is_verified false correctly for unverified host`() = runTest {
        // Host 3 has is_verified = false per seed data.
        val host = adapter.findById(seededHostId3)

        host shouldNotBe null
        host!!.isVerified shouldBe false
        host.firstName    shouldBe "Test"
        host.lastName     shouldBe "Host Three"
    }

    // ------------------------------------------------------------------
    // Test: non-existent host returns null
    // ------------------------------------------------------------------
    @Test
    fun `returns null when host ID is not found`() = runTest {
        val unknownId = UUID.fromString("99999999-9999-9999-9999-999999999999")

        val host = adapter.findById(unknownId)

        host shouldBe null
    }
}
