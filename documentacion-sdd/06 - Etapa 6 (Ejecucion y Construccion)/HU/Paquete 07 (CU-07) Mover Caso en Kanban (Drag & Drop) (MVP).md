# Etapa 6 — Paquete 07 (CU-07): Mover Caso en Kanban (Drag & Drop) (MVP)

## Metadata
- Etapa: 6 — Ejecucion y Construccion (IA-First)
- Paquete: 07
- Caso de uso: CU-07 Mover Caso en Kanban
- Alcance: MVP (drag & drop + validacion por motor de ciclo)
- Dependencias: Paquetes 03 (transiciones) + 06 (kanban lectura) + 04 (area/responsable)

---

## Caso de Uso — CU-07: Mover Caso en Kanban

### Objetivo
Permitir que un **usuario interno** cambie el estado de un caso arrastrando una tarjeta entre columnas del Kanban, con validacion estricta del ciclo de vida.

### Actores
- Actor primario: Usuario interno
- Actor secundario: Sistema (motor de ciclo de vida)

### Disparador
El usuario realiza drag & drop de una tarjeta desde una columna (estado origen) hacia otra (estado destino).

### Precondiciones
- Existe un tablero Kanban cargado (Paquete 06).
- El motor de transiciones y endpoint de transiciones existen (Paquete 03).
- Las columnas del tablero tienen asociado un `id_estado`.

### Flujo principal
1. Usuario arrastra tarjeta de columna A a columna B.
2. UI solicita movimiento al backend indicando caso y estado destino.
3. Backend:
   - valida que el tablero/columna exista
   - valida que el estado destino pertenece al tablero
   - llama al endpoint/motor de transiciones del caso
4. Si transicion valida:
   - caso cambia de estado
   - tarjeta se mueve y se actualiza el conteo de columnas
5. Si transicion invalida:
   - se rechaza el movimiento
   - UI devuelve la tarjeta a la columna original
   - se muestra mensaje con razon

### Postcondiciones
- Estado del caso actualizado si procede.
- Trazabilidad: historial + evento EstadoCambiado o TransicionRechazada.

### Reglas / invariantes relevantes
- Drag & drop no puede romper las reglas del ciclo.
- No se permite mover casos cerrados.
- Mover tarjeta NO debe cambiar asignaciones (area/responsable).

### Excepciones
- columna destino no valida para el tablero -> rechazo
- transicion invalida -> rechazo con razon

---

## Historias de Usuario asociadas

### HU-07 — Mover casos en Kanban (prioridad media)
Como usuario interno  
Quiero mover casos entre columnas del Kanban con drag & drop  
Para actualizar el estado de forma rapida respetando el ciclo.

#### Criterios de aceptacion (Given/When/Then)
- Given un caso en una columna con estado X
  When arrastro a una columna con estado Y permitido
  Then el caso cambia a Y y la tarjeta queda en la nueva columna

- Given un caso en estado X
  When arrastro a una columna con estado Y no permitido
  Then el sistema rechaza, la tarjeta vuelve a su columna y veo la razon

- Given un caso cerrado
  When intento moverlo
  Then el sistema lo rechaza

---

## Tickets de trabajo (<= 4 horas c/u) para HU-07

### T6-042 — Endpoint POST /api/kanban/tableros/{id}/mover (Laravel)
**Objetivo:** Crear endpoint especializado para movimientos desde Kanban.  
**Alcance:**
- recibe:
  - id_caso
  - id_estado_destino
- valida:
  - tablero existe y activo
  - estado destino pertenece a columnas del tablero (visible)
  - caso pertenece al area del tablero (id_area_responsable)
- ejecuta:
  - invoca motor/servicio de transiciones (Paquete 03)
- responde:
  - ok true + nuevo estado
  - ok false + razon (si rechaza)
**Criterios de aceptacion:**
- solo permite mover si el caso pertenece al tablero y estado destino es columna valida
- respeta motor de ciclo
**Pruebas minimas:**
- feature tests:
  - movimiento ok
  - tablero no corresponde (rechazo)
  - estado no pertenece (rechazo)
  - transicion invalida (rechazo)

---

### T6-043 — UI Angular: habilitar drag & drop basico (Angular)
**Objetivo:** Permitir arrastrar tarjetas entre columnas.  
**Alcance:**
- implementar drag & drop (CDK DragDrop)
- al soltar:
  - llamar endpoint mover
  - si ok: mantener tarjeta en destino
  - si error: revertir movimiento y mostrar toast/mensaje
**Criterios de aceptacion:**
- cumple HU-07
**Pruebas minimas:**
- prueba manual guiada:
  - mover valido
  - mover invalido

---

### T6-044 — UI Angular: optimizacion de refresco (Angular)
**Objetivo:** Evitar recargar todo el tablero en cada movimiento.  
**Alcance:**
- si movimiento ok:
  - actualizar solo columnas afectadas (origen/destino)
- si error:
  - revertir localmente
**Criterios de aceptacion:**
- movimiento fluido y sin parpadeo
**Pruebas minimas:**
- prueba manual

---

### T6-045 — Endpoint GET /api/kanban/tableros/{id}/tarjetas (ajuste para devolver id_estado_actual) (Laravel)
**Objetivo:** Asegurar payload suficiente para UI drag & drop.  
**Alcance:**
- incluir explicitamente:
  - id_estado_actual
  - id_area_responsable
- (si ya estaba, omitir este ticket)
**Criterios de aceptacion:**
- UI puede identificar origen/destino
**Pruebas minimas:**
- feature test contrato de salida

---

## Priorizacion del paquete (orden recomendado)
1) T6-042 (endpoint mover)  
2) T6-043 (drag & drop)  
3) T6-044 (optimizar)  
4) T6-045 (si aplica)

---

## Nota de alcance MVP
- Este paquete no incluye configuracion avanzada de tableros (mantenedor Admin).
- Solo implementa el movimiento usando configuracion baseline ya cargada.

---

## Listo para Cursor + spec-kit (cuando corresponda)
- En Cursor, enfatizar que el endpoint mover es un wrapper que llama al motor de transiciones.
- Pedir manejo cuidadoso de reversion UI ante error.
