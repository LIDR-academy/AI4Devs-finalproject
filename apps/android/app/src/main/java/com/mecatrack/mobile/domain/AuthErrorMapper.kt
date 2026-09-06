package com.mecatrack.mobile.domain

object AuthErrorMapper {
    const val INVALID_CREDENTIALS = "Correo o contraseña incorrectos"
    const val TOO_MANY_ATTEMPTS = "Demasiados intentos. Intenta de nuevo más tarde."
    const val NETWORK = "Error de conexión. Verifica tu red e intenta de nuevo."

    fun mapLoginFailure(statusCode: Int?, apiMessage: String?): String {
        if (statusCode == null) {
            return NETWORK
        }

        return when (statusCode) {
            401, 403 -> INVALID_CREDENTIALS
            429 -> TOO_MANY_ATTEMPTS
            400 -> apiMessage?.trim()?.takeIf { it.isNotEmpty() } ?: NETWORK
            else -> NETWORK
        }
    }
}
