# Etapa 6 — Paquete 15 (CU-15) Imputacion de Tiempo Flexible (MVP)

## Metadata
- Etapa 6 — Ejecucion y Construccion (IA-First)
- Paquete 15
- Caso de uso CU-15 Imputacion de Tiempo (flexible)
- Alcance MVP
- Dependencias Paquetes 01–05 (casos, mensajes), 13 (usuarios), 14 (auditoria)

---

## Caso de Uso — CU-15 Imputacion de Tiempo Flexible

### Objetivo
Permitir que usuarios internos registren imputacion de tiempo sobre un caso, con flexibilidad
- se puede imputar tiempo aunque el usuario no sea el responsable
- se puede imputar tiempo en distintos momentos
- se registra trazabilidad y eventos

### Actores
- Actor primario Usuario interno (Agente  Encargado  Jefe)
- Actor secundario Sistema

### Disparador
El usuario necesita registrar tiempo invertido (gestion, analisis, ejecucion, coordinacion, etc.) para control y metricas.

### Precondiciones
- Caso existe.
- Usuario interno autenticado (Paquete 13) o identidad disponible en dev.
- Caso no esta cerrado (decision recomendada MVP permitir imputar solo en casos no cerrados).

### Flujo principal
1. Usuario abre el caso.
2. Usuario registra una imputacion
   - fecha
   - minutos (o hhmm)
   - tipo de actividad (opcional)
   - comentario (opcional)
3. Sistema valida
   - caso existe
   - minutos  0
   - fecha razonable (no futuro extremo)
4. Sistema guarda imputacion.
5. Sistema emite evento `TiempoImputado`.
6. UI muestra total acumulado y detalle.

### Postcondiciones
- Tiempo registrado y visible en el caso.
- Datos listos para metricas (por area, por tipo, por usuario).

### Reglas  invariantes relevantes
- No requiere estar asignado.
- Se registra actor imputador siempre.
- Minimo minutos enteros.
- No se modifican estados por imputacion.

### Excepciones
- Caso cerrado - rechazo (recomendacion MVP).
- Minutos invalidos - rechazo.

---

## Historias de Usuario asociadas

### HU-15 — Registrar tiempo en un caso (prioridad media-alta)
Como usuario interno  
Quiero imputar tiempo sobre un caso, aunque no sea responsable  
Para reflejar el esfuerzo real y obtener metricas.

#### Criterios de aceptacion (GivenWhenThen)
- Given un caso abierto
  When registro 30 minutos con comentario
  Then se guarda imputacion, se ve en el caso y se emite TiempoImputado

- Given un caso cerrado
  When intento imputar tiempo
  Then se rechaza

---

## Tickets de trabajo (= 4 horas cu) para HU-15

### T6-096 — Migracion y modelo imputacion_tiempo (Laravel)
Objetivo Persistir imputaciones.  
Alcance
- tabla `imputacion_tiempo`
  - id_imputacion (PK)
  - id_caso (FK)
  - id_usuario (FK) (actor)
  - fecha_trabajo (date)
  - minutos (int)
  - tipo_actividad (nullable)
  - comentario (nullable)
  - fecha_registro (datetime)
- indices
  - (id_caso, fecha_trabajo)
  - (id_usuario, fecha_trabajo)
Criterios de aceptacion
- migraciones aplican
Pruebas minimas
- migratefresh

---

### T6-097 — Endpoint POST apicasos{id}tiempos (Laravel)
Objetivo Registrar imputacion.  
Alcance
- valida caso existe y no cerrado
- valida minutos  0
- guarda imputacion
- emite `TiempoImputado` (evento_log)
- actualiza `fecha_ultima_actividad` del caso (opcional, recomendado)
Criterios de aceptacion
- crea imputacion
- rechaza en caso cerrado
Pruebas minimas
- feature tests

---

### T6-098 — Endpoint GET apicasos{id}tiempos (Laravel)
Objetivo Listar imputaciones del caso.  
Alcance
- lista ordenada por fecha_trabajo desc
- incluye total acumulado
Criterios de aceptacion
- retorna lista y total
Pruebas minimas
- feature test

---

### T6-099 — UI Angular seccion imputacion en detalle de caso (Angular)
Objetivo Mostrar y registrar tiempos desde UI.  
Alcance
- formulario
  - fecha
  - minutos
  - comentario
- tabla de registros
- total acumulado
Criterios de aceptacion
- registra y muestra imputaciones
Pruebas minimas
- prueba manual guiada

---

### T6-100 — Validaciones adicionales (MVP) (Laravel)
Objetivo Asegurar consistencia minima sin complejidad.  
Alcance
- no permitir fecha muy futura (ej  hoy + 1 dia)
- limite superior razonable por registro (ej 24h = 1440 minutos) configurable
Criterios de aceptacion
- rechaza valores extremos
Pruebas minimas
- unit tests de validacion

---

## Priorizacion del paquete (orden recomendado)
1) T6-096 (tabla)  
2) T6-097 (POST)  
3) T6-098 (GET)  
4) T6-099 (UI)  
5) T6-100 (validaciones extra)

---

## Nota de alcance MVP
- No se incluye aprobacion de tiempos ni reportes avanzados (paquete futuro).
- La imputacion flexible queda habilitada desde el MVP.

---

## Listo para Cursor + spec-kit (cuando corresponda)
- En Cursor, exigir que NO se verifique asignacion del usuario al caso.
- Asegurar emision de evento TiempoImputado para auditoria y metricas.
