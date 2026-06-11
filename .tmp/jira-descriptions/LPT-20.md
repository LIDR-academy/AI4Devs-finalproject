## [original]

Como jugador registrado, quiero que mis partidas se suban automáticamente al finalizarlas, para tener mi historial disponible en la nube sin ninguna acción adicional.

## [enhanced]

### Contexto y alcance

Épica **Cuenta y sincronización**. Tras finalizar una partida (LPT-14 `finish_game`), si el organizador tiene sesión activa y hay conectividad, la partida se sube automáticamente a Firestore sin acción manual.

**Incluye:** trigger post-finalización, escritura atómica/batch de `games`, `players` y `rounds`, vinculación `cloudGameId` en partida local, reintentos ante fallo de red, feedback UI discreto (éxito/error).

**Excluye:** subida manual de partidas locales anteriores al registro (post-MVP), sincronización durante la partida, subida si no hay sesión.

### Criterios de aceptación

1. Al finalizar partida (`game.status == finished`), si el usuario está autenticado y hay red, se inicia subida automática en background.
2. Se crea `games/{gameId}` con `hostId == Auth.uid`, `status: finished`, metadatos y timestamps (`finishedAt`, `createdAt`, `updatedAt`).
3. Se escriben subcolecciones `players` y `rounds` con datos completos (apuestas, bazas, `scoresDelta`, `totalScore`).
4. La partida local se actualiza con `cloudGameId` y `syncStatus: synced` para deduplicación en LPT-15.
5. Si **no hay sesión** o **no hay red**: la partida queda solo local; no se muestra error bloqueante; opcional badge "pendiente de sincronizar".
6. Si la subida falla: `syncStatus: pending`, reintento al recuperar conectividad o al abrir historial.
7. **No** se suben partidas finalizadas antes del registro de forma retroactiva (PRD post-MVP).
8. El organizador no necesita pulsar ningún botón adicional.

### Modelo de datos

**Escritura Firestore:**

| Ruta | Contenido |
|------|-----------|
| `games/{gameId}` | `hostId`, `status`, `playerCount`, `finishedAt`, `settings` *(roundSequence, etc.)* |
| `games/{gameId}/players/{playerId}` | `userId`, `displayName`, `seatOrder`, `totalScore` |
| `games/{gameId}/rounds/{roundId}` | `roundNumber`, `dealerPlayerId`, `bids`, `tricks`, `scoresDelta`, `status: closed` |

**Actualización partida local:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cloudGameId` | string | ID del documento en Firestore |
| `syncStatus` | string | `local`, `pending`, `synced`, `failed` |

### Impacto en Security Rules

```javascript
match /games/{gameId} {
  allow create: if request.auth != null
    && request.resource.data.hostId == request.auth.uid;
  allow update: if request.auth != null
    && resource.data.hostId == request.auth.uid;
  allow read: if request.auth != null && (
    resource.data.hostId == request.auth.uid
    || exists(/databases/$(database)/documents/games/$(gameId)/players/$(request.auth.uid))
  );
}
match /games/{gameId}/players/{playerId} { /* host write; participants read */ }
match /games/{gameId}/rounds/{roundId} { /* host write; participants read */ }
```

*(Ajustar membership check según modelado final de `players`.)*

### Firebase Auth

Requiere sesión activa (`Auth.uid` como `hostId`). Sin Auth: no-op silencioso.

### Arquitectura y ficheros

```
lib/features/sync/
  domain/
    entities/sync_status.dart
    repositories/game_sync_repository.dart
    usecases/upload_finished_game_usecase.dart
    usecases/retry_pending_uploads_usecase.dart
  data/
    datasources/game_firestore_datasource.dart
    datasources/game_local_datasource.dart   # extensión syncStatus/cloudGameId
    repositories/game_sync_repository_impl.dart
  presentation/
    bloc/game_sync_bloc.dart                 # opcional: estado global sync
    widgets/sync_status_snackbar.dart

lib/features/round/
  domain/usecases/finish_game_usecase.dart   # disparar upload tras finish
```

**Flujo:**

```
finish_game → if (authenticated && online) → UploadFinishedGameUseCase
           → WriteBatch Firestore → update local cloudGameId
```

### Definición de hecho

- [ ] Tests unitarios: mapeo local → Firestore, no-op sin sesión.
- [ ] Tests unitarios: `retry_pending_uploads` con partidas `pending`.
- [ ] Tests de integración con Firestore Emulator: escritura completa de partida 4 jugadores.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- `data-model.md`: `cloudGameId`, `syncStatus` en partida local.
- `firebase-data-access.yml`: operación `uploadFinishedGame`.
- `firestore.rules`: permisos de creación por `hostId`.

### Requisitos no funcionales

- **Offline:** partida guardada local; subida diferida sin bloquear UI.
- **Rendimiento:** subida en background; UI no bloqueada > 100 ms.
- **Fiabilidad:** `WriteBatch` o transacción para consistencia game+players+rounds.
- **UX:** snackbar no intrusivo; no interrumpir celebración de resultado final.
