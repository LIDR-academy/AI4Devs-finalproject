package com.stayhub.domain.shared

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import java.time.LocalDate

class DateRangeTest : StringSpec({

    "constructs a valid range" {
        val range = DateRange(LocalDate.of(2025, 6, 1), LocalDate.of(2025, 6, 5))
        range.checkIn shouldBe LocalDate.of(2025, 6, 1)
        range.checkOut shouldBe LocalDate.of(2025, 6, 5)
    }

    "computes nights as the day count between check-in and check-out" {
        DateRange(LocalDate.of(2025, 6, 1), LocalDate.of(2025, 6, 5)).nights shouldBe 4
        DateRange(LocalDate.of(2025, 6, 1), LocalDate.of(2025, 6, 2)).nights shouldBe 1
    }

    "rejects check-out equal to check-in" {
        shouldThrow<IllegalArgumentException> {
            DateRange(LocalDate.of(2025, 6, 1), LocalDate.of(2025, 6, 1))
        }
    }

    "rejects check-out before check-in" {
        shouldThrow<IllegalArgumentException> {
            DateRange(LocalDate.of(2025, 6, 5), LocalDate.of(2025, 6, 1))
        }
    }

    "equality is by value" {
        DateRange(LocalDate.of(2025, 6, 1), LocalDate.of(2025, 6, 5)) shouldBe
            DateRange(LocalDate.of(2025, 6, 1), LocalDate.of(2025, 6, 5))
    }

    "different ranges are not equal" {
        (
            DateRange(LocalDate.of(2025, 6, 1), LocalDate.of(2025, 6, 5)) ==
                DateRange(LocalDate.of(2025, 6, 1), LocalDate.of(2025, 6, 6))
            ) shouldBe false
    }
})
