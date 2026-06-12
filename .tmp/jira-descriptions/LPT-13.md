## [original]

Como organizador, quiero poder repetir una ronda completa, para gestionar situaciones excepcionales durante el juego.

## [enhanced]

### Contexto y alcance

Acción de recuperación en la ronda actual (épica **Flujo de ronda**). Reinicia la ronda en curso sin afectar rondas ya cerradas ni puntuaciones acumuladas de rondas anteriores.

**Incluye:** confirmación explícita, reset de apuestas y bazas de la ronda actual, restauración de `totalScore` revirtiendo `scoresDelta` si la ronda se había cerrado parcialmente, vuelta a fase `bidding`.

**Excluye:** repetir partida completa (LPT-8), deshacer rondas anteriores.

### Criterios de aceptación

1. Acción "Repetir ronda" disponible durante ronda actual (`bidding`, `playing`, `scoring`).
2. Diálogo de confirmación advierte que se perderán los datos de la ronda actual.
3. Al confirmar:
   - Se limpian `bids`, `tricks`, `scoresDelta` de la ronda actual.
   - Si se había aplicado `scoresDelta` a `totalScore`, se **revierte** ese delta.
   - `round.status` vuelve a `bidding`.
   - `dealerPlayerId` y `cardsPerPlayer` se mantienen (misma ronda, mismo repartidor).
4. Navega a pantalla de apuestas (LPT-9).
5. Rondas con `status == closed` no se ven afectadas.
6. Funciona offline.

### Modelo de datos

**Operación atómica local** sobre `Round` actual + `Player.totalScore` (reversión).

```dart
// Pseudocódigo dominio
for (player in players) {
  player.totalScore -= round.scoresDelta[player.id] ?? 0;
}
round.resetToBidding(); // limpia bids, tricks, scoresDelta
```

### Impacto en Security Rules

Solo local.

### Firebase Auth

No aplica.

### Arquitectura y ficheros (`lib/features/round/`)

```
lib/features/round/
  domain/usecases/repeat_round_usecase.dart
  presentation/widgets/repeat_round_button.dart
  presentation/widgets/repeat_round_dialog.dart
```

### Definición de hecho

- [ ] Tests unitarios: reversión correcta de totalScore.
- [ ] Tests unitarios: rondas cerradas anteriores intactas.
- [ ] Tests BLoC: confirmación y reset.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- `data-model.md`: nota sobre reset de ronda vs rondas cerradas.

### Requisitos no funcionales

- **Offline:** obligatorio.
- **UX:** acción destructiva claramente diferenciada (color advertencia); requiere confirmación.
