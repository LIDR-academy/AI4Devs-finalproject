package com.stayhub.domain.availability

import java.time.LocalDate

data class UnavailableDate(
    val date: LocalDate,
    val reason: String, // "booked", "blocked", "held"
)
