## [original]

Como organizador, quiero ver durante el juego las apuestas, puntuación acumulada y balance de bazas de cada jugador, para que todos puedan seguir el estado de la partida.

## [enhanced]

### Contexto y alcance

Pantalla de juego durante la fase física (épica **Flujo de ronda**), tras cerrar apuestas (LPT-9). Vista de solo lectura del estado de la ronda y partida para consulta en mesa.

**Incluye:** listado de jugadores con apuesta de la ronda, puntuación acumulada total, balance de bazas (suma apostada vs `cardsPerPlayer`), indicador de repartidor, botón para pasar a introducir bazas reales (LPT-11).

**Excluye:** edición de apuestas (LPT-12), cálculo de puntos de ronda (LPT-11).

### Criterios de aceptación

1. Tras cerrar apuestas, se muestra pantalla de juego con todos los jugadores ordenados por `seatOrder`.
2. Por cada jugador se muestra: nombre, apuesta de la ronda actual, puntuación acumulada (`totalScore`), indicador si es repartidor.
3. Cabecera o panel resumen muestra: número de ronda, cartas por jugador, **balance de bazas** (`suma apuestas / cardsPerPlayer`), confirmación visual de restricción cumplida.
4. La pantalla es de **solo lectura** (no se editan datos en esta vista).
5. Botón **"Introducir bazas"** navega a LPT-11.
6. Opción de volver a corregir apuestas (atajo a LPT-12) visible pero secundaria.
7. Funciona offline; diseño legible a distancia (tipografía grande, contraste alto — persona Carlos del PRD).

### Modelo de datos

**Lectura desde:**

- `Round.bids`, `Round.cardsPerPlayer`, `Round.dealerPlayerId`, `Round.roundNumber`
- `Player.displayName`, `Player.totalScore`, `Player.seatOrder`

Sin escrituras en esta pantalla.

### Impacto en Security Rules

Ninguno (solo lectura local).

### Firebase Auth

No aplica.

### Arquitectura y ficheros (`lib/features/round/`)

```
lib/features/round/
  domain/
    usecases/get_round_play_state_usecase.dart
  presentation/
    bloc/play_state_bloc.dart
    pages/play_page.dart
    widgets/player_play_card.dart
    widgets/tricks_balance_banner.dart
    widgets/round_header.dart
```

**Routing:** `/games/{gameId}/rounds/{roundNumber}/play`.

### Definición de hecho

- [ ] Widget test: renderiza apuestas y scores correctos con datos mock.
- [ ] Tests BLoC: carga estado de ronda en `playing`.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- Ninguna obligatoria (UI de consulta).

### Requisitos no funcionales

- **Offline:** obligatorio.
- **UX:** estado comprensible de un vistazo; sin scroll excesivo en 8 jugadores.
- **Accesibilidad:** `Semantics` en puntuaciones y apuestas; soporte tamaño de fuente del sistema.
