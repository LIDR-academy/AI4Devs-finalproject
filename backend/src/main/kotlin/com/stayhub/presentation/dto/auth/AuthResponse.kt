package com.stayhub.presentation.dto.auth

data class AuthResponse(
    val token: String,
    val user_id: String,
    val first_name: String,
)
