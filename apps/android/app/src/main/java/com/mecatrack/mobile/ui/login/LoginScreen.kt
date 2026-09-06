package com.mecatrack.mobile.ui.login

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.mecatrack.mobile.ui.components.AppTextField
import com.mecatrack.mobile.ui.components.ErrorBanner

@Composable
fun LoginScreen(
    viewModel: LoginViewModel,
    onLoggedIn: () -> Unit,
) {
    val state = viewModel.uiState

    Column(
        modifier = Modifier
            .fillMaxSize()
            .systemBarsPadding()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = "MecaTrack",
            style = MaterialTheme.typography.headlineMedium,
        )
        Text(
            text = "Ingreso de taller",
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.padding(top = 4.dp, bottom = 24.dp),
        )
        ErrorBanner(state.errorMessage)
        AppTextField(
            value = state.email,
            onValueChange = viewModel::onEmailChange,
            label = "Correo",
            enabled = !state.isLoading,
        )
        AppTextField(
            value = state.password,
            onValueChange = viewModel::onPasswordChange,
            label = "Contraseña",
            enabled = !state.isLoading,
            isPassword = true,
            modifier = Modifier.padding(top = 8.dp),
        )
        if (state.isLoading) {
            CircularProgressIndicator(
                modifier = Modifier
                    .padding(top = 24.dp)
                    .align(Alignment.CenterHorizontally),
            )
        } else {
            Button(
                onClick = { viewModel.submit(onLoggedIn) },
                enabled = state.email.isNotBlank() && state.password.isNotBlank(),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 24.dp),
            ) {
                Text("Entrar")
            }
        }
    }
}
