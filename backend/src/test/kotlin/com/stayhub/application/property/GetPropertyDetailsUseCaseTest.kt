package com.stayhub.application.property

import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.application.error.NotFoundException
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import java.util.UUID

class GetPropertyDetailsUseCaseTest {

    private val propertyRepository = mockk<PropertyRepository>()
    private val useCase = GetPropertyDetailsUseCase(propertyRepository)

    private val sampleProperty = Property(
        id = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001"),
        title = "Cosy Eixample Apartment",
        description = "A lovely apartment in the heart of Eixample",
        propertyType = "apartment",
        location = Property.Location(
            lat = 41.394,
            lng = 2.161,
            city = "Barcelona",
            region = "Catalonia",
            country = "Spain",
            address = "Carrer de Provença 123",
        ),
        maxGuests = 4,
        bedrooms = 2,
        bathrooms = 1,
        nightlyRateEur = 100.0,
        cleaningFeeEur = 50.0,
        amenities = listOf("WiFi", "AC"),
        houseRules = listOf("No smoking"),
        photos = listOf(Property.Photo(url = "https://example.com/photo.jpg", caption = "Living room")),
        hostId = UUID.randomUUID(),
        avgRating = 4.8,
        reviewCount = 12,
    )

    @Test
    fun `returns property when found`() {
        runBlocking {
            val id = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001")
            coEvery { propertyRepository.findById(id) } returns sampleProperty

            val result = useCase.execute(id)

            result shouldBe sampleProperty
        }
    }

    @Test
    fun `throws NotFoundException when property not found`() {
        runBlocking {
            val id = UUID.randomUUID()
            coEvery { propertyRepository.findById(id) } returns null

            shouldThrow<NotFoundException> {
                useCase.execute(id)
            }
        }
    }
}
