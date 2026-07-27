# ADR-007: PWA Integration Strategy

## Status
Accepted

## Date
2026-07-08

## Context
Realista es una herramienta mobile-first para compradores de vivienda. El usuario típico consulta anuncios desde el móvil mientras visita pisos o navega por portales inmobiliarios. Necesitábamos que la experiencia fuera similar a una app nativa: instalable, offline-capable, y con navegación rápida.

## Decision
Usar **`@vite-pwa/sveltekit`** para convertir la SPA de SvelteKit en una Progressive Web App:

- **Service Worker**: Auto-generado por Vite PWA plugin con estrategia `generateSW`. Workbox runtime caching para assets estáticos y API calls.
- **Manifest**: `manifest.webmanifest` con nombre "Realista", tema verde oscuro (#1a3a2a), iconos PNG 192x192 y 512x512.
- **Meta tags**: iOS Safari (apple-touch-icon, apple-mobile-web-app-capable), tema de color.
- **Navegación**: Tabs inferiores persistentes (Dashboard, Listing Lens, Mortgage Compass, Timeline, Checklist). Cada tab es una ruta SvelteKit independiente.
- **SPA mode**: `@sveltejs/adapter-node` con fallback SPA para rutas no pre-renderizadas.

## Alternatives Considered
1. **Sin PWA (solo responsive)**: Pierde instalabilidad y cache offline. El usuario tiene que abrir el navegador cada vez.
2. **React Native / Flutter**: Complejidad innecesaria para un MVP educativo. Duplicaría el código frontend.
3. **Workbox manual**: Más control pero más boilerplate. `@vite-pwa/sveltekit` abstrae la configuración.
4. **SSR con adapter-node**: La app es fundamentalmente una SPA con datos dinámicos por sesión. SSR añade complejidad sin beneficio para este caso de uso.

## Consequences
- **Positivo**: Instalable en homescreen (iOS y Android). Experiencia app-like.
- **Positivo**: Cache offline para assets estáticos y datos previamente cargados.
- **Positivo**: Configuración declarativa en `vite.config.ts`. Service worker auto-generado.
- **Negativo**: Los iconos actuales son placeholders ("R" sobre fondo verde). Deberían reemplazarse por un diseño profesional.
- **Negativo**: La estrategia de cacheo puede servir datos stale si no se configura correctamente la invalidación.

## Related
- Principio V: Mobile-First PWA (constitución)
- `frontend/vite.config.ts`: Configuración PWA
- `frontend/static/manifest.webmanifest`
