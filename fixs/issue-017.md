# Issue 017 — Carrusel de estilos populares cortado y sin flechas

**Estado:** ✅ Resuelto  
**Severidad:** Media  
**Reportado:** 2026-07-18  

## Descripción
En el Home, los estilos populares muestran el primer y último ítem cortados a la mitad.
No hay flechas ni controles para desplazar el carrusel horizontalmente.

## Causa raíz
El contenedor `.home-styles` usaba `overflow-x: auto` sin padding lateral para los items
de borde. No existían botones de navegación.

## Solución
- Envuelto en `.home-styles-wrapper` con padding lateral y `position: relative`
- Agregados botones de flecha izquierda/derecha con posición absoluta
- Método `scrollStyles()` en el componente para scroll suave de 240px
- Agregado `ViewChild('stylesCarousel')` para referencia DOM

## Archivos modificados
- `frontend/src/app/features/showcase/showcase-page/showcase-page.component.html`
- `frontend/src/app/features/showcase/showcase-page/showcase-page.component.scss`
- `frontend/src/app/features/showcase/showcase-page/showcase-page.component.ts`
