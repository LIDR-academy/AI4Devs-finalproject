# Etapa 6 — Paquete 12 (CU-12) IA — Sugerencias y Confirmacion (MVP)

## Metadata
- Etapa 6 — Ejecucion y Construccion (IA-First)
- Paquete 12
- Caso de uso CU-12 IA — Sugerencias y Confirmacion
- Alcance MVP (IA sugiere, el humano confirma)
- Dependencias Paquetes 01–05 (casos, mensajes), 03 (ciclo), 04 (asignaciones), 11 (SLA opcional para contexto)

---

## Caso de Uso — CU-12 IA — Sugerencias y Confirmacion

### Objetivo
Proveer sugerencias asistidas por IA para
- area responsable
- subtipo de trabajo
- prioridad
- respuesta sugerida (borrador)

respetando reglas
- la IA no ejecuta acciones
- umbral 0.85 para preseleccion
- confirmacion humana obligatoria
- auditoria completa (aceptadorechazado)

### Actores
- Actor primario Usuario interno
- Actor secundario Sistema (servicio IA)

### Disparador
- Creacion de caso
- Registro de mensaje del solicitante (correoUI)
- Accion manual del usuario (“Solicitar sugerencias”)

### Precondiciones
- Caso existe y no esta cerrado.
- Existen catalogos (area, subtipo, prioridad).
- Servicio IA disponible (puede ser mockeado en dev).

### Flujo principal
1. Sistema solicita sugerencias al servicio IA con contexto del caso
   - tiposubtipo (si existe)
   - texto del mensaje inicial
   - historico corto del caso
2. Servicio IA retorna sugerencias con confianza (0–1).
3. UI presenta sugerencias
   - si confianza = 0.85 → preseleccionada
   - si confianza  0.85 → requiere confirmacion explicita
4. Usuario confirma o rechaza cada sugerencia.
5. Sistema
   - aplica solo las confirmadas
   - registra auditoria (decision humana)
   - emite eventos de confirmacion

### Postcondiciones
- Caso actualizado solo con decisiones confirmadas.
- Registro auditable de sugerencias y decisiones.

### Reglas  invariantes
- IA nunca cambia estado ni asigna sin confirmacion.
- Rechazar una sugerencia no reintenta automaticamente.
- Un caso cerrado no acepta sugerencias.

### Excepciones
- Servicio IA no disponible → UI permite continuar sin IA.
- Payload invalido → se omite sugerencia con log.

---

## Historias de Usuario asociadas

### HU-12 — Usar IA para sugerir y confirmar (prioridad media)
Como usuario interno  
Quiero recibir sugerencias de IA y decidir si aplicarlas  
Para acelerar la gestion sin perder control.

#### Criterios de aceptacion (GivenWhenThen)
- Given un caso nuevo
  When solicito sugerencias
  Then veo areasubtipoprioridadrespuesta con confianza

- Given una sugerencia con confianza = 0.85
  When la confirmo
  Then se aplica y se registra auditoria

- Given una sugerencia rechazada
  When continuo
  Then no se aplica ningun cambio

---

## Tickets de trabajo (= 4 horas cu) para HU-12

### T6-073 — Migraciones sugerencia_ia y decision_ia (Laravel)
Objetivo Persistir sugerencias y decisiones humanas.  
Alcance
- `sugerencia_ia`
  - id_sugerencia (PK)
  - id_caso (FK)
  - tipo (area  subtipo  prioridad  respuesta)
  - valor_sugerido
  - confianza
  - fecha_creacion
- `decision_ia`
  - id_decision (PK)
  - id_sugerencia (FK)
  - decision (aceptada  rechazada)
  - actor
  - fecha_decision
Criterios de aceptacion
- migraciones aplican sin errores
Pruebas minimas
- migratefresh

---

### T6-074 — Servicio IA (adapter) + mock (Laravel)
Objetivo Integrar servicio IA desacoplado.  
Alcance
- interfaz `ServicioIA`
- implementacion mock (dev)
- timeout y manejo de errores
Criterios de aceptacion
- sistema funciona con mock
Pruebas minimas
- unit test del adapter

---

### T6-075 — Endpoint POST apicasos{id}iasugerir (Laravel)
Objetivo Solicitar sugerencias IA.  
Alcance
- arma contexto
- invoca servicio IA
- persiste sugerencias
- retorna sugerencias con confianza
Criterios de aceptacion
- retorna lista consistente
Pruebas minimas
- feature test (mock IA)

---

### T6-076 — Endpoint POST apiiaconfirmar (Laravel)
Objetivo Confirmar o rechazar sugerencias.  
Alcance
- aplica solo sugerencias aceptadas
- registra decision
- emite eventos (opcional)
Criterios de aceptacion
- solo lo confirmado se aplica
Pruebas minimas
- feature test

---

### T6-077 — UI Angular panel de sugerencias IA (Angular)
Objetivo Mostrar y confirmar sugerencias.  
Alcance
- lista sugerencias
- indicador confianza
- preseleccion = 0.85
- botones confirmarrechazar
Criterios de aceptacion
- UX clara y controlada
Pruebas minimas
- prueba manual guiada

---

### T6-078 — Auditoria y eventos IA (Laravel)
Objetivo Trazabilidad de decisiones IA.  
Alcance
- eventos
  - IASugerenciaGenerada
  - IADecisionRegistrada
Criterios de aceptacion
- eventos persistidos
Pruebas minimas
- feature test

---

## Priorizacion del paquete (orden recomendado)
1) T6-073 (tablas)  
2) T6-074 (adapter IA + mock)  
3) T6-075 (sugerir)  
4) T6-077 (UI)  
5) T6-076 (confirmar)  
6) T6-078 (auditoria)

---

## Nota de alcance MVP
- El entrenamientoafinamiento del modelo queda fuera.
- Se recomienda comenzar con prompts deterministas + mock.
- Produccion puede usar proveedor externo mas adelante.

---

## Listo para Cursor + spec-kit (cuando corresponda)
- En Cursor, exigir no side-effects sin confirmacion.
- Asegurar persistencia antes de aplicar cambios.
