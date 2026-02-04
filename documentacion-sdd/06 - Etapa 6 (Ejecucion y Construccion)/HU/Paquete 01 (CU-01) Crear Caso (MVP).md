# Etapa 6 — Paquete 01 (CU-01): Crear Caso (MVP)

## Metadata
- Etapa: 6 — Ejecucion y Construccion (IA-First)
- Paquete: 01
- Caso de uso: CU-01 Crear Caso
- Alcance: MVP (canal correo en MVP, pero este paquete es UI interna)
- Precondicion: Proyecto Laravel y Angular creados por ti (instalacion basica) + repositorio GitLab creado

---

## Caso de Uso — CU-01: Crear Caso

### Objetivo
Permitir que un **usuario interno** cree un **caso** en nombre de un **solicitante externo** (sin login), registrando:
- pais (CL/CO/US)
- datos basicos del solicitante (nombre, identificador RUT/NIT, correo y/o telefono)
- tipo de trabajo (fijo) y subtipo (opcional, configurable)
- descripcion inicial

### Actores
- Actor primario: Usuario interno (Agente)
- Actores secundarios: Sistema (validaciones y persistencia)

### Disparador
El usuario interno recibe un requerimiento por telefono u otro medio y debe registrarlo.

### Precondiciones
- El usuario interno esta autenticado (la autenticacion completa puede implementarse mas adelante; en este paquete solo se asume acceso al endpoint).
- Existen catalogos minimos: `pais`, `tipo_identificador`, `tipo_trabajo` (subtipo opcional).
- Base de datos MySQL configurada.
- Reglas de identificadores:
  - RUT: valida modulo 11 y se almacena como xx.xxx.xxx-x
  - NIT: solo digitos, largo configurable (min/max)

### Flujo principal
1. Usuario interno ingresa formulario “Crear caso”.
2. Selecciona pais (CL/CO/US).
3. Ingresa datos del solicitante: nombre, tipo_identificador (RUT/NIT), identificador, correo (opcional) y/o telefono (opcional).
4. Selecciona tipo_trabajo y (opcional) subtipo.
5. Ingresa descripcion inicial.
6. Sistema valida datos.
7. Sistema crea/actualiza contacto (si ya existe por identificador+pais+tipo_identificador, reutiliza).
8. Sistema crea caso:
   - asigna `caso.id_pais` (igual al pais ingresado)
   - genera `codigo_caso` unico (ej: CASO-000123)
   - asigna estado inicial del ciclo vigente (si ya existe configuracion; si aun no, se deja estado inicial por defecto configurable para MVP)
9. Sistema registra evento `CasoCreado` (evento_log).
10. Sistema responde con `id_caso` y `codigo_caso`.

### Postcondiciones
- Caso creado y persistido.
- Contacto asociado y persistido.
- Evento `CasoCreado` registrado.

### Reglas / invariantes relevantes
- Solicitante NO tiene login.
- Pais se guarda tanto en contacto como en caso.
- `codigo_caso` es unico.
- Caso cerrado nunca se reabre (no aplica en este CU, pero no debe introducirse nada que lo contradiga).

### Excepciones
- Identificador invalido para el pais/tipo (rechaza con error).
- No viene correo ni telefono (rechaza si definimos obligatoriedad minima).
- Tipo de trabajo inexistente (rechaza).

---

## Historias de Usuario asociadas

### HU-01 — Crear caso desde UI (alta prioridad)
Como usuario interno  
Quiero crear un caso indicando pais y datos basicos del solicitante  
Para registrar solicitudes recibidas por telefono u otros medios.

#### Criterios de aceptacion (Given/When/Then)
- Given que estoy autenticado como usuario interno
  When envio una solicitud de creacion de caso con pais, solicitante y descripcion
  Then el sistema crea el contacto (si no existe) y crea el caso con un `codigo_caso` unico

- Given un solicitante con RUT invalido
  When intento crear el caso
  Then el sistema rechaza con error indicando identificador invalido

- Given un solicitante con NIT con caracteres no numericos
  When intento crear el caso
  Then el sistema rechaza con error indicando formato invalido

---

## Tickets de trabajo (<= 4 horas c/u) para HU-01

> Nota: Asumes que tu ya creaste el proyecto Laravel base y el repo GitLab.
> Cada ticket incluye entregable verificable y no excede 4 horas.

### T6-001 — Migraciones y seed de catalogos minimos (Laravel)
**Objetivo:** Crear migraciones para `pais`, `tipo_identificador`, `tipo_trabajo` (+ seeds base).  
**Alcance:**
- Migraciones con nombres y campos en español
- `pais` con registros: CL, CO, US
- `tipo_identificador`: RUT, NIT, OTRO
- `tipo_trabajo`: (Incidente, Solicitud, Contingencia, Requerimiento, Proyecto, Actividad de procesos)
- Comentarios en tablas/campos críticos
**Criterios de aceptacion:**
- Migraciones ejecutan sin errores
- Seeds cargan catalogos y quedan consultables
**Pruebas minimas:**
- Ejecutar migrate:fresh --seed en local

---

### T6-002 — Modelo y validacion de Contacto (Laravel)
**Objetivo:** Implementar modelo `Contacto` + validaciones de identificador por pais.  
**Alcance:**
- Modelo Eloquent `Contacto`
- Request validation (FormRequest) para:
  - RUT: modulo 11 + formateo xx.xxx.xxx-x
  - NIT: solo digitos + largo configurable (parametrizable)
- Persistir `id_pais`, `id_tipo_identificador`, `identificador`, `nombre`, `correo?`, `telefono?`
**Criterios de aceptacion:**
- Rechaza RUT invalido
- Acepta RUT valido y lo guarda en formato requerido
- Rechaza NIT con letras y acepta NIT numerico dentro del rango
**Pruebas minimas:**
- Unit tests para validador RUT y validador NIT

---

### T6-003 — Modelo Caso + generacion de codigo_caso (Laravel)
**Objetivo:** Implementar modelo `Caso` y generacion de `codigo_caso` unico.  
**Alcance:**
- Migracion `caso` con:
  - `codigo_caso` UNIQUE
  - FK a `contacto`
  - `id_pais` (FK a `pais`)
  - `id_tipo_trabajo`, `id_subtipo` (subtipo puede quedar para otro paquete si no existe aun)
  - `fecha_creacion`, `fecha_actualizacion`
- Servicio/Helper para generar codigo incremental con formato estable (ej: CASO-000001)
**Criterios de aceptacion:**
- Siempre genera codigos unicos y consecutivos (al menos en entorno single DB)
- No permite duplicados por constraint UNIQUE
**Pruebas minimas:**
- Test de concurrencia basica (dos creaciones seguidas no colisionan)

---

### T6-004 — Endpoint POST /api/casos (Laravel)
**Objetivo:** Crear endpoint de creacion de caso segun CU-01.  
**Alcance:**
- Controller + Service:
  - resolver/crear `Contacto`
  - crear `Caso` con `id_pais` y `codigo_caso`
  - asignar estado inicial (placeholder si el ciclo aun no esta implementado)
- Respuesta JSON con `id_caso` y `codigo_caso`
**Criterios de aceptacion:**
- Crea caso con contacto asociado
- Aplica validaciones de identificadores
**Pruebas minimas:**
- Feature test (API) para casos: RUT valido, RUT invalido, NIT invalido, NIT valido

---

### T6-005 — Registro de evento CasoCreado (evento_log) (Laravel)
**Objetivo:** Registrar evento canonico `CasoCreado` al crear un caso.  
**Alcance:**
- Migracion `evento_log`
- Escritura de evento `CasoCreado` (payload minimo v1)
- `correlation_id` asociado al `codigo_caso` o `id_caso`
**Criterios de aceptacion:**
- Al crear caso se inserta registro en `evento_log`
- Payload contiene: caso_id, tipo_trabajo, canal_origen=ui, solicitante/contacto
**Pruebas minimas:**
- Feature test: crear caso -> existe evento CasoCreado

---

### T6-006 — UI Angular (formulario minimo Crear Caso) (Angular)
**Objetivo:** Pantalla basica para crear caso y mostrar codigo generado.  
**Alcance:**
- Formulario:
  - pais (select)
  - nombre
  - tipo_identificador (RUT/NIT)
  - identificador
  - correo (opcional)
  - telefono (opcional)
  - tipo_trabajo (select)
  - descripcion
- Llamada a POST /api/casos
- Mostrar `codigo_caso` resultado
**Criterios de aceptacion:**
- Permite crear caso correctamente
- Muestra error de validacion si API rechaza
**Pruebas minimas:**
- Prueba manual guiada (MVP)
- (Opcional) test de componente si el equipo lo aplica

---

## Priorizacion del paquete (orden recomendado)
1) T6-001 (catalogos)  
2) T6-002 (contacto + validacion)  
3) T6-003 (caso + codigo)  
4) T6-004 (endpoint crear caso)  
5) T6-005 (evento CasoCreado)  
6) T6-006 (UI crear caso)

---

## Listo para Cursor + spec-kit (cuando corresponda)
Una vez tengas:
- repo creado y proyectos base inicializados (Laravel/Angular)
- este paquete guardado como MD

Recomendacion de uso:
- Trabajar ticket por ticket (no todo el paquete junto)
- Para cada ticket, pegar en Cursor:
  - contexto base (Etapa 5)
  - este paquete
  - el ticket actual (solo uno)
  - criterios de aceptacion del ticket
