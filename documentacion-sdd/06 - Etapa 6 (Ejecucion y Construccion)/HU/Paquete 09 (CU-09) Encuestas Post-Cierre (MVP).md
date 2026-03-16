# Etapa 6 — Paquete 09 (CU-09): Encuestas Post-Cierre (MVP)

## Metadata
- Etapa: 6 — Ejecucion y Construccion (IA-First)
- Paquete: 09
- Caso de uso: CU-09 Encuestas Post-Cierre
- Alcance: MVP
- Dependencias: Paquete 08 (cierre automatico) + Paquete 03 (cierre manual via ciclo) + evento CasoCerrado

---

## Caso de Uso — CU-09: Encuestas Post-Cierre

### Objetivo
Enviar y registrar **encuestas de satisfaccion** asociadas a un caso **siempre que el caso se cierre** (manual o automatico), asegurando:
- una sola encuesta por cierre
- respuesta sin login
- trazabilidad del resultado
- envio por canal correcto

### Regla de canal (confirmada)
- Si el caso **ingreso por WhatsApp** → enviar **link por WhatsApp** (post-MVP)
- En **todos los demas casos** → enviar **link por correo** (MVP)

> En MVP, el envio efectivo es **solo por correo**. WhatsApp queda diseñado y fuera de MVP.

### Actores
- Actor primario: Sistema
- Actor secundario: Solicitante externo (responde encuesta)

### Disparador
Evento `CasoCerrado` (motivo manual o automatico).

### Precondiciones
- Caso cerrado.
- Caso no tiene una encuesta activa/enviada previamente para ese cierre.
- Existe correo del solicitante (requerido para MVP).

### Flujo principal
1. Sistema detecta evento `CasoCerrado`.
2. Sistema valida que no exista encuesta enviada para ese caso.
3. Sistema crea registro de encuesta asociada al caso.
4. Sistema genera link publico unico (token).
5. Sistema envia correo al solicitante con link de encuesta.
6. Solicitante abre link y responde encuesta.
7. Sistema guarda respuestas y marca encuesta como respondida.

### Postcondiciones
- Encuesta creada y asociada al caso.
- Respuesta registrada (si el solicitante responde).
- Datos disponibles para metricas.

### Reglas / invariantes relevantes
- Una encuesta por cierre.
- La encuesta NO reabre el caso.
- La encuesta se responde sin autenticacion.
- El link expira opcionalmente (recomendado, configurable).

### Excepciones
- Caso sin correo -> registrar encuesta como pendiente_no_enviada (auditable).
- Error enviando correo -> reintentos controlados (fuera de MVP).

---

## Historias de Usuario asociadas

### HU-09 — Enviar y responder encuesta post-cierre (alta prioridad)
Como sistema  
Quiero enviar una encuesta al cerrar un caso  
Para medir satisfaccion del solicitante.

#### Criterios de aceptacion (Given/When/Then)
- Given un caso cerrado con correo del solicitante
  When se dispara CasoCerrado
  Then se crea encuesta y se envia link por correo

- Given una encuesta enviada
  When el solicitante responde
  Then la respuesta queda guardada y asociada al caso

- Given un caso ya encuestado
  When ocurre otro evento no relacionado
  Then no se crea una segunda encuesta

---

## Tickets de trabajo (<= 4 horas c/u) para HU-09

### T6-051 — Migraciones: encuesta y encuesta_respuesta (Laravel)
**Objetivo:** Persistir encuestas y respuestas.  
**Alcance:**
- tabla `encuesta`:
  - id_encuesta (PK)
  - id_caso (FK)
  - token_publico (UNIQUE)
  - canal_envio (correo/whatsapp)
  - estado (creada, enviada, respondida, expirada)
  - fecha_creacion, fecha_envio, fecha_respuesta
- tabla `encuesta_respuesta`:
  - id_respuesta (PK)
  - id_encuesta (FK)
  - pregunta
  - valor
**Criterios de aceptacion:**
- migraciones aplican sin errores
**Pruebas minimas:**
- migrate:fresh

---

### T6-052 — Generacion de encuesta al cerrar caso (Laravel)
**Objetivo:** Crear encuesta automaticamente al recibir CasoCerrado.  
**Alcance:**
- listener del evento `CasoCerrado`
- validar no duplicar encuesta
- generar token publico seguro
- crear registro encuesta
**Criterios de aceptacion:**
- cierre manual o automatico crea encuesta
- no se crean duplicados
**Pruebas minimas:**
- feature test: cerrar caso -> existe encuesta

---

### T6-053 — Envio de correo con link de encuesta (Laravel)
**Objetivo:** Enviar correo al solicitante con link publico.  
**Alcance:**
- plantilla de correo simple
- link con token (ej: /encuestas/{token})
- manejo basico de error (log)
**Criterios de aceptacion:**
- correo se intenta enviar
- fecha_envio se registra
**Pruebas minimas:**
- test con mail fake/log

---

### T6-054 — Endpoint publico GET /encuestas/{token} (Laravel)
**Objetivo:** Mostrar formulario de encuesta sin login.  
**Alcance:**
- valida token
- valida estado (no expirada, no respondida)
- muestra preguntas
**Criterios de aceptacion:**
- token valido -> formulario
- token invalido/expirado -> mensaje amigable
**Pruebas minimas:**
- feature tests

---

### T6-055 — Endpoint publico POST /encuestas/{token}/responder (Laravel)
**Objetivo:** Registrar respuesta de encuesta.  
**Alcance:**
- guarda respuestas
- marca encuesta como respondida
- fecha_respuesta
**Criterios de aceptacion:**
- respuesta se guarda
- encuesta queda en estado respondida
**Pruebas minimas:**
- feature test completo (GET + POST)

---

### T6-056 — Definicion de preguntas de encuesta (Laravel)
**Objetivo:** Definir encuesta MVP estandar.  
**Alcance:**
- preguntas base:
  - satisfaccion general (1–5)
  - resolucion del problema (si/no)
  - comentario libre (opcional)
- definidas en config o tabla
**Criterios de aceptacion:**
- formulario muestra preguntas configuradas
**Pruebas minimas:**
- test de carga de configuracion

---

### T6-057 — UI Angular (opcional): vista interna de resultados (Angular)
**Objetivo:** Visualizar respuestas de encuestas por caso.  
**Alcance:**
- vista solo lectura en detalle de caso
- muestra respuestas asociadas
**Criterios de aceptacion:**
- se ven respuestas cuando existen
**Pruebas minimas:**
- prueba manual

---

## Priorizacion del paquete (orden recomendado)
1) T6-051 (tablas)  
2) T6-052 (crear encuesta al cerrar)  
3) T6-053 (envio correo)  
4) T6-054 (formulario publico)  
5) T6-055 (guardar respuesta)  
6) T6-056 (preguntas)  
7) T6-057 (UI interna, opcional MVP)

---

## Nota de alcance MVP
- El envio por WhatsApp queda fuera de MVP.
- No se implementan recordatorios de encuesta (puede ser paquete futuro).
- Seguridad basica por token no predecible.

---

## Listo para Cursor + spec-kit (cuando corresponda)
- En Cursor, enfatizar endpoints publicos sin auth.
- Pedir cuidado con expiracion de tokens y validaciones defensivas.
