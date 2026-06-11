## [original]

Como jugador registrado, quiero recibir automáticamente en mi historial las partidas en las que participé aunque no fuera yo quien llevara el marcador, para ver todas mis partidas desde mi cuenta.

## [enhanced]

### Contexto y alcance

Épica **Cuenta y sincronización**. Cuando un organizador sube una partida (LPT-20) en la que participan jugadores registrados (`players.userId`), esos usuarios ven la partida en su historial sin acción adicional (PRD §6, métrica MVP §8).

**Incluye:** query de partidas donde el usuario es participante, integración con listado unificado (LPT-15), listener opcional para partidas nuevas, deduplicación con partidas locales.

**Excluye:** notificaciones push, invitaciones en tiempo real, partidas donde el jugador es solo invitado sin `userId`.

### Criterios de aceptación

1. Un jugador registrado que participó en una partida subida por otro organizador ve esa partida en su historial (LPT-15).
2. La vinculación se basa en `games/{gameId}/players/{playerId}.userId == Auth.uid`.
3. No requiere acción del participante tras la subida del organizador.
4. Al abrir historial con sesión y red, se consultan:
   - Partidas locales (`syncStatus` local/pending/synced).
   - Partidas en nube donde `hostId == uid` **o** el usuario aparece en `players` con su `userId`.
5. Partidas recibidas muestran badge **nube** y datos de resumen (fecha, jugadores, líder).
6. Tap navega a detalle (LPT-16) leyendo desde Firestore.
7. Si el participante elimina la partida de su historial (LPT-17), solo se oculta para él (`hiddenGameIds`); no afecta al organizador ni a otros.
8. Jugadores invitados (sin `userId`) no reciben la partida en nube.

### Modelo de datos

**Query participante (candidatas):**

```dart
// Opción A: collection group (requiere índice)
collectionGroup('players').where('userId', isEqualTo: uid)

// Opción B: denormalizar participantIds[] en games/{gameId}
collection('games').where('participantIds', arrayContains: uid)
```

**Recomendación MVP:** al subir (LPT-20), escribir `participantIds: [uid1, uid2, ...]` en `games/{gameId}` para query eficiente.

| Campo en `games` | Tipo | Descripción |
|------------------|------|-------------|
| `participantIds` | array\<string\> | `userId` de jugadores registrados en la partida |

### Impacto en Security Rules

```javascript
match /games/{gameId} {
  allow read: if request.auth != null && (
    resource.data.hostId == request.auth.uid
    || request.auth.uid in resource.data.participantIds
  );
}
```

Participantes: **solo lectura**; no pueden modificar la partida del organizador.

### Firebase Auth

Requiere sesión para ver partidas recibidas en nube. Sin sesión: solo historial local.

### Arquitectura y ficheros

```
lib/features/history/
  domain/
    usecases/get_participated_games_usecase.dart
  data/
    datasources/history_firestore_datasource.dart  # extensión query participante

lib/features/sync/
  domain/usecases/upload_finished_game_usecase.dart
  # al subir: calcular y persistir participantIds desde players con userId
```

**Integración LPT-15:** `HistoryRepository` fusiona local + hosted + participated; deduplica por `cloudGameId`.

**Listener opcional (mejora):**

```dart
// Snapshot de games donde participantIds contains uid
// Actualiza historial en tiempo real al recibir nueva partida
```

### Definición de hecho

- [ ] Tests unitarios: merge historial con partidas hosted y participated.
- [ ] Tests unitarios: `participantIds` generado correctamente en upload.
- [ ] Tests integración Emulator: jugador B ve partida subida por jugador A.
- [ ] Índice Firestore para query elegida documentado en `firestore.indexes.json`.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- `data-model.md`: campo `participantIds` en `games`.
- `firebase-data-access.yml`: `listParticipatedGames`.
- `firestore.indexes.json`: índice para `participantIds` o collection group `players`.

### Requisitos no funcionales

- **Offline:** partidas recibidas visibles tras primera descarga; sin red muestra cache local si existe.
- **Privacidad:** participante solo lee; no expone datos de otros usuarios fuera de la partida.
- **Rendimiento:** query participante < 1 s con hasta 100 partidas; paginación si necesario.
