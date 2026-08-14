package com.mecatrack.mobile.domain

import org.junit.Assert.assertEquals
import org.junit.Test

class AuthErrorMapperTest {
    @Test
    fun maps401ToGenericCredentials() {
        assertEquals(
            AuthErrorMapper.INVALID_CREDENTIALS,
            AuthErrorMapper.mapLoginFailure(401, "Invalid email or password"),
        )
    }

    @Test
    fun maps403ToGenericCredentials() {
        assertEquals(
            AuthErrorMapper.INVALID_CREDENTIALS,
            AuthErrorMapper.mapLoginFailure(403, "Forbidden"),
        )
    }

    @Test
    fun maps429ToTooManyAttempts() {
        assertEquals(
            AuthErrorMapper.TOO_MANY_ATTEMPTS,
            AuthErrorMapper.mapLoginFailure(429, "Too Many Requests"),
        )
    }

    @Test
    fun maps400ToApiValidationMessage() {
        assertEquals(
            "email must be an email",
            AuthErrorMapper.mapLoginFailure(400, "email must be an email"),
        )
    }

    @Test
    fun mapsMissingStatusToNetwork() {
        assertEquals(
            AuthErrorMapper.NETWORK,
            AuthErrorMapper.mapLoginFailure(null, null),
        )
    }

    @Test
    fun mapsOtherHttpToNetwork() {
        assertEquals(
            AuthErrorMapper.NETWORK,
            AuthErrorMapper.mapLoginFailure(500, "Internal server error"),
        )
    }
}
