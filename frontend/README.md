# Frontend - Sistema de Gestión de Tareas

## 📋 Descripción

Frontend desarrollado en React + TypeScript para el sistema de gestión de tareas y planificación de proyectos. Incluye funcionalidades avanzadas de asignación de equipos, visualización Gantt y gestión de cargas de trabajo.

## 🚀 Funcionalidades Principales

### ✅ **Gestión de Tareas (US-06)**
- **Asignación inteligente de equipos** basada en disponibilidad y carga de trabajo
- **Recomendaciones automáticas** con análisis de conflictos
- **Visualización de proyectos actuales** por equipo con códigos de colores:
  - 🔵 **Azul**: En progreso
  - 🟠 **Naranja**: Finalizando pronto (≤7 días)
  - 🟢 **Verde**: Por iniciar
- **Interfaz expandible** para ver detalles de proyectos
- **Cálculo dinámico de cargas** de trabajo por equipo

### 📊 **Visualización Gantt (US-11)** ⭐ **NUEVO**
- **Diagrama de Gantt interactivo** con Frappe Gantt
- **Filtros avanzados** por departamento, equipo, estado y fechas
- **Múltiples vistas temporales**:
  - Cuarto de día, Medio día, Día, Semana, Mes
- **Códigos de colores** por estado de tarea:
  - 🔵 **Azul**: Planificadas
  - 🟢 **Verde**: En progreso  
  - ⚫ **Gris**: Completadas
- **Popups informativos** con detalles de cada tarea
- **Estadísticas en tiempo real**:
  - Total de tareas planificadas
  - Rango temporal del proyecto
  - Equipos y departamentos activos
  - Distribución por estados
  - Rankings de equipos más activos
- **Controles de vista** y exportación (en desarrollo)

### 🔧 **Funcionalidades Técnicas**
- **Modelo de datos unificado** - Task como fuente única de verdad
- **Adaptadores automáticos** para compatibilidad con interfaces existentes
- **Cálculo dinámico** de cargas de trabajo
- **Detección inteligente** de conflictos de planificación
- **Interfaz responsive** y accesible (WCAG AA)

## 🛠️ Tecnologías

- **React 18** + **TypeScript**
- **Bootstrap 5** + **React Bootstrap**
- **FontAwesome** para iconografía
- **Frappe Gantt** para visualización temporal
- **React Router** para navegación
- **CSS Modules** para estilos

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── gantt/                    # 🆕 Componentes Gantt
│   │   ├── GanttFilters.tsx     # Filtros avanzados
│   │   ├── GanttStats.tsx       # Estadísticas y métricas
│   │   └── GanttControls.tsx    # Controles de vista
│   ├── tasks/
│   │   └── planning/
│   │       ├── TeamRecommendationsList.tsx
│   │       ├── CurrentProjectsList.tsx
│   │       └── PlanningForm.tsx
│   └── layout/
├── pages/
│   ├── GanttPage.tsx            # 🆕 Página principal Gantt
│   ├── Dashboard.tsx
│   └── TaskManagement.tsx
├── services/
│   ├── ganttService.ts          # 🆕 Servicio Gantt
│   ├── taskService.ts           # Servicio unificado
│   └── mockData/
│       ├── tasks.ts             # 130+ tareas/proyectos
│       ├── teams.ts             # Equipos con cargas dinámicas
│   └── types/
│       └── index.ts                 # Tipos TypeScript
```

## 🎨 **Mejoras de UX/UI**

### **Códigos de Color Mejorados**
- **Contraste optimizado** para accesibilidad
- **Text-shadow** para mejor legibilidad
- **Pesos de fuente** ajustados
- **Cumplimiento WCAG AA**

### **Animaciones y Transiciones**
- **Expansión suave** de listas de proyectos
- **Hover effects** en tarjetas
- **Loading states** informativos
- **Transiciones CSS** fluidas

### **Responsive Design**
- **Mobile-first** approach
- **Breakpoints** optimizados
- **Touch-friendly** en dispositivos móviles
- **Navegación adaptativa**

## 🚀 **Instalación y Uso**

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm start

# Construir para producción
npm run build
```

## 📊 **Datos de Prueba**

El sistema incluye **130+ tareas/proyectos** distribuidos entre **20 equipos** de **4 departamentos**:

- **Tecnología**: 15 equipos (internos y externos)
- **Negocio**: 3 equipos
- **Recursos Humanos**: 1 equipo  
- **Finanzas**: 1 equipo

### **Estados de Tareas**
- **Planificadas**: Tareas futuras con fechas asignadas
- **En Progreso**: Tareas actualmente en desarrollo
- **Completadas**: Tareas finalizadas

## 🔄 **Flujo de Trabajo**

1. **Acceso al Gantt**: Menú lateral → "Planificación Gantt"
2. **Aplicar filtros**: Departamentos, equipos, fechas, estados
3. **Cambiar vista**: Día, semana, mes según necesidad
4. **Explorar tareas**: Click en barras para ver detalles
5. **Analizar estadísticas**: Panel de métricas en tiempo real

## 🎯 **Próximas Funcionalidades**

- [ ] **Exportación PDF** del diagrama Gantt
- [ ] **Drag & drop** para reprogramar tareas
- [ ] **Dependencias** entre tareas
- [ ] **Notificaciones** de conflictos
- [ ] **Integración** con calendario
- [ ] **Reportes** avanzados

## 🐛 **Resolución de Problemas**

### **Gantt no se muestra**
- Verificar conexión a internet (CDN de Frappe Gantt)
- Comprobar que existen tareas con fechas asignadas
- Revisar filtros aplicados

### **Rendimiento lento**
- Aplicar filtros para reducir datos mostrados
- Usar vista "Mes" para períodos largos
- Limpiar caché del navegador

## 📝 **Notas de Desarrollo**

- **Frappe Gantt** se carga dinámicamente desde CDN
- **Compatibilidad** mantenida con interfaces existentes
- **Tipos TypeScript** completos para mejor DX
- **Error handling** robusto en todos los componentes

---

**Desarrollado con ❤️ para optimizar la planificación de proyectos**
