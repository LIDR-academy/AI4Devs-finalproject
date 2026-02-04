# Etapa 6 — Paquete 14 (CU-14) Auditoria, Trazabilidad e Idempotencia (MVP)

## Metadata
- Etapa 6 — Ejecucion y Construccion (IA-First)
- Paquete 14
- Caso de uso CU-14 Auditoria y Trazabilidad
- Alcance MVP (base robusta para operación y soporte)
- Dependencias Paquetes 01–13 (eventos ya utilizados en varios paquetes)

---

## Caso de Uso — CU-14 Auditoria, Trazabilidad e Idempotencia

### Objetivo
Asegurar que todas las acciones relevantes del sistema queden trazadas y sean auditables, incluyendo
- eventos canonicos persistidos (evento_log)
- correlacion entre acciones (correlation_id)
- historial funcional (estados, asignaciones, mensajes)
- idempotencia para integraciones (correo y futuras)
- registro de consumo de eventos (evitar reprocesos)

### Actores
- Actor primario Sistema
- Actor secundario Usuario interno (Auditor  Admin  Jefaturas)

### Disparador
- Cualquier accion de negocio (crear caso, transicionar, asignar, mensaje, cierre, encuesta, IA, login)
- Ingestas (correo) y jobs (SLA, cierres)

### Precondiciones
- Existen eventos y acciones ya implementadas.
- Existe necesidad operativa de diagnostico y auditoria.

### Flujo principal
1. Cada accion de negocio genera evento canonico (evento_log).
2. Eventos incluyen
   - event_id
   - event_type
   - occurred_at
   - producer
   - correlation_id
   - payload (v1)
3. Para integraciones
   - se registra idempotency key y resultado
4. Para auditoria
   - se habilitan vistas de consulta (solo lectura) sobre
     - eventos de caso
     - historial de estadoasignacion
     - mensajes
     - SLAalertas
     - encuestas
     - decisiones IA

### Postcondiciones
- Operacion soportable se puede reconstruir “que paso” y “por que”.
- Integraciones seguras ante reprocesos.

### Reglas  invariantes
- evento_log es append-only (inmutable).
- payload versionado.
- idempotencia obligatoria en integraciones.
- Auditor (rol) es solo lectura.

### Excepciones
- No se debe bloquear la operacion por fallos de auditoria
  - si falla evento_log, se debe registrar error y continuar (decision)
  - recomendacion MVP evento_log es critico; si falla persistencia, rechazar la operacion para no perder trazabilidad

---

## Historias de Usuario asociadas

### HU-14 — Trazabilidad completa por caso (alta prioridad)
Como auditor o jefatura  
Quiero ver toda la trazabilidad de un caso  
Para entender acciones, responsables y tiempos.

#### Criterios de aceptacion (GivenWhenThen)
- Given un caso con acciones
  When consulto su auditoria
  Then veo eventos, estados, asignaciones y mensajes en orden temporal

- Given una integracion que reprocesa el mismo mensaje
  When intenta insertarlo de nuevo
  Then el sistema lo omite por idempotencia

---

## Tickets de trabajo (= 4 horas cu) para HU-14

### T6-089 — Estabilizar esquema canonico evento_log (Laravel)
Objetivo Asegurar un esquema canonico unico para eventos.  
Alcance
- revisar `evento_log` existente
- campos minimos
  - id_evento (PK)
  - event_id (UUID) UNIQUE
  - event_type
  - event_version
  - occurred_at
  - producer
  - correlation_id
  - payload_json (JSON)
  - actor (nullable)
- indices
  - (correlation_id)
  - (event_type, occurred_at)
Criterios de aceptacion
- todas las emisiones de eventos usan el mismo helper
Pruebas minimas
- unit tests de helper

---

### T6-090 — Helper unico de emision de eventos (Laravel)
Objetivo Evitar emisiones “a mano” dispersas.  
Alcance
- servicio `EventPublisher`
  - `publish(type, correlation_id, payload, actor, version=1)`
- genera UUID y occurred_at
- valida payload JSON serializable
Criterios de aceptacion
- todos los paquetes migran a este helper
Pruebas minimas
- unit test y verificacion en feature tests existentes

---

### T6-091 — Correlation ID estandar por caso (Laravel)
Objetivo Definir como se construye correlation_id.  
Alcance
- regla correlation_id = `codigo_caso` (si existe) o `CASO{id}`
- aplicar en
  - crear caso
  - transiciones
  - asignaciones
  - mensajes
  - cierres
Criterios de aceptacion
- eventos de un caso se filtran por correlation_id
Pruebas minimas
- feature test crear caso y verificar correlation_id

---

### T6-092 — Tabla generica de consumoidempotencia para integraciones (Laravel)
Objetivo Unificar idempotencia (correo hoy, WhatsApp mañana).  
Alcance
- tabla `integracion_consumo`
  - id_consumo
  - integracion (correowhatsappotro)
  - id_externo UNIQUE con integracion (UNIQUE(integracion, id_externo))
  - resultado
  - id_caso (nullable)
  - fecha_procesado
  - payload_resumen (nullable)
Criterios de aceptacion
- correo usa esta tabla para idempotencia
Pruebas minimas
- unit test de insercion atomica

---

### T6-093 — Endpoint auditoria GET apicasos{id}auditoria (Laravel)
Objetivo Entregar vista consolidada de trazabilidad por caso.  
Alcance
- retorna en orden temporal
  - eventos (evento_log por correlation_id)
  - historial de estado
  - historial de asignacion
  - mensajes
  - (opcional) SLAencuestasIA si ya existen
Criterios de aceptacion
- respuesta consistente y ordenada
Pruebas minimas
- feature test

---

### T6-094 — UI Angular vista de auditoria en detalle de caso (Angular)
Objetivo Visualizar trazabilidad en UI.  
Alcance
- seccion “Auditoria”
- timeline simple
- filtros por tipo de registro (eventosestadosmensajes)
Criterios de aceptacion
- auditoria se ve y navega
Pruebas minimas
- prueba manual

---

### T6-095 — Politica de falla evento_log (decision implementable) (Laravel)
Objetivo Definir comportamiento cuando falla persistencia de auditoria.  
Alcance (recomendacion MVP)
- si falla `EventPublisher`, abortar transaccion y devolver error 500 controlado
- log adicional para soporte
Criterios de aceptacion
- no existen cambios sin evento asociado
Pruebas minimas
- test simulando fallo (mock) - rollback

---

## Priorizacion del paquete (orden recomendado)
1) T6-089 (evento_log canonico)  
2) T6-090 (helper unico)  
3) T6-091 (correlation_id)  
4) T6-092 (integracion_consumo)  
5) T6-095 (politica de falla)  
6) T6-093 (endpoint auditoria)  
7) T6-094 (UI auditoria)

---

## Nota de alcance MVP
- Este paquete fortalece todo lo ya construido; conviene aplicarlo antes de ir a produccion.
- El rol Auditor (solo lectura) puede aplicarse via permisos del Paquete 13.

---

## Listo para Cursor + spec-kit (cuando corresponda)
- Pedir a Cursor refactor incremental introducir EventPublisher y migrar un modulo a la vez.
- Evitar “big bang refactor”.
