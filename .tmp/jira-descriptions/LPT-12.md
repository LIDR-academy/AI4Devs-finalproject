## [original]

Como organizador, quiero poder corregir apuestas o bazas en la ronda actual, para subsanar errores de introducción.

## [enhanced]

### Contexto y alcance

Corrección de datos en la **ronda en curso** únicamente (épica **Flujo de ronda**). Permite editar apuestas (fase `bidding` o `playing`) o bazas (fase `scoring` antes de cerrar).

**Incluye:** edición de apuestas con re-validación de restricción del repartidor, edición de bazas con re-cálculo de puntos, bloqueo si corrección viola restricción hasta que el repartidor corrija, restricción a ronda actual.

**Excluye:** modificar rondas ya cerradas (`status == closed`), repetir ronda completa (LPT-13).

### Criterios de aceptación

1. Solo disponible para la ronda con `status` en `bidding`, `playing` o `scoring` (no cerrada).
2. **Corrección de apuestas:** el organizador puede volver a editar cualquier apuesta; se re-ejecuta validación de restricción del repartidor (LPT-9).
3. Si tras una corrección la restricción queda incumplida (suma = `cardsPerPlayer`), se **bloquea** el avance hasta que el repartidor modifique su apuesta.
4. **Corrección de bazas:** antes de confirmar cierre de ronda, se pueden ajustar bazas; se re-valida suma = `cardsPerPlayer` y se recalculan puntos.
5. Si la ronda ya tenía `scoresDelta` provisional, se recalcula `totalScore` de forma consistente (restar delta anterior, aplicar nuevo).
6. Rondas anteriores (`closed`) no son editables desde la UI.
7. Funciona offline.

### Modelo de datos

Sin cambios de esquema; operaciones de actualización sobre `Round.bids` y `Round.tricks` en ronda activa.

**Use cases:**

- `CorrectBidsUseCase`: actualiza bids, valida restricción.
- `CorrectTricksUseCase`: actualiza tricks, recalcula scoresDelta y totalScore.

### Impacto en Security Rules

Solo local. En nube: prohibir escritura en rondas `closed`.

### Firebase Auth

No aplica.

### Arquitectura y ficheros (`lib/features/round/`)

```
lib/features/round/
  domain/
    usecases/correct_bids_usecase.dart
    usecases/correct_tricks_usecase.dart
  presentation/
    widgets/edit_bids_button.dart
    widgets/edit_tricks_button.dart
    pages/correct_round_page.dart   # o modales sobre bidding/scoring
```

### Definición de hecho

- [ ] Tests unitarios: corrección que viola restricción bloquea cierre.
- [ ] Tests unitarios: recálculo de totalScore tras corrección de bazas.
- [ ] Tests BLoC: edición y estados de bloqueo.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- `data-model.md` § reglas de negocio: "solo ronda actual editable".

### Requisitos no funcionales

- **Offline:** obligatorio.
- **UX:** confirmación antes de descartar correcciones; mensaje claro cuando repartidor debe actuar.
