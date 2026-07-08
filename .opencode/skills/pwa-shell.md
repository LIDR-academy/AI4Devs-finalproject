# Skill: pwa-shell

## Purpose

Generates the Progressive Web App shell for the SvelteKit frontend: manifest, service worker, icons, and the `@vite-pwa/sveltekit` configuration.

## When to invoke

- During initial setup (Foundational phase, T020)
- When the PWA shell needs regenerating (e.g., new icons, new manifest fields)

## Inputs

- App name (default: "Realista")
- App description (default: "Asistente educativo con IA para compradores de vivienda en España")
- Theme color (default: `#2563eb`)
- Background color (default: `#ffffff`)

## Outputs

- `frontend/static/manifest.webmanifest`
- `frontend/static/icons/icon-192.png`, `icon-512.png`, `maskable-icon-512.png`
- `frontend/src/service-worker.ts`
- Updated `frontend/vite.config.ts` with `@vite-pwa/sveltekit` plugin

## Manifest template

```json
{
  "name": "Realista",
  "short_name": "Realista",
  "description": "Asistente educativo con IA para compradores de vivienda en España",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/maskable-icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## Vite config additions

```typescript
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default {
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      manifest: { /* see above */ },
      workbox: {
        navigateFallback: '/',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ]
};
```

## Icon generation

Use the `pwa-asset-generator` or include pre-made PNGs in the scaffold. For initial scaffold, include 3 placeholder PNGs (192, 512, 512-maskable) generated from a base logo.

## iOS-specific

Add to `frontend/src/app.html`:

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Realista" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```
