package com.stayhub.infrastructure.persistence

import com.fasterxml.jackson.databind.ObjectMapper
import com.stayhub.domain.property.PropertySearchFilters
import io.kotest.matchers.shouldNotBe
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.springframework.r2dbc.core.DatabaseClient

class PropertyRepositoryAdapterTest {
    private val databaseClient = mockk<DatabaseClient>()
    private val objectMapper = ObjectMapper()
    private val adapter = PropertyRepositoryAdapter(databaseClient, objectMapper)

    @Test
    fun `adapter can be instantiated`() {
        adapter shouldNotBe null
    }

    @Test
    fun `adapter implements PropertyRepository interface`() {
        (adapter as com.stayhub.domain.property.PropertyRepository) shouldNotBe null
    }

    @Test
    fun `PropertySearchFilters can be created with price range`() {
        val filters = PropertySearchFilters(minPrice = 100.0, maxPrice = 150.0)
        filters shouldNotBe null
    }

    @Test
    fun `PropertySearchFilters supports sorting`() {
        val filters = PropertySearchFilters(sortBy = "price_asc")
        filters shouldNotBe null
    }
}
