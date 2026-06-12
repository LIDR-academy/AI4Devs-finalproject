## [original]

Como jugador, quiero ver un listado de todas mis partidas jugadas (locales y en nube), para consultar mi historial de juego.

## [enhanced]

### Contexto y alcance

Pantalla principal del épica **Historial**. Listado unificado de partidas locales y sincronizadas en nube con diferenciación visual.

**Incluye:** lista ordenada por fecha descendente, icono/badge local vs nube, datos resumen (fecha, jugadores, ganador o puntuación líder), navegación a detalle (LPT-16), estado vacío, pull-to-refresh para partidas en nube.

**Excluye:** detalle ronda a ronda (LPT-16), eliminación (LPT-17), repetir partida (LPT-8).

### Criterios de aceptación

1. El usuario ve un listado de partidas con `status == finished` (locales y nube).
2. Cada ítem muestra: fecha de finalización, número de jugadores, icono **local** (dispositivo) o **nube** (Firebase), nombre del líder o puntuación ganadora.
3. Ordenación por `finishedAt` descendente (más reciente primero).
4. Tap en ítem navega a detalle (LPT-16).
5. Sin conexión: se muestran solo partidas locales; indicador de "sin sincronizar" si hay cuenta pero no hay red.
6. Con conexión y sesión: se fusionan partidas locales y `games` de Firestore donde el usuario es `hostId` o está en `players` con su `userId`; deduplicar por `cloudGameId` si una local ya fue subida.
7. Estado vacío con mensaje amigable si no hay partidas.
8. Funciona sin cuenta (solo historial local).

### Modelo de datos

**Fuentes:**

| Origen | Consulta |
|--------|----------|
| Local | `Game` where `status == finished` |
| Firestore | `games` where `hostId == uid` OR `players` contains uid *(índice/query TBD)* |

**DTO `GameHistoryItem`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID local o cloud |
| `source` | enum | `local`, `cloud` |
| `finishedAt` | timestamp | Fecha fin |
| `playerCount` | number | Jugadores |
| `winnerName` | string? | Líder |
| `cloudGameId` | string? | Para deduplicación |

### Impacto en Security Rules

- `games`: lectura para `hostId` y participantes en `players`.
- Listado solo de partidas `finished`.

### Firebase Auth

Opcional. Sin sesión: solo listado local. Con sesión: merge con nube.

### Arquitectura y ficheros (`lib/features/history/`)

```
lib/features/history/
  domain/
    entities/game_history_item.dart
    repositories/history_repository.dart
    usecases/get_game_history_usecase.dart
  data/
    datasources/history_local_datasource.dart
    datasources/history_firestore_datasource.dart
    repositories/history_repository_impl.dart
  presentation/
    bloc/history_list_bloc.dart
    pages/history_list_page.dart
    widgets/game_history_tile.dart
    widgets/source_badge.dart
    widgets/empty_history_view.dart
```

**Routing:** `/history` → `HistoryListPage`; tap → `/history/{gameId}`.

### Definición de hecho

- [ ] Tests unitarios: merge local+nube, deduplicación.
- [ ] Tests BLoC: carga, vacío, error de red.
- [ ] Widget test: tile con badge local/cloud.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- `firebase-data-access.yml`: queries de listado por host y participante.
- `data-model.md`: campo `cloudGameId` en partida local para trazabilidad.

### Requisitos no funcionales

- **Offline:** listado local siempre disponible.
- **Rendimiento:** lista virtualizada (`ListView.builder`); carga inicial < 500 ms para 100 partidas locales.
- **UX:** pull-to-refresh solo cuando hay sesión y red.
