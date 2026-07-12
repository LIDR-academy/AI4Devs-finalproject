package com.stayhub.application.auth

import com.stayhub.application.error.ConflictException
import com.stayhub.domain.auth.PasswordEncoder
import com.stayhub.domain.auth.TokenService
import com.stayhub.domain.auth.User
import com.stayhub.domain.auth.UserRepository
import org.springframework.stereotype.Service
import java.util.UUID

/**
 * Registers a new guest with a BCrypt-hashed password, then issues a JWT.
 *
 * Throws [ConflictException] if the email is already taken.
 */
@Service
class RegisterGuestUseCase(
    private val userRepository: UserRepository,
    private val tokenService: TokenService,
    private val passwordEncoder: PasswordEncoder,
) {
    suspend fun execute(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
    ): AuthResult {
        if (userRepository.findByEmail(email) != null) {
            throw ConflictException("Email already registered")
        }

        val hash = passwordEncoder.encode(password)
        val user = User(
            id = UUID.randomUUID(),
            email = email,
            passwordHash = hash,
            firstName = firstName,
            lastName = lastName,
        )

        val saved = userRepository.save(user)
        val token = tokenService.issue(saved.id)
        return AuthResult(token = token, userId = saved.id, firstName = saved.firstName)
    }
}
