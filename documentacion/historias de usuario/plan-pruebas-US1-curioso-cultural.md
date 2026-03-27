# Plan de Pruebas — US-1: El Curioso Cultural

**User Story**: US-1 — Descubrimiento por Tiempo y Mood + Watchlist
**Generado**: 2026-03-11
**Tickets cubiertos**: ARF-001 a ARF-011

---

## 🧪 Pruebas Unitarias — Backend (Jest / NestJS)

| ID | Módulo / Servicio | Caso de prueba | Resultado esperado |
|----|------------------|----------------|--------------------|
| UT-BE-001 | `CuratedService` | `getObras({ duracion_max: 15 })` | Retorna solo obras con `duracion_min <= 15` |
| UT-BE-002 | `CuratedService` | `getObras({ mood: 'Melancolico' })` | Retorna solo obras con `vibe_mood = 'Melancolico'` |
| UT-BE-003 | `CuratedService` | `getObras({ duracion_max: 10, mood: 'Alegre' })` | Aplica ambos filtros con AND lógico |
| UT-BE-004 | `CuratedService` | `getObras({})` sin filtros | Retorna todo el catálogo ordenado (Abierto primero) |
| UT-BE-005 | `CuratedService` | `getObras({ duracion_max: 1 })` sin resultados | Retorna array vacío `[]` sin error |
| UT-BE-006 | `WatchlistService` | `addToWatchlist(userId, obraId)` | Inserta en `LISTA_DESEOS` y retorna la obra |
| UT-BE-007 | `WatchlistService` | `addToWatchlist` obra duplicada | No duplica el registro (upsert) |
| UT-BE-008 | `WatchlistService` | `getWatchlist(userId)` | Retorna array de obras del usuario |
| UT-BE-009 | `AuthService` | `register({ email, password })` | Crea usuario con hash bcrypt, retorna JWT |
| UT-BE-010 | `AuthService` | `login({ email, wrongPassword })` | Lanza 401, no revela si el email existe |
| UT-BE-011 | `AuthService` | `register` con email duplicado | Lanza 409 Conflict |

---

## 🧪 Pruebas Unitarias — Frontend (React Testing Library)

| ID | Componente / Hook | Caso de prueba | Resultado esperado |
|----|------------------|----------------|--------------------|
| UT-FE-001 | `DialDeTiempo` | Render inicial | Muestra slider con valores 5, 10, 15, 30, 45, 60, 90, 120+ |
| UT-FE-002 | `DialDeTiempo` | Mover slider a 15 | `onChange` se llama con valor 15 |
| UT-FE-003 | `DialDeTiempo` | Render del valor | Muestra "15 min" para 15, "2 horas" para 120 |
| UT-FE-004 | `MoodSelector` | Seleccionar un mood | Chip activo resaltado, `onChange` llamado |
| UT-FE-005 | `MoodSelector` | Segundo clic en mood activo | Deselecciona el mood, `onChange` llamado con `null` |
| UT-FE-006 | `ObraCard` | Render con `estado_acceso = Abierto` | Muestra ícono 🟢 con tooltip "Gratuito" |
| UT-FE-007 | `ObraCard` | Render con status Suscripción | Muestra ícono 🟡 con tooltip "Requiere suscripción" |
| UT-FE-008 | `ObraCard` | Click en "Guardar" autenticado | Llama a `addToWatchlist(id_obra)` |
| UT-FE-009 | `ObraCard` | Click en "Guardar" sin auth | Muestra modal de login, NO llama a la API |
| UT-FE-010 | `useWatchlist` | `addToWatchlist` exitoso | Actualiza estado local optimistically, ícono cambia |
| UT-FE-011 | `useWatchlist` | `addToWatchlist` con error 500 | Revierte estado local, muestra toast de error |
| UT-FE-012 | Página `/` | Botón "Sorpréndeme" | Selecciona una obra aleatoria del array de resultados |
| UT-FE-013 | Página `/` | Estado vacío | Muestra `EmptyState` cuando `obras = []` |
| UT-FE-014 | Página `/` | Estado de carga | Muestra `SkeletonCard` mientras fetch está en curso |

---

## 🔗 Pruebas de Integración

| ID | Endpoint / Flujo | Caso de prueba | Resultado esperado |
|----|-----------------|----------------|--------------------|
| IT-001 | `GET /obras?duracion_max=15&mood=Melancolico` | Request real a BD de test | HTTP 200, array de obras con los campos correctos |
| IT-002 | `GET /obras` | Sin filtros | HTTP 200, todas las obras ordenadas Abierto > Suscripción > VOD |
| IT-003 | `GET /obras?duracion_max=1` | Sin coincidencias | HTTP 200, `[]` (no 404) |
| IT-004 | `POST /auth/register` | Email y password válidos | HTTP 201, body con `access_token` |
| IT-005 | `POST /auth/login` | Credenciales correctas | HTTP 200, body con `access_token` |
| IT-006 | `POST /auth/login` | Password incorrecto | HTTP 401, sin revelar si el email existe |
| IT-007 | `POST /watchlist` | Con JWT válido y `id_obra` | HTTP 201, obra en respuesta |
| IT-008 | `POST /watchlist` | Sin cabecera Authorization | HTTP 401 |
| IT-009 | `GET /watchlist` | Con JWT válido | HTTP 200, array de obras del usuario |
| IT-010 | Migración BD | Esquema de OBRA | Todas las columnas y FK presentes |
| IT-011 | Seed | Datos de prueba | Mínimo 10 obras de 3 ejes y 3 tipos de acceso |

---

## 🎭 Pruebas E2E (Playwright / Cypress)

| ID | Flujo de usuario | Pasos | Resultado esperado |
|----|-----------------|-------|--------------------|
| E2E-001 | Descubrimiento completo | 1. Abrir `/` → 2. Mover Dial a 20min → 3. Seleccionar mood "Inspirador" → 4. Ver resultados | Galería muestra obras filtradas con indicadores de acceso correctos |
| E2E-002 | Botón Sorpréndeme | 1. Abrir `/` con filtros → 2. Hacer clic en "Sorpréndeme" | Una obra aleatoria queda destacada |
| E2E-003 | Registro y Watchlist | 1. Abrir `/` → 2. Clic "Guardar" → 3. Aparecer modal login → 4. Registrarse → 5. Clic "Guardar" → 6. Ver Watchlist | Obra en Watchlist del usuario recién creado |
| E2E-004 | Login y Watchlist persistida | 1. Login → 2. Guardar obra → 3. Recargar página → 4. Ver Watchlist | La obra persiste tras recarga |
| E2E-005 | Filtros en URL | 1. Aplicar filtros → 2. Copiar URL → 3. Abrir URL en nueva pestaña | Los mismos filtros y resultados se muestran |

---

## 🚨 Casos límite y manejo de errores

| Situación | Comportamiento esperado |
|-----------|------------------------|
| JWT expirado al guardar en Watchlist | Toast "sesión expirada", redirige a login |
| Catálogo vacío (0 obras en BD) | Página principal en estado vacío, sin errores de JS |
| `duracion_max` con valor no numérico en URL | Backend retorna 400 Bad Request; frontend ignora el param |
| Click simultáneo en "Guardar" (doble clic rápido) | Solo se ejecuta una llamada API (debounce o flag de carga) |
| Pérdida de conexión durante "Guardar" | Toast de error, ícono revierte, sin datos corruptos |

---

## 📐 Herramientas

| Tipo | Herramienta |
|------|-------------|
| Unitarias Backend | Jest + NestJS Testing Module |
| Unitarias Frontend | React Testing Library + Jest |
| Integración | Supertest (sobre servidor NestJS) + BD de test Docker |
| E2E | Playwright (recomendado) o Cypress |
| Datos de test | Factory functions con faker.js en `test/factories/` |
