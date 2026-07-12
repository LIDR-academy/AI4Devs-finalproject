package com.stayhub.infrastructure.config

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.security.core.context.SecurityContextImpl
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono
import javax.crypto.SecretKey

/**
 * Reactive WebFilter that validates the `Authorization: Bearer <token>` header.
 *
 * On a valid, signed, non-expired JWT it extracts the subject (and any `roles`
 * claim) and populates the reactive security context so downstream
 * authorization rules in [SecurityConfig] can act on an authenticated principal.
 *
 * Invalid or absent tokens are not rejected here — the filter simply leaves the
 * context unauthenticated and lets the [SecurityConfig] authorization rules
 * decide (protected routes then yield 401).
 */
@Component
class JwtAuthFilter(
    private val jwtProperties: JwtProperties,
) : WebFilter {

    private val bearerPrefix = "Bearer "

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val header = exchange.request.headers.getFirst("Authorization")
        if (header == null || !header.startsWith(bearerPrefix)) {
            return chain.filter(exchange)
        }

        val token = header.substring(bearerPrefix.length).trim()
        val claims = parseClaims(token) ?: return chain.filter(exchange)

        val authorities = extractRoles(claims).map { SimpleGrantedAuthority("ROLE_$it") }
        val authentication = UsernamePasswordAuthenticationToken(claims.subject, token, authorities)

        return chain.filter(exchange)
            .contextWrite(
                ReactiveSecurityContextHolder.withSecurityContext(
                    Mono.just(SecurityContextImpl(authentication)),
                ),
            )
    }

    private fun parseClaims(token: String): Claims? = runCatching {
        val key: SecretKey = Keys.hmacShaKeyFor(jwtProperties.secret.toByteArray())
        Jwts.parser()
            .verifyWith(key)
            .requireIssuer(jwtProperties.issuer)
            .build()
            .parseSignedClaims(token)
            .payload
    }.getOrNull()

    @Suppress("UNCHECKED_CAST")
    private fun extractRoles(claims: Claims): List<String> =
        when (val roles = claims["roles"]) {
            is List<*> -> roles.filterIsInstance<String>()
            is String -> listOf(roles)
            else -> emptyList()
        }
}
