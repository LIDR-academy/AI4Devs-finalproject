# ADR-011: Navigation with Compose Navigation (KMP)

**Date:** 2026-04-12
**Status:** Accepted

## Context

DiviDox targets Android, iOS, and Desktop (JVM). Navigation must work on all three platforms from `commonMain`. The app has two top-level navigation scopes:

1. **Auth graph** — Login, Sign Up, Forgot Password (unauthenticated)
2. **Main graph** — Dashboard, Portfolio (My Holdings), Dividend Activity, Analysis, Search, Favorites, Security Detail, Add/Edit Holding, Profile & Settings (authenticated)

A navigation guard must redirect unauthenticated users to the Auth graph and clear the back stack after successful login.

## Decision

Use **`org.jetbrains.androidx.navigation:navigation-compose`** (the KMP-compatible Compose Navigation library, version aligned with `androidx-navigation` in `libs.versions.toml`).

### Route definition

Routes are typed using `@Serializable` data classes / objects:

```kotlin
// common:ui-resources or a dedicated :common:navigation module
@Serializable object LoginRoute
@Serializable object SignUpRoute
@Serializable object ForgotPasswordRoute

@Serializable object DashboardRoute
@Serializable object PortfolioRoute
@Serializable object DividendsRoute
@Serializable object AnalysisRoute
@Serializable object FavoritesRoute
@Serializable object SearchRoute
@Serializable object SettingsRoute

@Serializable data class SecurityDetailRoute(val ticker: String)
@Serializable data class EditHoldingRoute(val holdingId: String)
@Serializable object AddHoldingRoute
```

### Graph structure

```kotlin
// composeApp — RootNavGraph.kt
@Composable
fun RootNavGraph(authState: Flow<AuthUser?>) {
    val navController = rememberNavController()
    val user by authState.collectAsStateWithLifecycle(null)

    LaunchedEffect(user) {
        if (user == null) {
            navController.navigate(LoginRoute) {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    NavHost(navController, startDestination = if (user != null) DashboardRoute else LoginRoute) {
        authGraph(navController)
        mainGraph(navController)
    }
}

// Auth graph
fun NavGraphBuilder.authGraph(navController: NavController) {
    composable<LoginRoute> {
        LoginScreen(
            onNavigateToDashboard = {
                navController.navigate(DashboardRoute) {
                    popUpTo(LoginRoute) { inclusive = true }
                }
            },
            onNavigateToSignUp = { navController.navigate(SignUpRoute) },
            onNavigateToForgotPassword = { navController.navigate(ForgotPasswordRoute) },
        )
    }
    composable<SignUpRoute> { /* ... */ }
    composable<ForgotPasswordRoute> { /* ... */ }
}

// Main graph with bottom nav
fun NavGraphBuilder.mainGraph(navController: NavController) {
    composable<DashboardRoute> {
        DashboardScreen(
            onSecurityClick = { ticker -> navController.navigate(SecurityDetailRoute(ticker)) },
            onViewAllFavorites = { navController.navigate(FavoritesRoute) },
        )
    }
    composable<PortfolioRoute> {
        PortfolioScreen(
            onAddHolding = { navController.navigate(AddHoldingRoute) },
            onEditHolding = { id -> navController.navigate(EditHoldingRoute(id)) },
            onSecurityClick = { ticker -> navController.navigate(SecurityDetailRoute(ticker)) },
        )
    }
    // ... other destinations
    composable<SecurityDetailRoute> { backStackEntry ->
        val route: SecurityDetailRoute = backStackEntry.toRoute()
        SecurityDetailScreen(
            ticker = route.ticker,
            onAddToPortfolio = { navController.navigate(AddHoldingRoute) },
            onBack = { navController.popBackStack() },
        )
    }
}
```

### Bottom navigation bar

The bottom nav bar (`BottomNavBar`) is rendered inside the main graph scaffold. It is driven by `navController.currentBackStackEntryAsState()` to highlight the active tab. Tapping a tab navigates with `saveState = true` and `restoreState = true` to preserve scroll/state per tab.

## Rules

| Rule | Rationale |
|---|---|
| ViewModels have **zero** knowledge of `NavController` | Navigation is driven by `Effect` lambdas passed to `Screen` composables (ADR-010) |
| All routes are `@Serializable` | Type-safe navigation; no raw strings |
| Auth guard lives in `RootNavGraph`, not in individual screens | Single enforcement point |
| Back stack is cleared on successful login (`popUpTo(0)`) | User cannot navigate back to Login after authenticating |
| Tab navigation uses `saveState`/`restoreState` | Preserves scroll position and ViewModel state per bottom nav tab |

## Alternatives Considered

### Voyager (KMP navigation library)
- **Pros**: Purpose-built for KMP, simpler API for non-Compose-Navigation teams.
- **Cons**: Not backed by Jetpack/Google; diverges from the Jetpack Navigation paradigm the team already knows; less tooling support (Deep Links, Navigation Editor in Android Studio).

### Custom navigator (StateFlow-based)
- **Pros**: Full control; no library dependency.
- **Cons**: High implementation cost; reimplements back stack management, deep links, SavedStateHandle integration.

### Decompose
- **Pros**: Mature KMP navigation, supports back handling on all platforms.
- **Cons**: Forces a Component-based architecture that conflicts with the established ViewModel/MVI pattern; steep learning curve.

## Consequences
- **Positive**: Single navigation library for all platforms; deep link support out of the box; familiar to Android developers; type-safe routes prevent runtime crashes from mismatched string arguments
- **Negative**: `navigation-compose` is a Jetpack library ported to KMP — iOS/Desktop behaviour may lag behind Android; Desktop back navigation must be handled manually (keyboard shortcut or hardware back button)
- **Desktop note**: Desktop has no hardware back button. Screens that need "back" must render an explicit back arrow in the UI (already established in the Stitch designs).

## Related
- [ADR-010](ADR-010-mvi-presentation-pattern.md): MVI effects drive navigation callbacks
- [ADR-002](ADR-002-clean-architecture-auth-module-split.md): Auth module structure
