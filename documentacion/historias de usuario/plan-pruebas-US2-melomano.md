# Plan de Pruebas — US-2: El Melómano

**User Story**: US-2 — Exploración de Fragmentos Musicales + Reproducción
**Generado**: 2026-03-11
**Tickets cubiertos**: ARF-012 a ARF-019

---

## 🧪 Pruebas Unitarias — Backend (Jest / NestJS)

| ID | Módulo / Servicio | Caso de prueba | Resultado esperado |
|----|------------------|----------------|--------------------|
| UT-BE-012 | `CuratedService` | `getObras({ eje_vertical: 'Stage', tipo_contenido: 'fragmento', genero: 'Jazz' })` | Retorna solo fragmentos de Jazz del eje Stage |
| UT-BE-013 | `CuratedService` | `getObras({ eje_vertical: 'Stage' })` sin tipo ni género | Retorna todas las obras de Stage |
| UT-BE-014 | `CuratedService` | `getObras` — respuesta incluye `hitos[]` | El array de hitos está presente en cada obra de la respuesta |
| UT-BE-015 | `CuratedService` | `findOneWithDetails(id)` — obra con 3 Hitos | Retorna todos los Hitos y `permite_iframe` de la plataforma |
| UT-BE-016 | `CuratedService` | `findOneWithDetails(id)` — obra inexistente | Lanza NotFoundException (404) |
| UT-BE-017 | `CuratedService` | `getPlayUrl(id)` con permite_iframe = false | Retorna URL con parámetros de afiliación de la plataforma |
| UT-BE-018 | `CuratedService` | `getPlayUrl(id)` con permite_iframe = true | Retorna la embed URL correspondiente (YouTube/Vimeo) |

---

## 🧪 Pruebas Unitarias — Frontend (React Testing Library)

| ID | Componente / Hook | Caso de prueba | Resultado esperado |
|----|------------------|----------------|--------------------|
| UT-FE-015 | `TipoContenidoToggle` | Click en "Solo Fragmentos" | Toggle activo, `onChange` llamado con "fragmento" |
| UT-FE-016 | `TipoContenidoToggle` | Click en opción ya activa | Deselecciona, `onChange` con `null` |
| UT-FE-017 | `GeneroSelector` | Render con lista de géneros | Muestra chips: Jazz, Sinfónico, Ópera, Bolero, Rock, Pop |
| UT-FE-018 | `GeneroSelector` | Click en chip "Jazz" | Chip activo resaltado, `onChange` llamado con "Jazz" |
| UT-FE-019 | `ReproductorModal` | Render con URL de YouTube | Iframe con src correcto: `https://youtube.com/embed/{videoId}` |
| UT-FE-020 | `ReproductorModal` | Render con URL de Vimeo | Iframe con src correcto: `https://player.vimeo.com/video/{videoId}` |
| UT-FE-021 | `ReproductorModal` | Cerrar con ESC | `onClose` es llamado |
| UT-FE-022 | `ReproductorModal` | Cerrar con clic en overlay | `onClose` es llamado |
| UT-FE-023 | `ReproductorModal` | Error en carga del iframe | Muestra fallback con `DeepLinkButton` |
| UT-FE-024 | `DeepLinkButton` | Render con plataforma MUBI | Botón muestra "Ver en MUBI" + logo MUBI |
| UT-FE-025 | `DeepLinkButton` | Atributos de seguridad | El enlace tiene `target="_blank"` y `rel="noopener noreferrer"` |
| UT-FE-026 | `HitoBadge` | Obra con 1 Hito | Muestra "🏆 Ganador Grammy 2023" |
| UT-FE-027 | `HitoBadge` | Obra con 3 Hitos | Muestra el primero + "+2 más" |
| UT-FE-028 | `ObraCard` | Render con `permite_iframe = true` | Botón "Reproducir" visible |
| UT-FE-029 | `ObraCard` | Render con `permite_iframe = false` | Botón "Ver en [plataforma]" visible, no "Reproducir" |

---

## 🔗 Pruebas de Integración

| ID | Endpoint / Flujo | Caso de prueba | Resultado esperado |
|----|-----------------|----------------|--------------------|
| IT-012 | `GET /obras?eje_vertical=Stage&tipo_contenido=fragmento&genero=Jazz` | Request a BD de test | HTTP 200, obras filtradas con `hitos[]` presente |
| IT-013 | `GET /obras?eje_vertical=Stage` | Sin tipo ni género | HTTP 200, todas las obras de Stage |
| IT-014 | `GET /obras` — campo `hitos` | En cualquier respuesta | Cada obra incluye `hitos: string[]` (puede ser `[]`) |
| IT-015 | `GET /obras/42` | Obra existente con 3 Hitos | HTTP 200, `hitos[]` con 3 items, `permite_iframe` presente |
| IT-016 | `GET /obras/9999` | Obra inexistente | HTTP 404 con mensaje claro |
| IT-017 | `GET /obras/42/play-url` con `permite_iframe = false` | Request real | HTTP 200, URL con parámetros de afiliación del env |
| IT-018 | `GET /obras/42/play-url` con `permite_iframe = true` | Request real | HTTP 200, embed URL de la plataforma |
| IT-019 | Migración HITO | Tabla creada correctamente | `id_hito`, `id_obra` FK, `nombre_hito`, `anio_hito` presentes |
| IT-020 | Seed Stage | Datos de conciertos | 8+ obras de Stage con géneros y Hitos |

---

## 🎭 Pruebas E2E (Playwright / Cypress)

| ID | Flujo de usuario | Pasos | Resultado esperado |
|----|-----------------|-------|--------------------|
| E2E-006 | Filtrado en The Stage | 1. Navegar a `/stage` → 2. Click "Solo Fragmentos" → 3. Click chip "Jazz" | Galería muestra solo fragmentos de Jazz |
| E2E-007 | Smart Embedding | 1. Navegar a `/stage` → 2. Click en obra con `permite_iframe = true` → 3. Click "Reproducir" | Modal abierto con iframe del video cargando |
| E2E-008 | Cerrar modal reproductor | 1. Abrir modal → 2. Presionar ESC | Modal cerrado, galería visible nuevamente |
| E2E-009 | Deep Linking | 1. Click en obra con `permite_iframe = false` | Botón "Ver en [Plataforma]" visible; click abre nueva pestaña |
| E2E-010 | Hito en galería | 1. Navegar a `/stage` con datos de seed | Obras con Hitos muestran badge dorado |
| E2E-011 | Filtros en URL Stage | 1. Aplicar tipo + género → 2. Copiar URL → 3. Nueva pestaña | Mismos filtros y resultados |

---

## 🚨 Casos límite y manejo de errores

| Situación | Comportamiento esperado |
|-----------|------------------------|
| Género musical no existente en BD | Resultados vacíos con `[]`, sin error |
| URL de embed inválida en iframe | Error capturado, fallback con DeepLinkButton mostrado |
| Obra con `permite_iframe = true` pero sin `url_origen` en BD | `GET /obras/:id/play-url` retorna 422 Unprocessable Entity |
| Obra sin ningún Hito | Card renderizada sin badge de Hito (sin errores de render) |
| Obra con `anio_hito = null` | Hito mostrado sin año: "🏆 Versión histórica" |

---

## 📐 Herramientas

| Tipo | Herramienta |
|------|-------------|
| Unitarias Backend | Jest + NestJS Testing Module |
| Unitarias Frontend | React Testing Library + Jest + `@testing-library/user-event` |
| Integración | Supertest + BD PostgreSQL de test en Docker |
| E2E | Playwright (verificar apertura de nueva pestaña con `context.waitForEvent('page')`) |
| Mock de iframes | `jest.mock` de la URL de embed para evitar llamadas reales |
