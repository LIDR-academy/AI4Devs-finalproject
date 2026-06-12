## [original]

Como jugador, quiero gestionar mi lista de favoritos (añadir y eliminar), para mantenerla actualizada.

## [enhanced]

### Contexto y alcance

Gestión de la lista de **favoritos locales** (épica **Jugadores y favoritos**, PRD §6). Pantalla dedicada para consultar, añadir y eliminar jugadores frecuentes.

**Incluye:** listado de favoritos, eliminar favorito, añadir favorito manual (nombre libre o búsqueda de usuario), integración con selector de favoritos en LPT-6.

**Excluye:** sincronización de favoritos en nube (MVP: solo local).

### Criterios de aceptación

1. Pantalla accesible desde menú/perfil o desde flujo de añadir jugadores.
2. Lista todos los `FavoritePlayer` almacenados localmente.
3. **Eliminar:** swipe o botón elimina favorito tras confirmación (o undo snackbar).
4. **Añadir:** formulario con nombre libre o búsqueda de usuario registrado (misma lógica que LPT-6); no duplicar si ya existe mismo `userId` o mismo `displayName` (case-insensitive).
5. Cada favorito muestra: nombre, indicador si es usuario registrado (avatar/icono).
6. Los cambios se reflejan inmediatamente en el picker de LPT-6.
7. Funciona sin cuenta y sin conexión (excepto búsqueda de usuarios al añadir registrado).
8. Sin límite de favoritos en MVP (PRD post-MVP: límite no incluido).

### Modelo de datos

**Almacenamiento local `FavoritePlayer`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | Identificador |
| `displayName` | string | Nombre visible |
| `userId` | string? | Si es usuario registrado |
| `createdAt` | timestamp | Alta |

**Sin colección Firestore** en MVP.

### Impacto en Security Rules

Ninguno (100% local).

### Firebase Auth

Opcional. Búsqueda de usuarios al añadir registrado requiere conexión, no sesión obligatoria.

### Arquitectura y ficheros (`lib/features/favorites/`)

```
lib/features/favorites/
  domain/
    entities/favorite_player.dart
    repositories/favorite_repository.dart
    usecases/get_favorites_usecase.dart
    usecases/add_favorite_usecase.dart
    usecases/remove_favorite_usecase.dart
  data/
    models/favorite_player_model.dart
    datasources/favorite_local_datasource.dart
    repositories/favorite_repository_impl.dart
  presentation/
    bloc/favorites_bloc.dart
    pages/favorites_page.dart
    widgets/favorite_list_tile.dart
    widgets/add_favorite_fab.dart
```

**Routing:** `/favorites` → `FavoritesPage`.

**Relación con LPT-6:** `FavoriteRepository` compartido vía inyección de dependencias.

### Definición de hecho

- [ ] Tests unitarios: add/remove, deduplicación por userId y displayName.
- [ ] Tests BLoC: listado, añadir, eliminar.
- [ ] Widget test: lista vacía y con ítems.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- `data-model.md`: sección "Favoritos locales" (fuera de Firestore en MVP).
- `firebase-data-access.yml`: nota "favorites: local only".

### Requisitos no funcionales

- **Offline:** listado y CRUD local sin red.
- **Rendimiento:** carga instantánea (< 100 ms para listas razonables).
- **UX:** estado vacío con CTA para añadir primer favorito.
