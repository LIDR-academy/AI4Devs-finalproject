# User Story 3 + Work Tickets — El Cinéfilo
**Prioridad**: 🔷 Should-Have (P2)
**Generado**: 2026-03-09
**Total tickets**: 9 | **Esfuerzo total**: 17h

---

## User Story 3 — Búsqueda por Festival/Hito + Acceso Transparente

**Persona**: El Cinéfilo (Cinephile)

**Historia**:
> Como **Cinéfilo**, quiero buscar películas de festivales reconocidos y ver claramente si necesito suscripción o si son gratuitas, para decidir qué ver sin contratiempos de acceso.

**Criterios de Aceptación**:
1. **Dado** que estoy en la sección "The Cinema", **Cuando** busco por Hito "Nominados Oscar 2024", **Entonces** el sistema retorna todas las obras que tienen ese `HITO` registrado, con su `ESTADO_ACCESO` visible (🟢🟡🔵) y el logo de la plataforma origen.
2. **Dado** que hago clic en una película, **Cuando** veo el detalle de la obra, **Entonces** puedo ver la ficha técnica completa: director, región, duración, valor cultural (máx. 280 caracteres) y todos sus Hitos.
3. **Dado** que la obra es de acceso Suscripción (🟡), **Cuando** hago clic en "Ver en MUBI", **Entonces** el sistema me redirige mediante Deep Linking con parámetros de afiliación inyectados por el backend.
4. **Dado** que el servicio externo no está disponible, **Cuando** intento acceder, **Entonces** el sistema muestra "Contenido no disponible temporalmente" sin errores técnicos.

**Requisitos cubiertos**: RF-001, RF-002, RF-006, RF-010, RF-011, RNF-003
**Fuera de scope**: Watchlist, Smart Embedding, Modo Contexto.

---

## 🗃️ Base de Datos

### ARF-020 — Seed: catálogo de cine de festivales

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de Datos |
| **Estimación** | 1.5h |
| **Dependencias** | ARF-012 |

**Descripción**: Poblar la base de datos con un catálogo representativo del eje "The Cinema" que incluya películas con Hitos de festivales internacionales reconocidos.

**Criterios de Aceptación**:
- [ ] Mínimo 10 obras del eje `EJE_VERTICAL = 'Cinema'`
- [ ] Festivales representados: Óscar, Cannes, Berlinale, Sundance, BAFTA (mínimo 3)
- [ ] Obras con los tres tipos de acceso: Abierto (🟢), Suscripción (🟡), VOD (🔵)
- [ ] Plataformas: MUBI, Mubi, YouTube, Vimeo — con `permite_iframe` correcto por plataforma
- [ ] Cada película tiene `valor_cultural` (máx. 280 caracteres) y al menos 1 Hito con `anio_hito`
- [ ] Al menos 3 películas con múltiples Hitos para validar la visualización de "+N más"

---

### ARF-021 — Índice en tabla HITO para búsqueda por nombre

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de Datos |
| **Estimación** | 0.5h |
| **Dependencias** | ARF-012 |

**Descripción**: Agregar índice de búsqueda textual en el campo `nombre_hito` para que las búsquedas por festival sean performantes.

**Criterios de Aceptación**:
- [ ] Índice `GIN` o `BTREE` creado en `HITO.nombre_hito` (PostgreSQL)
- [ ] La búsqueda por texto parcial funciona: "Oscar" encuentra "Nominado Oscar 2024" y "Ganador Oscar 2023"
- [ ] La migración es reversible

**Tareas Técnicas**:
1. Crear migración que agrega `CREATE INDEX idx_hito_nombre ON HITO USING GIN (to_tsvector('spanish', nombre_hito))`
2. Validar el plan de ejecución de la query de búsqueda con `EXPLAIN ANALYZE`

---

## ⚙️ Backend

### ARF-022 — Endpoint GET /obras con búsqueda por Hito

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 2h |
| **Dependencias** | ARF-014, ARF-021 |

**Descripción**: Extender el endpoint de búsqueda para permitir que el usuario filtre obras por el nombre de un Hito o festival, habilitando búsquedas como "Nominados Oscar 2024".

**Criterios de Aceptación**:
- [ ] `GET /obras?hito=Oscar` retorna todas las obras que tienen un HITO cuyo `nombre_hito` contiene "Oscar"
- [ ] `GET /obras?eje_vertical=Cinema&hito=Cannes` combina ambos filtros correctamente (AND lógico)
- [ ] La búsqueda es insensible a mayúsculas/minúsculas
- [ ] Si no hay resultados, retorna `[]` con 200 (no 404)
- [ ] El rendimiento de la búsqueda es < 500ms con el índice aplicado

**Tareas Técnicas**:
1. Agregar query param `hito?: string` al controlador de `CuratedModule`
2. Extender la query en `CuratedService` con LEFT JOIN a HITO y cláusula `ILIKE %hito%`
3. Actualizar `ObraResponseDto` si es necesario
4. Agregar test de integración para verificar la búsqueda por hito

---

### ARF-023 — Endpoint GET /obras/:id/play-url con afiliación

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 2h |
| **Dependencias** | ARF-015 |

**Descripción**: Implementar el endpoint que genera la URL de redirección con los parámetros de afiliación inyectados de forma segura en el backend, nunca expuestos al frontend.

**Criterios de Aceptación**:
- [ ] `GET /obras/42/play-url` retorna `{ url: "https://mubi.com/film/xxx?ref=arteflujo&aff=ARF123" }`
- [ ] Los parámetros de afiliación se leen desde variables de entorno (nunca hardcodeados)
- [ ] Si la obra tiene `permite_iframe = true`, el endpoint retorna la embed URL en su lugar
- [ ] Si la obra no existe, retorna 404
- [ ] El endpoint NO requiere autenticación (es público)

**Tareas Técnicas**:
1. Crear método `getPlayUrl(id_obra)` en `CuratedService`
2. Leer los códigos de afiliado por plataforma desde `process.env.AFFILIATE_MUBI`, `AFFILIATE_NETFLIX`, etc.
3. Crear `backend/.env.example` actualizado con las variables de afiliados
4. Registrar `GET /obras/:id/play-url` en el controlador

---

### ARF-024 — Circuit Breaker para acceso a plataformas externas

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 2.5h |
| **Dependencias** | ARF-023 |

**Descripción**: Implementar el patrón Circuit Breaker en el Motor de Agregación para que los fallos de plataformas externas no degraden la experiencia del usuario ni propaguen errores al frontend.

**Criterios de Aceptación**:
- [ ] Si una plataforma externa falla 3 veces consecutivas, el circuit breaker se abre y marca su contenido como `disponible = false` en caché Redis por 30 minutos
- [ ] El endpoint `GET /obras` retorna obras con plataformas caídas con un campo `disponible: false` (no las elimina del catálogo)
- [ ] El endpoint `GET /obras/:id/play-url` retorna 503 con mensaje `"Contenido no disponible temporalmente"` si la plataforma está en estado abierto
- [ ] El circuit breaker se auto-recupera (estado half-open) después del tiempo de espera

**Tareas Técnicas**:
1. Instalar librería de circuit breaker (`opossum` para Node.js)
2. Crear `AggregatorService` en `backend/src/modules/aggregator/` que envuelve las llamadas a plataformas externas
3. Configurar Redis como almacén de estado del circuit breaker (`disponible:plataforma:id`)
4. Agregar campo `disponible: boolean` al `ObraResponseDto`
5. Crear endpoint health-check `/aggregator/status` para monitoreo interno

---

## 🎨 Frontend

### ARF-025 — Página The Cinema con buscador por Hito/festival

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 2.5h |
| **Dependencias** | ARF-022, ARF-008 |

**Descripción**: Crear la página del eje "The Cinema" con su buscador especializado por nombre de hito o festival, permitiendo búsquedas como "Cannes", "Oscar" o "Berlinale".

**Criterios de Aceptación**:
- [ ] Página accesible en `/cinema` con título "The Cinema"
- [ ] Campo de búsqueda con placeholder "Buscar por festival, premio o director..."
- [ ] La búsqueda se ejecuta al escribir (debounce 400ms) o al presionar Enter
- [ ] Los resultados usan `ObraCard` mostrando claramente el indicador de acceso (🟢🟡🔵)
- [ ] El término de búsqueda se refleja en la URL: `/cinema?hito=Oscar`
- [ ] Etiquetas de búsquedas sugeridas: "Oscar", "Cannes", "Berlinale", "Sundance" como chips clickeables
- [ ] Estado vacío con mensaje: "No encontramos películas con ese criterio. Prueba con 'Cannes' o 'Berlinale'."

**Tareas Técnicas**:
1. Crear `pages/cinema/index.tsx` (Next.js)
2. Crear `components/HitoBuscador/HitoBuscador.tsx` con debounce
3. Crear `components/SugerenciasHito/SugerenciasHito.tsx` con chips de búsqueda predefinidos
4. Extender `hooks/useObrasFiltradas.ts` con el parámetro `hito`

---

### ARF-026 — Página de detalle de obra (ficha técnica de película)

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 2.5h |
| **Dependencias** | ARF-015, ARF-019, ARF-023 |

**Descripción**: Crear la página de detalle completa para una obra cinematográfica, con todos los datos de la ficha técnica, todos sus Hitos y el botón de acceso con la lógica de Deep Linking o Smart Embedding.

**Criterios de Aceptación**:
- [ ] Página accesible en `/obra/[id]` con datos de SSR (Next.js `getServerSideProps`)
- [ ] Muestra: título, director/artista, región, duración, `valor_cultural` completo, todos los Hitos con año
- [ ] El indicador de acceso (🟢🟡🔵) es prominente con texto descriptivo: "Disponible en MUBI (Suscripción)"
- [ ] Botón de acción dinámico: "Reproducir" (Smart Embedding) o "Ver en [Plataforma]" (Deep Linking)
- [ ] Si `disponible = false` (circuit breaker activo), el botón muestra "No disponible temporalmente" deshabilitado
- [ ] Meta tags SEO: `<title>` y `<meta description>` con datos de la obra

**Tareas Técnicas**:
1. Crear/actualizar `pages/obra/[id].tsx` con `getServerSideProps` para SSR
2. Crear `components/FichaTecnica/FichaTecnica.tsx` con todos los campos de la obra
3. Crear `components/BotonAcceso/BotonAcceso.tsx` que decide entre Reproducir y Deep Link según `permite_iframe` y `disponible`
4. Agregar meta tags dinámicos con `next/head`

---

### ARF-027 — Estado de indisponibilidad y manejo de errores en el Frontend

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 1.5h |
| **Dependencias** | ARF-024, ARF-026 |

**Descripción**: Implementar la capa de UI que comunica al usuario de forma amigable cuando un contenido no está disponible por fallo de plataforma, sin mostrar errores técnicos.

**Criterios de Aceptación**:
- [ ] Si `disponible = false` en `ObraCard`, se muestra un badge "No disponible" sobre la imagen y el botón de acceso se deshabilita
- [ ] Si `GET /obras/:id/play-url` retorna 503, se muestra un toast: "Este contenido no está disponible en este momento. Inténtalo más tarde."
- [ ] El error 503 no propaga un error de React ni rompe la página
- [ ] La `ObraCard` con `disponible = false` sigue siendo visible en los resultados (no se oculta)

**Tareas Técnicas**:
1. Agregar prop `disponible: boolean` a `ObraCard` y renderizar badge condicionalmente
2. Envolver la llamada a `play-url` en try/catch con toast de error en `BotonAcceso`
3. Crear `components/IndisponibleBadge/IndisponibleBadge.tsx`

---

## 📊 Orden de ejecución — US-3

```
(Paralelos desde inicio de US-3)
ARF-020 (BD: seed The Cinema)
ARF-021 (BD: índice HITO.nombre_hito)
    └── ARF-022 (Backend: búsqueda por Hito en GET /obras)
                └── ARF-025 (FE: Página The Cinema + buscador)

ARF-015 (ya existe, US-2)
    └── ARF-023 (Backend: GET /obras/:id/play-url con afiliación)
            └── ARF-024 (Backend: Circuit Breaker)
                    └── ARF-027 (FE: UI de indisponibilidad)

ARF-015 + ARF-019 + ARF-023 ──► ARF-026 (FE: Ficha técnica de película)
ARF-024 + ARF-026 ────────────► ARF-027 (FE: estados de error)
```

---

## 📋 Resumen de tickets — US-3

| ID | Tipo | Descripción | Horas |
|----|------|-------------|-------|
| ARF-020 | BD | Seed catálogo The Cinema | 1.5h |
| ARF-021 | BD | Índice búsqueda en HITO | 0.5h |
| ARF-022 | Backend | GET /obras búsqueda por Hito | 2h |
| ARF-023 | Backend | GET /obras/:id/play-url con afiliación | 2h |
| ARF-024 | Backend | Circuit Breaker para plataformas externas | 2.5h |
| ARF-025 | Frontend | Página The Cinema + buscador por Hito | 2.5h |
| ARF-026 | Frontend | Ficha técnica de película (detalle) | 2.5h |
| ARF-027 | Frontend | UI de indisponibilidad y errores | 1.5h |
| **Total US-3** | | | **15h** |

---

## 📊 Acumulado total del proyecto

| User Story | Persona | Tickets | Horas |
|-----------|---------|---------|-------|
| US-1 | Curioso Cultural | ARF-001 → ARF-011 (11 tickets) | 22h |
| US-2 | Melómano | ARF-012 → ARF-019 (8 tickets) | 14.5h |
| US-3 | Cinéfilo | ARF-020 → ARF-027 (8 tickets) | 15h |
| **Total** | | **27 tickets** | **51.5h** |
