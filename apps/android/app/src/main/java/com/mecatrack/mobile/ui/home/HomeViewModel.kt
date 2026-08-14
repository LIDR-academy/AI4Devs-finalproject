package com.mecatrack.mobile.ui.home

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mecatrack.mobile.data.api.InProgressItemDto
import com.mecatrack.mobile.data.repository.MecaTrackRepository
import com.mecatrack.mobile.data.session.UserSession
import kotlinx.coroutines.launch

data class HomeUiState(
    val user: UserSession? = null,
    val items: List<InProgressItemDto> = emptyList(),
    val total: Int = 0,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
)

class HomeViewModel(
    private val repository: MecaTrackRepository,
) : ViewModel() {
    var uiState by mutableStateOf(HomeUiState(user = repository.currentUser()))
        private set

    fun refresh() {
        viewModelScope.launch {
            uiState = uiState.copy(isLoading = true, errorMessage = null)
            val result = runCatching { repository.inProgress() }
            result.fold(
                onSuccess = { response ->
                    uiState = uiState.copy(
                        isLoading = false,
                        items = response.items,
                        total = response.total,
                        errorMessage = null,
                    )
                },
                onFailure = {
                    uiState = uiState.copy(
                        isLoading = false,
                        errorMessage = LOAD_ERROR,
                    )
                },
            )
        }
    }

    fun logout(onLoggedOut: () -> Unit) {
        viewModelScope.launch {
            repository.logout()
            onLoggedOut()
        }
    }

    companion object {
        const val LOAD_ERROR = "No se pudieron cargar las órdenes."
    }
}
