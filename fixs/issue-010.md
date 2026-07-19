# Issue-010: Estilos populares en Home no es carrusel horizontal

**Fecha:** 2026-07-18  
**Contexto:** La sección "Estilos populares" en el Home muestra los estilos en múltiples filas con wrap. Debería ser un carrusel horizontal de una sola fila con scroll/flechas de navegación.  
**Estado:** 🔧 En progreso

---

## Problema

- Los estilos populares se renderizan en un contenedor con `flex-wrap` o `grid`, generando múltiples filas
- No existe comportamiento de carrusel (scroll horizontal, flechas de navegación)
- El diseño actual no coincide con el prototipo Figma que muestra una sola fila deslizable

## Comportamiento esperado

- La sección "Estilos populares" debe mostrarse como un carrusel horizontal de una sola fila
- Debe incluir flechas (anterior / siguiente) para navegar entre estilos
- Opcionalmente, soporte de scroll horizontal nativo en dispositivos táctiles
- Solo se deben ver N estilos por vez (según breakpoint), el resto se accede deslizando

## Solución

1. Reemplazar el contenedor actual (wrap/grid) por un carrusel horizontal
2. Implementar controles de navegación (flechas izquierda/derecha)
3. Asegurar que `overflow-x: hidden` en el wrapper y `overflow-x: scroll` en el track
4. Añadir soporte para gestos táctiles (swipe)
5. Validar que el diseño sea responsive en mobile, tablet y desktop

## Archivos a modificar

- `frontend/src/pages/Home.tsx` — sección "Estilos populares"
- `frontend/src/components/StylesCarousel/` — nuevo componente o adaptar existente
- Posible: estilos CSS/Tailwind del contenedor de estilos

## Relacionado

- Issue-010 es visual/UX, no afecta lógica de negocio
