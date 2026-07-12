package com.stayhub.infrastructure.config

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.validation.annotation.Validated

/**
 * JWT validation settings.
 *
 * Values bind from `stayhub.jwt.*` in application.yml, sourced from
 * environment variables (`JWT_SECRET`, `JWT_ISSUER`). The secret is
 * validated at context refresh — a missing or too-short secret fails the
 * boot with a clear error rather than letting the application start and
 * 500 on the first /auth request.
 */
@Validated
@ConfigurationProperties(prefix = "stayhub.jwt")
data class JwtProperties(
    @field:NotBlank
    @field:Size(
        min = 32,
        message = "stayhub.jwt.secret must be at least 32 characters (256 bits) for HS256",
    )
    val secret: String,
    val issuer: String = "stayhub",
)
