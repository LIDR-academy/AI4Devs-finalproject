package com.stayhub.infrastructure.geocoding

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class MapboxGeocodeAdapterTest {
    private val adapter = MapboxGeocodeAdapter(apiKey = "test-valid-token")

    @Test
    fun `returns demo Barcelona location when querying barcelona`() {
        runBlocking {
            val result = adapter.geocode("Barcelona")

            assert(result.isNotEmpty()) { "Result should contain Barcelona" }
            assert(result[0].name == "Barcelona, Spain") { "Name should be Barcelona, Spain" }
            assert(result[0].lat == 41.3851) { "Latitude should match Barcelona" }
            assert(result[0].lng == 2.1734) { "Longitude should match Barcelona" }
            assert(result[0].bbox != null) { "Should include bounding box" }
        }
    }

    @Test
    fun `returns empty list for blank query`() {
        runBlocking {
            val result = adapter.geocode("   ")

            assert(result.isEmpty()) { "Result should be empty for blank query" }
        }
    }

    @Test
    fun `returns empty list for query exceeding max length`() {
        runBlocking {
            val longQuery = "a".repeat(257)

            val result = adapter.geocode(longQuery)

            assert(result.isEmpty()) { "Result should be empty for query exceeding max length" }
        }
    }

    @Test
    fun `throws IllegalStateException when API key is default token during validation`() {
        val adapter = MapboxGeocodeAdapter(apiKey = "default-token")
        assertThrows<IllegalStateException> {
            adapter.validateConfiguration()
        }
    }

    @Test
    fun `throws IllegalStateException when API key is blank during validation`() {
        val adapter = MapboxGeocodeAdapter(apiKey = "")
        assertThrows<IllegalStateException> {
            adapter.validateConfiguration()
        }
    }

    @Test
    fun `returns demo Madrid location when querying madrid`() {
        runBlocking {
            val result = adapter.geocode("madrid")

            assert(result.isNotEmpty()) { "Result should contain Madrid" }
            assert(result[0].name == "Madrid, Spain") { "Name should be Madrid, Spain" }
        }
    }

    @Test
    fun `returns demo Lisbon location when querying lisbon`() {
        runBlocking {
            val result = adapter.geocode("Lisbon")

            assert(result.isNotEmpty()) { "Result should contain Lisbon" }
            assert(result[0].name == "Lisbon, Portugal") { "Name should be Lisbon, Portugal" }
        }
    }

    @Test
    fun `returns empty list for unmapped city`() {
        runBlocking {
            val result = adapter.geocode("Unknown City")

            assert(result.isEmpty()) { "Result should be empty for unmapped city" }
        }
    }
}
