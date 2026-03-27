# Plan de Pruebas — US-3: El Cinéfilo

**User Story**: US-3 — Búsqueda por Festival/Hito + Acceso Transparente
**Generado**: 2026-03-11
**Tickets cubiertos**: ARF-020 a ARF-027

---

## 🧪 Pruebas Unitarias — Backend (Jest / NestJS)

| ID | Módulo / Servicio | Caso de prueba | Resultado esperado |
|----|------------------|----------------|--------------------|
| UT-BE-019 | `CuratedService` | `getObras({ hito: 'Oscar' })` | Retorna obras con Hito que contenga "Oscar" (ILIKE) |
| UT-BE-020 | `CuratedService` | `getObras({ hito: 'oscar' })` minúsculas | Mismos resultados que con "Oscar" (insensible a mayúsculas) |
| UT-BE-021 | `CuratedService` | `getObras({ eje_vertical: 'Cinema', hito: 'Cannes' })` | Combina filtros con AND lógico |
| UT-BE-022 | `CuratedService` | `getObras({ hito: 'FestivalInexistente' })` | Retorna `[]` sin error |
| UT-BE-023 | `CuratedService` | `getPlayUrl(id)` — variables de entorno de afiliados | URL incluye `?ref=arteflujo&aff=` + valor del env |
| UT-BE-024 | `CuratedService` | `getPlayUrl(id)` — env variable no definida | Lanza error de configuración con mensaje claro |
| UT-BE-025 | `AggregatorService` | Circuit Breaker: 3 fallos consecutivos | Estado cambia a "abierto", lanza 503 en siguientes intentos |
| UT-BE-026 | `AggregatorService` | Circuit Breaker: estado half-open tras 30 min | Intenta la siguiente llamada y vuelve a "cerrado" si tiene éxito |
| UT-BE-027 | `AggregatorService` | `getObras` con plataforma en estado "abierto" | La obra incluye `disponible: false` en la respuesta |

---

## 🧪 Pruebas Unitarias — Frontend (React Testing Library)

| ID | Componente / Hook | Caso de prueba | Resultado esperado |
|----|------------------|----------------|--------------------|
| UT-FE-030 | `HitoBuscador` | Escribir "Oscar" → debounce 400ms | `onChange` llamado una sola vez después de 400ms |
| UT-FE-031 | `HitoBuscador` | Escribir y borrar antes de 400ms | `onChange` NO llamado durante la escritura |
| UT-FE-032 | `SugerenciasHito` | Render | Muestra chips: "Oscar", "Cannes", "Berlinale", "Sundance" |
| UT-FE-033 | `SugerenciasHito` | Click en chip "Cannes" | Campo de búsqueda se rellena con "Cannes", `onChange` llamado |
| UT-FE-034 | `FichaTecnica` | Render con obra completa | Muestra título, director, región, duración, valor_cultural |
| UT-FE-035 | `FichaTecnica` | `valor_cultural` con 280 caracteres | Muestra el texto completo sin truncar |
| UT-FE-036 | `BotonAcceso` | `permite_iframe = true` y `disponible = true` | Muestra botón "Reproducir" activo |
| UT-FE-037 | `BotonAcceso` | `permite_iframe = false` y `disponible = true` | Muestra botón "Ver en [Plataforma]" activo |
| UT-FE-038 | `BotonAcceso` | `disponible = false` | Botón deshabilitado con texto "No disponible temporalmente" |
| UT-FE-039 | `IndisponibleBadge` | Render | Muestra badge con texto "No disponible" y estilo visual de advertencia |
| UT-FE-040 | `ObraCard` | `disponible = false` | Renderiza `IndisponibleBadge` sobre la imagen |
| UT-FE-041 | `ObraCard` | `disponible = true` | No renderiza `IndisponibleBadge` |

---

## 🔗 Pruebas de Integración

| ID | Endpoint / Flujo | Caso de prueba | Resultado esperado |
|----|-----------------|----------------|--------------------|
| IT-021 | `GET /obras?hito=Oscar` | Con datos de seed | HTTP 200, obras con Hitos de Oscar |
| IT-022 | `GET /obras?hito=oscar` | Búsqueda en minúsculas | HTTP 200, mismos resultados que "Oscar" |
| IT-023 | `GET /obras?eje_vertical=Cinema&hito=Cannes` | Filtros combinados | HTTP 200, solo obras de Cinema con Hito Cannes |
| IT-024 | `GET /obras?hito=FestivalNoExistente` | Sin coincidencias | HTTP 200, `[]` |
| IT-025 | `GET /obras/42/play-url` | Con env de afiliados configurado | HTTP 200, URL con `?ref=arteflujo&aff=` correcto |
| IT-026 | `GET /obras/42/play-url` | Circuit Breaker abierto para esa plataforma | HTTP 503, body `{ message: "Contenido no disponible temporalmente" }` |
| IT-027 | `GET /obras` | Plataforma en estado "abierto" | HTTP 200, obras afectadas tienen `disponible: false` |
| IT-028 | Índice HITO | Query de búsqueda con EXPLAIN | Usa el índice GIN, tiempo < 500ms |
| IT-029 | Seed Cinema | Datos cargados | 10+ obras de Cinema con Hitos de 3+ festivales distintos |
| IT-030 | Migración ARF-021 | Índice en `HITO.nombre_hito` | Índice presente en el esquema de la BD de test |

---

## 🎭 Pruebas E2E (Playwright / Cypress)

| ID | Flujo de usuario | Pasos | Resultado esperado |
|----|-----------------|-------|--------------------|
| E2E-012 | Búsqueda por festival | 1. Navegar a `/cinema` → 2. Escribir "Cannes" → 3. Esperar debounce | Galería muestra películas con Hito Cannes con indicadores 🟢🟡🔵 |
| E2E-013 | Chip de búsqueda | 1. Navegar a `/cinema` → 2. Click chip "Oscar" | Campo relleno, resultados de Oscar visibles |
| E2E-014 | Ficha técnica | 1. Click en película → 2. Ver página `/obra/[id]` | Ficha técnica completa con todos los Hitos |
| E2E-015 | Deep Linking con afiliación | 1. Click "Ver en MUBI" en ficha técnica | Nueva pestaña con URL de MUBI + params de afiliación |
| E2E-016 | Contenido no disponible | 1. Simular Circuit Breaker abierto → 2. Ver galería | Obras afectadas muestran badge "No disponible", botón deshabilitado |
| E2E-017 | SEO de ficha técnica | 1. Navegar a `/obra/[id]` → 2. Inspeccionar `<head>` | `<title>` y `<meta description>` con datos de la película |
| E2E-018 | Búsqueda en URL | 1. Aplicar búsqueda → 2. Copiar URL → 3. Nueva pestaña | Misma búsqueda y resultados reproducibles desde la URL |

---

## 🚨 Casos límite y manejo de errores

| Situación | Comportamiento esperado |
|-----------|------------------------|
| `GET /obras/:id/play-url` tarda más de 5s | Frontend muestra spinner; tras timeout, mensaje de error amigable |
| Variable de entorno `AFFILIATE_MUBI` no definida | Backend falla al iniciar con mensaje claro; no retorna URL sin afiliado |
| Búsqueda con caracteres especiales (`<script>`, `'OR'1=1`) | Backend retorna `[]`; ningún SQL Injection ni XSS en respuesta |
| Película con `valor_cultural = null` | Ficha técnica omite el campo sin errores de render |
| Circuit Breaker en half-open: prueba fallida | Vuelve al estado abierto, no expone error al usuario |
| Acceso a `/obra/[id]` con id inexistente | Página 404 amigable de Next.js, sin stacktrace |

---

## 📐 Herramientas

| Tipo | Herramienta |
|------|-------------|
| Unitarias Backend | Jest + NestJS Testing Module + `opossum` mock para Circuit Breaker |
| Unitarias Frontend | React Testing Library + Jest + `@testing-library/user-event` |
| Integración | Supertest + BD PostgreSQL Docker + Redis de test |
| E2E | Playwright (`page.waitForNavigation` para Deep Linking, `page.context().waitForEvent('page')` para nueva pestaña) |
| Pruebas de carga | K6: simular 100 usuarios buscando "Oscar" simultáneamente |
| Contratos API | Pact: verificar que la respuesta de GET /obras/:id/play-url mantiene el contrato |
