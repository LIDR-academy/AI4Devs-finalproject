## [original]

Como organizador, quiero crear una nueva partida seleccionando el número de jugadores, para que la app genere automáticamente la secuencia de rondas y el número de cartas.

## [enhanced]

### Contexto y alcance

Primera pantalla del flujo de creación de partida (épica **Gestión de partida**). El organizador elige cuántos jugadores habrá (3–8) y la app calcula y persiste la configuración base de la partida **sin intervención manual**.

**Incluye:** selector de jugadores, cálculo de baraja/rondas, creación de borrador local en estado `lobby`, vista previa de configuración y navegación al paso siguiente (añadir jugadores — LPT-6).

**Excluye (otros tickets):** añadir jugadores (LPT-6), orden/repartidor (LPT-7), repetir partida (LPT-8), flujo de rondas, sincronización Firestore (solo al finalizar partida).

### Criterios de aceptación

1. El organizador puede seleccionar un número de jugadores entre **3 y 8** (inclusive).
2. Al cambiar el número, la UI muestra en tiempo real: **cartas totales**, **máximo de cartas por jugador por ronda** y **número total de rondas**.
3. La secuencia de rondas sigue el patrón ascendente-plateau-descendente: 
1, 2, …, M (repetido N veces, siendo N el número de jugadores), M-1, …, 2, 1. 
Ejemplo con 4 jugadores (M=10): 1,2,3,4,5,6,7,8,9,10,10,10,10,9,8,7,6,5,4,3,2,1 = 22 rondas.
4. Al confirmar, se crea un borrador de partida en estado `lobby` persistido **localmente** (offline-first) con: `playerCount`, `totalCards`, `maxCardsPerRound`, `roundSequence[]` (`roundNumber`, `cardsPerPlayer`).
5. Tras confirmar, navega a la pantalla de configuración de jugadores (LPT-6) pasando el `gameId` del borrador.
6. Si el usuario cancela o vuelve atrás sin confirmar, no se persiste ningún borrador.
7. La operación funciona **sin conexión** y sin requerir cuenta.

### Tabla de configuración (PRD §6)

| Jugadores | Cartas totales | Máx. por ronda (M) | Rondas |
|-----------|----------------|--------------------|--------|
| 3 | 30 | 10 | 21 |
| 4 | 40 | 10 | 22 |
| 5 | 40 | 8 | 19 |
| 6 | 48 | 8 | 21 |
| 7 | 49 (+ comodín) | 7 | 19 |
| 8 | 48 | 6 | 18 |

### Lógica de dominio

- `GameDeckConfig`: value object inmutable por `playerCount`.
- `RoundDefinition`: `roundNumber` (1-based), `cardsPerPlayer`.
- `buildRoundSequence(maxCardsPerRound)`: genera `2*M - 1` rondas.
- `CreateGameDraftUseCase`: valida rango 3–8, resuelve config, genera secuencia, delega persistencia.
- Sin dependencias de Flutter/Firebase en `domain/`.

### Modelo de datos

**Persistencia local (MVP):** borrador en almacenamiento local del dispositivo. Firestore **no** se escribe en este paso.

**Entidad `Game` (borrador):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | Identificador local |
| `status` | string | `lobby` |
| `playerCount` | number | 3–8 (objetivo; jugadores reales se añaden en LPT-6) |
| `totalCards` | number | Según tabla |
| `maxCardsPerRound` | number | M |
| `roundSequence` | array | `{ roundNumber, cardsPerPlayer }` |
| `createdAt` | timestamp | Creación local |
| `updatedAt` | timestamp | Última modificación |

**Alineación Firestore futura** (`data-model.md`): al sincronizar, mapear a `games/{gameId}` con `status: lobby`, `maxPlayers`/`playerCount`, y subcolección `rounds` pre-generada o embebida en `settings.roundSequence` *(definir en implementación)*.

### Impacto en Security Rules

Ninguno en este ticket (solo escritura local). Documentar intención: creación en Firestore requerirá `request.auth != null` y `hostId == request.auth.uid` cuando se implemente la subida.

### Firebase Auth

No aplica. El flujo es idéntico con o sin sesión.

### Arquitectura y ficheros (`lib/features/game_setup/`)

```
lib/features/game_setup/
  domain/
    entities/game.dart, round_definition.dart
    value_objects/game_deck_config.dart
    repositories/game_repository.dart          # abstract
    usecases/create_game_draft_usecase.dart
    services/round_sequence_builder.dart       # pure Dart
  data/
    models/game_model.dart
    mappers/game_mapper.dart
    datasources/game_local_datasource.dart
    repositories/game_repository_impl.dart
  presentation/
    bloc/create_game_bloc.dart
    bloc/create_game_event.dart
    bloc/create_game_state.dart
    pages/create_game_page.dart
    widgets/player_count_selector.dart
    widgets/game_config_preview.dart
```

**Routing:** ruta `/games/new` → `CreateGamePage`; al confirmar → `/games/{gameId}/players`.

**BLoC:** eventos `PlayerCountChanged`, `CreateGameConfirmed`; estados `CreateGameInitial`, `CreateGamePreview`, `CreateGameSubmitting`, `CreateGameSuccess`, `CreateGameFailure`.

### Definición de hecho

- [ ] Tests unitarios (`round_sequence_builder_test.dart`): secuencia correcta para jugadores 3–8 (conteo, primer/último valor, pico en M).
- [ ] Tests unitarios (`create_game_draft_usecase_test.dart`): mock de `GameRepository`, validación de rango inválido.
- [ ] Tests BLoC (`bloc_test`): preview al cambiar count, éxito al confirmar, error de persistencia.
- [ ] `flutter analyze` sin errores en ficheros tocados.
- [ ] UI accesible: labels semánticos en selector, contraste suficiente.

### Documentación a actualizar

- `ai-specs/specs/data-model.md`: campos `totalCards`, `maxCardsPerRound`, `roundSequence` en `games` o `settings`.
- `docs/PRD.md`: solo si se clarifica el algoritmo de secuencia (opcional).

### Requisitos no funcionales

- **Offline:** creación y persistencia sin red.
- **Rendimiento:** cálculo de secuencia < 50 ms en dispositivo medio.
- **UX:** feedback inmediato al cambiar jugadores; botón confirmar deshabilitado durante persistencia.
