## [original]

Como organizador, quiero repetir una partida desde el historial, para recrear la misma configuración sin introducir los datos de nuevo.

## [enhanced]

### Contexto y alcance

Funcionalidad transversal entre épicas **Gestión de partida** e **Historial**. Desde el detalle o listado de historial, el usuario crea una **nueva** partida en `lobby` copiando la configuración de una partida pasada.

**Incluye:** copia de `playerCount`, jugadores (nombres y `userId` si aplica), secuencia de rondas; nueva partida editable antes de empezar (PRD §6).

**Excluye:** copiar puntuaciones o resultados de rondas anteriores; subida automática a nube (solo al finalizar la nueva partida).

### Criterios de aceptación

1. Acción "Repetir partida" disponible en listado y detalle de historial (local y nube).
2. Al confirmar, se crea un nuevo `gameId` con `status: lobby` copiando: `playerCount`, `totalCards`, `maxCardsPerRound`, `roundSequence`, lista de jugadores (`displayName`, `userId`, `isGuest`).
3. **No** se copian: puntuaciones, rondas jugadas, `startedAt`/`finishedAt` de la partida origen.
4. El organizador puede editar jugadores y orden (LPT-6/LPT-7) antes de empezar.
5. `firstDealerPlayerId` no se copia; se reasigna en LPT-7.
6. Funciona offline si la partida origen es local; para partidas en nube requiere haberlas descargado previamente o conexión para leer Firestore.
7. Diálogo de confirmación antes de crear el borrador.

### Modelo de datos

**Origen:** partida local o `games/{gameId}` + subcolecciones `players` en Firestore.

**Destino:** nuevo documento local `Game` + `Player[]` sin subcolección `rounds` jugadas (solo `roundSequence` en config).

**Use case `RepeatGameUseCase`:**

```
input: sourceGameId
output: newGameId (lobby)
```

### Impacto en Security Rules

Lectura de partida origen en nube: usuario debe ser `hostId` o participante en `players` con su `userId`.

### Firebase Auth

Opcional. Repetir partida local no requiere cuenta.

### Arquitectura y ficheros

```
lib/features/history/
  domain/usecases/repeat_game_usecase.dart
  presentation/widgets/repeat_game_button.dart

lib/features/game_setup/
  domain/services/game_cloner_service.dart   # pure Dart: copia config sin scores
```

**Routing:** desde `/history/{gameId}` → confirmar → `/games/{newGameId}/players`.

### Definición de hecho

- [ ] Tests unitarios (`game_cloner_service_test.dart`): copia config, excluye scores/rondas cerradas.
- [ ] Tests BLoC historial: acción repetir navega a setup.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- `data-model.md`: nota sobre clonación de partidas (nuevo `gameId`, sin historial de rondas).

### Requisitos no funcionales

- **Offline:** repetir desde historial local sin red.
- **Rendimiento:** clonación < 200 ms para partida de 8 jugadores.
- **UX:** snackbar confirmando "Nueva partida creada" con enlace al setup.
