package com.stayhub.domain.auth

import java.util.UUID

/**
 * Domain entity representing a registered guest with authentication credentials.
 *
 * Pure Kotlin data class — no framework imports. Lives in the domain layer.
 * passwordHash is a BCrypt hash; never expose it outside the auth flow.
 */
data class User(
    val id: UUID,
    val email: String,
    val passwordHash: String,
    val firstName: String,
    val lastName: String,
)
