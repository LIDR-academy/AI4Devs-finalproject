package com.mecatrack.mobile.ui.login

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mecatrack.mobile.data.api.readApiError
import com.mecatrack.mobile.data.repository.MecaTrackRepository
import com.mecatrack.mobile.domain.ApiErrors
import com.mecatrack.mobile.domain.AuthErrorMapper
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import retrofit2.HttpException

data class LoginUiState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
)

class LoginViewModel(
    private val repository: MecaTrackRepository,
    private val json: Json,
) : ViewModel() {
    var uiState by mutableStateOf(LoginUiState())
        private set

    fun onEmailChange(value: String) {
        uiState = uiState.copy(email = value, errorMessage = null)
    }

    fun onPasswordChange(value: String) {
        uiState = uiState.copy(password = value, errorMessage = null)
    }

    fun submit(onSuccess: () -> Unit) {
        val email = uiState.email.trim()
        if (email.isEmpty() || uiState.password.isBlank()) {
            uiState = uiState.copy(errorMessage = "Introduce correo y contraseña")
            return
        }
        if (!EMAIL_PATTERN.matches(email)) {
            uiState = uiState.copy(errorMessage = "Introduce un correo electrónico válido")
            return
        }
        viewModelScope.launch {
            uiState = uiState.copy(isLoading = true, errorMessage = null)
            val result = runCatching { repository.login(email, uiState.password) }
            uiState = uiState.copy(isLoading = false)
            result.fold(
                onSuccess = { onSuccess() },
                onFailure = { error ->
                    val http = error as? HttpException
                    val parsed = readApiError(error, json)
                    uiState = uiState.copy(
                        errorMessage = AuthErrorMapper.mapLoginFailure(
                            http?.code(),
                            ApiErrors.messageFrom(parsed.second),
                        ),
                    )
                },
            )
        }
    }

    private companion object {
        val EMAIL_PATTERN = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
    }
}
