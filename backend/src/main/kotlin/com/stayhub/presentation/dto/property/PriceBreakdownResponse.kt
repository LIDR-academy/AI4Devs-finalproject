package com.stayhub.presentation.dto.property

data class PriceBreakdownResponse(
    val property_id: String,
    val check_in: String,
    val check_out: String,
    val nights: Int,
    val nightly_rate_eur: Double,
    val subtotal_eur: Double,
    val cleaning_fee_eur: Double,
    val service_fee_eur: Double,
    val tax_eur: Double,
    val total_eur: Double,
)
