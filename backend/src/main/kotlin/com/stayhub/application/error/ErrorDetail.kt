package com.stayhub.application.error

/**
 * Field-level error detail. Used by domain/application validation errors and
 * surfaced in the presentation-layer error response.
 */
data class ErrorDetail(
    val field: String,
    val reason: String,
)
