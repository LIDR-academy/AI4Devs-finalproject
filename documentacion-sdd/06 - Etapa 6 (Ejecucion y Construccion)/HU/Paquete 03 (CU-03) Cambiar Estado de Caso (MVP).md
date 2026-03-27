# Etapa 6 — Paquete 03 (CU-03): Cambiar Estado de Caso (MVP)

## Metadata
- Etapa: 6 — Ejecucion y Construccion (IA-First)
- Paquete: 03
- Caso de uso: CU-03 Cambiar Estado de Caso
- Alcance: MVP (core de reglas duras; sin Kanban aun)
- Dependencias: Paquete 01 (casos) + Paquete 02 (consulta) + catalogos base

---

## Caso de Uso — CU-03: Cambiar Estado de Caso

### Objetivo
Permitir que un **usuario interno** avance un caso por su ciclo de vida, respetando reglas duras:
- transiciones configurables
- no se permiten saltos
- no se permite retroceso

y registrando:
- historial de cambios
- evento de estado

### Actores
- Actor primario: Usuario interno (Agente / Encargado / Jefe de area, segun permisos)
- Actor secundario: Sistema (motor de ciclo, auditoria)

### Disparador
El usuario necesita mover el caso a su siguiente estado (por ejemplo, de Ingresado a Asignado, o de En trabajo a Resuelto).

### Precondiciones
- Existe un caso creado.
- Existe un ciclo de vida vigente para el tipo de trabajo (baseline por defecto).
- El usuario interno tiene acceso a ejecutar la transicion (autorizacion fina puede implementarse despues).

### Flujo principal
1. Usuario abre el caso.
2. Usuario solicita cambiar el estado a un estado destino.
3. Sistema valida:
   - que la transicion exista en la configuracion vigente del ciclo
   - que no haya retroceso ni salto (segun transiciones/orden)
4. Si es valido:
   - actualiza `caso.id_estado_actual`
   - registra en `caso_estado_historial`
   - emite evento `EstadoCambiado`
5. Si no es valido:
   - no cambia el caso
   - emite `TransicionRechazada` (auditable)
   - responde con error y razon

### Postcondiciones
- Caso queda en nuevo estado, o se mantiene igual si la transicion fue rechazada.
- Existe trazabilidad del intento.

### Reglas / invariantes relevantes
- Un caso cerrado no se reabre (se asegura en integraciones; aqui solo se evita transicionar desde cerrado).
- Motor de ciclo es la unica forma valida de cambiar estado (no se cambia directo por update de caso).

### Excepciones
- Estado destino no permitido -> rechazo
- Caso no existe -> 404
- Caso ya cerrado -> rechazo

---

## Historias de Usuario asociadas

### HU-03 — Cambiar estado de un caso (alta prioridad)
Como usuario interno  
Quiero avanzar el caso respetando el ciclo definido  
Para asegurar orden, auditoria y reportería consistente.

#### Criterios de aceptacion (Given/When/Then)
- Given un caso en un estado X
  When solicito cambio a un estado Y permitido
  Then el caso cambia a Y, se registra historial y se emite EstadoCambiado

- Given un caso en un estado X
  When solicito cambio a un estado no permitido
  Then el caso NO cambia, se registra TransicionRechazada y se informa la razon

- Given un caso cerrado
  When intento cambiar estado
  Then el sistema rechaza la operacion

---

## Tickets de trabajo (<= 4 horas c/u) para HU-03

> Nota: Este paquete introduce configuracion versionada minima de ciclos y estados (baseline).
> Mantenerlo simple para cerrar rapido y habilitar Kanban en el paquete siguiente.

### T6-013 — Migraciones: ciclo_vida_version, estado, transicion (Laravel)
**Objetivo:** Crear tablas de configuracion del ciclo de vida versionado.  
**Alcance:**
- `ciclo_vida_version` (por tipo_trabajo, version_numero, vigente)
- `estado` (por ciclo_version, nombre, orden, es_inicial, es_final)
- `transicion` (por ciclo_version, estado_origen, estado_destino)
- constraints:
  - UNIQUE (ciclo_version, origen, destino)
**Criterios de aceptacion:**
- migraciones aplican sin errores
- se pueden crear versiones y definir estados/transiciones
**Pruebas minimas:**
- migrate:fresh

---

### T6-014 — Seed baseline de ciclo de vida (por tipo_trabajo) (Laravel)
**Objetivo:** Cargar un baseline inicial (vigente) para cada tipo de trabajo.  
**Alcance:**
- definir estados y transiciones alto nivel (baseline):
  - Incidente: Ingresado -> AsignadoArea -> AsignadoResponsable -> EnTrabajo -> Resuelto -> Cerrado
  - Solicitud: Ingresado -> AsignadoArea -> AsignadoResponsable -> EnTrabajo -> Cerrado
  - Contingencia: Ingresado -> AsignadoArea -> EnTrabajo -> Cerrado
  - Requerimiento: Ingresado -> Analisis -> EnTrabajo -> Cerrado
  - Proyecto: Iniciado -> Planificado -> EnEjecucion -> Cerrado
  - ActividadProcesos: Ingresado -> EnTrabajo -> Cerrado
- marcar version vigente por tipo
**Criterios de aceptacion:**
- cada tipo_trabajo tiene un ciclo vigente con estado inicial
**Pruebas minimas:**
- seed + query de verificacion automatizada

---

### T6-015 — Motor de Ciclo de Vida (servicio) (Laravel)
**Objetivo:** Implementar un servicio que valide y ejecute transiciones.  
**Alcance:**
- obtener ciclo vigente por tipo_trabajo del caso
- validar existencia de transicion (origen->destino)
- validar restricciones:
  - no permitir transicionar si estado actual es final (cerrado)
- ejecutar:
  - update de `caso.id_estado_actual`
  - insert en `caso_estado_historial`
**Criterios de aceptacion:**
- transicion valida actualiza y registra historial
- transicion invalida no cambia estado
**Pruebas minimas:**
- unit tests con casos validos/invalidos

---

### T6-016 — Endpoint POST /api/casos/{id}/transiciones (Laravel)
**Objetivo:** Exponer el cambio de estado via API.  
**Alcance:**
- recibe `id_estado_destino`
- llama motor de ciclo
- retorna 200 si ok / 422 si rechazada
- registra evento:
  - EstadoCambiado (ok)
  - TransicionRechazada (rechazo)
**Criterios de aceptacion:**
- cumple criterios HU-03
**Pruebas minimas:**
- feature tests:
  - transicion ok
  - transicion rechazada
  - caso cerrado rechaza

---

### T6-017 — Migracion + escritura de evento_log para EstadoCambiado/TransicionRechazada (Laravel)
**Objetivo:** Asegurar registro de eventos canonicos al cambiar estado o rechazar.  
**Alcance:**
- si ya existe `evento_log` del paquete 01, reutilizar
- agregar helpers para emitir eventos v1
**Criterios de aceptacion:**
- cada transicion produce evento correspondiente
**Pruebas minimas:**
- feature test verificando insercion en evento_log

---

### T6-018 — UI Angular: control minimo de cambio de estado (Angular)
**Objetivo:** Permitir cambiar estado desde la vista detalle (sin Kanban).  
**Alcance:**
- en detalle de caso:
  - mostrar estado actual
  - mostrar dropdown con estados destino permitidos (solo siguientes)
- llamada a POST transiciones
- manejo de error con razon
**Criterios de aceptacion:**
- usuario puede avanzar segun ciclo baseline
- muestra error si transicion invalida
**Pruebas minimas:**
- prueba manual guiada

---

### T6-019 — Endpoint GET /api/casos/{id}/transiciones-posibles (Laravel)
**Objetivo:** Exponer lista de estados destino permitidos desde estado actual.  
**Alcance:**
- dado un caso, devolver lista de estados destino permitidos segun transiciones
**Criterios de aceptacion:**
- UI puede poblar dropdown correctamente
**Pruebas minimas:**
- feature test

---

## Priorizacion del paquete (orden recomendado)
1) T6-013 (tablas ciclo)  
2) T6-014 (seed baseline)  
3) T6-015 (motor)  
4) T6-016 (endpoint transiciones)  
5) T6-019 (transiciones posibles)  
6) T6-018 (UI cambio estado)  
7) T6-017 (eventos si no quedo ya cubierto dentro de T6-016)

---

## Notas de implementacion (importante)
- Para mantener tickets <= 4h, el baseline se carga por seed y se asume vigente.
- La edicion por Admin (mantenedor de ciclos) se puede dejar para un paquete posterior, una vez el motor este estable.
- Esto habilita inmediatamente Kanban (Paquete 05) porque el Kanban solo solicita transiciones.

---

## Listo para Cursor + spec-kit (cuando corresponda)
Sugerencia de uso:
- En Cursor, tomar primero T6-013 + T6-014 para dejar baseline listo.
- Luego T6-015/016 para tener motor y endpoint.
- Recien despues crear UI, para que Angular consuma API estable.
