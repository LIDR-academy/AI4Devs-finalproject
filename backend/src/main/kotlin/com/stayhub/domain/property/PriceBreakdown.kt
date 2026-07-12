package com.stayhub.domain.property

import java.time.LocalDate
import java.util.UUID

data class PriceBreakdown(
    val propertyId: UUID,
    val checkIn: LocalDate,
    val checkOut: LocalDate,
    val nights: Int,
    val nightlyRateEur: Double,
    val subtotalEur: Double,
    val cleaningFeeEur: Double,
    val serviceFeeEur: Double,
    val taxEur: Double,
    val totalEur: Double,
)
