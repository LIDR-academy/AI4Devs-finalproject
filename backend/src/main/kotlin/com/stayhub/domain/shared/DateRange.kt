package com.stayhub.domain.shared

import java.time.LocalDate
import java.time.temporal.ChronoUnit

/**
 * Immutable value object representing a stay from [checkIn] to [checkOut].
 *
 * Invariants: [checkOut] must be strictly after [checkIn]. The number of
 * [nights] is the count of days between the two dates.
 *
 * Pure domain type — no framework dependencies.
 */
data class DateRange(val checkIn: LocalDate, val checkOut: LocalDate) {

    init {
        require(checkOut.isAfter(checkIn)) {
            "Check-out ($checkOut) must be strictly after check-in ($checkIn)"
        }
    }

    /** Number of nights in the stay. */
    val nights: Int get() = ChronoUnit.DAYS.between(checkIn, checkOut).toInt()
}
