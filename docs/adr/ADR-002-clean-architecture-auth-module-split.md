# ADR-002: Clean Architecture for Auth — :component vs :feature Split

## Status
Accepted

## Context
The project follows a multi-module architecture where:
- **`:component`** modules own the **data + domain** layers (no UI, no Compose)
- **`:feature`** modules own the **presentation** layer (MVI, ViewModel, Composable screens)

The auth module exists as an empty skeleton at `:feature:auth`. We need to split it properly.

## Decision
Create **`:component:auth`** for data+domain and use the existing **`:feature:auth`** for presentation only.

```
:component:auth  (dividox.kmp.library + dividox.kmp.di)
└── src/commonMain/kotlin/com/akole/dividox/component/auth/
    ├── domain/
    │   ├── model/
    │   │   ├── AuthUser.kt
    │   │   └── AuthProvider.kt       # enum: GOOGLE, EMAIL (APPLE deferred to post-v1)
    │   ├── repository/
    │   │   └── AuthRepository.kt     # interface
    │   └── usecase/
    │       ├── SignInWithGoogleUseCase.kt
    │       ├── SignInWithEmailUseCase.kt
    │       ├── SignUpWithEmailUseCase.kt
    │       ├── ForgotPasswordUseCase.kt
    │       ├── SignOutUseCase.kt
    │       └── ObserveAuthStateUseCase.kt
    └── data/
        ├── datasource/
        │   └── AuthDataSource.kt     # expect class
        └── repository/
            └── AuthRepositoryImpl.kt

:feature:auth  (dividox.kmp.library + dividox.compose.multiplatform + dividox.kmp.di)
└── src/commonMain/kotlin/com/akole/dividox/feature/auth/
    └── presentation/
        ├── login/
        │   ├── LoginContract.kt
        │   ├── LoginViewModel.kt
        │   └── LoginScreen.kt
        ├── signup/
        │   ├── SignUpContract.kt
        │   ├── SignUpViewModel.kt
        │   └── SignUpScreen.kt
        ├── forgotpassword/
        │   ├── ForgotPasswordContract.kt
        │   ├── ForgotPasswordViewModel.kt
        │   └── ForgotPasswordScreen.kt
        └── navigation/
            └── AuthNavigation.kt
```

`:feature:auth` depends on `:component:auth`.

## Consequences
- **Positive**: Domain/data fully testable without Compose; clean separation of concerns; consistent with project conventions
- **Negative**: Two modules to configure instead of one
- **Rule**: Never import Compose or UI dependencies in `:component:auth`

## Related
- [ADR-001](ADR-001-firebase-authentication-backend.md): Firebase as Authentication Backend
- [ADR-003](ADR-003-secure-token-session-storage.md): Secure Token Storage
- DVX-11: Create :component:auth and Domain Layer
- DVX-16: Auth UI Layer in :feature:auth
