# US-004: Visor Interactivo (Zoom & Pan)

**Como** Usuario (Arquitecto o Cliente)  
**Quiero** navegar por el plano usando zoom y desplazamiento  
**Para** poder inspeccionar los detalles técnicos con precisión en cualquier dispositivo.

## Detalles
- **Titulo breve:** Navegación en Visor
- **Prioridad:** Alta (P1)
- **Estimación:** 5 Puntos
- **Dependencias:** US-003
- **Orden de ejecución:** 4
- **Estado:** Pending

## Diseño de Pantallas y UI

### 1. Lienzo del Visor (Canvas)
- **Área Principal:** Ocupa el 100% de la pantalla menos el header.
- **Imagen:** Renderizado de la imagen del plano.
- **Comportamiento:** El cursor cambia a "Mano" (grab) para indicar capacidad de panning.

### 2. Controles de Navegación (Overlay)
- **Ubicación:** Esquina inferior derecha o flotante.
- **Botones:** Zoom In (+), Zoom Out (-), Reset View (ajustar a pantalla).
- **Indicador:** Nivel de zoom actual (ej. 150%).

## Criterios de Aceptación (Gherkin)

### Escenario 1: Visualización inicial
**Dado** un plano cargado correctamente
**Cuando** entro al visor del proyecto
**Entonces** la imagen se ajusta para verse completa en la pantalla (Fit to screen)

### Escenario 2: Zoom profundo
**Dado** que estoy visualizando un plano
**Cuando** uso la rueda del ratón o el gesto de "pinch" en tablet
**Entonces** la imagen se amplia suavemente sin perder su posición relativa
**Y** la calidad se mantiene aceptable (dependiendo de la resolución original)

### Escenario 3: Panning (Desplazamiento)
**Dado** que tengo la imagen con zoom aplicado
**Cuando** hago clic y arrastro (o toco y arrastro)
**Entonces** el área visible del plano se mueve siguiendo mi cursor/dedo

## Tickets de Trabajo

### [FRONT-004] Implementación Visor Canvas
- **Tipo:** Frontend Feature
- **Propósito:** Crear el visor con capacidades de zoom y pan.
- **Especificaciones Técnicas:**
  - Componente: `PlanViewer.vue`.
  - Librería sugerida: `@panzoom/panzoom` o implementación nativa Canvas API.
  - Soportar eventos touch y wheel.
  - Asegurar rendimiento con imágenes 4k.
- **Criterios de Aceptación:**
  - Zoom funciona suavemente.
  - Se puede arrastrar la imagen (Pan).
  - Reset devuelve a vista inicial.
- **Equipo Asignado:** Frontend
- **Esfuerzo:** 8 pts

