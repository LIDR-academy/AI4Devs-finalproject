package com.stayhub.domain.property

import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test
import java.util.*

class PropertyTest {
    @Test
    fun `constructs a Property with all required fields`() {
        val prop = Property(
            id = UUID.randomUUID(),
            title = "Cosy Barcelona Apartment",
            description = "Modern 2-bed in Gràcia",
            propertyType = "apartment",
            location = Property.Location(
                lat = 41.4001,
                lng = 2.1644,
                city = "Barcelona",
                region = "Catalonia",
                country = "Spain",
                address = "Carrer de Sant Josep, 10"
            ),
            maxGuests = 4,
            bedrooms = 2,
            bathrooms = 1,
            nightlyRateEur = 120.0,
            cleaningFeeEur = 50.0,
            amenities = listOf("WiFi", "Kitchen", "AC"),
            houseRules = listOf("No smoking", "Check-in after 4pm"),
            photos = emptyList(),
            hostId = UUID.randomUUID(),
            avgRating = 4.8,
            reviewCount = 12
        )

        prop.title shouldBe "Cosy Barcelona Apartment"
        prop.location.lat shouldBe 41.4001
        prop.propertyType shouldBe "apartment"
        prop.bedrooms shouldBe 2
        prop.nightlyRateEur shouldBe 120.0
    }
}
