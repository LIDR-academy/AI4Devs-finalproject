# Issue-011: Scroll comienza desde la mitad al navegar entre páginas

**Fecha:** 2026-07-18  
**Contexto:** Al navegar a cualquier página que no sea el Home, la vista comienza desde la mitad de la página hacia abajo. El router no está restaurando la posición de scroll al tope en cada navegación.  
**Estado:** 🔧 En progreso

---

## Problema

- Al hacer clic en un enlace o botón que navega a otra ruta, la nueva página se muestra con scroll ya desplazado hacia abajo
- El comportamiento ocurre en todas las rutas excepto el Home
- React Router no realiza `scrollTo(0, 0)` por defecto al cambiar de ruta

## Comportamiento esperado

- Al navegar a cualquier página, la vista debe comenzar desde el tope (posición de scroll = 0)
- El comportamiento debe aplicarse en todas las rutas, incluyendo navegación hacia atrás y adelante

## Solución

1. Crear un componente `ScrollToTop` que llame a `window.scrollTo(0, 0)` en cada cambio de ruta
2. Registrarlo en el router usando el hook `useLocation` de React Router
3. Envolver el árbol de rutas con este componente

```tsx
// ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
```

4. Incluirlo dentro de `<BrowserRouter>` antes de las rutas:

```tsx
<BrowserRouter>
  <ScrollToTop />
  <Routes>...</Routes>
</BrowserRouter>
```

## Archivos a modificar

- `frontend/src/components/ScrollToTop.tsx` — nuevo componente
- `frontend/src/App.tsx` (o archivo de rutas) — incluir `<ScrollToTop />`

## Relacionado

- Puede estar relacionado con el layout principal si usa un contenedor con scroll propio en vez de `window`
