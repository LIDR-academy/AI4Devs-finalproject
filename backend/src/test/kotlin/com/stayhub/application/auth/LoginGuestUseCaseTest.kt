package com.stayhub.application.auth

import com.stayhub.application.error.UnauthorizedException
import com.stayhub.domain.auth.PasswordEncoder
import com.stayhub.domain.auth.TokenService
import com.stayhub.domain.auth.User
import com.stayhub.domain.auth.UserRepository
import com.stayhub.infrastructure.auth.BcryptPasswordEncoderAdapter
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import java.util.UUID

class LoginGuestUseCaseTest {

    private val userRepository = mockk<UserRepository>()
    private val tokenService = mockk<TokenService>()
    private val passwordEncoder: PasswordEncoder = BcryptPasswordEncoderAdapter(BCryptPasswordEncoder())

    private val useCase = LoginGuestUseCase(
        userRepository = userRepository,
        tokenService = tokenService,
        passwordEncoder = passwordEncoder,
    )

    private val userId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-000000000001")
    private val correctPassword = "correct-password"
    private val correctHash = BcryptPasswordEncoderAdapter(BCryptPasswordEncoder()).encode(correctPassword)

    private val registeredUser = User(
        id = userId,
        email = "alice@example.com",
        passwordHash = correctHash,
        firstName = "Alice",
        lastName = "Smith",
    )

    @Test
    fun `happy path - correct credentials return token`() {
        runBlocking {
            coEvery { userRepository.findByEmail("alice@example.com") } returns registeredUser
            coEvery { tokenService.issue(userId) } returns "jwt-token-123"

            val result = useCase.execute(email = "alice@example.com", password = correctPassword)

            result.token shouldBe "jwt-token-123"
            result.firstName shouldBe "Alice"
            result.userId shouldBe userId
            coVerify(exactly = 1) { tokenService.issue(userId) }
        }
    }

    @Test
    fun `wrong password throws UnauthorizedException`() {
        runBlocking {
            coEvery { userRepository.findByEmail("alice@example.com") } returns registeredUser

            shouldThrow<UnauthorizedException> {
                useCase.execute(email = "alice@example.com", password = "wrong-password")
            }

            coVerify(exactly = 0) { tokenService.issue(any()) }
        }
    }

    @Test
    fun `email not found throws UnauthorizedException`() {
        runBlocking {
            coEvery { userRepository.findByEmail("unknown@example.com") } returns null

            shouldThrow<UnauthorizedException> {
                useCase.execute(email = "unknown@example.com", password = "any-password")
            }

            coVerify(exactly = 0) { tokenService.issue(any()) }
        }
    }
}
