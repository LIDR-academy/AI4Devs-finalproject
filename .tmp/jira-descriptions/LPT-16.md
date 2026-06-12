## [original]

Como jugador, quiero ver el detalle de una partida pasada ronda a ronda, para recordar cómo se desarrolló.

## [enhanced]

### Contexto y alcance

Vista de detalle de partida finalizada (épica **Historial**), accesible desde LPT-15. Muestra evolución ronda a ronda con apuestas, bazas y puntuaciones.

**Incluye:** cabecera con resumen de partida, lista/tabla de rondas expandibles, ranking final, acciones secundarias (repetir LPT-8, eliminar LPT-17).

**Excluye:** edición de resultados históricos.

### Criterios de aceptación

1. Muestra resumen: fecha, jugadores con puntuación final, duración opcional, origen local/nube.
2. Listado de rondas ordenado por `roundNumber` ascendente.
3. Por ronda (expandible o pantalla secundaria): `cardsPerPlayer`, repartidor, apuestas por jugador, bazas reales, `scoresDelta`, ranking acumulado tras la ronda.
4. Ranking final destacado al final o en cabecera fija.
5. Carga desde almacenamiento local o Firestore según origen de la partida.
6. Botones: **Repetir partida** (LPT-8), **Eliminar del historial** (LPT-17).
7. Funciona offline para partidas locales.

### Modelo de datos

**Lectura:**

- `Game` + `Player[]` + `Round[]` (todas `closed`)
- Firestore: `games/{gameId}`, `players`, `rounds` ordenados por `roundNumber`

**Sin escrituras** excepto acciones delegadas a LPT-8/LPT-17.

### Impacto en Security Rules

Lectura de partida en nube: host o participante.

### Firebase Auth

Opcional según origen de partida.

### Arquitectura y ficheros (`lib/features/history/`)

```
lib/features/history/
  domain/
    entities/game_detail.dart, round_summary.dart
    usecases/get_game_detail_usecase.dart
  presentation/
    bloc/game_detail_bloc.dart
    pages/game_detail_page.dart
    widgets/round_summary_tile.dart
    widgets/final_ranking_card.dart
    widgets/round_detail_expansion.dart
```

**Routing:** `/history/{gameId}`.

### Definición de hecho

- [ ] Tests unitarios: mapeo de rondas y ranking final.
- [ ] Tests BLoC: carga local vs cloud.
- [ ] Widget test: expansión de ronda muestra bids/tricks.
- [ ] `flutter analyze` sin errores.

### Documentación a actualizar

- Ninguna obligatoria.

### Requisitos no funcionales

- **Offline:** detalle local sin red.
- **UX:** scroll fluido con muchas rondas (hasta 19); información densa pero escaneable.
