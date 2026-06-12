## [original]

Como organizador, quiero introducir las apuestas de cada jugador en orden (repartidor al final) con validación de la restricción en tiempo real, para cerrar la fase de apuestas sin errores.

## [enhanced]

### Contexto y alcance

Primera fase de cada ronda (épica **Flujo de ronda**). El organizador introduce las apuestas en orden rotativo; el repartidor apuesta siempre el último.

**Incluye:** UI secuencial de apuestas, indicadores de bazas disponibles y número prohibido para el repartidor, validación en tiempo real de la restricción del repartidor, bloqueo al cerrar si es inválido.

**Excluye:** pantalla de juego (LPT-10), introducción de bazas reales (LPT-11), corrección posterior (LPT-12).

### Criterios de aceptación

1. Las apuestas se introducen en orden de `seatOrder`, comenzando por el jugador siguiente al repartidor; el **repartidor apuesta el último**.
2. Cada apuesta es un entero entre **0** y `cardsPerPlayer` de la ronda actual (inclusive).
3. Durante la introducción se muestra en tiempo real:
   - Bazas ya apostadas (suma parcial).
   - Bazas restantes disponibles (`cardsPerPlayer - suma parcial`).
   - Para el repartidor: **número prohibido** = bazas restantes al llegar su turno.
4. **Restricción del repartidor:** la suma total de apuestas **no puede igualar** `cardsPerPlayer`. Si el repartidor intenta apostar el valor prohibido, se bloquea la confirmación con mensaje explicativo.
5. Botón "Cerrar apuestas" habilitado solo cuando todas las apuestas están registradas y la restricción se cumple.
6. Al cerrar: `round.status` pasa a `playing`; navega a pantalla de juego (LPT-10).
7. Funciona offline.

### Reglas de dominio

```
availableTricks = cardsPerPlayer - sum(bids so far)
forbiddenBidForDealer = availableTricks  # cuando le toca al repartidor
validClose = sum(allBids) != cardsPerPlayer
```

**Puntuación (referencia, cálculo en LPT-11):** acierto `10 + 5×bazas`; fallo `-5×|apuesta - bazas|`.

### Modelo de datos

**`Round` (ronda actual):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `bids` | map\<playerId, number\> | Apuestas por jugador |
| `status` | string | `bidding` → `playing` |
| `cardsPerPlayer` | number | De `roundSequence` |
| `dealerPlayerId` | string | Repartidor de la ronda |

**Alineación Firestore** (`rounds/{roundId}`): `bid` como map o estructura acordada en `data-model.md`.

### Impacto en Security Rules

Solo local en MVP. En nube: solo `hostId` puede escribir `bids` con `status == bidding`.

### Firebase Auth

No aplica durante el juego local.

### Arquitectura y ficheros (`lib/features/round/`)

```
lib/features/round/
  domain/
    entities/round.dart, bid_entry.dart
    value_objects/dealer_restriction.dart
    services/bid_order_service.dart
    services/dealer_restriction_validator.dart
    usecases/submit_bid_usecase.dart
    usecases/close_bidding_usecase.dart
  data/
    models/round_model.dart
    datasources/round_local_datasource.dart
  presentation/
    bloc/bidding_bloc.dart
    pages/bidding_page.dart
    widgets/bid_input_stepper.dart
    widgets/tricks_balance_indicator.dart
    widgets/forbidden_bid_warning.dart
```

**Routing:** `/games/{gameId}/rounds/{roundNumber}/bids`.

### Definición de hecho

- [ ] Tests unitarios (`dealer_restriction_validator_test.dart`): casos límite (suma = cardsPerPlayer, repartidor con prohibido).
- [ ] Tests unitarios (`bid_order_service_test.dart`): orden correcto según seatOrder y dealer.
- [ ] Tests BLoC: flujo completo de apuestas, bloqueo en prohibido, cierre válido.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- `data-model.md`: estructura de `bids`/`bid` en `rounds`.
- `data-model.md` § restricción repartidor (regla de negocio explícita).

### Requisitos no funcionales

- **Offline:** obligatorio.
- **UX:** número prohibido destacado visualmente; no requiere explicación oral en mesa.
- **Rendimiento:** validación instantánea (< 16 ms) en cada cambio de apuesta.
