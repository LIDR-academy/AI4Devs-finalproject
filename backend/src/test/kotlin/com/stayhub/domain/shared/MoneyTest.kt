package com.stayhub.domain.shared

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import java.math.BigDecimal

class MoneyTest : StringSpec({

    "constructs from a BigDecimal and normalises to scale 2" {
        Money(BigDecimal("10")).amount shouldBe BigDecimal("10.00")
        Money(BigDecimal("10.1")).amount shouldBe BigDecimal("10.10")
    }

    "rounds half-up to two decimal places" {
        Money(BigDecimal("10.005")).amount shouldBe BigDecimal("10.01")
        Money(BigDecimal("10.004")).amount shouldBe BigDecimal("10.00")
    }

    "exposes EUR as the fixed currency" {
        Money(BigDecimal("1.00")).currency shouldBe "EUR"
    }

    "factory from string and double convenience" {
        Money.of("12.50").amount shouldBe BigDecimal("12.50")
        Money.zero().amount shouldBe BigDecimal("0.00")
    }

    "rejects negative amounts" {
        shouldThrow<IllegalArgumentException> { Money(BigDecimal("-0.01")) }
    }

    "allows zero" {
        Money(BigDecimal.ZERO).amount shouldBe BigDecimal("0.00")
    }

    "adds two money values" {
        (Money.of("10.00") + Money.of("5.50")).amount shouldBe BigDecimal("15.50")
    }

    "multiplies by an integer number of nights" {
        (Money.of("80.00") * 3).amount shouldBe BigDecimal("240.00")
    }

    "multiplies by zero nights yields zero" {
        (Money.of("80.00") * 0).amount shouldBe BigDecimal("0.00")
    }

    "rejects multiplication by a negative factor" {
        shouldThrow<IllegalArgumentException> { Money.of("80.00") * -1 }
    }

    "multiplies by a BigDecimal rate (service fee 12%)" {
        (Money.of("240.00") * BigDecimal("0.12")).amount shouldBe BigDecimal("28.80")
    }

    "pricing formula composes correctly" {
        val nightly = Money.of("80.00")
        val nights = 3
        val cleaning = Money.of("25.00")
        val subtotal = nightly * nights
        val serviceFee = subtotal * BigDecimal("0.12")
        val total = subtotal + cleaning + serviceFee
        subtotal.amount shouldBe BigDecimal("240.00")
        serviceFee.amount shouldBe BigDecimal("28.80")
        total.amount shouldBe BigDecimal("293.80")
    }

    "equality is by value" {
        Money.of("10.00") shouldBe Money(BigDecimal("10.000"))
        (Money.of("10.00") == Money.of("10.01")) shouldBe false
    }

    "renders with two decimal places and EUR" {
        Money.of("5").toString() shouldBe "5.00 EUR"
    }
})
