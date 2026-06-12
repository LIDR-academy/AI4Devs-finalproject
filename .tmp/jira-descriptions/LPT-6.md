## [original]

Como organizador, quiero añadir jugadores por nombre libre, buscando usuarios registrados o seleccionando de mis favoritos, para configurar la partida rápidamente.

## [enhanced]

### Contexto y alcance

Segundo paso del flujo de creación de partida (épica **Gestión de partida**), tras LPT-5. El organizador completa el roster del borrador en estado `lobby` usando tres vías de alta.

**Incluye:** alta por nombre libre (invitado), búsqueda de usuarios registrados en Firestore, selección desde favoritos locales, validación de mínimo/máximo de jugadores, opción de marcar jugador como favorito.

**Excluye:** reordenar jugadores y elegir repartidor (LPT-7), inicio de partida, flujo de rondas, sincronización en nube.

### Criterios de aceptación

1. El organizador puede añadir jugadores hasta alcanzar el `playerCount` definido en LPT-5 (3–8).
2. **Nombre libre:** campo de texto con validación (no vacío, sin duplicados de nombre en la misma partida).
3. **Usuario registrado:** búsqueda por `displayName` en colección `users` (requiere conexión); al seleccionar, se vincula `userId` y se muestra nombre/avatar.
4. **Favoritos:** lista local de jugadores frecuentes (registrados o invitados); al seleccionar, se pre-rellena el jugador.
5. No se permite el mismo `userId` dos veces en la misma partida.
6. Botón "Marcar como favorito" disponible tras añadir un jugador (persiste en almacenamiento local).
7. El organizador puede eliminar jugadores del roster mientras la partida está en `lobby`.
8. No se puede avanzar al siguiente paso (LPT-7) hasta tener exactamente `playerCount` jugadores.
9. Funciona sin cuenta; la búsqueda de usuarios registrados muestra mensaje informativo si no hay conexión.

### Modelo de datos

**Persistencia local (MVP):** jugadores del borrador en almacenamiento local asociado al `gameId`.

**Entidad `Player` (borrador):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | Identificador local del jugador en partida |
| `gameId` | string | Partida padre |
| `displayName` | string | Nombre visible |
| `userId` | string? | `null` si es invitado; `users/{uid}` si registrado |
| `isGuest` | boolean | `true` si nombre libre sin cuenta |
| `seatOrder` | number? | Asignado en LPT-7 |
| `joinedAt` | timestamp | Alta en el roster |

**Favoritos locales (`FavoritePlayer`):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | UUID local |
| `displayName` | string | Nombre |
| `userId` | string? | Opcional, si es usuario registrado |
| `createdAt` | timestamp | Fecha de alta |

**Alineación Firestore** (`games/{gameId}/players/{playerId}`): `userId`, `displayName`, `seatOrder`, `joinedAt`.

### Impacto en Security Rules

- Lectura de `users`: permitir búsqueda autenticada o lectura pública de `displayName` *(definir en implementación)*.
- Escritura en `players` subcolección: solo al sincronizar partida finalizada (fuera de alcance de este ticket).

### Firebase Auth

No obligatorio. Búsqueda de usuarios requiere conexión pero no sesión del organizador.

### Arquitectura y ficheros (`lib/features/game_setup/`)

```
lib/features/game_setup/
  domain/
    entities/player.dart, favorite_player.dart
    repositories/player_repository.dart, favorite_repository.dart, user_search_repository.dart
    usecases/add_guest_player_usecase.dart
    usecases/add_registered_player_usecase.dart
    usecases/add_player_from_favorite_usecase.dart
    usecases/remove_player_usecase.dart
    usecases/mark_player_as_favorite_usecase.dart
  data/
    models/player_model.dart, favorite_player_model.dart
    datasources/player_local_datasource.dart
    datasources/favorite_local_datasource.dart
    datasources/user_firestore_datasource.dart
    repositories/player_repository_impl.dart
    repositories/favorite_repository_impl.dart
    repositories/user_search_repository_impl.dart
  presentation/
    bloc/add_players_bloc.dart
    pages/add_players_page.dart
    widgets/player_list_tile.dart
    widgets/add_guest_form.dart
    widgets/user_search_field.dart
    widgets/favorites_picker.dart
```

**Routing:** `/games/{gameId}/players` → `AddPlayersPage`; al completar roster → `/games/{gameId}/setup` (LPT-7).

### Definición de hecho

- [ ] Tests unitarios: validación duplicados, límite de jugadores, invitado vs registrado.
- [ ] Tests BLoC (`bloc_test`): añadir/eliminar jugadores, estados de búsqueda y error de red.
- [ ] `flutter analyze` sin errores.
- [ ] Widget test del formulario de nombre libre y lista de jugadores.

### Documentación a actualizar

- `ai-specs/specs/data-model.md`: campos `isGuest`, favoritos locales *(sección nueva o nota en players)*.
- `firebase-data-access.yml`: operación `searchUsers` por `displayName`.

### Requisitos no funcionales

- **Offline:** nombre libre y favoritos sin red; búsqueda degradada con mensaje claro.
- **Rendimiento:** búsqueda con debounce ≥ 300 ms; resultados limitados a 20.
- **UX:** feedback visual al alcanzar el máximo de jugadores; confirmación al eliminar.
