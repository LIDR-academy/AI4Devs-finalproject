package com.mecatrack.mobile.ui.nav

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.mecatrack.mobile.di.AppContainer
import com.mecatrack.mobile.ui.home.HomeScreen
import com.mecatrack.mobile.ui.home.HomeViewModel
import com.mecatrack.mobile.ui.intake.IntakeViewModel
import com.mecatrack.mobile.ui.intake.IntakeWizardScreen
import com.mecatrack.mobile.ui.login.LoginScreen
import com.mecatrack.mobile.ui.login.LoginViewModel
import com.mecatrack.mobile.ui.viewModelFactory

object Routes {
    const val LOGIN = "login"
    const val HOME = "home"
    const val INTAKE = "intake"
}

@Composable
fun MecaTrackNav(
    container: AppContainer,
    navController: NavHostController = rememberNavController(),
) {
    val start = if (container.repository.isLoggedIn()) Routes.HOME else Routes.LOGIN

    NavHost(navController = navController, startDestination = start) {
        composable(Routes.LOGIN) {
            val loginViewModel: LoginViewModel = viewModel(
                factory = remember {
                    viewModelFactory {
                        LoginViewModel(container.repository, container.json)
                    }
                },
            )
            LoginScreen(
                viewModel = loginViewModel,
                onLoggedIn = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
            )
        }
        composable(Routes.HOME) {
            val homeViewModel: HomeViewModel = viewModel(
                factory = remember {
                    viewModelFactory {
                        HomeViewModel(container.repository)
                    }
                },
            )
            HomeScreen(
                viewModel = homeViewModel,
                onNewWorkOrder = { navController.navigate(Routes.INTAKE) },
                onLoggedOut = {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.HOME) { inclusive = true }
                    }
                },
            )
        }
        composable(Routes.INTAKE) {
            val intakeViewModel: IntakeViewModel = viewModel(
                factory = remember {
                    viewModelFactory {
                        IntakeViewModel(container.repository, container.json)
                    }
                },
            )
            IntakeWizardScreen(
                viewModel = intakeViewModel,
                onClose = { navController.popBackStack() },
            )
        }
    }
}
