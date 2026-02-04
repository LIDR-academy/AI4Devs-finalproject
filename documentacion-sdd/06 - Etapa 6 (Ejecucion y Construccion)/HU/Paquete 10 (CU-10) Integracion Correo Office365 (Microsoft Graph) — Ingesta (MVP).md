# Etapa 6 — Paquete 10 (CU-10): Integracion Correo Office365 (Microsoft Graph) — Ingesta (MVP)

## Metadata
- Etapa: 6 — Ejecucion y Construccion (IA-First)
- Paquete: 10
- Caso de uso: CU-10 Integracion Correo Office365 — Ingesta
- Alcance: MVP (solo correo)
- Dependencias: Paquetes 01–05 (casos, contacto, mensajes) + regla no reapertura + idempotencia + evento_log

---

## Caso de Uso — CU-10: Integracion Correo Office365 — Ingesta

### Objetivo
Permitir que el sistema **lea correos entrantes** del buzón de mesa de servicios (Office365) y:
- cree casos nuevos cuando corresponda
- agregue mensajes a casos existentes cuando corresponda
- NO reabra casos cerrados (si llega correo de un caso cerrado, crea un caso nuevo)
- deduzca país (CL/CO/US) según reglas simples (MVP) o por defecto
- asegure deduplicacion por `Message-ID`

### Actor(es)
- Actor primario: Sistema (Integrador Correo)
- Actores secundarios: Office365 (Graph), Usuario interno (solo consulta)

### Disparador
- Ejecucion programada (polling) o webhook (notificaciones Graph).
- Para MVP, se recomienda **polling** (simplifica arranque; webhook puede venir despues).

### Precondiciones
- Existe configuracion de Graph (tenant, client_id, secret/cert).
- Buzón objetivo definido (ej: mesadeservicios@...).
- Se dispone de permisos de Graph apropiados.
- Se mantiene registro de mensajes procesados (idempotencia).

### Flujo principal (MVP — polling)
1. Job de ingesta se ejecuta cada N minutos.
2. Integrador consulta Graph por correos nuevos (desde ultimo watermark).
3. Por cada correo:
   - obtiene `internetMessageId` (Message-ID) y/o `id` de Graph
   - valida si ya fue procesado (idempotencia)
4. Determina correlacion:
   - Si el asunto/cuerpo contiene `codigo_caso` (ej: CASO-000123):
     - busca ese caso
     - si caso existe y NO esta cerrado -> agregar mensaje al caso
     - si caso existe y esta cerrado -> crear caso nuevo y registrar mensaje
   - Si no contiene codigo -> crear caso nuevo y registrar mensaje
5. Crea contacto (si no existe) usando:
   - correo remitente como llave principal (MVP)
   - nombre remitente si disponible
   - pais: heuristica MVP (ver abajo) o default CL
6. Registra mensaje entrante:
   - canal = correo
   - origen = solicitante
   - id_externo = Message-ID
   - id_hilo_externo = conversationId/threadId (si existe)
7. Registra eventos:
   - CasoCreado (si corresponde)
   - MensajeRegistrado
   - (opcional) PrimeraAccionRegistrada (NO debe dispararse por mensajes del solicitante; se recomienda que primera accion sea del agente/sistema. Definicion: primera gestion interna.)
8. Actualiza watermark/estado de procesamiento.

### Heuristica pais (MVP)
Como el “cliente interno” no es util, y lo relevante es CL/CO/US:
- Si el correo pertenece a dominios conocidos (configurable) -> asignar pais
- Si no, default CL (configurable)

> Alternativa MVP: no inferir; pedir al agente completar/ajustar el pais en el caso si viene incompleto.

### Postcondiciones
- Mensajes entrantes quedan trazados en BD.
- Casos se crean o actualizan sin duplicaciones.
- Casos cerrados nunca se reabren.

### Reglas / invariantes relevantes
- Idempotencia estricta por Message-ID.
- No reapertura: correo sobre caso cerrado -> caso nuevo.
- Un caso activo por contacto: (aplica a WhatsApp; para correo MVP se recomienda NO forzar esta regla para evitar efectos no deseados, salvo que tu lo pidas. En correo es comun que un contacto tenga multiples hilos.)
  - Decision recomendada MVP: **NO aplicar 1 caso activo por contacto en correo**, solo por codigo_caso/hilo.

### Excepciones
- Falla Graph -> no afecta core (log y reintento).
- Correo sin Message-ID -> usar `graph_id` como idempotency key.
- Adjuntos -> se omiten en MVP o se guardan como evidencia (si se decide; ver tickets).

---

## Historias de Usuario asociadas

### HU-10 — Ingestar correos entrantes y crear/actualizar casos (prioridad alta MVP)
Como sistema  
Quiero leer correos entrantes del buzón y crear o actualizar casos  
Para operar la mesa sin ingreso manual.

#### Criterios de aceptacion (Given/When/Then)
- Given un correo sin codigo de caso
  When se ejecuta la ingesta
  Then se crea un caso nuevo y se registra el mensaje

- Given un correo con codigo de caso de un caso abierto
  When se ejecuta la ingesta
  Then se registra el mensaje en el caso existente y no se crea un caso nuevo

- Given un correo con codigo de caso de un caso cerrado
  When se ejecuta la ingesta
  Then se crea un caso nuevo (no se reabre) y se registra el mensaje

- Given el mismo correo procesado dos veces
  When se ejecuta la ingesta nuevamente
  Then no se duplica mensaje ni caso

---

## Tickets de trabajo (<= 4 horas c/u) para HU-10

### T6-058 — Modelo de idempotencia: evento_consumo_correo (Laravel)
**Objetivo:** Registrar correos ya procesados para evitar duplicados.  
**Alcance:**
- tabla `correo_procesado` (o `evento_consumo` reutilizable):
  - id (PK)
  - id_externo (Message-ID o graph_id) UNIQUE
  - fecha_procesado
  - resultado (creo_caso / agrego_mensaje / omitido)
  - id_caso (nullable)
- helper para consultar/insertar de forma atomica
**Criterios de aceptacion:**
- si id_externo ya existe, se omite procesamiento
**Pruebas minimas:**
- unit test: doble insercion no duplica

---

### T6-059 — Cliente Graph: autenticacion y lectura basica (Laravel)
**Objetivo:** Conectar a Graph y listar correos no procesados.  
**Alcance:**
- servicio `GraphCorreoClient`
- autenticacion OAuth2 (client credentials recomendado para daemon)
- funcion listar correos (limit + filtro fecha)
- configuracion via env
**Criterios de aceptacion:**
- en entorno dev, puede ejecutar consulta y traer correos (mock si no hay tenant listo)
**Pruebas minimas:**
- test con mock de cliente HTTP
- (manual) prueba con tenant cuando este disponible

---

### T6-060 — Job de ingesta por polling (Laravel)
**Objetivo:** Ejecutar ingesta periodica de correos.  
**Alcance:**
- comando/job `IngestarCorreos`
- frecuencia configurable
- watermark simple (ultima fecha o ultimo id)
- procesa en lotes
**Criterios de aceptacion:**
- se ejecuta sin bloquear el sistema
- procesa correos en batch
**Pruebas minimas:**
- test de job con mocks

---

### T6-061 — Parser de correlacion por codigo_caso (Laravel)
**Objetivo:** Detectar `codigo_caso` en asunto/cuerpo.  
**Alcance:**
- regex robusta para CASO-000123
- retorna codigo encontrado o null
**Criterios de aceptacion:**
- detecta codigo en distintos formatos de asunto
**Pruebas minimas:**
- unit tests con casos variados

---

### T6-062 — Persistencia: correo -> caso/mensaje (Laravel)
**Objetivo:** Crear o asociar caso y registrar mensaje segun reglas CU-10.  
**Alcance:**
- si codigo detectado:
  - buscar caso por codigo
  - si abierto: agregar mensaje
  - si cerrado: crear caso nuevo + mensaje
- si no hay codigo: crear caso nuevo + mensaje
- registrar `mensaje` con:
  - canal=correo
  - origen=solicitante
  - remitente=from
  - id_externo=Message-ID
  - id_hilo_externo=conversationId si existe
- actualizar `fecha_ultima_actividad` del caso
**Criterios de aceptacion:**
- cumple HU-10
**Pruebas minimas:**
- feature tests con correos simulados (payload mock)

---

### T6-063 — Manejo de adjuntos (MVP reducido) (Laravel)
**Objetivo:** Definir comportamiento MVP para adjuntos.  
**Alcance (elige MVP):**
- opcion A (recomendada MVP): ignorar adjuntos y dejar log
- opcion B: guardar metadata de adjunto sin descargar
**Criterios de aceptacion:**
- no rompe ingesta
**Pruebas minimas:**
- test con correo que trae adjuntos (mock)

---

### T6-064 — Observabilidad basica de ingesta (Laravel)
**Objetivo:** Logs y metricas simples para operar la ingesta.  
**Alcance:**
- log por batch:
  - cantidad leida
  - cantidad procesada
  - omitidos por idempotencia
  - errores
**Criterios de aceptacion:**
- logs claros para soporte
**Pruebas minimas:**
- prueba manual (ver logs)

---

## Priorizacion del paquete (orden recomendado)
1) T6-058 (idempotencia)  
2) T6-061 (parser codigo)  
3) T6-062 (persistencia caso/mensaje)  
4) T6-059 (cliente Graph)  
5) T6-060 (job polling)  
6) T6-064 (observabilidad)  
7) T6-063 (adjuntos MVP)

---

## Decisiones abiertas (para que confirmes en el proximo paso)
1) Regla 1 caso activo por contacto:
   - Recomendacion para correo MVP: NO aplicarla, solo correlacion por codigo/hilo.
2) Pais en casos creados por correo:
   - Default CL configurable y editable manualmente por agente.
3) Adjuntos:
   - opcion A (ignorar) u opcion B (guardar metadata).

---

## Listo para Cursor + spec-kit (cuando corresponda)
- En Cursor, trabajar primero idempotencia + parser + persistencia con payloads mock.
- Dejar la conexion real a Graph para cuando Soporte confirme app/permisos.
