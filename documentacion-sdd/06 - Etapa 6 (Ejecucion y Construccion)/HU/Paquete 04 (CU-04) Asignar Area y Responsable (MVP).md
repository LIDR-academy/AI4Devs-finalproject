# Etapa 6 — Paquete 04 (CU-04): Asignar Area y Responsable (MVP)

## Metadata
- Etapa: 6 — Ejecucion y Construccion (IA-First)
- Paquete: 04
- Caso de uso: CU-04 Asignar Area / Responsable
- Alcance: MVP (operacion diaria basica)
- Dependencias: Paquetes 01–03 (casos, consulta, estados) + catalogos `area` y `usuario` minimos

---

## Caso de Uso — CU-04: Asignar Area / Responsable

### Objetivo
Permitir que un **usuario interno** asigne o reasigne:
- el area responsable de un caso
- el responsable (usuario) del caso

cumpliendo reglas:
- reasignacion NO cambia el estado del caso
- se registra historial de asignaciones
- se emiten eventos de asignacion

### Actores
- Actor primario: Usuario interno (Agente / Encargado / Jefe de area / Admin)
- Actor secundario: Sistema (validaciones, auditoria)

### Disparador
Un caso creado requiere ser derivado a un area y/o a un responsable para su gestion.

### Precondiciones
- Existe un caso creado.
- Existen areas del sistema (DII, Soporte TI, Procesos) al menos como catalogo.
- Existen usuarios internos (catalogo minimo; la auth fina puede implementarse despues).

### Flujo principal — Asignar area
1. Usuario abre el caso.
2. Usuario selecciona un area destino.
3. Sistema valida que el area exista.
4. Sistema actualiza `caso.id_area_responsable`.
5. Sistema registra en `caso_asignacion_historial`.
6. Sistema emite evento `AreaAsignada`.
7. Sistema responde OK.

### Flujo principal — Asignar responsable
1. Usuario selecciona un responsable destino.
2. Sistema valida que el usuario exista.
3. Sistema actualiza `caso.id_responsable`.
4. Registra historial.
5. Emite `ResponsableAsignado`.

### Postcondiciones
- Area/responsable quedan asignados sin modificar `id_estado_actual`.
- Se registra trazabilidad completa.

### Reglas / invariantes relevantes
- no se cambia el estado del caso por asignar
- se puede reasignar múltiples veces
- caso cerrado: por defecto se permite asignar? (definicion MVP)
  - recomendacion MVP: NO permitir cambios sobre caso cerrado para mantener consistencia

### Excepciones
- caso no existe (404)
- area/responsable no existen (422)
- caso cerrado (rechazo)

---

## Historias de Usuario asociadas

### HU-04 — Asignar caso a area y responsable (alta prioridad)
Como usuario interno  
Quiero asignar o reasignar un caso a un area y/o responsable  
Para que el trabajo llegue al equipo correcto sin cambiar el estado.

#### Criterios de aceptacion (Given/When/Then)
- Given un caso abierto
  When asigno un area valida
  Then el caso actualiza su area, no cambia estado, registra historial y emite AreaAsignada

- Given un caso abierto
  When asigno un responsable valido
  Then el caso actualiza responsable, no cambia estado, registra historial y emite ResponsableAsignado

- Given un caso cerrado
  When intento asignar
  Then el sistema rechaza

---

## Tickets de trabajo (<= 4 horas c/u) para HU-04

### T6-020 — Migraciones y seed de areas (Laravel)
**Objetivo:** Crear catalogo `area` con seeds minimos.  
**Alcance:**
- tabla `area` con:
  - id_area (PK)
  - codigo (UNIQUE)
  - nombre
- seed:
  - DII
  - SOPORTE_TI
  - PROCESOS
**Criterios de aceptacion:**
- seeds cargan y quedan consultables
**Pruebas minimas:**
- migrate:fresh --seed

---

### T6-021 — Catalogo minimo de usuarios (Laravel)
**Objetivo:** Definir tabla `usuario` minima para asignaciones (sin auth completa).  
**Alcance:**
- tabla `usuario` con campos minimos:
  - id_usuario (PK)
  - nombre
  - correo (UNIQUE)
  - id_area (nullable)
  - activo (bool)
- seed de usuarios de prueba (minimo 2 por area)
**Criterios de aceptacion:**
- existen usuarios para seleccionar en UI
**Pruebas minimas:**
- seed y consulta

---

### T6-022 — Migracion y modelo: caso_asignacion_historial (Laravel)
**Objetivo:** Persistir historial de asignaciones.  
**Alcance:**
- tabla `caso_asignacion_historial` con:
  - area_anterior, area_nueva
  - responsable_anterior, responsable_nuevo
  - actor (id_usuario o string temporal)
  - fecha_hora
- indices por caso y fecha
**Criterios de aceptacion:**
- insertar historial por cada asignacion
**Pruebas minimas:**
- unit test insercion

---

### T6-023 — Endpoint POST /api/casos/{id}/asignaciones/area (Laravel)
**Objetivo:** Asignar/reasignar area de un caso.  
**Alcance:**
- valida caso existe y no esta cerrado
- valida area existe
- actualiza `caso.id_area_responsable`
- registra historial
- emite `AreaAsignada` en `evento_log`
**Criterios de aceptacion:**
- cumple HU-04 (area)
**Pruebas minimas:**
- feature tests: ok, caso no existe, area no existe, caso cerrado

---

### T6-024 — Endpoint POST /api/casos/{id}/asignaciones/responsable (Laravel)
**Objetivo:** Asignar/reasignar responsable de un caso.  
**Alcance:**
- valida caso existe y no esta cerrado
- valida usuario existe y activo
- actualiza `caso.id_responsable`
- registra historial
- emite `ResponsableAsignado`
**Criterios de aceptacion:**
- cumple HU-04 (responsable)
**Pruebas minimas:**
- feature tests: ok, caso no existe, usuario no existe, inactivo, caso cerrado

---

### T6-025 — Endpoint GET /api/areas y GET /api/usuarios (Laravel)
**Objetivo:** Exponer catalogos para UI (seleccion).  
**Alcance:**
- GET /api/areas
- GET /api/usuarios?area_id=...
**Criterios de aceptacion:**
- UI puede listar y filtrar usuarios por area
**Pruebas minimas:**
- feature tests basicos

---

### T6-026 — UI Angular: asignar area y responsable (Angular)
**Objetivo:** Permitir asignaciones desde vista detalle de caso.  
**Alcance:**
- componentes:
  - selector de area
  - selector de responsable (filtrado por area si aplica)
- llamada a endpoints
- feedback de exito y error
**Criterios de aceptacion:**
- asignar area y responsable sin cambiar estado
- rechazar asignacion en caso cerrado
**Pruebas minimas:**
- prueba manual guiada

---

### T6-027 — Vista historial de asignaciones (Angular) (opcional, pero util)
**Objetivo:** Mostrar historial en detalle de caso.  
**Alcance:**
- endpoint GET /api/casos/{id}/asignaciones-historial
- UI lista cambios con fecha y actor
**Criterios de aceptacion:**
- se ve trazabilidad minima
**Pruebas minimas:**
- feature test + prueba manual

---

## Priorizacion del paquete (orden recomendado)
1) T6-020 (areas)  
2) T6-021 (usuarios minimos)  
3) T6-022 (historial)  
4) T6-025 (endpoints catalogos)  
5) T6-023 (asignar area)  
6) T6-024 (asignar responsable)  
7) T6-026 (UI)  
8) T6-027 (historial UI, opcional)

---

## Nota importante (alcance MVP)
- La integracion real con la API externa de permisos/menus se implementa en un paquete posterior de seguridad.
- Para fines de construccion y validacion funcional, basta con un catalogo minimo de usuarios y una identidad de actor temporal (por ejemplo, actor_id fijo en entorno dev).

---

## Listo para Cursor + spec-kit (cuando corresponda)
- Trabajar ticket por ticket.
- Evitar que Cursor implemente autorizacion fina; eso va en paquetes posteriores.
