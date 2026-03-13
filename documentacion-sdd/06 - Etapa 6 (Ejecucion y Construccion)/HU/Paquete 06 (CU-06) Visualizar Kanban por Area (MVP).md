# Etapa 6 — Paquete 06 (CU-06) Visualizar Kanban por Area (MVP)

## Metadata
- Etapa 6 — Ejecucion y Construccion (IA-First)
- Paquete 06
- Caso de uso CU-06 Visualizar Kanban por Area
- Alcance MVP (solo visualizacion; drag & drop va en Paquete 07)
- Dependencias Paquetes 01–05 (casos, estados, asignaciones, mensajes) + ciclo de vida baseline vigente

---

## Caso de Uso — CU-06 Visualizar Kanban por Area

### Objetivo
Permitir que un usuario interno visualice un tablero Kanban por area, con
- columnas configurables (mapeadas a estados del ciclo de vida)
- tarjetas (casos) filtrables
- orden basico por fecha de actualizacion

Sin cambiar estados aun (solo lectura en este paquete).

### Actores
- Actor primario Usuario interno (Agente  Encargado  Jefe de area)
- Actor secundario Sistema

### Disparador
El usuario necesita una vista operativa para entender rapidamente el estado de los casos del area.

### Precondiciones
- Existen casos con `id_area_responsable` asignada (Paquete 04).
- Existen estados configurados (Paquete 03).
- Existe configuracion de tablero Kanban por area (baseline por defecto, editable por Admin en paquete futuro).

### Flujo principal
1. Usuario selecciona su area (o se asume por su perfil cuando exista auth completa).
2. Sistema carga el tablero del area
   - columnas (estados) en orden
3. Sistema carga tarjetas
   - casos del area cuya `id_estado_actual` pertenece a las columnas
4. Usuario aplica filtros (opcional).
5. UI muestra tarjetas agrupadas por columna.

### Postcondiciones
- No hay cambios de estado.
- Usuario obtiene visibilidad operativa.

### Reglas  invariantes relevantes
- Columnas del tablero se basan en estados (no se duplican estados en el mismo tablero).
- Un caso aparece en una sola columna (segun estado actual).
- Casos cerrados
  - decision recomendada MVP ocultar por defecto, con filtro para mostrarlos si se requiere.

### Excepciones
- No existe tablero configurado para el area - se usa tablero baseline (generado por seed).

---

## Historias de Usuario asociadas

### HU-06 — Ver Kanban por area (prioridad media-alta)
Como usuario interno  
Quiero ver los casos de mi area en un tablero Kanban  
Para conocer rapidamente el estado general y priorizar gestion.

#### Criterios de aceptacion (GivenWhenThen)
- Given que existen casos asignados a un area
  When abro el Kanban de esa area
  Then veo columnas y tarjetas agrupadas por estado

- Given que aplico filtro por responsable
  When filtro
  Then solo veo tarjetas del responsable seleccionado

- Given que no existe tablero configurado
  When abro Kanban
  Then el sistema usa un tablero baseline por defecto

---

## Tickets de trabajo (= 4 horas cu) para HU-06

### T6-035 — Migraciones kanban_tablero y kanban_columna (Laravel)
Objetivo Crear tablas para configuracion del tablero Kanban.  
Alcance
- `kanban_tablero`
  - id_tablero (PK)
  - id_area (FK)
  - nombre
  - activo (bool)
  - fecha_creacionactualizacion
- `kanban_columna`
  - id_columna (PK)
  - id_tablero (FK)
  - id_estado (FK a estado)
  - orden
  - wip_limite (nullable)
  - visible (bool)
- constraints
  - UNIQUE (id_tablero, id_estado)
- indices
  - (id_area, activo)
  - (id_tablero, orden)
Criterios de aceptacion
- migraciones aplican sin errores
Pruebas minimas
- migratefresh

---

### T6-036 — Seed baseline Kanban por area (Laravel)
Objetivo Crear tableros baseline por area con columnas por estados comunes.  
Alcance
- para cada area (DII, SOPORTE_TI, PROCESOS)
  - crear 1 tablero activo
  - columnas
    - Ingresado
    - AsignadoArea (si existe como estado)
    - AsignadoResponsable (si existe)
    - EnTrabajo
    - Resuelto (si existe en el tipo)
    - Cerrado
- Nota si algun estado no existe en un tipo, igual puede existir como columna; las tarjetas solo apareceran donde aplique.
Criterios de aceptacion
- existe tablero activo por area con columnas visibles y ordenadas
Pruebas minimas
- seed + query verificacion

---

### T6-037 — Endpoint GET apikanbantablerosarea_id=... (Laravel)
Objetivo Listar tableros disponibles para un area.  
Alcance
- devuelve tablero activo por defecto
- si hay multiples, devuelve lista (para futuro)
Criterios de aceptacion
- area con tablero - retorna tablero
- area sin tablero - retorna baseline (si aplica)
Pruebas minimas
- feature tests

---

### T6-038 — Endpoint GET apikanbantableros{id} (Laravel)
Objetivo Obtener definicion del tablero (columnas).  
Alcance
- retorna columnas visibles ordenadas con estado asociado
Criterios de aceptacion
- columnas en orden
Pruebas minimas
- feature test

---

### T6-039 — Endpoint GET apikanbantableros{id}tarjetas (Laravel)
Objetivo Obtener tarjetas (casos) del tablero.  
Alcance
- filtra por
  - area del tablero
  - estados incluidos (columnas)
  - excluir cerrados por defecto (param opcional include_closed=true)
- filtros opcionales
  - responsable
  - tipo_trabajo
  - pais
- salida resumida
  - id_caso, codigo_caso, estado_actual, contacto(nombre), fecha_actualizacion, responsable
Criterios de aceptacion
- tarjetas aparecen en columna correcta segun estado
- filtros aplican correctamente
Pruebas minimas
- feature tests include_closed, filtro responsable

---

### T6-040 — Indices para rendimiento Kanban (Laravel  migracion incremental)
Objetivo Asegurar indices compuestos recomendados para consultas de Kanban.  
Alcance
- en tabla `caso`
  - INDEX (id_area_responsable, id_estado_actual, fecha_actualizacion)
  - INDEX (id_responsable, id_estado_actual)
Criterios de aceptacion
- explain basico muestra uso de indices
Pruebas minimas
- prueba manual con EXPLAIN (documentada)

---

### T6-041 — UI Angular vista Kanban (solo lectura) (Angular)
Objetivo Renderizar tablero Kanban por area.  
Alcance
- selector de area (temporal, hasta tener auth completa)
- render columnas
- cargar tarjetas
- filtros basicos
  - responsable
  - tipo_trabajo
  - pais
- click en tarjeta abre detalle
Criterios de aceptacion
- se ve tablero con columnas y tarjetas
- filtros funcionan
Pruebas minimas
- prueba manual guiada

---

## Priorizacion del paquete (orden recomendado)
1) T6-035 (tablas kanban)  
2) T6-036 (seed baseline)  
3) T6-037 (listar tableros)  
4) T6-038 (definicion tablero)  
5) T6-039 (tarjetas)  
6) T6-040 (indices)  
7) T6-041 (UI kanban)

---

## Nota de alcance MVP
- En este paquete el Kanban es solo lectura.
- El cambio de estado por drag & drop se implementa en Paquete 07, reutilizando el endpoint de transiciones del Paquete 03.

---

## Listo para Cursor + spec-kit (cuando corresponda)
- En Cursor, mantener el foco no implementar drag & drop aqui.
- Pedir implementacion incremental con payloads estables para Angular.
