package com.stayhub.domain.shared

import java.math.BigDecimal
import java.math.RoundingMode

/**
 * Immutable monetary value object denominated in EUR.
 *
 * Always uses [BigDecimal] internally (never [Double]) to avoid floating-point
 * rounding errors. Amounts are normalised to a scale of 2 (cents) using
 * [RoundingMode.HALF_UP] and must be non-negative.
 *
 * Pure domain type — no framework dependencies.
 */
class Money(rawAmount: BigDecimal) {

    /** The normalised amount, always at scale 2. */
    val amount: BigDecimal = rawAmount.setScale(SCALE, RoundingMode.HALF_UP)

    /** Fixed currency for v1. */
    val currency: String get() = CURRENCY

    init {
        require(amount.signum() >= 0) { "Money amount must be non-negative, was $rawAmount" }
    }

    /** Sum of two monetary values. */
    operator fun plus(other: Money): Money = Money(amount.add(other.amount))

    /** Multiply by a whole number of units (e.g. nights). */
    operator fun times(factor: Int): Money {
        require(factor >= 0) { "Multiplication factor must be non-negative, was $factor" }
        return Money(amount.multiply(BigDecimal(factor)))
    }

    /** Multiply by a decimal rate (e.g. 0.12 service fee). */
    operator fun times(rate: BigDecimal): Money = Money(amount.multiply(rate))

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Money) return false
        return amount.compareTo(other.amount) == 0
    }

    override fun hashCode(): Int = amount.hashCode()

    override fun toString(): String = "$amount $CURRENCY"

    companion object {
        const val CURRENCY: String = "EUR"
        private const val SCALE: Int = 2

        fun of(value: String): Money = Money(BigDecimal(value))

        fun zero(): Money = Money(BigDecimal.ZERO)
    }
}
