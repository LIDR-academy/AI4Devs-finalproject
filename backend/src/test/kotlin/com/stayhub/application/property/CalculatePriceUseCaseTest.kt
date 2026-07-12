package com.stayhub.application.property

import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.application.error.ValidationException
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.doubles.plusOrMinus
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class CalculatePriceUseCaseTest {

    private val propertyRepository = mockk<PropertyRepository>()
    private val useCase = CalculatePriceUseCase(propertyRepository)

    private val propertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001")

    private val sampleProperty = Property(
        id = propertyId,
        title = "Cosy Eixample Apartment",
        description = "A lovely apartment",
        propertyType = "apartment",
        location = Property.Location(41.394, 2.161, "Barcelona", "Catalonia", "Spain", "Carrer de Provença 123"),
        maxGuests = 4,
        bedrooms = 2,
        bathrooms = 1,
        nightlyRateEur = 100.0,
        cleaningFeeEur = 50.0,
        amenities = emptyList(),
        houseRules = emptyList(),
        photos = emptyList(),
        hostId = UUID.randomUUID(),
        avgRating = 4.8,
        reviewCount = 12,
    )

    @Test
    fun `calculates correct price breakdown for 3 nights at 100 EUR nightly rate`() {
        runBlocking {
            val checkIn = LocalDate.of(2027, 7, 1)
            val checkOut = LocalDate.of(2027, 7, 4) // 3 nights

            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty

            val result = useCase.execute(propertyId, checkIn, checkOut)

            result.nights shouldBe 3
            result.nightlyRateEur shouldBe 100.0
            result.subtotalEur shouldBe 300.0        // 3 * 100
            result.cleaningFeeEur shouldBe 50.0      // flat
            result.serviceFeeEur shouldBe (300.0 * 0.12 plusOrMinus 0.01) // 36.0
            result.taxEur shouldBe 0.0               // v1: 0%
            result.totalEur shouldBe (300.0 + 50.0 + 36.0 + 0.0 plusOrMinus 0.01) // 386.0
        }
    }

    @Test
    fun `calculates correct price breakdown for 1 night`() {
        runBlocking {
            val checkIn = LocalDate.of(2027, 7, 1)
            val checkOut = LocalDate.of(2027, 7, 2) // 1 night

            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty

            val result = useCase.execute(propertyId, checkIn, checkOut)

            result.nights shouldBe 1
            result.subtotalEur shouldBe 100.0
            result.serviceFeeEur shouldBe (100.0 * 0.12 plusOrMinus 0.01) // 12.0
            result.totalEur shouldBe (100.0 + 50.0 + 12.0 plusOrMinus 0.01) // 162.0
        }
    }

    @Test
    fun `calculates correct price breakdown for 7 nights`() {
        runBlocking {
            val checkIn = LocalDate.of(2027, 7, 1)
            val checkOut = LocalDate.of(2027, 7, 8) // 7 nights

            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty

            val result = useCase.execute(propertyId, checkIn, checkOut)

            result.nights shouldBe 7
            result.subtotalEur shouldBe 700.0        // 7 * 100
            result.cleaningFeeEur shouldBe 50.0
            result.serviceFeeEur shouldBe (700.0 * 0.12 plusOrMinus 0.01) // 84.0
            result.taxEur shouldBe 0.0
            result.totalEur shouldBe (700.0 + 50.0 + 84.0 plusOrMinus 0.01) // 834.0
        }
    }

    @Test
    fun `throws ValidationException when check_in is after check_out`() {
        runBlocking {
            val checkIn = LocalDate.of(2027, 7, 10)
            val checkOut = LocalDate.of(2027, 7, 1)

            shouldThrow<ValidationException> {
                useCase.execute(propertyId, checkIn, checkOut)
            }
        }
    }

    @Test
    fun `throws ValidationException when check_in equals check_out`() {
        runBlocking {
            val date = LocalDate.of(2027, 7, 1)

            shouldThrow<ValidationException> {
                useCase.execute(propertyId, date, date)
            }
        }
    }

    @Test
    fun `throws ValidationException when check_in is in the past`() {
        runBlocking {
            val checkIn = LocalDate.of(2020, 1, 1)
            val checkOut = LocalDate.of(2020, 1, 5)

            // No property lookup needed since date validation is first
            shouldThrow<ValidationException> {
                useCase.execute(propertyId, checkIn, checkOut)
            }
        }
    }

    @Test
    fun `result includes correct property_id and dates`() {
        runBlocking {
            val checkIn = LocalDate.of(2027, 7, 1)
            val checkOut = LocalDate.of(2027, 7, 4)

            coEvery { propertyRepository.findById(propertyId) } returns sampleProperty

            val result = useCase.execute(propertyId, checkIn, checkOut)

            result.propertyId shouldBe propertyId
            result.checkIn shouldBe checkIn
            result.checkOut shouldBe checkOut
        }
    }
}
