package com.stayhub

import com.stayhub.application.search.SearchPropertiesUseCase
import com.stayhub.domain.property.GeocodeService
import com.stayhub.infrastructure.geocoding.MapboxGeocodeAdapter
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Import(StayHubApplicationTests.MinimalTestConfig::class)
class StayHubApplicationTests {

    @TestConfiguration
    class MinimalTestConfig {
        @Bean
        fun searchPropertiesUseCase() = mockk<SearchPropertiesUseCase>()

        @Bean
        fun geocodeService(): GeocodeService = MapboxGeocodeAdapter("test-token")
    }

    @Test
    fun contextLoads() {
    }
}
