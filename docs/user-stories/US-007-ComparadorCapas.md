# US-007: Comparación de Capas (Slider de Opacidad)

**Como** Usuario  
**Quiero** ajustar la transparencia de la versión actual sobre la versión anterior  
**Para** detectar visualmente los cambios realizados (muros movidos, muebles cambiados).

## Detalles
- **Titulo breve:** Comparador Visual
- **Prioridad:** Media (P2)
- **Estimación:** 5 Puntos
- **Dependencias:** US-004
- **Orden de ejecución:** 7
- **Estado:** Pending

## Diseño de Pantallas y UI

### 1. Control Deslizante de Opacidad (Overlay)
- **Ubicación:** Central superior o lateral, flotante sobre el plano.
- **Diseño:** Slider horizontal range (0 a 100).
- **Indicadores:**
  - Extremo Izquierdo: Icono/Texto "Base" (o nombre del archivo base).
  - Extremo Derecho: Icono/Texto "Propuesta" (o nombre de la nueva versión).
- **Feedback:** Al arrastrar, la opacidad de la capa superior cambia instantáneamente.

### 2. Selector de Versiones (Opcional MVP)
- **Elemento:** Dropdown para elegir qué versión actúa como "Base" y cuál como "Propuesta" si hay más de 2.

## Criterios de Aceptación (Gherkin)

### Escenario 1: Carga de capas
**Dado** un proyecto que tiene una "Imagen Base" (A) y una "Propuesta" (B)
**Cuando** abro el visor
**Entonces** ambas imágenes se cargan superpuestas y alineadas

### Escenario 2: Uso del Slider
**Dado** el control deslizante de opacidad visible
**Cuando** lo muevo hacia la izquierda (0%) o derecha (100%)
**Entonces** la capa superior varía su transparencia en tiempo real
**Y** revela el contenido de la capa inferior

### Escenario 3: Solo una versión disponible (Edge Case)
**Dado** un proyecto con solo 1 plano subido
**Cuando** entro al visor
**Entonces** el control de opacidad NO debe aparecer o debe estar deshabilitado

## Tickets de Trabajo

### [FRONT-007] Implementación Comparador de Opacidad
- **Tipo:** Frontend Feature
- **Propósito:** Permitir superposición y transparencia variable.
- **Especificaciones Técnicas:**
  - Modificar `PlanViewer` para aceptar Array de imágenes.
  - Renderizar imagen Base (Bottom) y Propuesta (Top) absolute.
  - CSS `opacity`: controlada por variable reactiva del Slider (0-1).
  - Asegurar `z-index` correcto.
- **Criterios de Aceptación:**
  - Slider a 0 solo muestra base.
  - Slider a 100 solo muestra propuesta.
  - Intermedio mezcla ambas.
- **Equipo Asignado:** Frontend
- **Esfuerzo:** 5 pts

