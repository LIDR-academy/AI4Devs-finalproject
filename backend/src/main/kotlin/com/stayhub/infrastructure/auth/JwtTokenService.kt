package com.stayhub.infrastructure.auth

import com.stayhub.domain.auth.TokenService
import com.stayhub.infrastructure.config.JwtProperties
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Service
import java.util.Date
import java.util.UUID

/**
 * Issues 30-day signed JWTs using the same secret and issuer as [JwtAuthFilter].
 *
 * Algorithm: HMAC-SHA256 via [Keys.hmacShaKeyFor].
 *
 * [JwtProperties] guarantees the secret is non-blank and ≥ 32 characters
 * (validated at context refresh), so this issuer can hash it directly
 * without re-checking length.
 */
@Service
class JwtTokenService(
    private val jwtProperties: JwtProperties,
) : TokenService {

    override fun issue(userId: UUID): String {
        val key = Keys.hmacShaKeyFor(jwtProperties.secret.toByteArray())
        return Jwts.builder()
            .subject(userId.toString())
            .issuer(jwtProperties.issuer)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + 30L * 24 * 60 * 60 * 1000))
            .signWith(key)
            .compact()
    }
}
