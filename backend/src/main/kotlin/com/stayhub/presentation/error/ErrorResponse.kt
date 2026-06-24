package com.stayhub.presentation.error

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty
import com.stayhub.application.error.ErrorDetail

/**
 * Wire shape for all error responses, per contracts/error-responses.yml.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class ErrorResponse(
    val error: ErrorBody,
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ErrorBody(
    val code: String,
    val message: String,
    val details: List<ErrorDetail>? = null,
    @param:JsonProperty("trace_id")
    @get:JsonProperty("trace_id")
    val traceId: String? = null,
)
