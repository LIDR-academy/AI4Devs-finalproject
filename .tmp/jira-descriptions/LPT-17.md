## [original]

Como jugador, quiero eliminar partidas de mi historial, para mantener solo las que me interesa conservar.

## [enhanced]

### Contexto y alcance

Eliminación de partidas del historial **propio** (épica **Historial**). No afecta a otros participantes ni borra la partida en nube para el resto (PRD §6).

**Incluye:** acción eliminar en listado y detalle, confirmación, eliminación local, ocultación en historial del usuario para partidas en nube.

**Excluye:** borrado físico de `games` en Firestore para todos los participantes.

### Criterios de aceptación

1. Acción "Eliminar" disponible en listado (swipe o menú) y detalle de partida.
2. Diálogo de confirmación: "Esta acción no se puede deshacer" (local) / "Solo se eliminará de tu historial" (nube).
3. **Partida local:** eliminación física del `Game` y datos asociados (`players`, `rounds`) del almacenamiento local.
4. **Partida en nube:** se registra en perfil local `hiddenGameIds[]` o subcolección `users/{uid}/hiddenGames`; **no** se borra `games/{gameId}` en Firestore.
5. Tras eliminar, la partida desaparece del listado (LPT-15) inmediatamente.
6. Otros jugadores registrados siguen viendo la partida en su historial.
7. Funciona offline para partidas locales.

### Modelo de datos

**Local delete:** cascade delete `Game`, `Player`, `Round` por `gameId`.

**Cloud hide (usuario autenticado):**

| Ruta | Campo | Descripción |
|------|-------|-------------|
| `users/{uid}` o prefs locales | `hiddenGameIds` | array de `gameId` ocultos para este usuario |

### Impacto en Security Rules

- Usuario solo puede escribir su propio `hiddenGameIds` (o gestión 100% local del ocultado).
- **No** permitir `delete` de `games/{gameId}` por participantes en MVP.

### Firebase Auth

Requerido solo para ocultar partidas en nube. Eliminación local no requiere cuenta.

### Arquitectura y ficheros (`lib/features/history/`)

```
lib/features/history/
  domain/
    usecases/delete_local_game_usecase.dart
    usecases/hide_cloud_game_usecase.dart
  presentation/
    widgets/delete_game_dialog.dart
    widgets/delete_game_slidable.dart
```

### Definición de hecho

- [ ] Tests unitarios: delete local cascade.
- [ ] Tests unitarios: hide cloud no borra documento remoto.
- [ ] Tests BLoC: eliminación actualiza listado.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- `data-model.md`: estrategia de ocultado vs borrado en historial compartido.
- `firebase-data-access.yml`: operación `hideGameForUser`.

### Requisitos no funcionales

- **Offline:** eliminación local sin red.
- **UX:** confirmación clara diferenciando local vs nube.
