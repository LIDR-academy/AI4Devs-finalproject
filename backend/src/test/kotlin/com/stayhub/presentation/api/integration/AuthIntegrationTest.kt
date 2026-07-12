package com.stayhub.presentation.api.integration

import org.junit.jupiter.api.Test
import org.springframework.http.MediaType

/**
 * Auth endpoints over the real stack (migrated onto AbstractApiIntegrationTest).
 * The round-trip test asserts the issued token genuinely grants access — a real
 * 201 booking — replacing the earlier weak `!= 401` check.
 */
class AuthIntegrationTest : AbstractApiIntegrationTest() {

    @Test
    fun `register then login issues a token accepted on a protected endpoint`() {
        val email = "auth-${System.nanoTime()}@example.com"

        http.post().uri("/api/v1/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"email":"$email","password":"pass1234","first_name":"Auth","last_name":"Test"}""")
            .exchange().expectStatus().isCreated

        val token = http.post().uri("/api/v1/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"email":"$email","password":"pass1234"}""")
            .exchange()
            .expectStatus().isOk
            .expectBody(Map::class.java).returnResult().responseBody!!["token"] as String

        // Token grants access to the protected booking endpoint → real 201.
        val (checkIn, checkOut) = nextStayWindow()
        http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"property_id":"cccccccc-cccc-cccc-cccc-000000001001","check_in":"$checkIn","check_out":"$checkOut","guest_count":2}""")
            .exchange()
            .expectStatus().isCreated
    }

    @Test
    fun `register returns 409 for a duplicate email`() {
        val email = "dup-${System.nanoTime()}@example.com"
        http.post().uri("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"email":"$email","password":"pass1234","first_name":"A","last_name":"B"}""")
            .exchange().expectStatus().isCreated
        http.post().uri("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"email":"$email","password":"other","first_name":"C","last_name":"D"}""")
            .exchange()
            .expectStatus().isEqualTo(409)
            .expectBody().jsonPath("$.error.code").isEqualTo("CONFLICT")
    }

    @Test
    fun `register returns 400 when a required field is blank`() {
        http.post().uri("/api/v1/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"email":"","password":"pass1234","first_name":"A","last_name":"B"}""")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `login returns 401 for a wrong password`() {
        val email = "wrong-${System.nanoTime()}@example.com"
        http.post().uri("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"email":"$email","password":"correct-pass","first_name":"T","last_name":"U"}""")
            .exchange().expectStatus().isCreated
        http.post().uri("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"email":"$email","password":"wrong-pass"}""")
            .exchange()
            .expectStatus().isUnauthorized
            .expectBody().jsonPath("$.error.code").isEqualTo("UNAUTHORIZED")
    }
}
