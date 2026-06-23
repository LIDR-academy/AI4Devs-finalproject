# Backlog de mejoras futuras (fuera del MVP actual)

> Ideas surgidas durante el desarrollo de la Entrega 2 que no forman parte
> del PRD validado. Se documentan aquí para no perderlas, sin comprometerse
> a implementarlas en esta entrega. Revisar en la Entrega final si queda
> margen, o como roadmap post-entrega.

## Theming configurable por el usuario

**Origen:** sesión de diseño de wireframes (17/06/2026), al decidir el
estilo visual de la app.

**Idea:** permitir que el usuario cambie el tema visual de la app (colores,
quizá modo claro/oscuro) desde ajustes. Técnicamente viable con bajo coste
si el diseño base ya se construye sobre `ColorScheme`/tokens semánticos de
Material 3 en lugar de colores fijos — por eso se ha tenido en cuenta como
restricción de diseño ahora, aunque la funcionalidad no se implemente.

**Coste estimado:** medio (UI de selección de tema + persistencia de
preferencia local). No depende de Firebase ni de sincronización.

---

## Renombrado manual de partidas en el historial

**Origen:** sesión de diseño de wireframes (17/06/2026), al revisar cómo
identificar partidas en el historial cuando hay varias el mismo día.

**Idea:** añadir un campo `name` opcional a `Game`, editable desde el
historial, para que el organizador pueda darle un nombre propio a una
partida ("Partida de los viernes").

**Decisión para el MVP actual:** identificación derivada (fecha/hora +
jugadores), sin campo nuevo. Ver readme §3.2.

**Coste estimado:** medio-alto. No es solo el campo: requiere UI de edición,
validación, y sobre todo propagar el cambio a participantes registrados que
ya tienen la partida en su historial tras la sincronización (LPT-20/21) —
abre superficie de testing y de Security Rules no contemplada en los
tickets actuales.

---

## Estadísticas personales del organizador

**Origen:** sesión de diseño de wireframes (17/06/2026), al revisar las
tarjetas secundarias de la pantalla Home generadas por IA (Figma), que
incluían una tarjeta "Mejor racha" sin respaldo en el PRD.

**Idea:** mostrar en Home o en una pantalla propia estadísticas del
organizador sobre su propio historial: partidas totales jugadas, partidas
ganadas, máxima puntuación alcanzada en una partida, etc.

**Nota:** el PRD excluye explícitamente "estadísticas sociales entre
jugadores" del MVP; esta idea es distinta (estadísticas personales, no
comparativas entre jugadores) pero tampoco está validada ni priorizada.

**Coste estimado:** bajo-medio para métricas simples calculables sobre el
historial ya existente (total partidas, total rondas); medio-alto si se
quiere "partidas ganadas" (requiere definir qué significa "ganar" — ¿mayor
`totalScore`? — y calcularlo de forma consistente).

---

## Decisión de diseño para Home (MVP actual)

Tras estas tres ideas, se decidió simplificar la pantalla Home al máximo:
sin tarjetas secundarias de estadísticas ni de jugadores. Solo cabecera,
acceso a cuenta, botón "Nueva partida" e historial. Coherente con la
persona Carlos del PRD (interfaz clara, sin elementos sin función definida).
