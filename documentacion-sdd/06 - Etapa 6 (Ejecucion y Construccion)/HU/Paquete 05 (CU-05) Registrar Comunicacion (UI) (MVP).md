# Etapa 6 — Paquete 05 (CU-05): Registrar Comunicacion (UI) (MVP)

## Metadata
- Etapa: 6 — Ejecucion y Construccion (IA-First)
- Paquete: 05
- Caso de uso: CU-05 Registrar Comunicacion (UI)
- Alcance: MVP (solo UI interna; integracion correo se aborda en un paquete posterior)
- Dependencias: Paquetes 01–04 (caso/consulta/estado/asignaciones) + evento_log operativo

---

## Caso de Uso — CU-05: Registrar Comunicacion (UI)

### Objetivo
Permitir que un **usuario interno** registre comunicaciones asociadas a un caso, incluyendo:
- mensajes visibles para el solicitante (canal UI, para trazabilidad)
- notas internas (no visibles para solicitante)

y asegurar:
- trazabilidad
- evento `MensajeRegistrado`
- evento `PrimeraAccionRegistrada` solo una vez por caso (cuando corresponda)

### Actores
- Actor primario: Usuario interno (Agente / Encargado)
- Actor secundario: Sistema

### Disparador
El agente necesita dejar registro de una gestion (llamada, accion realizada, respuesta preparada, solicitud de datos, etc.).

### Precondiciones
- Caso existe y no esta cerrado.
- UI permite abrir detalle de caso (Paquete 02).
- Identidad del actor disponible (aunque sea temporal en dev).

### Flujo principal — Mensaje externo (registrado desde UI)
1. Usuario abre un caso.
2. Usuario escribe un mensaje (visible para solicitante).
3. Sistema valida que el caso no este cerrado.
4. Sistema registra el mensaje asociado al caso.
5. Sistema emite `MensajeRegistrado`.
6. Si es la primera accion del caso (ver regla), sistema emite `PrimeraAccionRegistrada`.
7. UI actualiza el hilo de mensajes.

### Flujo principal — Nota interna
1. Usuario escribe una nota interna.
2. Sistema registra el mensaje como interno.
3. Emite `MensajeRegistrado` (igual, para auditoria).
4. Si es primera accion, emite `PrimeraAccionRegistrada`.

### Postcondiciones
- Mensaje almacenado en BD y visible en el detalle del caso.
- Eventos registrados en `evento_log`.

### Reglas / invariantes relevantes
- Caso cerrado: no se permite registrar mensajes (recomendado para MVP por consistencia).
- `PrimeraAccionRegistrada`:
  - se emite solo una vez por caso
  - se dispara con la primera accion operativa del caso, considerando:
    - primer mensaje (externo o interno) registrado por un usuario interno
    - (en paquetes posteriores) primer tiempo imputado / primera evidencia

### Excepciones
- Caso no existe (404).
- Caso cerrado (rechazo 422).

---

## Historias de Usuario asociadas

### HU-05 — Registrar mensajes y notas en un caso (alta prioridad)
Como usuario interno  
Quiero registrar mensajes y notas internas en un caso  
Para mantener trazabilidad de la gestion y de la comunicacion.

#### Criterios de aceptacion (Given/When/Then)
- Given un caso abierto
  When registro un mensaje externo desde UI
  Then el mensaje se guarda, aparece en el detalle y se emite MensajeRegistrado

- Given un caso abierto sin acciones previas
  When registro el primer mensaje (externo o interno)
  Then se emite PrimeraAccionRegistrada una sola vez

- Given un caso cerrado
  When intento registrar un mensaje
  Then el sistema rechaza la operacion

---

## Tickets de trabajo (<= 4 horas c/u) para HU-05

### T6-028 — Migracion y modelo: mensaje (Laravel)
**Objetivo:** Crear tabla `mensaje` y modelo Eloquent correspondiente.  
**Alcance:**
- tabla `mensaje` (campos en español):
  - id_mensaje (PK)
  - id_caso (FK)
  - canal (ui)  (en MVP solo ui)
  - origen (agente/sistema)
  - remitente (string: nombre o correo del actor)
  - asunto (nullable)
  - cuerpo (text)
  - es_nota_interna (bool)
  - fecha_hora_mensaje
  - id_externo (nullable) (para futuro correo/whatsapp)
  - id_hilo_externo (nullable)
- indices:
  - (id_caso, fecha_hora_mensaje)
**Criterios de aceptacion:**
- migracion ejecuta y permite insertar mensajes por caso
**Pruebas minimas:**
- migrate:fresh + insercion simple

---

### T6-029 — Endpoint POST /api/casos/{id}/mensajes (Laravel)
**Objetivo:** Registrar mensaje desde UI.  
**Alcance:**
- valida caso existe y no esta cerrado
- guarda mensaje
- emite evento `MensajeRegistrado` en `evento_log`
- invoca logica de primera accion (ver T6-031)
**Criterios de aceptacion:**
- caso abierto -> 201 con payload del mensaje
- caso cerrado -> 422
**Pruebas minimas:**
- feature tests (ok / caso cerrado / caso no existe)

---

### T6-030 — Endpoint GET /api/casos/{id}/mensajes (Laravel)
**Objetivo:** Obtener hilo de mensajes ordenado por fecha.  
**Alcance:**
- lista mensajes por caso (ascendente)
- incluye bandera `es_nota_interna`
**Criterios de aceptacion:**
- retorna mensajes ordenados
**Pruebas minimas:**
- feature test

---

### T6-031 — Regla de PrimeraAccionRegistrada (Laravel)
**Objetivo:** Implementar mecanismo para emitir `PrimeraAccionRegistrada` solo una vez por caso.  
**Alcance:**
- definir como detectar si ya existe primera accion:
  - opcion recomendada: campo en `caso` -> `fecha_primera_accion` (nullable)
- al registrar primer mensaje (o nota interna):
  - si `fecha_primera_accion` es NULL -> setear y emitir evento
  - si no -> no emitir
**Criterios de aceptacion:**
- primer mensaje emite PrimeraAccionRegistrada
- segundo mensaje no emite
**Pruebas minimas:**
- unit/feature test (dos mensajes, un solo evento)

---

### T6-032 — UI Angular: hilo de mensajes en detalle de caso (Angular)
**Objetivo:** Mostrar mensajes del caso en la vista detalle.  
**Alcance:**
- seccion “Conversacion”
- lista mensajes con:
  - fecha/hora
  - remitente
  - cuerpo
  - indicador nota interna
- refresco despues de enviar
**Criterios de aceptacion:**
- al abrir detalle se cargan mensajes
- se ve diferencia entre nota interna y mensaje externo
**Pruebas minimas:**
- prueba manual guiada

---

### T6-033 — UI Angular: crear mensaje / nota interna (Angular)
**Objetivo:** Permitir registrar mensaje o nota interna.  
**Alcance:**
- textarea + boton enviar
- checkbox “nota interna”
- manejo de error si caso cerrado
**Criterios de aceptacion:**
- envia correctamente y aparece en hilo
- muestra error si API rechaza
**Pruebas minimas:**
- prueba manual guiada

---

### T6-034 — Endpoint GET /api/casos/{id}/historial-estado (opcional util para trazabilidad) (Laravel)
**Objetivo:** Exponer historial de cambios de estado para mostrar junto a mensajes.  
**Alcance:**
- lista `caso_estado_historial` por caso, ordenado por fecha
**Criterios de aceptacion:**
- UI puede mostrar timeline combinado (a futuro)
**Pruebas minimas:**
- feature test

---

## Priorizacion del paquete (orden recomendado)
1) T6-028 (tabla mensaje)  
2) T6-029 (POST mensajes)  
3) T6-031 (primera accion)  
4) T6-030 (GET mensajes)  
5) T6-032 (UI hilo)  
6) T6-033 (UI enviar)  
7) T6-034 (opcional)

---

## Nota de alcance MVP
- En MVP, estos mensajes son principalmente para trazabilidad interna.
- El envio real al solicitante por correo se aborda en el paquete de integracion Graph (posterior).
- La estructura deja preparado `id_externo` e `id_hilo_externo` para correo/whatsapp sin rediseño.

---

## Listo para Cursor + spec-kit (cuando corresponda)
- Trabajar un ticket a la vez.
- En Cursor, pedir implementacion minima + pruebas minimas por ticket.
- Evitar que se implemente integracion correo en este paquete (eso viene despues).
