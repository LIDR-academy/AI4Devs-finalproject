# ADR-010: MVI Pattern for the Presentation Layer

**Date:** 2026-04-12
**Status:** Accepted

## Context

DiviDox uses Compose Multiplatform for its UI across Android, iOS, and Desktop. Each screen needs a predictable, testable state management pattern. The project uses Koin for DI and `androidx.lifecycle:lifecycle-viewmodel-compose` (KMP-compatible) for ViewModel scoping.

Two common patterns were evaluated: MVVM (ViewModel + StateFlow) and MVI (Model-View-Intent with an explicit contract). Given the dividend-focused domain involves complex user interactions (period selection, currency switching, sort chips, async market data) that must be handled deterministically, MVI is the better fit.

## Decision

All feature screens follow the **MVI pattern** with an explicit `Contract` object that defines the three types in one file:

```kotlin
// LoginContract.kt
object LoginContract {

    data class State(
        val email: String = "",
        val password: String = "",
        val isPasswordVisible: Boolean = false,
        val isLoading: Boolean = false,
        val error: String? = null,
    )

    sealed interface Event {
        data class EmailChanged(val value: String) : Event
        data class PasswordChanged(val value: String) : Event
        data object TogglePasswordVisibility : Event
        data object SignInClicked : Event
        data object GoogleSignInClicked : Event
        data object ForgotPasswordClicked : Event
        data object SignUpClicked : Event
    }

    sealed interface Effect {
        data object NavigateToDashboard : Effect
        data object NavigateToSignUp : Effect
        data object NavigateToForgotPassword : Effect
        data class ShowError(val message: String) : Effect
    }
}
```

```kotlin
// LoginViewModel.kt
class LoginViewModel(
    private val signInWithEmail: SignInWithEmailUseCase,
    private val signInWithGoogle: SignInWithGoogleUseCase,
) : ViewModel() {

    private val _state = MutableStateFlow(LoginContract.State())
    val state: StateFlow<LoginContract.State> = _state.asStateFlow()

    private val _effects = Channel<LoginContract.Effect>(Channel.BUFFERED)
    val effects: Flow<LoginContract.Effect> = _effects.receiveAsFlow()

    fun onEvent(event: LoginContract.Event) {
        when (event) {
            is LoginContract.Event.EmailChanged -> _state.update { it.copy(email = event.value) }
            is LoginContract.Event.PasswordChanged -> _state.update { it.copy(password = event.value) }
            LoginContract.Event.TogglePasswordVisibility ->
                _state.update { it.copy(isPasswordVisible = !it.isPasswordVisible) }
            LoginContract.Event.SignInClicked -> signIn()
            // ...
        }
    }

    private fun signIn() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            signInWithEmail(_state.value.email, _state.value.password)
                .onSuccess { _effects.send(LoginContract.Effect.NavigateToDashboard) }
                .onFailure { _state.update { s -> s.copy(isLoading = false, error = "Incorrect email or password.") } }
        }
    }
}
```

```kotlin
// LoginScreen.kt
@Composable
fun LoginScreen(
    viewModel: LoginViewModel = koinViewModel(),
    onNavigateToDashboard: () -> Unit,
    onNavigateToSignUp: () -> Unit,
    onNavigateToForgotPassword: () -> Unit,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.effects.collect { effect ->
            when (effect) {
                LoginContract.Effect.NavigateToDashboard -> onNavigateToDashboard()
                LoginContract.Effect.NavigateToSignUp -> onNavigateToSignUp()
                LoginContract.Effect.NavigateToForgotPassword -> onNavigateToForgotPassword()
                is LoginContract.Effect.ShowError -> { /* show snackbar */ }
            }
        }
    }

    LoginContent(
        state = state,
        onEvent = viewModel::onEvent,
    )
}

@Composable
private fun LoginContent(
    state: LoginContract.State,
    onEvent: (LoginContract.Event) -> Unit,
) { /* pure UI, no ViewModel references */ }
```

## Rules

| Rule | Rationale |
|---|---|
| `State` is a `data class` with only immutable fields | Enables structural equality for Compose recomposition optimisation |
| `Event` is a `sealed interface` | All possible user inputs are enumerable and exhaustive |
| `Effect` is a `sealed interface` sent via `Channel` | One-shot side effects (navigation, toasts) must not survive recomposition; `StateFlow` would replay them |
| `Screen` composable handles effect collection and navigation callbacks | Keeps `Content` composable pure and previewable |
| `Content` composable is `private` and receives only `State` + `onEvent` | Fully testable without a ViewModel; usable in Compose Previews |
| ViewModel is injected via `koinViewModel()` | Consistent with Koin DI; no manual factory wiring |
| Navigation callbacks are passed as lambdas to `Screen` | ViewModel has zero dependency on the navigation framework |

## File Structure per Feature Screen

```
feature/{name}/presentation/{screen}/
    ├── {Screen}Contract.kt   — State, Event, Effect
    ├── {Screen}ViewModel.kt  — MVI logic, use case calls
    └── {Screen}Screen.kt     — Screen composable (effect collection + navigation) + private Content
```

## Alternatives Considered

### MVVM with `StateFlow<UiState>` only (no Effects)
- **Pros**: Simpler; fewer types to define.
- **Cons**: Navigation and one-shot side effects must be modelled as nullable state fields (e.g., `val navigateTo: Destination?`), which creates consumed-state complexity. Easy to miss clearing the event after consumption, leading to re-triggered navigation on recomposition.

### Redux-style single global store
- **Pros**: Single source of truth for the entire app.
- **Cons**: Overkill for a mobile app; poor compatibility with `ViewModel` lifecycle scoping; complex for parallel async operations per screen.

## Consequences
- **Positive**: Predictable state flow; all events are typed and traceable; easy to unit test (send events, assert state); effects are guaranteed to fire exactly once
- **Negative**: More boilerplate per screen (3 files instead of 1); contributors must follow the contract structure consistently
- **Enforcement**: Detekt rule `ForbiddenImport` can be used to prevent `MutableState` / `mutableStateOf` in ViewModel files

## Related
- [ADR-002](ADR-002-clean-architecture-auth-module-split.md): `:feature:auth` presentation structure
- [ADR-011](ADR-011-navigation.md): Navigation lambdas wired in NavGraph, not in ViewModel
