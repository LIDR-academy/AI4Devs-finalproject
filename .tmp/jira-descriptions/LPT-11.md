## [original]

Como organizador, quiero introducir las bazas reales obtenidas y que la app calcule los puntos automáticamente, para eliminar errores de cálculo.

## [enhanced]

### Contexto y alcance

Fase de puntuación de cada ronda (épica **Flujo de ronda**), tras la pantalla de juego (LPT-10). El organizador registra las bazas reales y la app calcula y persiste los puntos.

**Incluye:** entrada de bazas por jugador, validación de suma = `cardsPerPlayer`, cálculo automático de puntos, actualización de `totalScore`, transición a resultado de ronda (LPT-14).

**Excluye:** corrección de apuestas (LPT-12), repetir ronda (LPT-13).

### Criterios de aceptación

1. El organizador introduce las bazas reales (0–`cardsPerPlayer`) para cada jugador.
2. **Validación:** la suma de bazas reales debe igualar `cardsPerPlayer`; no se puede confirmar si no cuadra.
3. **Cálculo de puntos por jugador:**
   - Si `bazas == apuesta`: `puntos = 10 + (5 × bazas)`
   - Si `bazas != apuesta`: `puntos = -5 × |apuesta - bazas|`
4. Se actualiza `Player.totalScore` += puntos de la ronda.
5. Se persiste en la ronda: `tricks` (map por playerId), `scoresDelta` (map por playerId), `status: closed`, `closedAt`.
6. Al confirmar, navega a pantalla de resultado (LPT-14).
7. Si no es la última ronda, LPT-14 ofrecerá avanzar a la siguiente (creando ronda con repartidor rotado).
8. Funciona offline.

### Reglas de dominio

```dart
int calculateRoundScore(int bid, int tricks) {
  if (bid == tricks) return 10 + (5 * tricks);
  return -5 * (bid - tricks).abs();
}
```

### Modelo de datos

**`Round` (actualización al cerrar):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `tricks` | map\<playerId, number\> | Bazas reales |
| `scoresDelta` | map\<playerId, number\> | Puntos de la ronda |
| `status` | string | `closed` |
| `closedAt` | timestamp | Cierre |

**`Player`:** `totalScore` incrementado.

### Impacto en Security Rules

Solo local. En Firestore: escritura de `scoresDelta` y `totalScore` por `hostId`.

### Firebase Auth

No aplica.

### Arquitectura y ficheros (`lib/features/round/`)

```
lib/features/round/
  domain/
    services/score_calculator_service.dart
    services/tricks_sum_validator.dart
    usecases/submit_tricks_usecase.dart
    usecases/close_round_usecase.dart
  presentation/
    bloc/scoring_bloc.dart
    pages/scoring_page.dart
    widgets/trick_input_stepper.dart
    widgets/tricks_sum_indicator.dart
```

**Routing:** `/games/{gameId}/rounds/{roundNumber}/tricks`.

### Definición de hecho

- [ ] Tests unitarios (`score_calculator_service_test.dart`): acierto, fallo, casos 0 bazas.
- [ ] Tests unitarios (`tricks_sum_validator_test.dart`): suma inválida bloqueada.
- [ ] Tests BLoC: flujo completo de cierre de ronda.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- `data-model.md`: estructura `tricks`, `scoresDelta`; reglas de puntuación en comentario o sección de negocio.

### Requisitos no funcionales

- **Offline:** obligatorio.
- **Rendimiento:** cálculo instantáneo para 8 jugadores.
- **UX:** preview de puntos antes de confirmar (opcional pero recomendado).
