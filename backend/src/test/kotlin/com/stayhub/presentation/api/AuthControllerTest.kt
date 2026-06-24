package com.stayhub.presentation.api

import com.stayhub.application.auth.AuthResult
import com.stayhub.application.auth.LoginGuestUseCase
import com.stayhub.application.auth.RegisterGuestUseCase
import com.stayhub.application.error.ConflictException
import com.stayhub.application.error.UnauthorizedException
import com.stayhub.presentation.middleware.GlobalExceptionHandler
import io.mockk.coEvery
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.test.web.reactive.server.WebTestClient
import java.util.UUID

/**
 * WebFlux controller slice test for [AuthController].
 *
 * Uses [WebTestClient.bindToController] (no Spring context) — auth routes
 * are public so no security context is needed.
 */
class AuthControllerTest {

    private val registerGuest = mockk<RegisterGuestUseCase>()
    private val loginGuest = mockk<LoginGuestUseCase>()

    private val controller = AuthController(
        registerGuest = registerGuest,
        loginGuest = loginGuest,
    )

    private val client = WebTestClient.bindToController(controller)
        .controllerAdvice(GlobalExceptionHandler::class.java)
        .build()

    private val userId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-000000000001")
    private val fakeToken = "eyJhbGciOiJIUzI1NiJ9.test.sig"

    @Test
    fun `POST register returns 201 with token`() {
        coEvery {
            registerGuest.execute("new@example.com", "pass123", "Alice", "Smith")
        } returns AuthResult(token = fakeToken, userId = userId, firstName = "Alice")

        client.post()
            .uri("/api/v1/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(
                """{"email":"new@example.com","password":"pass123","first_name":"Alice","last_name":"Smith"}"""
            )
            .exchange()
            .expectStatus().isCreated
            .expectBody()
            .jsonPath("$.token").isEqualTo(fakeToken)
            .jsonPath("$.user_id").isEqualTo(userId.toString())
            .jsonPath("$.first_name").isEqualTo("Alice")
    }

    @Test
    fun `POST login returns 200 with token`() {
        coEvery {
            loginGuest.execute("alice@example.com", "pass123")
        } returns AuthResult(token = fakeToken, userId = userId, firstName = "Alice")

        client.post()
            .uri("/api/v1/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"email":"alice@example.com","password":"pass123"}""")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.token").isEqualTo(fakeToken)
            .jsonPath("$.user_id").isEqualTo(userId.toString())
            .jsonPath("$.first_name").isEqualTo("Alice")
    }

    @Test
    fun `POST register returns 400 when email is missing`() {
        client.post()
            .uri("/api/v1/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"password":"pass123","first_name":"Alice","last_name":"Smith"}""")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `POST login returns 400 when password is missing`() {
        client.post()
            .uri("/api/v1/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"email":"alice@example.com"}""")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `POST register returns 409 when email already taken`() {
        coEvery {
            registerGuest.execute(any(), any(), any(), any())
        } throws ConflictException("Email already registered")

        client.post()
            .uri("/api/v1/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(
                """{"email":"taken@example.com","password":"pass123","first_name":"Alice","last_name":"Smith"}"""
            )
            .exchange()
            .expectStatus().isEqualTo(409)
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("CONFLICT")
    }

    @Test
    fun `POST login returns 401 when credentials are invalid`() {
        coEvery {
            loginGuest.execute(any(), any())
        } throws UnauthorizedException("Invalid credentials")

        client.post()
            .uri("/api/v1/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"email":"alice@example.com","password":"wrong"}""")
            .exchange()
            .expectStatus().isUnauthorized
            .expectBody()
            .jsonPath("$.error.code").isEqualTo("UNAUTHORIZED")
    }
}
