# Etapa 6 — Paquete 02 (CU-02): Consultar Caso (MVP)

## Metadata
- Etapa: 6 — Ejecucion y Construccion (IA-First)
- Paquete: 02
- Caso de uso: CU-02 Consultar Caso
- Alcance: MVP (solo canal correo; este paquete es UI interna + API)
- Dependencias: Paquete 01 (creacion de caso, contacto, catalogos, API base)

---

## Caso de Uso — CU-02: Consultar Caso

### Objetivo
Permitir que un **usuario interno** consulte:
- un listado de casos con filtros basicos
- el detalle de un caso especifico

para gestionar la operacion diaria (mesa de servicios).

### Actores
- Actor primario: Usuario interno (Agente)
- Actor secundario: Sistema (API + persistencia)

### Disparador
El usuario necesita ver el estado de casos, su carga actual, o revisar un caso especifico para atenderlo.

### Precondiciones
- Existe al menos un caso creado (Paquete 01).
- El usuario interno tiene acceso a la UI (autenticacion completa puede implementarse despues; en este paquete se asume acceso).
- Indices base en tablas `caso` y `contacto` para busqueda (definidos en Etapa 5.6).

### Flujo principal — Listado
1. Usuario ingresa a la vista “Listado de casos”.
2. Usuario aplica filtros (cero o mas).
3. Sistema devuelve casos paginados, con datos resumidos.
4. Usuario selecciona un caso del listado.
5. Sistema muestra el detalle del caso.

### Flujo principal — Detalle
1. Usuario abre un caso por `id_caso` o por `codigo_caso`.
2. Sistema devuelve el detalle completo:
   - datos basicos del caso
   - estado actual (placeholder si motor de ciclo aun no esta)
   - datos del contacto (pais, nombre, identificador, correo/telefono)
   - resumen de mensajes (si existen; placeholder si aun no se implementan)
   - evidencias (placeholder si aun no se implementan)

### Postcondiciones
- No hay cambios de estado ni mutaciones; solo consulta.
- La UI permite navegar y encontrar casos.

### Reglas / invariantes relevantes
- `codigo_caso` es unico.
- Consultas deben ser eficientes para futuro Kanban (filtros por estado/area/responsable).

### Excepciones
- Caso no existe (404).
- Filtros invalidos (400).

---

## Historias de Usuario asociadas

### HU-02 — Ver listado y detalle de casos (alta prioridad)
Como usuario interno  
Quiero buscar y ver casos por filtros basicos  
Para gestionar mi carga de trabajo diaria y dar seguimiento.

#### Filtros minimos (MVP)
- codigo_caso (exacto o contiene)
- pais (CL/CO/US)
- tipo_trabajo
- rango de fechas (creacion)
- estado_actual (si existe)
- texto libre sobre contacto (nombre / identificador / correo / telefono) (opcional, si no afecta mucho)

#### Criterios de aceptacion (Given/When/Then)
- Given que existen casos creados
  When consulto el listado sin filtros
  Then obtengo una lista paginada ordenada por fecha_actualizacion desc

- Given un `codigo_caso`
  When lo busco en el listado
  Then aparece el caso correspondiente

- Given un `id_caso`
  When consulto el detalle
  Then veo los datos del caso y del contacto asociado

- Given un `id_caso` inexistente
  When consulto el detalle
  Then recibo 404

---

## Tickets de trabajo (<= 4 horas c/u) para HU-02

> Nota: Se asume API base operativa (Paquete 01). Los tickets estan pensados para cerrar rapido y acumular valor.

### T6-007 — Endpoint GET /api/casos (listado paginado) (Laravel)
**Objetivo:** Implementar listado paginado de casos con filtros minimos.  
**Alcance:**
- GET /api/casos?page=&page_size=
- filtros:
  - codigo_caso (contains)
  - id_pais
  - id_tipo_trabajo
  - fecha_creacion_desde / fecha_creacion_hasta
- orden: `fecha_actualizacion` desc
- incluir datos resumidos del contacto (nombre + identificador)
**Criterios de aceptacion:**
- retorna pagina estable con metadata (page, page_size, total)
- filtros aplican correctamente
**Pruebas minimas:**
- Feature tests por cada filtro
- prueba de paginacion

---

### T6-008 — Endpoint GET /api/casos/{id_caso} (detalle) (Laravel)
**Objetivo:** Obtener detalle de un caso por id.  
**Alcance:**
- GET /api/casos/{id}
- incluye:
  - caso (codigo, pais, tipo_trabajo, estado_actual placeholder)
  - contacto asociado (pais, nombre, identificador, correo, telefono)
**Criterios de aceptacion:**
- caso existente -> 200 con payload consistente
- caso inexistente -> 404
**Pruebas minimas:**
- Feature tests (200 / 404)

---

### T6-009 — Endpoint GET /api/casos/por-codigo/{codigo_caso} (opcional, pero util) (Laravel)
**Objetivo:** Buscar caso por codigo de forma directa (para correlacion y soporte).  
**Alcance:**
- GET /api/casos/por-codigo/CASO-000123
- retorna 404 si no existe
**Criterios de aceptacion:**
- codigo existente -> retorna caso
- codigo inexistente -> 404
**Pruebas minimas:**
- Feature tests

---

### T6-010 — DTO/Resource de salida estandar para Caso (Laravel)
**Objetivo:** Unificar formato de respuesta del caso (listado y detalle).  
**Alcance:**
- Resource/Transformer:
  - CasoResumenResource (listado)
  - CasoDetalleResource (detalle)
- evita duplicacion de payload en controladores
**Criterios de aceptacion:**
- payload consistente en endpoints de casos
**Pruebas minimas:**
- tests de contrato basicos (snapshot o asserts de keys)

---

### T6-011 — UI Angular: listado de casos (Angular)
**Objetivo:** Pantalla de listado con paginacion y filtros minimos.  
**Alcance:**
- tabla con columnas:
  - codigo
  - pais
  - tipo_trabajo
  - contacto (nombre + identificador)
  - fecha_actualizacion
- filtros:
  - codigo_caso
  - pais
  - tipo_trabajo
  - rango fechas
- paginacion
- click abre detalle
**Criterios de aceptacion:**
- listado se carga y pagina
- filtros aplican y refrescan resultados
**Pruebas minimas:**
- prueba manual guiada (MVP)
- (opcional) test de componente

---

### T6-012 — UI Angular: detalle de caso (Angular)
**Objetivo:** Vista detalle de caso (solo lectura en este paquete).  
**Alcance:**
- mostrar:
  - datos del caso
  - datos del contacto
  - placeholders para mensajes/evidencias (a implementar en paquetes posteriores)
**Criterios de aceptacion:**
- navegar desde listado a detalle
- manejar 404 mostrando mensaje amigable
**Pruebas minimas:**
- prueba manual guiada

---

## Priorizacion del paquete (orden recomendado)
1) T6-007 (listado API)  
2) T6-008 (detalle API)  
3) T6-010 (resources estandar)  
4) T6-011 (UI listado)  
5) T6-012 (UI detalle)  
6) T6-009 (buscar por codigo, opcional)

---

## Listo para Cursor + spec-kit (cuando corresponda)
Para cada ticket:
- pegar solo el ticket actual en Cursor
- incluir criterios de aceptacion
- pedir codigo minimo y pruebas minimas
- verificar que no se introduzcan funciones de otros paquetes (estado, mensajes, integraciones)
