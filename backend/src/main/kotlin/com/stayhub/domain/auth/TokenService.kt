package com.stayhub.domain.auth

import java.util.UUID

/**
 * Port: JWT token issuance contract.
 *
 * Implemented by the infrastructure layer (JwtTokenService).
 * Pure interface — no framework imports.
 */
interface TokenService {
    fun issue(userId: UUID): String
}
