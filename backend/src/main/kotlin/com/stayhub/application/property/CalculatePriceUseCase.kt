package com.stayhub.application.property

import com.stayhub.domain.property.PriceBreakdown
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.application.error.NotFoundException
import com.stayhub.application.error.ValidationException
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
class CalculatePriceUseCase(
    private val propertyRepository: PropertyRepository,
) {
    suspend fun execute(
        propertyId: UUID,
        checkIn: LocalDate,
        checkOut: LocalDate,
    ): PriceBreakdown {
        if (!checkIn.isBefore(checkOut)) {
            throw ValidationException("check_in must be before check_out")
        }
        if (!checkIn.isAfter(LocalDate.now().minusDays(1))) {
            throw ValidationException("check_in must be today or in the future")
        }

        val property = propertyRepository.findById(propertyId)
            ?: throw NotFoundException("Property not found: $propertyId")

        val nights = ChronoUnit.DAYS.between(checkIn, checkOut).toInt()
        val subtotal = round2(property.nightlyRateEur * nights)
        val cleaning = round2(property.cleaningFeeEur)
        val serviceFee = round2(subtotal * 0.12)
        val tax = 0.0  // v1: tax_rate is 0%
        val total = round2(subtotal + cleaning + serviceFee + tax)

        return PriceBreakdown(
            propertyId = propertyId,
            checkIn = checkIn,
            checkOut = checkOut,
            nights = nights,
            nightlyRateEur = property.nightlyRateEur,
            subtotalEur = subtotal,
            cleaningFeeEur = cleaning,
            serviceFeeEur = serviceFee,
            taxEur = tax,
            totalEur = total,
        )
    }

    private fun round2(value: Double): Double = Math.round(value * 100.0) / 100.0
}
