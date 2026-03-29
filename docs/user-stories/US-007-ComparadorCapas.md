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

### 1. Control Deslizante de Opacidad (Overlay) y Visualización
- **Ubicación:** Panel flotante inferior-central para no bloquear menús superiores ni laterales.
- **Diseño:** Slider horizontal (rango 0 a 100) alineado en el centro del panel flotante.
- **Indicadores e Información:**
  - Extremo Izquierdo (o selector izquierdo): Icono/Texto con la versión o fecha de la "Base".
  - Extremo Derecho (o selector derecho): Icono/Texto con la versión o fecha de la "Propuesta".
  - Indicador central (50%) para indicar vista intermedia.
- **Botón de Alternancia (Blink/Toggle):** Botón adyacente al slider para saltar rápidamente entre 0% y 100% de opacidad y visualizar micro-cambios al instante.
- **Feedback:** Respuesta inmediata sin latencia (lag) al arrastrar el slider.

### 2. Selección de Capas y Sincronización
- **Selección Inteligente:** Autoselección de la versión más reciente como "Propuesta" y la versión anterior como "Base" por defecto.
- **Selector de Versiones:** Dropdowns ubicados en los lados del panel inferior flotante para permitir cambiar la capa "Base" y la "Propuesta".
- **Estado Vacío:** Si solo hay una versión disponible en el proyecto, el panel flotante inferior se oculta por completo por defecto para mantener el visor limpio.

## Criterios de Aceptación (Gherkin)

### Escenario 1: Carga de capas y sincronización geométrica
**Dado** un proyecto que tiene una "Imagen Base" (A) y una "Propuesta" (B)
**Cuando** abro el visor
**Entonces** ambas imágenes se cargan superpuestas y alineadas
**Y** ambas imágenes mantienen exactamente el mismo nivel de zoom y posición al navegar (paneo).

### Escenario 2: Uso del Slider de Opacidad
**Dado** el control deslizante de opacidad visible
**Cuando** lo muevo hacia la izquierda (0%) o derecha (100%)
**Entonces** la capa superior varía su transparencia visual instantáneamente
**Y** revela de manera fluida el contenido de la capa inferior

### Escenario 3: Solo una versión disponible (Edge Case)
**Dado** un proyecto con solo 1 plano subido
**Cuando** entro al visor
**Entonces** el control de opacidad NO aparece en el visor

### Escenario 4: Botón de Alternancia Rápida (Blink)
**Dado** el visor con las dos capas cargadas y superpuestas
**Cuando** el usuario hace clic en el botón de alternar vista
**Entonces** la opacidad de la capa superior cambia instantáneamente entre 0% y 100% (o de manera inversa) sin necesidad de usar el slider manual.

## Tickets de Trabajo

### [FRONT-008] Implementación Comparador de Opacidad
- **Tipo:** Frontend Feature & UX
- **Propósito:** Permitir superposición, sincronización geométrica de capas y transparencia variable.
- **Especificaciones Técnicas:**
  - Modificar `PlanViewer` para aceptar un Array de imágenes o un objeto con `{ base, proposal }`.
  - Crear e implementar un componente de control independiente (ej. `LayerComparatorControls.vue`), situado con absolute (`bottom-4 left-1/2 transform -translate-x-1/2`).
  - Envolver ambas imágenes en un único `wrapper` (contenedor padre) que capture los eventos de Zoom y Paneo, asegurando que ambas se muevan juntas de manera totalmente sincrónica.
  - CSS `opacity`: controlada por una variable reactiva (`v-model` del Slider de 0 a 1).
  - Incluir botón de "Alternancia rápida" que configure la opacidad directamente a los extremos 0 o 1.
  - Asegurar un correcto manejo del `z-index`.
- **Criterios de Aceptación:**
  - Base y Propuesta reaccionan al zoom de manera compartida e idéntica.
  - Botón blink altera entre estado inferior a superior al instante.
  - Desaparición del componente `LayerComparatorControls` si las imágenes asociadas son $<2$.
- **Equipo Asignado:** Frontend
- **Esfuerzo:** 5 pts

### [BACK-009] Inclusión de Capas en el Listado de Planos (Soporte Comparador)
- **Tipo:** Backend API Update
- **Propósito:** Permitir que el frontend tenga todas las imágenes cargadas al listar versiones evitando llamadas secundarias que ralentizarían el flujo del comparador.
- **Especificaciones Técnicas:**
  - Modificar el método `findByProject` en `PrismaPlanRepository.ts` (`apps/backend/src/infrastructure/database/repositories/prisma-plan.repository.ts`).
  - Añadir la configuración `include: { layers: true }` a la consulta de Prisma.
  - Asegurar que la entidad de Dominio `Plan` instancie e incluya correctamente las `layers` mapeadas en su respuesta al igual que lo hace el método `findById`.
- **Criterios de Aceptación:**
  - El endpoint `GET /projects/{projectId}/plans` devuelve dentro de cada plano un arreglo `layers` con sus URLs procesadas.
  - El tiempo de respuesta de la consulta a base de datos sigue siendo óptimo para un MVP sin requerir por el momento lazy-loading.
- **Equipo Asignado:** Backend
- **Esfuerzo:** 1 pt

