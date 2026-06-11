## [original]

Como organizador, quiero reordenar los jugadores y elegir el primer repartidor (o asignarlo aleatoriamente), para respetar el orden físico de la mesa.

## [enhanced]

### Contexto y alcance

Tercer paso del flujo de creación de partida (épica **Gestión de partida**), tras LPT-6. El organizador define el orden en mesa y el primer repartidor antes de iniciar la partida.

**Incluye:** reordenación drag-and-drop (o botones subir/bajar), selección manual del primer repartidor, botón "Repartidor aleatorio", persistencia de `seatOrder` y `firstDealerPlayerId`, botón "Empezar partida".

**Excluye:** flujo de rondas (LPT-9+), edición de orden una vez iniciada la partida.

### Criterios de aceptación

1. El organizador puede reordenar la lista de jugadores mientras `status == lobby`.
2. Cada jugador muestra su posición (`seatOrder` 1-based) actualizada en tiempo real al reordenar.
3. El primer repartidor por defecto es el jugador en posición 1; el organizador puede seleccionar otro tocando su fila.
4. Botón **"Repartidor aleatorio"** asigna aleatoriamente el primer repartidor entre los jugadores del roster.
5. Al pulsar **"Empezar partida"**: persiste `seatOrder` y `firstDealerPlayerId`, cambia `status` a `in_progress`, crea la primera ronda con `dealerPlayerId == firstDealerPlayerId`, navega a fase de apuestas (LPT-9).
6. No se puede empezar sin exactamente `playerCount` jugadores.
7. Funciona sin conexión y sin cuenta.

### Modelo de datos

**Actualización local del borrador `Game`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `status` | string | `lobby` → `in_progress` al empezar |
| `firstDealerPlayerId` | string | `playerId` del primer repartidor |
| `startedAt` | timestamp | Inicio de partida |
| `currentRoundNumber` | number | `1` al empezar |

**Actualización `Player`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `seatOrder` | number | Posición en mesa (1-based) |

**Primera ronda (`Round`):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `roundNumber` | number | `1` |
| `cardsPerPlayer` | number | De `roundSequence[0]` |
| `dealerPlayerId` | string | Primer repartidor |
| `status` | string | `bidding` |

**Rotación de repartidor (dominio):** en rondas siguientes, `dealerPlayerId` rota según `seatOrder` (repartidor = jugador anterior en orden circular).

### Impacto en Security Rules

Ninguno en este ticket (solo local). Documentar: transición `lobby` → `in_progress` en Firestore requerirá permisos de `hostId`.

### Firebase Auth

No aplica.

### Arquitectura y ficheros (`lib/features/game_setup/`)

```
lib/features/game_setup/
  domain/
    usecases/reorder_players_usecase.dart
    usecases/set_first_dealer_usecase.dart
    usecases/randomize_first_dealer_usecase.dart
    usecases/start_game_usecase.dart
    services/dealer_rotation_service.dart
  presentation/
    bloc/game_setup_bloc.dart
    pages/game_setup_page.dart
    widgets/reorderable_player_list.dart
    widgets/dealer_selector.dart
    widgets/random_dealer_button.dart
```

**Routing:** `/games/{gameId}/setup` → `GameSetupPage`; al empezar → `/games/{gameId}/rounds/1/bids`.

### Definición de hecho

- [ ] Tests unitarios (`dealer_rotation_service_test.dart`): rotación circular correcta.
- [ ] Tests unitarios (`start_game_usecase_test.dart`): crea ronda 1, actualiza status.
- [ ] Tests BLoC: reordenar, aleatorio, empezar partida.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- `data-model.md`: `firstDealerPlayerId`, valores de `status` en rondas (`bidding`, `playing`, `scoring`, `closed`).

### Requisitos no funcionales

- **Offline:** completo sin red.
- **UX:** indicador visual claro del repartidor seleccionado; animación suave al reordenar.
- **Accesibilidad:** reordenación accesible sin solo drag (botones alternativos).
