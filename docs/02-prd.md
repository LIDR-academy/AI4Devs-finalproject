## 👥 FASE 2: Definición del Producto (PRD)

### User Personas

#### 1. María - BIM Manager & Coordinadora General (Usuario Principal)

**Rol:** Supervisión global del inventario digital y coordinación entre diseño, fabricación y montaje.

**Contexto de Trabajo:**
- Gestiona 50,000+ piezas distribuidas en 5 talleres externos y 3 equipos de diseño internos
- Responsable de reportar progreso a dirección de obra y comisión de patrimonio
- Punto único de contacto entre arquitectos (diseño) y industriales (fabricación)

**Pain Point Crítico:**
> *"Necesito saber AHORA cuántas dovelas del arco C-12 están aprobadas, cuántas en taller, y si hay alguna rechazada. Hoy tardo 3 horas buscando en carpetas de red y emails. Cuando encuentro la información, ya cambió. Necesito un sistema que me dé la verdad en 5 segundos."*

**Jobs-to-be-Done con SF-PM:**
- **Dashboard en tiempo real**: Ver estado de todas las piezas con filtros rápidos (sector, estado, taller asignado)
- **Alertas automáticas**: Notificación si pieza crítica está bloqueada >7 días
- **Reportes ejecutivos**: Generar PDF de progreso mensual para dirección en 2 clicks
- **Búsqueda avanzada**: "Mostrar piezas de Arco C-12 en estado 'Fabricación' asignadas a Taller Granollers"

**Métricas de Éxito:**
- Reducir de 3 horas a 10 minutos el tiempo diario de búsqueda de información
- Eliminar 100% emails de "¿Dónde está la pieza X?"
- Generar reportes semanales en <5 minutos

---

#### 2. Jordi - Arquitecto de Diseño Paramétrico

**Rol:** Generación de geometría con Rhino + Grasshopper.

**Contexto de Trabajo:**
- Diseña 200-500 piezas por semana usando scripts paramétricos
- Entrega modelos 3D a la Oficina Técnica para aprobación
- Debe cumplir nomenclaturas ISO-19650 y especificaciones de materiales

**Pain Point Crítico:**
> *"Subo un archivo con 200 piezas y 3 días después me dicen que 15 nombres de capas estaban mal. Necesito saberlo en el momento de la subida, antes de que taller empiece a trabajar con datos incorrectos. El error me cuesta una semana de retrabajos."*

**Jobs-to-be-Done con SF-PM:**
- **Validación instantánea pre-ingesta**: Subir .3dm y recibir feedback en <10 segundos sobre nomenclaturas inválidas
- **Interfaz de corrección guiada**: Si "SF_C12_D_023" es inválido, el sistema sugiere "SF-C12-D-023" automáticamente
- **Historial de versiones**: Comparar geometría actual vs. versión anterior aprobada
- **Batch upload**: Procesar 500 piezas en una sola operación con reporte de validación

**Métricas de Éxito:**
- Reducir errores de nomenclatura de 15% a 0%
- Obtener feedback de validación en <10 segundos (vs. 3 días actual)
- Eliminar retrabajo por datos incorrectos

---

#### 3. Enric - Responsable de Taller de Piedra (Industrial Partner)

**Rol:** Fabricación física de piezas en piedra Montjuïc.

**Contexto de Trabajo:**
- Taller externo con 12 canteros especializados
- Recibe encargos semanales de 20-40 piezas únicas
- Debe interpretar geometría compleja para planificar corte de piedra

**Pain Point Crítico:**
> *"Recibo PDFs 2D y capturas de pantalla por email. Necesito ver la pieza en 3D para planificar el corte de piedra, verificar ángulos complejos, y evitar errores que cuestan €15,000 por pieza. A veces me envían la versión incorrecta y lo descubro cuando ya corté el bloque."*

**Jobs-to-be-Done con SF-PM:**
- **Interfaz móvil simplificada**: Ver lista de "Mis Piezas Asignadas" desde tablet en taller
- **Visor 3D interactivo**: Rotar, medir, inspeccionar secciones críticas de la pieza
- **Actualización de estado simple**: Botón "Marcar como Completada" con adjuntar foto de control de calidad
- **Notificaciones de nuevas asignaciones**: Push notification cuando se asigna nueva pieza a su taller

**Métricas de Éxito:**
- Reducir errores de fabricación por mala interpretación de 15% a <2%
- Acceso a modelo 3D en <30 segundos desde tablet
- Notificación de nuevas asignaciones en tiempo real

---

#### 4. Carme - Gestora de Materiales & Patrimonio

**Rol:** Compliance de especificaciones de materiales y conservación patrimonial.

**Contexto de Trabajo:**
- Debe auditar que cada pieza use material aprobado por Comisión de Patrimonio
- Responsable de trazabilidad de procedencia de piedra (cantera, lote, certificados)
- Genera reportes para inspecciones oficiales de patrimonio

**Pain Point Crítico:**
> *"No tengo forma de auditar si todas las piezas del sector B usan piedra Montjuïc homologada. Debo abrir 200 archivos Rhino uno por uno y leer propiedades de usuario. Cuando llega la auditoría oficial, me toma 2 semanas generar el informe."*

**Jobs-to-be-Done con SF-PM:**
- **Búsqueda semántica**: "Todas las piezas de piedra en Sector B fabricadas en enero 2026"
- **Validación de materiales**: Alertas automáticas si pieza usa material no homologado
- **Reportes de compliance**: Exportar Excel con trazabilidad completa para auditoría oficial
- **Análisis de costes**: Calcular volumen total de piedra Montjuïc necesario para Q1 2026

**Métricas de Éxito:**
- Reducir tiempo de generación de reportes de auditoría de 2 semanas a 1 día
- Detectar materiales no homologados en tiempo real (vs. post-fabricación)
- 100% trazabilidad de procedencia de materiales

---

### El Agente "The Librarian": Validación Activa de Datos

**Concepto Funcional (No Técnico):**

"The Librarian" es un **agente de IA que actúa como bibliotecario digital** de la Oficina Técnica. Su función es interceptar todo archivo .3dm subido al sistema y ejecutar una **validación multi-paso** antes de aceptarlo en el inventario.

#### Flujo de Validación (Vista de Usuario)

```text
1. ARQUITECTO SUBE ARCHIVO
   ↓
2. THE LIBRARIAN INSPECCIONA
   - ¿Los nombres de capas cumplen ISO-19650?
     Ejemplo válido: "SF-C12-D-023" ✅
     Ejemplo inválido: "bloque_23" ❌
   
   - ¿Qué tipo de pieza es? (Piedra/Hormigón/Metálica)
     Clasifica automáticamente leyendo el nombre de capa y material
   
   - ¿La geometría es válida?
     Detecta piezas con volumen cero o dimensiones anómalas
   
   - ¿Faltan metadatos críticos?
     Enriquece automáticamente datos faltantes (ej: si capa dice "Montjuïc", añade "Material: Piedra Montjuïc")
   ↓
3. DECISIÓN BINARIA
   
   ✅ ACEPTAR: Archivo cumple todos los estándares
      → Piezas se ingresan al inventario
      → Geometría se procesa en segundo plano para visor 3D
      → Arquitecto recibe notificación: "200 piezas aceptadas"
   
   ❌ RECHAZAR: Archivo tiene errores
      → Nada se ingresa al inventario
      → Arquitecto recibe informe detallado:
        * "15 piezas tienen nomenclatura inválida"
        * "Sugerencia: 'SF_C12_D_023' → 'SF-C12-D-023'"
        * "5 piezas tienen volumen = 0"
      → Arquitecto corrige y vuelve a subir
```

#### Beneficios de la Validación Activa

| Sin The Librarian (Proceso Actual) | Con The Librarian |
|-------------------------------------|-------------------|
| Arquitecto sube archivo con errores | Arquitecto sube archivo con errores |
| Archivo se acepta sin validar | **The Librarian detecta errores en 5 segundos** |
| BIM Manager revisa manualmente 3 días después | **Rechazo automático con informe de corrección** |
| Taller ya empezó a trabajar con datos incorrectos | **Taller nunca recibe datos erróneos** |
| **Coste:** €15,000 en retrabajo | **Coste:** €0 (prevención) |

#### Principios de Diseño del Agente

1. **Estricto pero Educativo**: No solo rechaza, sino que explica POR QUÉ y sugiere correcciones.
2. **Transparente**: El usuario ve el informe completo de validación (no es una "caja negra").
3. **Human-in-the-Loop**: Decisiones ambiguas se escalan a BIM Manager para aprobación manual.
4. **Aprendizaje Contextual**: Si BIM Manager aprueba manualmente una excepción repetida, The Librarian aprende la regla.

---

### Feature Map del MVP

#### Funcionalidades Prioritarias (Obligatorias para Demo a Inversores)

**F1: Upload de Archivos Rhino (.3dm)**
- Drag & drop de archivos en interfaz web
- Extracción automática de metadata (nombre, capa, propiedades de usuario)
- Procesamiento en segundo plano de geometría 3D

**F2: Validación Activa (The Librarian)**
- Validación de nomenclaturas ISO-19650 (regex + fuzzy matching)
- Clasificación automática de tipologías (Piedra/Hormigón/Metálica)
- Detección de anomalías geométricas (volumen, dimensiones)
- Informe de errores con sugerencias de corrección

**F3: Dashboard de Estado**
- Tabla con lista de todas las piezas (Nombre, Estado, Tipo, Taller, Fecha)
- Filtros rápidos: por estado, por tipología, por taller asignado
- Búsqueda por nombre de pieza

**F4: Visor 3D Web**
- Visualización de geometría en navegador (Three.js)
- Controles básicos: rotar, zoom, pan
- Renderizado de 100-1000 piezas simultáneas con buen rendimiento (>30 FPS)

**F5: Actualización de Estado**
- BIM Manager puede cambiar estado de pieza (Diseñada → Validada → En Fabricación → Completada)
- Responsable de Taller puede marcar pieza como "Completada" con adjuntar foto

**F6: Control de Acceso Básico (RBAC)**
- 2 roles: Admin (BIM Manager, acceso total) y Viewer (Taller, solo lectura + actualización de estado)
- Login con email/password

#### Funcionalidades Futuras (Post-MVP)

**P1: Búsqueda Avanzada**
- Filtros combinados: tipo + material + rango de fechas + taller
- Búsqueda semántica: "piezas similares a esta"

**P2: Historial de Versiones**
- Ver cambios geométricos entre versión 1.0 y 1.3
- Comparación visual side-by-side

**P3: Notificaciones Automáticas**
- Email/Push cuando pieza cambia de estado
- Alertas de piezas bloqueadas >7 días

**P4: Reportes Ejecutivos**
- Generar PDF/Excel con progreso mensual
- Gráficos de distribución de estados

**P5: Interfaz Móvil Nativa**
- App iOS/Android para talleres
- Offline-first (sincroniza al reconectar)

---

### Stack Tecnológico Conceptual

**Frontend: Aplicación Web Moderna**
- **React**: Framework UI para interfaces interactivas
- **Three.js**: Motor 3D para visor web de alto rendimiento
- **TypeScript**: Type safety para geometría 3D (Vector3, Matrix4)

**Backend: API y Procesamiento**
- **FastAPI (Python)**: Framework API moderno con auto-generación de documentación
- **rhino3dm**: Librería oficial de Rhino para leer archivos .3dm sin licencia
- **LangGraph**: Orquestación del workflow de The Librarian Agent

**Data Layer: Base de Datos y Almacenamiento**
- **Supabase (PostgreSQL)**: Base de datos relacional con autenticación y RBAC integrado
- **S3-compatible Storage**: Almacenamiento de archivos .3dm originales y .glb procesados

**AI/ML: Agente de Validación**
- **LangGraph**: Workflow stateful para The Librarian (validación multi-paso)
- **OpenAI GPT-4**: Clasificación zero-shot de tipologías de piezas

---

### Wireframes Conceptuales

#### Interfaz 1: Dashboard (Usuario: BIM Manager)

**Estado Default (Con Datos)**

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  SF-PM    Dashboard | Upload | Piezas         María Pérez (BIM) [Logout]   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │  📊 Resumen Ejecutivo                                        │
│  Filtros     │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│              │  │   50,247     │ │    1,234     │ │     12 ⚠️    │        │
│ Estado:      │  │ Total Piezas │ │ En Fabricac. │ │ Bloqueadas   │        │
│ [Todas    ▼] │  └──────────────┘ └──────────────┘ └──────────────┘        │
│              │                                                               │
│ Tipología:   │  📋 Lista de Piezas                                          │
│ [Todas    ▼] │  ┌─────────────┬──────────┬────────┬───────────┬──────┐   │
│              │  │ Nombre      │ Estado   │ Tipo   │ Taller    │ Fec. │   │
│ Taller:      │  ├─────────────┼──────────┼────────┼───────────┼──────┤   │
│ [Todos    ▼] │  │ SF-C12-D-001│ En Fab.  │ Piedra │ Granollers│ 2d   │   │
│              │  │ SF-C12-D-002│ Validada │ Piedra │ Barcelona │ 1d   │   │
│ [🔍 Buscar]  │  │ SF-C12-D-003│ Diseñada │ Hormig.│ -         │ Hoy  │   │
│              │  │ SF-C12-D-004│ Complet. │ Piedra │ Manresa   │ 5d   │   │
│              │  │ ...         │          │        │           │      │   │
│              │  └─────────────┴──────────┴────────┴───────────┴──────┘   │
│              │  [← Anterior]  Página 1 de 252  [Siguiente →]              │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

**Componentes Clave:**
- **Header**: Logo, navegación principal, usuario autenticado
- **Sidebar Filtros** (250px fijo):
  - Dropdowns de filtrado (Estado, Tipología, Taller)
  - Campo de búsqueda por nombre
- **Stats Cards** (3 métricas principales):
  - Total Piezas, En Fabricación, Bloqueadas (alertas rojas)
- **Tabla de Piezas**:
  - Columnas: Nombre, Estado, Tipo, Taller, Última Actualización
  - Sorting por columna (click en header)
  - Paginación con scroll infinito opcional
  - Click en fila → abre modal con detalles + visor 3D

**Estado Empty (Sin Piezas)**

```text
┌─────────────────────────────────────────────────────────────────┐
│  SF-PM    Dashboard | Upload | Piezas    María Pérez [Logout]  │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                   │
│  Filtros     │              📦                                   │
│              │                                                   │
│ Estado:      │     "No hay piezas en el sistema todavía"        │
│ [Todas    ▼] │                                                   │
│              │  Sube tu primer archivo .3dm para comenzar       │
│ Tipología:   │                                                   │
│ [Todas    ▼] │     [📤 Ir a Upload]                              │
│              │                                                   │
│ Taller:      │                                                   │
│ [Todos    ▼] │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

---

#### Interfaz 2: Upload (Usuario: Arquitecto)

**Estado Default (Listo para Subir)**

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  SF-PM    Dashboard | Upload | Piezas           Jordi Vila (Arq.) [Logout] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         📤 Subir Archivo Rhino                              │
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────┐        │
│   │                                                               │        │
│   │               📁 Arrastra tu archivo .3dm aquí                │        │
│   │                                                               │        │
│   │                 o haz click para seleccionar                  │        │
│   │                                                               │        │
│   │          Formatos soportados: .3dm (Rhino 5, 6, 7, 8)        │        │
│   │                  Tamaño máximo: 500MB                        │        │
│   │                                                               │        │
│   └───────────────────────────────────────────────────────────────┘        │
│                                                                             │
│   ℹ️ El sistema validará automáticamente:                                   │
│      ✅ Nomenclaturas ISO-19650                                             │
│      ✅ Tipología de piezas (Piedra/Hormigón/Metálica)                     │
│      ✅ Integridad geométrica (volumen, dimensiones)                       │
│                                                                             │
│   ⚠️ Si hay errores, recibirás un informe detallado con sugerencias        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Estado Durante Upload (Procesando)**

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  SF-PM    Dashboard | Upload | Piezas           Jordi Vila (Arq.) [Logout] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                      ⏳ Procesando Archivo                                   │
│                                                                             │
│   Archivo: bloques_arco_c12_v3.3dm (145 MB)                                │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Extrayendo metadata...                          67% ████████░░ │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   📊 Progreso:                                                              │
│      ✅ Piezas extraídas: 134 / 200                                         │
│      ⏳ Validando nomenclaturas...                                          │
│      ⏹️ Clasificación tipológica (pendiente)                               │
│                                                                             │
│   Tiempo estimado: 12 segundos                                             │
│                                                                             │
│   [❌ Cancelar Upload]                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Estado Éxito / Error**

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ✅ Upload Completado                                    │
│                                                                             │
│   📊 Resumen:                                                               │
│      • 200 piezas procesadas en 18 segundos                                │
│      • 195 piezas aceptadas ✅                                              │
│      • 5 piezas rechazadas ❌                                               │
│                                                                             │
│   📄 Informe de Validación:                                                 │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │ ❌ SF_C12_D_023 → Nomenclatura inválida                      │          │
│   │    Sugerencia: "SF-C12-D-023" (guiones en lugar de guiones_) │          │
│   │                                                               │          │
│   │ ❌ bloque_25 → No cumple ISO-19650                            │          │
│   │    Debe seguir: [PROYECTO]-[SECTOR]-[TIPO]-[NÚMERO]          │          │
│   │ ...                                                           │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                                                             │
│   [📥 Descargar Informe Completo]  [🔄 Subir Archivo Corregido]            │
│   [✅ Ver Piezas Aceptadas en Dashboard]                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

#### Interfaz 3: Visor 3D (Usuario: Responsable Taller)

**Estado Default (Pieza Seleccionada)**

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  SF-PM    Dashboard | Upload | Piezas          Enric Soler (Taller) [Out]  │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                               │
│ SF-C12-D-001 │                      🔲 VISOR 3D                              │
│              │    ┌───────────────────────────────────────────────┐         │
│ 📋 Info      │    │                                               │         │
│              │    │         [Modelo 3D Rotable]                   │         │
│ Estado:      │    │                                               │         │
│ En Fabric.   │    │         🔄 Click + Drag para rotar            │         │
│              │    │         🔍 Scroll para zoom                    │         │
│ Tipo:        │    │                                               │         │
│ Piedra Mont. │    └───────────────────────────────────────────────┘         │
│              │    [🔄 Rotar] [🔍 Zoom Fit] [📐 Medidas] [💾 Captura]       │
│ Dimensiones: │                                                               │
│ 120x80x45 cm │   📏 Información Geométrica:                                 │
│              │      • Volumen: 0.432 m³                                      │
│ Taller:      │      • Peso estimado: 1,188 kg                               │
│ Granollers   │      • Material: Piedra Montjuïc (lote GT-2025-08)           │
│              │                                                               │
│ [📸 Adjuntar]│   🛠️ Acciones:                                                │
│ [✅ Marcar   │      [✅ Marcar como Completada]                              │
│   Complet.]  │      [📸 Adjuntar Foto Control Calidad]                      │
│              │      [💬 Añadir Nota]                                         │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

**Componentes Clave:**
- **Sidebar Izquierdo** (300px):
  - Título de pieza (SF-C12-D-001)
  - Información técnica (Estado, Tipo, Dimensiones, Taller)
  - Acciones rápidas (Adjuntar foto, Marcar completada)
- **Área Principal** (Canvas 3D):
  - Renderizado Three.js de geometría .glb
  - Controles OrbitControls (rotar, zoom, pan)
  - Herramientas: Rotar, Zoom Fit, Medidas, Captura screenshot
- **Panel Inferior**:
  - Información geométrica (volumen, peso, material)
  - Botones de acción principales

**Estado Empty (Sin Pieza Seleccionada)**

```text
┌─────────────────────────────────────────────────────────────────┐
│  SF-PM    Dashboard | Upload | Piezas     Enric Soler [Logout] │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                   │
│  Mis Piezas  │              🔲                                   │
│              │                                                   │
│ [Lista vacía]│     "Selecciona una pieza del Dashboard"         │
│              │         para visualizarla en 3D                  │
│              │                                                   │
│              │     [📋 Ir al Dashboard]                          │
│              │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

---

### Roadmap Detallado con Criterios de Aceptación

#### P0.1: Upload de Archivos .3dm

**Descripción:**
Sistema de carga de archivos Rhino (.3dm) con drag & drop, validación de formato, extracción de metadata y feedback en tiempo real.

**Criterios de Aceptación:**

✅ **Performance:**
- Procesa 200 piezas en <30 segundos (archivo de ~150MB)
- Soporta archivos de hasta 500MB
- Muestra progreso actualizado cada 1 segundo

✅ **UX:**
- Interfaz drag & drop funcional en área designada
- Barra de progreso con porcentaje y tiempo estimado
- Usuario puede cancelar upload en cualquier momento
- Muestra notificación de éxito con resumen: "X piezas procesadas"

✅ **Data Integrity:**
- Extracción completa de metadata: nombre, capa, material, User Text
- 0% piezas duplicadas (validación por nombre único)
- Transacción atómica: si falla, rollback completo (no quedan datos corruptos)
- Log de evento: timestamp, usuario, archivo, resultado

---

#### P0.2: Validación Activa (The Librarian)

**Descripción:**
Agente de IA que intercepta archivos subidos, valida nomenclaturas ISO-19650, clasifica tipologías, detecta anomalías geométricas y genera informe de aceptación/rechazo.

**Criterios de Aceptación:**

✅ **Performance:**
- Validación completa en <10 segundos para 200 piezas
- Clasificación LLM con timeout de 5s (fallback a regex si excede)

✅ **UX:**
- Informe de rechazo lista errores específicos: "Pieza X: nomenclatura inválida"
- Sugerencias de corrección automáticas: "SF_C12 → SF-C12"
- Formato descargable (PDF o TXT) del informe completo
- Rechazo no bloquea interfaz (usuario puede subir otro archivo inmediatamente)

✅ **Data Integrity:**
- 95%+ de nomenclaturas inválidas detectadas (regex estricta)
- 0% de piezas inválidas aceptadas en base de datos
- Clasificación tipológica con 80%+ accuracy (validado manualmente en 100 piezas test)
- Logs de decisiones del agente: qué validó, qué rechazó, por qué

---

#### P0.3: Dashboard de Estado

**Descripción:**
Interfaz principal con tabla de todas las piezas, stats cards, filtros rápidos y búsqueda.

**Criterios de Aceptación:**

✅ **Performance:**
- Carga inicial <2 segundos con 10,000 piezas
- Filtrado y búsqueda <500ms
- Paginación o scroll infinito sin lag

✅ **UX:**
- Stats cards actualizadas en tiempo real (o refresh cada 30s)
- Filtros funcionales: Estado (dropdown), Tipología (dropdown), Taller (dropdown)
- Búsqueda por nombre con autocompletado
- Click en fila abre modal con detalles + botón "Ver en 3D"
- Tabla sortable por columna (click en header)

✅ **Data Integrity:**
- Datos sincronizados con base de datos (WebSocket o polling cada 10s)
- Contadores de stats correctos (queries agregadas optimizadas)
- Filtros combinados funcionan correctamente (AND logic)

---

#### P0.4: Actualización de Estado

**Descripción:**
Interface para cambiar el estado de una pieza (Diseñada → Validada → En Fabricación → Completada) con control de acceso por roles.

**Criterios de Aceptación:**

✅ **Performance:**
- Actualización de estado en <1 segundo
- Notificación visual de éxito inmediata

✅ **UX:**
- Dropdown de estados solo muestra transiciones válidas (no permite saltar pasos)
- BIM Manager puede cambiar cualquier estado
- Responsable Taller solo puede marcar "Completada" con adjuntar foto obligatoria
- Campo de notas opcional (máx 500 caracteres)
- Confirmación modal para cambios críticos ("¿Marcar 50 piezas como Completadas?")

✅ **Data Integrity:**
- Cambio de estado registra evento inmutable: timestamp, user_id, old_state, new_state
- Optimistic locking: si otro usuario cambió estado simultáneamente, error claro
- Foto de control de calidad almacenada en S3 con referencia en DB
- Rollback automático si upload de foto falla

---

#### P0.5: RBAC Básico (Control de Acceso)

**Descripción:**
Sistema de autenticación y control de acceso con 2 roles: Admin (BIM Manager) y Viewer (Taller).

**Criterios de Aceptación:**

✅ **Performance:**
- Login en <2 segundos
- Verificación de permisos en cada request <50ms

✅ **UX:**
- Pantalla de login con email/password
- Mensaje de error claro si credenciales incorrectas
- Sesión persiste tras cerrar navegador (JWT en localStorage)
- Logout limpia sesión completamente
- Interfaces adaptan según rol (Taller no ve botón "Eliminar Pieza")

✅ **Data Integrity:**
- Roles almacenados en tabla `users` con campo `role` enum
- Row Level Security (RLS) en Supabase activo
- API endpoints validan rol en backend (no solo frontend)
- Intento de acción no autorizada devuelve 403 Forbidden
- Log de intentos de acceso no autorizados

---

#### P0.6: Visor 3D Web

**Descripción:**
Visualización interactiva de geometría de piezas en navegador usando Three.js, con controles de cámara, medidas y exportación de capturas.

**Criterios de Aceptación:**

✅ **Performance:**
- Renderiza 1,000 piezas simultáneas a >30 FPS en laptop estándar (Intel i5, 8GB RAM)
- Carga de modelo .glb en <3 segundos (archivo 5-50MB)
- Instancing para piezas repetidas (optimización de memoria)

✅ **UX:**
- OrbitControls funcionales: rotar con click+drag, zoom con scroll, pan con shift+drag
- Botón "Zoom Fit" centra cámara en pieza
- Herramienta de medidas: click en 2 puntos muestra distancia en mm
- Botón "Captura" genera screenshot PNG descargable
- Grid de referencia y ejes XYZ visibles

✅ **Data Integrity:**
- Carga geometría desde URLs firmadas de S3/Supabase (seguridad)
- Fallback a bounding box si .glb no disponible (geometría en procesamiento)
- Compresión Draco aplicada a archivos .glb (60% reducción de tamaño)
- Material PBR básico aplicado (color según tipología: gris=piedra, beige=hormigón)

---

### User Stories (Happy Paths + Errores)

#### US-001: Upload de archivo .3dm válido (Happy Path)

**Given** el arquitecto Jordi está autenticado con rol "Architect"  
**And** tiene un archivo "bloques_arco_c12.3dm" de 150MB con 200 piezas válidas  
**When** navega a la página Upload  
**And** arrastra el archivo al área de drop  
**Then** el sistema inicia extracción de metadata  
**And** muestra barra de progreso con % actualizado cada segundo  
**And** completa procesamiento en <30 segundos  
**And** muestra notificación: "✅ 200 piezas procesadas correctamente"  
**And** redirige al Dashboard con las nuevas piezas visibles

**Criterios de Aceptación:**
✅ Tiempo total: <30s para 200 piezas  
✅ Progreso visual claro (spinner + %)  
✅ 200 piezas insertadas en tabla `parts` con estado "Diseñada"  
✅ Evento registrado en `events`: user_id, timestamp, "upload_success", archivo_nombre

---

#### US-002: Upload de archivo con nomenclaturas inválidas (Error Path)

**Given** el arquitecto sube un archivo "bloques_mal.3dm" con 15 piezas mal nombradas  
**When** el sistema procesa el archivo  
**Then** The Librarian detecta errores de nomenclatura  
**And** rechaza el archivo completo  
**And** muestra informe detallado:
- "15 piezas no cumplen ISO-19650"
- Lista de errores: "SF_C12_D_023 → Usar guiones: SF-C12-D-023"
- "bloque_25 → Debe seguir formato [PROY]-[SEC]-[TIPO]-[NUM]"  
**And** permite descargar informe en PDF  
**And** NO inserta ninguna pieza en base de datos

**Criterios de Aceptación:**
✅ 0% de piezas inválidas aceptadas  
✅ Informe lista TODAS las piezas con error  
✅ Sugerencias de corrección específicas  
✅ Usuario puede volver a subir archivo corregido inmediatamente

---

#### US-003: Upload cancelado por usuario (Edge Case)

**Given** el arquitecto inicia upload de un archivo de 500MB  
**And** el procesamiento está al 40%  
**When** hace click en "Cancelar Upload"  
**Then** el sistema detiene el procesamiento inmediatamente  
**And** muestra mensaje: "Upload cancelado. Ninguna pieza fue ingresada"  
**And** limpia datos temporales  
**And** permite subir otro archivo

**Criterios de Aceptación:**
✅ Cancelación en <1 segundo  
✅ 0% de piezas parciales en DB  
✅ Archivos temporales eliminados

---

#### US-004: Validación detecta geometría corrupta (Error Path)

**Given** el arquitecto sube un archivo con 5 piezas con volumen = 0  
**When** The Librarian valida geometría  
**Then** rechaza el archivo  
**And** informe indica: "5 piezas tienen volumen = 0 (geometría inválida)"  
**And** lista los nombres de las 5 piezas problemáticas

**Criterios de Aceptación:**
✅ Detección de volumen = 0 funciona  
✅ Informe técnico claro para arquitecto

---

#### US-005: BIM Manager visualiza Dashboard con 10,000 piezas (Happy Path)

**Given** María (BIM Manager) está autenticada  
**And** el sistema tiene 10,000 piezas registradas  
**When** abre el Dashboard  
**Then** la página carga en <2 segundos  
**And** muestra stats cards:
- Total Piezas: 10,000
- En Fabricación: 1,234
- Bloqueadas >7 días: 12 ⚠️  
**And** tabla muestra primeras 50 piezas con scroll infinito  
**And** filtros están listos para usar

**Criterios de Aceptación:**
✅ Carga inicial <2s  
✅ Stats correctas (queries agregadas)  
✅ Tabla responsive sin lag

---

#### US-006: BIM Manager filtra piezas por estado (Happy Path)

**Given** María está en el Dashboard  
**When** selecciona filtro Estado = "En Fabricación"  
**Then** tabla muestra solo piezas con estado "En Fabricación"  
**And** stats cards se actualizan para mostrar solo datos filtrados  
**And** contador indica "1,234 piezas (filtradas)"

**Criterios de Aceptación:**
✅ Filtro aplica en <500ms  
✅ Combinación de filtros funciona (Estado + Tipología)  
✅ Búsqueda respeta filtros activos

---

#### US-007: BIM Manager cambia estado de pieza (Happy Path)

**Given** María selecciona pieza "SF-C12-D-001" con estado "Validada"  
**When** cambia estado a "En Fabricación"  
**And** asigna Taller "Granollers"  
**And** añade nota: "Prioridad alta para Q1"  
**Then** el sistema actualiza estado en <1s  
**And** muestra notificación: "✅ Estado actualizado"  
**And** registra evento en tabla `events`: old_state="Validada", new_state="En Fabricación"  
**And** Dashboard refleja cambio inmediatamente

**Criterios de Aceptación:**
✅ Update <1s  
✅ Evento inmutable registrado  
✅ Notificación visual clara

---

#### US-008: Responsable Taller intenta cambiar estado sin permiso (Error Path)

**Given** Enric (Taller) está autenticado  
**And** intenta cambiar estado de "Validada" a "En Fabricación" (acción de BIM Manager)  
**When** hace click en cambiar estado  
**Then** el sistema muestra error: "❌ No tienes permisos para esta acción"  
**And** NO actualiza el estado  
**And** registra intento en log de seguridad

**Criterios de Aceptación:**
✅ RBAC bloquea acción  
✅ Mensaje de error claro  
✅ Log de intento no autorizado

---

#### US-009: Responsable Taller marca pieza como Completada (Happy Path)

**Given** Enric ve pieza "SF-C12-D-001" asignada a su taller con estado "En Fabricación"  
**When** hace click en "Marcar como Completada"  
**And** adjunta foto de control de calidad "qc_photo.jpg"  
**And** añade nota: "Terminada según especificaciones"  
**Then** el sistema sube foto a S3  
**And** actualiza estado a "Completada"  
**And** muestra notificación: "✅ Pieza marcada como Completada"  
**And** María (BIM Manager) recibe notificación en Dashboard

**Criterios de Aceptación:**
✅ Upload de foto obligatorio  
✅ Estado actualiza solo si foto sube correctamente  
✅ Notificación a BIM Manager

---

#### US-010: Visor 3D carga geometría de pieza (Happy Path)

**Given** Enric selecciona pieza "SF-C12-D-001"  
**And** el archivo .glb está disponible en S3  
**When** hace click en "Ver en 3D"  
**Then** el visor carga en <3 segundos  
**And** muestra geometría rotable en canvas 3D  
**And** información geométrica visible: volumen, peso, material  
**And** controles funcionan: rotar, zoom, pan

**Criterios de Aceptación:**
✅ Carga <3s  
✅ Renderizado >30 FPS  
✅ Controles OrbitControls responsivos

---

#### US-011: Visor 3D muestra bounding box si geometría no procesada (Fallback)

**Given** la pieza fue subida hace 5 minutos  
**And** el procesamiento de geometría aún está en cola  
**When** usuario abre visor 3D  
**Then** muestra bounding box (caja de dimensiones)  
**And** mensaje: "⏳ Geometría 3D en procesamiento. Mostrando bounding box"  
**And** se actualiza automáticamente cuando .glb esté listo

**Criterios de Aceptación:**
✅ Fallback visual (no pantalla en blanco)  
✅ Mensaje claro de estado  
✅ Auto-refresh cuando geometría disponible

---

#### US-012: Usuario toma captura de pantalla del visor 3D (Happy Path)

**Given** usuario tiene pieza abierta en visor 3D  
**When** hace click en "Captura"  
**Then** genera screenshot PNG del canvas  
**And** descarga automáticamente como "SF-C12-D-001_capture.png"  
**And** imagen tiene resolución 1920x1080

**Criterios de Aceptación:**
✅ Captura en <1s  
✅ Imagen de alta calidad  
✅ Nombre de archivo descriptivo

---

#### US-013: Login exitoso con credenciales válidas (Happy Path)

**Given** usuario visita la página de login  
**When** ingresa email "`maria@sagradafamilia.cat`" y password correcto  
**Then** el sistema valida credenciales en <2s  
**And** genera JWT token  
**And** redirige al Dashboard  
**And** header muestra "María Pérez (BIM Manager)"

**Criterios de Aceptación:**
✅ Login <2s  
✅ JWT almacenado en localStorage  
✅ Sesión persiste tras refresh

---

#### US-014: Login fallido con credenciales incorrectas (Error Path)

**Given** usuario ingresa email "`test@test.com`" con password incorrecto  
**When** hace click en "Iniciar Sesión"  
**Then** muestra error: "❌ Email o contraseña incorrectos"  
**And** NO genera token  
**And** campos quedan vacíos

**Criterios de Aceptación:**
✅ Mensaje de error genérico (no revela si email existe)  
✅ 0% acceso no autorizado  
✅ Log de intento fallido

---

## 🚀 Próximos Pasos

**Estado Actual:** FASE 2 (Definición del Producto) - 80% Completado

**Bloqueadores para Completar FASE 2:**
- ❌ Wireframes conceptuales de interfaces (Dashboard, Upload, Visor 3D)
- ❌ Roadmap detallado con criterios de aceptación técnicos para cada feature
- ❌ User Stories con formato Given/When/Then

**Una vez completada FASE 2, se podrá avanzar a:**
- FASE 3: Modelo de Negocio (Lean Canvas, ROI, Escalabilidad)
- FASE 4: Casos de Uso Críticos (Diagramas de secuencia)
- FASE 5: Modelo de Datos (Esquema de base de datos)

---

