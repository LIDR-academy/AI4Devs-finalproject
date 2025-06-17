# Componentes de Estimación de Tareas

Esta carpeta contiene los componentes implementados para la **US-05: Estimación de tarea por tecnología**.

## Componentes Implementados

### 1. SprintEstimationInput
**Ticket:** US-05-01

Componente para ingresar la estimación en sprints de una tarea.

**Características:**
- Entrada numérica con validaciones (0.5 - 50 sprints)
- Valores predefinidos basados en escala de Fibonacci (0.5, 1, 2, 3, 5, 8)
- Información contextual sobre duración (1 sprint = 2 semanas)
- Guía de estimación para diferentes tipos de tareas
- Accesible con teclado y pantalla

### 2. LoadFactorInput
**Ticket:** US-05-02

Componente para definir el factor de carga (número de trabajadores necesarios).

**Características:**
- Selección visual mediante botones (0.5, 1, 2, 3, 4, 5 trabajadores)
- Opción para valores personalizados
- Tooltips explicativos para cada nivel
- Interfaz intuitiva con iconos y colores
- Validación para valores entre 0.5 y 20 trabajadores

### 3. TaskEstimationModal
**Componente principal**

Modal que integra los dos componentes anteriores para la estimación completa.

**Características:**
- Información detallada de la tarea a estimar
- Validación de permisos (solo usuarios de tecnología)
- Validación de estado (solo tareas en PENDING_PLANNING)
- Resumen visual de la estimación
- Cálculo automático de esfuerzo total (persona-semanas)
- Manejo de estados de carga y errores
- Confirmación antes de cerrar con cambios no guardados

## Integración

Los componentes se integran en:
- `TaskTable`: Botón de estimación para tareas elegibles
- `TaskList`: Gestión del modal y actualización de datos
- `TaskService`: Función `updateTaskEstimation` para persistir cambios

## Criterios de Acceso

- Solo usuarios con rol `TECNOLOGIA` pueden acceder
- Solo tareas en estado `PENDING_PLANNING` son estimables
- Ambos valores (sprints y factor de carga) son obligatorios

## Validaciones Implementadas

### Sprints
- Valor numérico positivo
- Rango: 0.5 - 50 sprints
- Decimales permitidos (ej: 1.5, 2.5)

### Factor de Carga
- Valor numérico positivo
- Rango: 0.5 - 20 trabajadores
- Interpretación según documentación funcional (número de trabajadores)

## Estilos

Los componentes incluyen estilos CSS personalizados en `TaskEstimationModal.css` con:
- Diseño responsive
- Animaciones suaves
- Estados de carga
- Consistencia con el diseño general de TaskDistributor

## Pendientes para Futuras Iteraciones

- Implementación del historial de estimaciones (US-05-03)
- Conexión con backend real
- Sincronización con Redmine
- Métricas de precisión de estimaciones 