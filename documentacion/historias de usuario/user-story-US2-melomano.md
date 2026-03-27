# User Story 2 — El Melómano y Amante del Arte

**Prioridad**: 🔶 Should-Have (P2)
**Generado**: 2026-03-09

---

## Persona

**Nombre**: El Melómano y Amante del Arte

- **Descripción**: Usuario con conocimiento técnico en música o artes escénicas. Valora la interpretación y la calidad sobre la popularidad.
- **Motivación principal**: Encontrar fragmentos magistrales, versiones instrumentales únicas o la "pieza de oro" de un concierto sin tener que ver el evento completo.
- **Frustración actual**: Las plataformas comerciales no ofrecen curaduría especializada de música clásica, jazz, ópera o teatro. El contenido está disperso en YouTube sin criterio editorial.
- **Comportamiento clave**: Filtra por género y tipo de contenido (Sinfónico, Jazz, Ópera), usa el selector de "Solo Fragmentos" vs "Concierto Completo".

---

## Historia

> Como **Melómano**, quiero explorar fragmentos musicales curados por género y tipo de presentación para encontrar la "pieza de oro" de un concierto sin tener que ver el evento completo.

---

## Criterios de Aceptación

1. **Dado** que estoy en la sección "The Stage", **Cuando** selecciono el filtro "Solo Fragmentos" y el género "Jazz", **Entonces** el sistema muestra únicamente fragmentos de conciertos de Jazz con su indicador de plataforma origen (logo de YouTube, Vimeo, etc.).

2. **Dado** que selecciono una pieza musical con `permite_iframe = true`, **Cuando** hago clic en "Reproducir", **Entonces** el video se abre en un modal embebido (Smart Embedding) sin abandonar la plataforma.

3. **Dado** que selecciono una pieza musical con `permite_iframe = false`, **Cuando** hago clic en "Reproducir", **Entonces** el sistema muestra el botón "Ver en [plataforma origen]" que abre la app o web externa directamente.

4. **Dado** que una obra tiene un Hito registrado (ej. "Versión sinfónica histórica"), **Cuando** veo la card, **Entonces** el sello de calidad es visible de forma prominente en la miniatura.

---

## Requisitos cubiertos

| ID | Requisito |
|----|-----------|
| RF-001 | Agregar e indexar contenido de terceros sin alojar video propio |
| RF-002 | Mostrar tipo de acceso: 🟢🟡🔵 en cada obra |
| RF-005 | Smart Embedding cuando la plataforma lo permita |
| RF-006 | Deep Linking cuando la plataforma no permita iframe |
| RF-009 | Contenido organizado en los tres ejes (The Stage) |
| RF-011 | Mostrar Hitos de calidad en cada obra |

---

## Fuera de scope

- Watchlist (cubierta en US-1)
- Modo Contexto (previsto en US futura)
- Filtrado por duración (Dial de Tiempo, cubierto en US-1)

---

## Work Tickets relacionados

Ver [`work-tickets-US2-melomano.md`](./work-tickets-US2-melomano.md)

| ID | Descripción | Horas |
|----|-------------|-------|
| ARF-012 | Migración: tabla HITO y géneros musicales | 1.5h |
| ARF-013 | Seed: catálogo de conciertos The Stage | 1h |
| ARF-014 | Extender GET /obras con filtros tipo y género | 2h |
| ARF-015 | GET /obras/:id con detalle completo | 1.5h |
| ARF-016 | Página The Stage con filtros | 2.5h |
| ARF-017 | ReproductorModal con Smart Embedding | 3h |
| ARF-018 | DeepLinkButton con afiliación | 1.5h |
| ARF-019 | Visualización de Hitos en ObraCard | 1.5h |
| **Total** | | **14.5h** |
