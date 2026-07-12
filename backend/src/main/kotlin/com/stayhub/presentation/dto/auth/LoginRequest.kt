package com.stayhub.presentation.dto.auth

data class LoginRequest(
    val email: String? = null,
    val password: String? = null,
)
