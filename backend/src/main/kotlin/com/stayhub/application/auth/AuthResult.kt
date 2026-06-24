package com.stayhub.application.auth

import java.util.UUID

/**
 * Result returned by [RegisterGuestUseCase] and [LoginGuestUseCase].
 */
data class AuthResult(
    val token: String,
    val userId: UUID,
    val firstName: String,
)
