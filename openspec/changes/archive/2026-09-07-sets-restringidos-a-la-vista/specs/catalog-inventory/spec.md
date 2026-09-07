# Spec: catalog-inventory

## MODIFIED Requirements

### Requirement: Proyección pública del catálogo
El sistema SHALL exponer el catálogo en dos proyecciones. La **pública** (visitante,
sin autenticar) muestra únicamente Sets publicados con sus atributos de catálogo
(foto, nº de piezas, edad recomendada, tema, dificultad) y **si el Set exige
antigüedad mínima de suscripción**, y **oculta la disponibilidad y la posición/estado
en la cola de reservas**. La **autenticada** (suscriptor) añade la disponibilidad de
copias y la posición/estado en la cola. El estado a nivel de `Copy` nunca se expone en
la proyección pública.

La restricción por antigüedad es un **atributo del Set**, no un dato de inventario: se
puede leer sin sesión, igual que la dificultad. Lo que sigue exigiendo sesión es saber
**desde cuándo** puede llevárselo quien pregunta, porque eso depende de su suscripción.

#### Scenario: Visitante ve el catálogo sin disponibilidad
- **WHEN** un usuario no autenticado consulta el catálogo o el detalle de un Set
- **THEN** ve los atributos de catálogo de los Sets publicados
- **AND** no ve la disponibilidad de copias ni la posición en cola

#### Scenario: Suscriptor ve la disponibilidad
- **WHEN** un suscriptor autenticado consulta el detalle de un Set
- **THEN** ve además la disponibilidad de copias y su posición/estado en la cola de
  reservas

#### Scenario: Un set restringido se distingue en el listado
- **WHEN** cualquiera —con sesión o sin ella— consulta el catálogo
- **THEN** los Sets que exigen antigüedad mínima se muestran señalados como tales,
  junto con la antigüedad que exigen
- **AND** no se ocultan del listado a quien todavía no la alcanza
