package com.stayhub.presentation.dto.auth

data class RegisterRequest(
    val email: String? = null,
    val password: String? = null,
    val first_name: String? = null,
    val last_name: String? = null,
)
