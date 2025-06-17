# US-06: Asignación de Equipo y Planificación de Tarea

Esta carpeta contiene la implementación frontend de la US-06: Asignación de equipo y planificación de tarea.

## Componentes Implementados

### 1. TaskPlanningPage
- **Ubicación**: `TaskPlanningPage.tsx`
- **Descripción**: Página principal para la planificación de tareas
- **Funcionalidades**:
  - Carga de información de la tarea
  - Obtención de recomendaciones de equipos
  - Navegación entre pasos de recomendación y planificación
  - Gestión de conflictos y validaciones
  - Guardado de planificación

### 2. TeamRecommendationsList
- **Ubicación**: `TeamRecommendationsList.tsx`
- **Descripción**: Lista de equipos recomendados con métricas y proyectos actuales
- **Funcionalidades**:
  - Visualización de equipos ordenados por puntuación
  - Métricas de afinidad, capacidad y disponibilidad
  - **NUEVO**: Visualización de proyectos actuales de cada equipo
  - Fechas posibles de inicio y fin
  - Justificación de recomendaciones
  - Selección de equipo

### 3. CurrentProjectsList ⭐ **NUEVO**
- **Ubicación**: `CurrentProjectsList.tsx`
- **Descripción**: Componente para mostrar proyectos actuales de un equipo
- **Funcionalidades**:
  - Vista colapsable/expandible de proyectos
  - Códigos de colores por estado (en progreso, finalizando, por iniciar)
  - Información detallada: fechas, departamento, carga de trabajo
  - Resumen visual cuando está colapsado
  - Animaciones y transiciones suaves

### 4. PlanningForm
- **Ubicación**: `PlanningForm.tsx`
- **Descripción**: Formulario para asignar fechas y confirmar planificación
- **Funcionalidades**:
  - Selector de fechas con validaciones
  - Verificación de conflictos en tiempo real
  - **MEJORADO**: Conflictos específicos con proyectos actuales
  - Resumen de planificación
  - Confirmación y guardado

## Servicios Añadidos/Mejorados

### TaskService (Extensiones)
- `getTeamRecommendations(taskId)`: **MEJORADO** - Ahora incluye proyectos actuales
- `assignTeamAndDates(taskId, teamId, startDate, endDate)`: Asigna equipo y fechas
- `checkTeamConflicts(teamId, startDate, endDate)`: **MEJORADO** - Verifica conflictos con proyectos específicos

### Nuevos Servicios Mock
- **CurrentProjects**: `frontend/src/services/mockData/currentProjects.ts`
  - Datos simulados de 130+ proyectos actuales distribuidos entre todos los equipos
  - Funciones para obtener proyectos por equipo
  - Lógica de detección de conflictos específicos
  - Estados automáticos basados en fechas

### Datos Mock
- **AffinityMatrix**: Matriz de afinidad entre equipos y departamentos
- **Algoritmo de Recomendación**: Sistema de puntuación basado en múltiples factores
- **Proyectos Actuales**: Datos realistas que reflejan la carga actual de cada equipo

## Algoritmo de Recomendación

El sistema evalúa cada equipo basándose en:

### Factores de Puntuación (100 puntos máximo)
1. **Afinidad departamental (40%)**: Nivel de afinidad del equipo con el departamento
2. **Disponibilidad de capacidad (35%)**: Capacidad libre del equipo
3. **Tiempo de inicio (15%)**: Qué tan pronto puede comenzar
4. **Tipo de equipo (10%)**: Bonus para equipos internos

### Estados de Proyectos
- **En Progreso** (azul): Proyectos actualmente ejecutándose
- **Finalizando** (naranja): Proyectos que terminan en ≤7 días
- **Por Iniciar** (verde): Proyectos que aún no han comenzado

## Nuevas Características de UX

### Visualización de Proyectos Actuales
- **Vista Resumida**: Muestra los primeros 2 proyectos cuando está colapsado
- **Vista Expandida**: Información completa de todos los proyectos
- **Códigos de Colores**: Estados visuales inmediatos
- **Interactividad**: Hover effects y transiciones suaves

### Detección de Conflictos Mejorada
- Conflictos específicos con nombres de proyectos
- Cálculo de carga considerando proyectos actuales
- Advertencias detalladas con fechas exactas

### Mejoras Visuales
- Animaciones de entrada escalonadas
- Tarjetas con hover effects
- Mejor jerarquía visual de información
- Responsividad mejorada

## Archivos CSS

### `CurrentProjectsList.css`
- Estilos para el componente de proyectos actuales
- Códigos de colores por estado
- Animaciones y transiciones
- Responsividad móvil

### `TeamRecommendationsList.css`
- Estilos para las tarjetas de recomendación
- Efectos hover y animaciones
- Sistema de puntuación visual
- Layout responsivo

## Flujo de Usuario Mejorado

1. **Visualización de Recomendaciones**: 
   - Usuario ve equipos ordenados por puntuación
   - **NUEVO**: Puede ver proyectos actuales de cada equipo
   - Información contextual para mejor toma de decisiones

2. **Análisis de Conflictos**:
   - **MEJORADO**: Conflictos específicos con proyectos nominados
   - Advertencias detalladas sobre sobrecargas
   - Transparencia total en la planificación

3. **Selección Informada**:
   - Decisiones basadas en información completa
   - Contexto visual inmediato
   - Reducción de conflictos posteriores

## Datos Técnicos

- **130+ Proyectos Mock**: Distribuidos realísticamente entre 20 equipos
- **3 Estados de Proyecto**: Con lógica automática basada en fechas
- **Carga Balanceada**: Datos coherentes con las cargas actuales de equipos
- **Performance**: Componentes optimizados con animaciones CSS

Esta implementación cumple completamente con los criterios de aceptación mejorados de la US-06, proporcionando transparencia total en la planificación y mejor experiencia de usuario.

## Validaciones Implementadas

### Permisos
- Solo usuarios con rol TECNOLOGIA pueden planificar
- Solo tareas en estado PENDING_PLANNING son planificables
- Tareas deben tener estimación (sprints y loadFactor)

### Fechas
- Fecha inicio no puede ser anterior a hoy
- Fecha fin debe ser posterior a fecha inicio
- Duración mínima de 1 día

### Conflictos (Informativos)
- Solapamiento con otras tareas del equipo
- Sobrecarga de capacidad del equipo
- Advertencias no bloquean la asignación

## Estilos CSS

Los estilos están definidos en `TaskPlanningPage.css` e incluyen:
- Diseño responsive
- Animaciones de hover
- Códigos de color para diferentes estados
- Barras de progreso para capacidad
- Estilos para alertas y conflictos

## Integración

### Rutas
- `/tasks/:taskId/plan` - Página de planificación

### Estado Global
- Integrado con AuthContext para permisos
- Usa React Router para navegación

### APIs Mock
- Todas las funciones simulan delay de red
- Validaciones completas del lado cliente
- Datos de ejemplo realistas

## Próximos Pasos

Esta implementación cumple con todos los criterios de aceptación de la US-06. Las extensiones futuras podrían incluir:

1. Integración con backend real
2. Notificaciones en tiempo real
3. Calendario visual para selección de fechas
4. Historial de cambios en planificación
5. Métricas avanzadas de recomendación 