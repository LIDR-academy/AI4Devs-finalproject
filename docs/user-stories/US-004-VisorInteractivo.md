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
- **Estado:** Done

## Diseño de Pantallas y UI

### 1. Lienzo del Visor (Canvas)
- **Área Principal:** Ocupa el 100% del espacio disponible (viewport menos header).
- **Imagen:** Renderizado optimizado del plano.
- **Comportamiento Cursor:** Default: `grab` (mano abierta), Dragging: `grabbing` (mano cerrada).
- **Comportamiento Zoom:** Zoom hacia la posición del cursor (mouse) o centro del gesto (touch), no al centro de pantalla.

### 2. Controles de Navegación (Floating UI)
- **Ubicación:** Flotante, esquina inferior derecha (`bottom: 20px`, `right: 20px`).
- **Estilo:** Fondo semi-transparente o sólido con sombra para contraste.
- **Componentes:** Grupo de botones: `[-] Zoom Out`, `[ % ] Indicador/Reset`, `[+] Zoom In`, `[⟲] Fit to Screen`.

### 3. Interacciones y Atajos
- **Ratón:** Rueda (Zoom), Click+Arrastrar (Pan).
- **Táctil:** Pinch (Zoom), Arrastrar (Pan).
- **Teclado:**
  - `+` / `-`: Zoom In/Out.
  - `0` (Cero) o `R`: Reset View.
  - `Flechas`: Panning fino.

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
**Y** el cursor cambia visualmente a "agarre" durante la acción

### Escenario 4: Accesibilidad por Teclado
**Dado** que el foco está en el visor
**Cuando** presiono las teclas `+`, `-` o `0`
**Entonces** el visor realiza Zoom In, Zoom Out o Reset respectivamente

### Escenario 5: Límites de Navegación
**Dado** que estoy arrastrando el plano
**Cuando** llego al borde de la imagen
**Entonces** el visor impide perder la imagen de vista completamente (límite elástico o rígido)

## Tickets de Trabajo

### [FRONT-005] Implementación Visor Canvas
- **Tipo:** Frontend Feature
- **Propósito:** Crear el visor con capacidades de zoom y pan fluido usando tecnologías nativas.
- **Especificaciones Técnicas (Nuxt/Vue):**
  - **Componentes:**
    - `components/plans/PlanViewer.vue`: Lógica principal y área de visualización.
    - `components/plans/PlanControls.vue`: UI flotante para zoom/reset emit events.
  - **Implementación Lógica:**
    - Usar **CSS Transforms** (`transform: translate(...) scale(...)`) para máximo rendimiento GPU con imágenes grandes.
    - Utilizar `ref` para el estado (`zoomLevel`, `positionX`, `positionY`).
    - Implementar lógica de "Zoom-at-point" (calcular el desplazamiento basado en la coordenada del ratón relativa al contenedor).
    - Event Listeners:
      - `wheel`: Con `{ passive: false }` para prevenir scroll de página y controlar el zoom.
      - `pointerdown/move/up`: Para unificar lógica de Mouse y Touch en una sola API.
      - `window.addEventListener('keydown')`: Para atajos (+, -, 0, Flechas).
  - **Restricciones:** 
    - NO usar librerías externas pesadas.
    - Implementar límites (boundaries) para que la imagen no salga del viewport.
- **Criterios de Aceptación:**
  - [x] El zoom sigue al cursor del ratón (no solo al centro).
  - [x] Panorámica (Pan) fluida con cursor `grabbing`.
  - [x] Atajos de teclado (+, -, 0, Flechas) operativos.
  - [x] UI Flotante actualiza el porcentaje de zoom real.
  - [x] Funciona en móvil con gestos táctiles básicos (si es complejo, fallback a botones).
- **Equipo Asignado:** Frontend
- **Esfuerzo:** 8 pts

