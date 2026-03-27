# User Story 2 + Work Tickets — El Melómano y Amante del Arte
**Prioridad**: 🔶 Should-Have (P2)
**Generado**: 2026-03-09
**Total tickets**: 8 | **Esfuerzo total**: 14.5h

---

## User Story 2 — Exploración de Fragmentos Musicales + Reproducción

**Persona**: El Melómano y Amante del Arte

**Historia**:
> Como **Melómano**, quiero explorar fragmentos musicales curados por género y tipo de presentación para encontrar la "pieza de oro" de un concierto sin tener que ver el evento completo.

**Criterios de Aceptación**:
1. **Dado** que estoy en la sección "The Stage", **Cuando** selecciono el filtro "Solo Fragmentos" y el género "Jazz", **Entonces** el sistema muestra únicamente fragmentos de conciertos de Jazz con su indicador de plataforma origen (logo de YouTube, Vimeo, etc.).
2. **Dado** que selecciono una pieza musical con `permite_iframe = true`, **Cuando** hago clic en "Reproducir", **Entonces** el video se abre en un modal embebido (Smart Embedding) sin abandonar la plataforma.
3. **Dado** que selecciono una pieza musical con `permite_iframe = false`, **Cuando** hago clic en "Reproducir", **Entonces** el sistema muestra el botón "Ver en [plataforma origen]" que abre la app o web externa directamente.
4. **Dado** que una obra tiene un Hito registrado (ej. "Versión sinfónica histórica"), **Cuando** veo la card, **Entonces** el sello de calidad es visible de forma prominente en la miniatura.

**Requisitos cubiertos**: RF-001, RF-002, RF-005, RF-006, RF-009, RF-011
**Fuera de scope**: Watchlist, Modo Contexto, filtrado por duración en esta historia.

---

## 🗃️ Base de Datos

### ARF-012 — Migración: tabla HITO y géneros musicales

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de Datos |
| **Estimación** | 1.5h |
| **Dependencias** | ARF-001 |

**Descripción**: Crear la tabla `HITO` para los sellos de calidad/premios y agregar los campos necesarios para clasificación musical en `OBRA`.

**Criterios de Aceptación**:
- [ ] Tabla `HITO` creada: `id_hito`, `id_obra` (FK), `nombre_hito` (ej. "Ganador Cannes"), `anio_hito`
- [ ] Campo `tipo_contenido` agregado a `OBRA`: enum `('fragmento', 'completo')` — para filtro "Solo Fragmentos"
- [ ] Campo `genero_musical` agregado a `OBRA`: VARCHAR nullable (ej. "Jazz", "Sinfónico", "Ópera")
- [ ] Migración es reversible (up/down)
- [ ] Seed actualizado con al menos 6 obras de The Stage con distintos géneros e Hitos

---

### ARF-013 — Seed: catálogo de conciertos y fragmentos musicales

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de Datos |
| **Estimación** | 1h |
| **Dependencias** | ARF-012 |

**Descripción**: Poblar la base de datos con datos representativos del eje "The Stage" cubriendo todos los géneros y tipos de acceso.

**Criterios de Aceptación**:
- [ ] Mínimo 8 obras del eje `EJE_VERTICAL = 'Stage'`
- [ ] Al menos 2 fragmentos (`tipo_contenido = 'fragmento'`) y 2 completos por género principal
- [ ] Géneros representados: Jazz, Sinfónico, Ópera, Bolero/Salsa
- [ ] Obras con `permite_iframe = true` (YouTube/Vimeo) y `permite_iframe = false` (plataformas cerradas)
- [ ] Cada obra de The Stage tiene al menos 1 Hito registrado

---

## ⚙️ Backend

### ARF-014 — Extender GET /obras con filtros tipo_contenido y genero_musical

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 2h |
| **Dependencias** | ARF-003, ARF-012 |

**Descripción**: Ampliar el endpoint de búsqueda del Servicio de Curaduría para soportar los nuevos filtros específicos de la sección The Stage.

**Criterios de Aceptación**:
- [ ] `GET /obras?eje_vertical=Stage&tipo_contenido=fragmento&genero=Jazz` retorna solo fragmentos de Jazz
- [ ] Los Hitos de cada obra se incluyen en la respuesta como array: `hitos: ["Ganador Cannes", "Nominado Grammy"]`
- [ ] El filtro `eje_vertical` acepta: `Short List`, `Stage`, `Cinema`
- [ ] El filtro `tipo_contenido` acepta: `fragmento`, `completo`; ambos son opcionales
- [ ] Sin filtros, se mantiene el comportamiento anterior (retro-compatible)

**Tareas Técnicas**:
1. Extender `ObraResponseDto` para incluir `hitos: string[]`, `tipo_contenido`, `genero_musical`
2. Actualizar la query en `CuratedService` para hacer JOIN con tabla `HITO`
3. Agregar los nuevos query params con validación en el controlador
4. Verificar que los filtros se combinan correctamente (AND lógico)

---

### ARF-015 — Endpoint GET /obras/:id con detalle completo e Hitos

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 1.5h |
| **Dependencias** | ARF-014 |

**Descripción**: Implementar el endpoint de detalle de obra que devuelve todos los metadatos necesarios para la reproducción, incluyendo si es embebible y todos sus Hitos.

**Criterios de Aceptación**:
- [ ] `GET /obras/42` retorna el detalle completo: todos los campos de OBRA + array completo de Hitos + datos de PLATAFORMA_ORIGEN (incluyendo `permite_iframe`, `url_origen`)
- [ ] Si la obra no existe, retorna 404 con mensaje claro
- [ ] El campo `permite_iframe` está presente en la respuesta para que el frontend decida la estrategia de reproducción

**Tareas Técnicas**:
1. Agregar método `findOneWithDetails(id)` en `CuratedService`
2. Crear `ObraDetailDto` extendiendo `ObraResponseDto` con campos de plataforma y url_origen
3. Registrar el endpoint `GET /obras/:id` en el controlador

---

## 🎨 Frontend

### ARF-016 — Página The Stage con filtros de género y tipo

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 2.5h |
| **Dependencias** | ARF-014, ARF-006, ARF-008 |

**Descripción**: Crear la página dedicada al eje "The Stage" con sus filtros específicos: selector de género musical y toggle "Solo Fragmentos / Concierto Completo".

**Criterios de Aceptación**:
- [ ] Página accesible en `/stage` con título "The Stage"
- [ ] Toggle visual "Solo Fragmentos | Concierto Completo | Todos" que actualiza los resultados sin recargar
- [ ] Selector de género como chips horizontales: Jazz, Sinfónico, Ópera, Bolero, Rock, Pop (scroll horizontal en mobile)
- [ ] Los resultados usan el mismo componente `ObraCard` de ARF-008
- [ ] El estado de los filtros se refleja en la URL (`/stage?tipo=fragmento&genero=Jazz`)
- [ ] Estado vacío con mensaje específico para The Stage

**Tareas Técnicas**:
1. Crear `pages/stage/index.tsx` (Next.js)
2. Crear `components/TipoContenidoToggle/TipoContenidoToggle.tsx`
3. Crear `components/GeneroSelector/GeneroSelector.tsx` (reutiliza el patrón de MoodSelector)
4. Extender `hooks/useObrasFiltradas.ts` para los nuevos parámetros `eje_vertical`, `tipo_contenido`, `genero`

---

### ARF-017 — Componente ReproductorModal con Smart Embedding

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 3h |
| **Dependencias** | ARF-015 |

**Descripción**: Crear el reproductor modal que muestra el video embebido cuando `permite_iframe = true`. Es la funcionalidad de Smart Embedding central de la plataforma.

**Criterios de Aceptación**:
- [ ] Al hacer clic en "Reproducir" en una obra con `permite_iframe = true`, se abre un modal con el iframe del video
- [ ] El modal tiene botón de cierre (X) y se cierra al hacer clic fuera de él o presionar ESC
- [ ] El iframe usa la URL de origen de la plataforma con el formato correcto (embed URL de YouTube/Vimeo)
- [ ] Si el iframe no puede cargarse (error), muestra mensaje de fallback con botón de Deep Linking
- [ ] El modal es responsive: ocupa el 90% del viewport en desktop y 100% en mobile
- [ ] Al abrir el modal, se hace la llamada `GET /obras/:id` para obtener `url_origen` actualizado

**Tareas Técnicas**:
1. Crear `components/ReproductorModal/ReproductorModal.tsx` con Portal de React
2. Implementar lógica de construcción de embed URL para YouTube (`/embed/{videoId}`) y Vimeo (`/video/{videoId}`)
3. Crear `hooks/useObra.ts` para hacer fetch de `GET /obras/:id` on-demand
4. Agregar manejo de `onError` en el iframe para mostrar el fallback
5. Implementar trap de foco dentro del modal (accesibilidad)

---

### ARF-018 — Componente DeepLinkButton con parámetros de afiliación

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 1.5h |
| **Dependencias** | ARF-015 |

**Descripción**: Crear el componente de botón de Deep Linking para obras cuya plataforma no permite iframe. El botón abre la plataforma externa y el backend inyecta los parámetros de afiliación.

**Criterios de Aceptación**:
- [ ] Para obras con `permite_iframe = false`, se muestra el botón "Ver en [nombre_plataforma]" con el logo de la plataforma
- [ ] El clic abre la URL en una nueva pestaña (`target="_blank"` con `rel="noopener noreferrer"`)
- [ ] La URL incluye el parámetro de afiliación recibido del backend (no generado en el frontend)
- [ ] El botón muestra el icono de la plataforma (MUBI, Netflix, Apple TV, etc.)

**Tareas Técnicas**:
1. Crear `components/DeepLinkButton/DeepLinkButton.tsx` con props `plataformaNombre`, `url`, `logoUrl`
2. Crear mapa de logos de plataformas en `utils/platformLogos.ts`
3. Actualizar `ObraCard` (ARF-008) para renderizar `ReproductorModal` o `DeepLinkButton` según `permite_iframe`
4. Crear endpoint backend `GET /obras/:id/play-url` que retorna la URL con afiliado inyectado

---

### ARF-019 — Visualización de Hitos en ObraCard y página de detalle

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 1.5h |
| **Dependencias** | ARF-008, ARF-015 |

**Descripción**: Mostrar los Hitos (sellos de calidad) de forma prominente en las tarjetas de resultado y en la página de detalle de obra.

**Criterios de Aceptación**:
- [ ] En `ObraCard`, si la obra tiene Hitos, se muestra el primero como badge: "🏆 Ganador Cannes"
- [ ] Si hay más de 1 Hito, se muestra "+N más" como tooltip al hacer hover
- [ ] En la página de detalle, se listan todos los Hitos con año si está disponible
- [ ] El badge de Hito es visualmente destacado (color dorado/premium)

**Tareas Técnicas**:
1. Crear `components/HitoBadge/HitoBadge.tsx` reutilizable
2. Actualizar `ObraCard` para renderizar `HitoBadge` condicionalmente
3. Crear `pages/obra/[id].tsx` (página de detalle) que consume `GET /obras/:id`
4. Renderizar lista completa de Hitos en la página de detalle

---

## 📊 Orden de ejecución — US-2

```
(Paralelos desde inicio de US-2)
ARF-012 (BD: migración HITO + campos Stage)
    └── ARF-013 (BD: seed catálogo Stage)
    └── ARF-014 (Backend: extender GET /obras)
            └── ARF-015 (Backend: GET /obras/:id)
                    └── ARF-017 (FE: ReproductorModal)
                    └── ARF-018 (FE: DeepLinkButton)

ARF-008 (ya existe, US-1)
    └── ARF-019 (FE: Hitos en Card y detalle)

ARF-006 + ARF-014 ──► ARF-016 (FE: Página The Stage)
ARF-017 + ARF-018 + ARF-019 ──► ARF-016 (integración final)
```

## 📋 Resumen

| ID | Tipo | Descripción | Horas |
|----|------|-------------|-------|
| ARF-012 | BD | Migración HITO + campos Stage | 1.5h |
| ARF-013 | BD | Seed catálogo The Stage | 1h |
| ARF-014 | Backend | Extender GET /obras (género, tipo, hitos) | 2h |
| ARF-015 | Backend | GET /obras/:id detalle completo | 1.5h |
| ARF-016 | Frontend | Página The Stage con filtros | 2.5h |
| ARF-017 | Frontend | ReproductorModal Smart Embedding | 3h |
| ARF-018 | Frontend | DeepLinkButton con afiliación | 1.5h |
| ARF-019 | Frontend | Hitos en ObraCard y detalle | 1.5h |
| **Total US-2** | | | **14.5h** |

---

## Acumulado del proyecto

| Set | Tickets | Total horas |
|-----|---------|-------------|
| US-1 (Curioso Cultural) | ARF-001 → ARF-011 | 22h |
| US-2 (Melómano) | ARF-012 → ARF-019 | 14.5h |
| **Total acumulado** | **19 tickets** | **36.5h** |
