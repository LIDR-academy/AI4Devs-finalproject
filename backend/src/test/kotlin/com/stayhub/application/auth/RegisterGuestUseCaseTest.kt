package com.stayhub.application.auth

import com.stayhub.application.error.ConflictException
import com.stayhub.domain.auth.PasswordEncoder
import com.stayhub.domain.auth.TokenService
import com.stayhub.domain.auth.User
import com.stayhub.domain.auth.UserRepository
import com.stayhub.infrastructure.auth.BcryptPasswordEncoderAdapter
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldNotBeBlank
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.slot
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import java.util.UUID

class RegisterGuestUseCaseTest {

    private val userRepository = mockk<UserRepository>()
    private val tokenService = mockk<TokenService>()
    private val passwordEncoder: PasswordEncoder = BcryptPasswordEncoderAdapter(BCryptPasswordEncoder())

    private val useCase = RegisterGuestUseCase(
        userRepository = userRepository,
        tokenService = tokenService,
        passwordEncoder = passwordEncoder,
    )

    @Test
    fun `happy path - email not taken - saves user and returns token`() {
        runBlocking {
            coEvery { userRepository.findByEmail("new@example.com") } returns null
            val savedSlot = slot<User>()
            coEvery { userRepository.save(capture(savedSlot)) } answers { savedSlot.captured }
            coEvery { tokenService.issue(any()) } returns "jwt-token-abc"

            val result = useCase.execute(
                email = "new@example.com",
                password = "secret123",
                firstName = "Alice",
                lastName = "Smith",
            )

            result.token shouldBe "jwt-token-abc"
            result.firstName shouldBe "Alice"
            result.userId shouldNotBe null

            coVerify(exactly = 1) { userRepository.save(any()) }
            coVerify(exactly = 1) { tokenService.issue(result.userId) }
        }
    }

    @Test
    fun `password is BCrypt-hashed before storage`() {
        runBlocking {
            coEvery { userRepository.findByEmail(any()) } returns null
            val savedSlot = slot<User>()
            coEvery { userRepository.save(capture(savedSlot)) } answers { savedSlot.captured }
            coEvery { tokenService.issue(any()) } returns "token"

            useCase.execute(
                email = "alice@example.com",
                password = "plaintext-password",
                firstName = "Alice",
                lastName = "Smith",
            )

            val storedHash = savedSlot.captured.passwordHash
            storedHash shouldNotBe "plaintext-password"
            storedHash.shouldNotBeBlank()
            // Verify it is a valid BCrypt hash
            passwordEncoder.matches("plaintext-password", storedHash) shouldBe true
        }
    }

    @Test
    fun `throws ConflictException when email already registered`() {
        runBlocking {
            coEvery { userRepository.findByEmail("taken@example.com") } returns User(
                id = UUID.randomUUID(),
                email = "taken@example.com",
                passwordHash = "hash",
                firstName = "Bob",
                lastName = "Jones",
            )

            shouldThrow<ConflictException> {
                useCase.execute(
                    email = "taken@example.com",
                    password = "secret",
                    firstName = "Charlie",
                    lastName = "Doe",
                )
            }

            coVerify(exactly = 0) { userRepository.save(any()) }
            coVerify(exactly = 0) { tokenService.issue(any()) }
        }
    }
}
