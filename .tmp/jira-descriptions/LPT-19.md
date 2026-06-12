## [original]

Como jugador, quiero registrarme y hacer login con email y contraseña, para poder sincronizar mis partidas en la nube.

## [enhanced]

### Contexto y alcance

Épica **Cuenta y sincronización**. Implementa autenticación opcional con Firebase Auth (email/contraseña). Sin cuenta, la app sigue funcionando igual en local (PRD §6).

**Incluye:** pantallas de registro y login, validación de formularios, creación/actualización de perfil `users/{uid}`, gestión de sesión (BLoC), navegación condicional, logout, mensajes de error de Auth traducidos.

**Excluye:** subida de partidas (LPT-20), recepción automática en historial (LPT-21), OAuth, recuperación de contraseña *(post-MVP si no está en alcance)*, subida de partidas locales previas al registro.

### Criterios de aceptación

1. El usuario puede **registrarse** con email y contraseña (mínimo 8 caracteres, validación de formato email).
2. Tras registro exitoso, se crea documento `users/{uid}` con `displayName` (solicitado en registro), `email`, `createdAt`, `updatedAt`.
3. El usuario puede **iniciar sesión** con email y contraseña existentes.
4. El usuario puede **cerrar sesión** desde perfil/ajustes.
5. `AuthBloc` expone estados `Authenticated`, `Unauthenticated`, `AuthLoading`, `AuthFailure` y escucha `authStateChanges`.
6. La navegación principal funciona sin sesión; opciones de cuenta visibles pero no bloquean el flujo de juego local.
7. Errores comunes mapeados a mensajes UI: email en uso, credenciales inválidas, red no disponible.
8. Tras login/registro, el `displayName` queda disponible para búsqueda de usuarios (LPT-6).

### Modelo de datos

**Firebase Auth:** `uid`, `email` (gestionados por Auth).

**Firestore `users/{userId}`** (`userId == Auth.uid`):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `displayName` | string | Nombre visible (obligatorio, no vacío) |
| `email` | string | Email del usuario |
| `photoUrl` | string? | Opcional |
| `createdAt` | timestamp | Alta |
| `updatedAt` | timestamp | Última modificación |

### Impacto en Security Rules

```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow create, update: if request.auth != null && request.auth.uid == userId;
  allow delete: if false; // MVP
}
```

Validar en reglas que `displayName` no esté vacío en escrituras.

### Firebase Auth

| Operación | SDK |
|-----------|-----|
| Registro | `createUserWithEmailAndPassword` |
| Login | `signInWithEmailAndPassword` |
| Logout | `signOut` |
| Estado sesión | `authStateChanges` |

Tras registro/login: `doc('users/${uid}').set(..., SetOptions(merge: true))`.

### Arquitectura y ficheros (`lib/features/auth/`)

```
lib/features/auth/
  domain/
    entities/user_profile.dart
    repositories/auth_repository.dart
    usecases/sign_up_usecase.dart
    usecases/sign_in_usecase.dart
    usecases/sign_out_usecase.dart
    usecases/get_current_user_usecase.dart
  data/
    models/user_profile_model.dart
    datasources/auth_firebase_datasource.dart
    datasources/user_firestore_datasource.dart
    repositories/auth_repository_impl.dart
  presentation/
    bloc/auth_bloc.dart
    pages/sign_in_page.dart
    pages/sign_up_page.dart
    pages/profile_page.dart
    widgets/auth_text_field.dart
```

**Routing:** `/auth/sign-in`, `/auth/sign-up`; guard opcional que no bloquea rutas de juego local.

**Inyección:** `AuthRepository` en root; `AuthBloc` como `BlocProvider` global.

### Definición de hecho

- [ ] Tests unitarios: `SignUpUseCase`, `SignInUseCase` con mock de `AuthRepository`.
- [ ] Tests BLoC (`bloc_test`): registro, login, logout, errores.
- [ ] `flutter analyze` sin errores.
- [ ] Prueba manual con Firebase Emulator Suite (Auth + Firestore).

### Documentación a actualizar

- `firebase-data-access.yml`: flujos Auth ya definidos — verificar `profileSync`.
- `data-model.md`: confirmar campos obligatorios de `users`.
- `firestore.rules`: reglas de `users/{userId}`.

### Requisitos no funcionales

- **Offline:** login/registro requieren red; la app sin sesión funciona offline.
- **Seguridad:** no persistir contraseñas; usar solo SDK Auth.
- **UX:** indicador de carga durante Auth; formularios accesibles con labels.
