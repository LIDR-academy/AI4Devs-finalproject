package com.stayhub.application.auth

import com.stayhub.application.error.UnauthorizedException
import com.stayhub.domain.auth.PasswordEncoder
import com.stayhub.domain.auth.TokenService
import com.stayhub.domain.auth.UserRepository
import org.springframework.stereotype.Service

/**
 * Authenticates a guest by email + password, then issues a JWT.
 *
 * Throws [UnauthorizedException] if the email is not found or the password
 * doesn't match — deliberately uses the same message to avoid user enumeration.
 */
@Service
class LoginGuestUseCase(
    private val userRepository: UserRepository,
    private val tokenService: TokenService,
    private val passwordEncoder: PasswordEncoder,
) {
    suspend fun execute(email: String, password: String): AuthResult {
        val user = userRepository.findByEmail(email)
            ?: throw UnauthorizedException("Invalid credentials")

        if (!passwordEncoder.matches(password, user.passwordHash)) {
            throw UnauthorizedException("Invalid credentials")
        }

        val token = tokenService.issue(user.id)
        return AuthResult(token = token, userId = user.id, firstName = user.firstName)
    }
}
