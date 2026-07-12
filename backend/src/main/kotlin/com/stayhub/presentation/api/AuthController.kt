package com.stayhub.presentation.api

import com.stayhub.application.auth.LoginGuestUseCase
import com.stayhub.application.auth.RegisterGuestUseCase
import com.stayhub.application.error.ValidationException
import com.stayhub.presentation.dto.auth.AuthResponse
import com.stayhub.presentation.dto.auth.LoginRequest
import com.stayhub.presentation.dto.auth.RegisterRequest
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

/**
 * Auth endpoints — register and login.
 *
 * Both routes are public (no JWT required); see SecurityConfig.
 * Input validation is done manually so that we control the error message
 * and it routes through GlobalExceptionHandler as a 400.
 */
@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val registerGuest: RegisterGuestUseCase,
    private val loginGuest: LoginGuestUseCase,
) {

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    suspend fun register(@RequestBody request: RegisterRequest): AuthResponse {
        val email = request.email?.takeIf { it.isNotBlank() }
            ?: throw ValidationException("email is required")
        val password = request.password?.takeIf { it.isNotBlank() }
            ?: throw ValidationException("password is required")
        val firstName = request.first_name?.takeIf { it.isNotBlank() }
            ?: throw ValidationException("first_name is required")
        val lastName = request.last_name?.takeIf { it.isNotBlank() }
            ?: throw ValidationException("last_name is required")

        val result = registerGuest.execute(
            email = email,
            password = password,
            firstName = firstName,
            lastName = lastName,
        )
        return AuthResponse(
            token = result.token,
            user_id = result.userId.toString(),
            first_name = result.firstName,
        )
    }

    @PostMapping("/login")
    suspend fun login(@RequestBody request: LoginRequest): AuthResponse {
        val email = request.email?.takeIf { it.isNotBlank() }
            ?: throw ValidationException("email is required")
        val password = request.password?.takeIf { it.isNotBlank() }
            ?: throw ValidationException("password is required")

        val result = loginGuest.execute(email = email, password = password)
        return AuthResponse(
            token = result.token,
            user_id = result.userId.toString(),
            first_name = result.firstName,
        )
    }
}
