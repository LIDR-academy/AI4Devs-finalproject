## [original]

Como organizador, quiero ver el resultado de cada ronda con ranking y puntuación acumulada, para que todos los jugadores conozcan su posición.

## [enhanced]

### Contexto y alcance

Pantalla de resultado tras cerrar una ronda (épica **Flujo de ronda**), después de LPT-11. Muestra ranking, puntuaciones y delta respecto a la ronda anterior.

**Incluye:** tabla/lista ordenada por `totalScore` desc, puntos ganados en la ronda (`scoresDelta`), delta vs ronda anterior, botón siguiente ronda o resultado final.

**Excluye:** edición de datos, subida a nube (al finalizar última ronda — ticket de sincronización).

### Criterios de aceptación

1. Tras cerrar ronda (LPT-11), se muestra ranking de jugadores ordenado por `totalScore` descendente (empates: mismo puesto).
2. Por jugador: nombre, puntos de la ronda (`scoresDelta`), puntuación acumulada, **delta** respecto al `totalScore` antes de la ronda (opcional: flecha ↑/↓).
3. Cabecera: número de ronda, repartidor de la ronda.
4. Si **no** es la última ronda: botón **"Siguiente ronda"** crea ronda `n+1` con repartidor rotado y navega a apuestas (LPT-9).
5. Si es la **última ronda**: botón **"Ver resultado final"** cambia `game.status` a `finished`, muestra pantalla de resultado final de partida.
6. Funciona offline.

### Modelo de datos

**Lectura:**

- `Round.scoresDelta`, `Round.roundNumber`, `Round.dealerPlayerId`
- `Player.totalScore`, `Player.displayName`
- `Game.roundSequence` para saber si quedan rondas

**Escritura al avanzar:**

- Nueva `Round` con `roundNumber+1`, `dealerPlayerId` rotado, `status: bidding`
- O `Game.status: finished`, `finishedAt` si última ronda

### Impacto en Security Rules

Solo local.

### Firebase Auth

No aplica.

### Arquitectura y ficheros (`lib/features/round/`)

```
lib/features/round/
  domain/
    services/ranking_service.dart
    usecases/get_round_result_usecase.dart
    usecases/advance_to_next_round_usecase.dart
    usecases/finish_game_usecase.dart
  presentation/
    bloc/round_result_bloc.dart
    pages/round_result_page.dart
    widgets/ranking_list.dart
    widgets/score_delta_chip.dart
    pages/game_final_result_page.dart
```

**Routing:** `/games/{gameId}/rounds/{roundNumber}/result`; final → `/games/{gameId}/final`.

### Definición de hecho

- [ ] Tests unitarios (`ranking_service_test.dart`): orden, empates.
- [ ] Tests unitarios: `advance_to_next_round` rota repartidor correctamente.
- [ ] Tests BLoC: última ronda vs ronda intermedia.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- `data-model.md`: `finishedAt`, transición `in_progress` → `finished`.

### Requisitos no funcionales

- **Offline:** obligatorio.
- **UX:** ranking legible en pantalla compartida; animación sutil al mostrar delta.
