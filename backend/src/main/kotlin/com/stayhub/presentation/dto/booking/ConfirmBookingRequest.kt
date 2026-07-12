package com.stayhub.presentation.dto.booking

import jakarta.validation.constraints.NotBlank

data class ConfirmBookingRequest(
    @field:NotBlank(message = "payment_intent_id is required")
    val payment_intent_id: String? = null,
)
