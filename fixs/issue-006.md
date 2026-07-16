# Issue-006: Mapa de artistas (US0012) renderiza tiles dispersos sobre fondo negro

**Fecha:** 2026-07-16
**Contexto:** US0012 en revisión (PR #16). Al abrir `/mapa`, los tiles de OpenStreetMap aparecían desordenados sobre un área negra, sin controles de zoom (evidencia: `fixs/issue-map.png`).
**Estado:** ✅ Resuelto (2026-07-16)

---

## Descripción del problema

En la vista de mapa (`MapViewComponent`), Leaflet renderizaba solo algunos tiles y en posiciones incorrectas; el resto del contenedor quedaba negro y no aparecían los controles de zoom. El patrón visual corresponde a Leaflet operando **sin su hoja de estilos**: sin `leaflet.css`, los tiles pierden el `position: absolute` que los ancla a la grilla del mapa.

## Causa raíz

Los CSS de Leaflet y MarkerCluster se habían agregado al array `styles` de `angular.json` en el commit de US0012, pero **`ng serve` solo lee `angular.json` al arrancar**: el dev server llevaba corriendo desde antes de ese commit, por lo que servía un `styles.css` (8.7 KB) sin ninguna regla de Leaflet. No era un bug de código sino de configuración no recargada — aun así, dejaba al proyecto expuesto a repetir el problema tras cada edición de `angular.json`.

## Solución aplicada

Mover los imports de CSS de `angular.json` a `src/styles.scss`, que sí se recompila en caliente:

```scss
/* src/styles.scss */
@import 'leaflet/dist/leaflet.css';
@import 'leaflet.markercluster/dist/MarkerCluster.css';
@import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
```

y dejar en `angular.json` solo `src/styles.scss` (evita duplicar el CSS en el bundle).

## Verificación

- `styles.css` servido pasó de 8.7 KB a 24 KB e incluye `.leaflet-tile`, `.leaflet-container` y `.marker-cluster`.
- El mapa renderiza la grilla completa de tiles con controles de zoom.
- Suite frontend: 101/101 en verde.

## Nota relacionada (misma sesión)

Se reemplazó una imagen del seed del estilo *lettering* (`backend/Seed/TattooImageCatalog.cs`) que se pidió retirar: `342403992_d981945d52_b.jpg` (Flickr, CC BY-NC-SA) → `Corpus_Vile.JPG` (Wikimedia Commons, dominio público). Actualizados el catálogo, `docs/tattoo-styles.yml` y — dado que el seeder solo corre con BD vacía — la fila existente de `portfolio_items` en la BD de desarrollo vía `UPDATE`. **Las BD ya sembradas en otros entornos conservarán la URL antigua salvo re-seed o UPDATE equivalente.**
