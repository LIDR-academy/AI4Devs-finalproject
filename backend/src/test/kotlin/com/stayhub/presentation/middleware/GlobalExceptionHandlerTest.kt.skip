package com.stayhub.presentation.middleware

import com.stayhub.presentation.error.BookingCannotCancelException
import com.stayhub.presentation.error.ErrorDetail
import com.stayhub.presentation.error.NotFoundException
import com.stayhub.presentation.error.ValidationException
import org.junit.jupiter.api.Test
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.test.web.reactive.server.WebTestClient

@RestController
class FaultyController {
    @GetMapping("/boom/not-found")
    fun notFound(): String = throw NotFoundException("Property not found")

    @GetMapping("/boom/validation")
    fun validation(): String = throw ValidationException(
        "Invalid request parameters",
        listOf(ErrorDetail("check_in", "Check-in date must be in the future")),
    )

    @GetMapping("/boom/cannot-cancel")
    fun cannotCancel(): String = throw BookingCannotCancelException("Booking is already completed")

    @GetMapping("/boom/unexpected")
    fun unexpected(): String = throw IllegalStateException("kaboom")
}

class GlobalExceptionHandlerTest {

    private val client: WebTestClient = WebTestClient
        .bindToController(FaultyController())
        .controllerAdvice(GlobalExceptionHandler())
        .build()

    @Test
    fun `maps NotFoundException to 404 with NOT_FOUND code`() {
        client.get().uri("/boom/not-found").exchange()
            .expectStatus().isNotFound
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("NOT_FOUND")
            .jsonPath("$.error.message").isEqualTo("Property not found")
    }

    @Test
    fun `maps ValidationException to 400 with field details`() {
        client.get().uri("/boom/validation").exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("VALIDATION_ERROR")
            .jsonPath("$.error.details[0].field").isEqualTo("check_in")
            .jsonPath("$.error.details[0].reason").isEqualTo("Check-in date must be in the future")
    }

    @Test
    fun `maps BookingCannotCancelException to 422`() {
        client.get().uri("/boom/cannot-cancel").exchange()
            .expectStatus().isEqualTo(422)
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("BOOKING_CANNOT_CANCEL")
    }

    @Test
    fun `maps unexpected exceptions to 500 INTERNAL_ERROR without leaking detail`() {
        client.get().uri("/boom/unexpected").exchange()
            .expectStatus().is5xxServerError
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("INTERNAL_ERROR")
            .jsonPath("$.error.message").isEqualTo("An unexpected error occurred")
    }
}
