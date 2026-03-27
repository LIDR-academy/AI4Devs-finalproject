# Work Tickets — US-1: El Curioso Cultural
**Prioridad**: ⭐ Must-Have (P1)
**Generado**: 2026-03-09
**Total tickets**: 11 | **Esfuerzo total**: 22h

## User Story de referencia

> Como **Curioso Cultural**, quiero filtrar contenido por duración y estado de ánimo para descubrir cortos, conciertos o películas de calidad que se ajusten al tiempo libre que tengo en este momento.

---

## 🗃️ Base de Datos

### ARF-001 — Migración: tabla OBRA con soporte a filtros Dial de Tiempo y Mood

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de Datos |
| **Estimación** | 2h |
| **Dependencias** | Ninguna |

**Descripción**: Crear la migración de PostgreSQL para la entidad `OBRA` con todos los campos necesarios para el MVP, incluyendo los campos de filtrado `duracion_min` y `vibe_mood`.

**Criterios de Aceptación**:
- [ ] Tabla `OBRA` creada con: `id_obra`, `titulo`, `director_artista`, `region`, `duracion_min`, `vibe_mood`, `valor_cultural` (VARCHAR 280), `id_eje_vertical` (FK), `id_estado_acceso` (FK), `id_plataforma_origen` (FK)
- [ ] Índices en `duracion_min` y `vibe_mood` para optimizar los filtros
- [ ] La migración es reversible (up/down)

**Tareas Técnicas**:
1. Crear tablas auxiliares: `EJE_VERTICAL`, `ESTADO_ACCESO`, `PLATAFORMA_ORIGEN` (con campo `permite_iframe BOOLEAN`)
2. Crear tabla `OBRA` con claves foráneas a las anteriores
3. Crear tabla `LISTA_DESEOS` (`id_usuario` FK, `id_obra` FK, clave única compuesta)
4. Aplicar migración en entorno de desarrollo y verificar esquema

---

### ARF-002 — Seed: datos de prueba para el catálogo MVP

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de Datos |
| **Estimación** | 1h |
| **Dependencias** | ARF-001 |

**Descripción**: Poblar la base de datos con datos de prueba representativos (mínimo 10 obras) que cubran los tres ejes verticales y los tres tipos de acceso.

**Criterios de Aceptación**:
- [ ] Al menos 4 obras con `duracion_min ≤ 15` y distintos `vibe_mood`
- [ ] Obras en los tres ejes: Short List, Stage, Cinema
- [ ] Obras con los tres estados de acceso: Abierto, Suscripción, VOD
- [ ] Al menos 2 plataformas origen con `permite_iframe = true` y 2 con `false`

---

## ⚙️ Backend

### ARF-003 — Endpoint GET /obras con filtros duracion_max y mood

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 3h |
| **Dependencias** | ARF-001 |

**Descripción**: Implementar en el Servicio de Curaduría (NestJS) el endpoint de búsqueda filtrada que es el corazón del Dial de Tiempo.

**Criterios de Aceptación**:
- [ ] `GET /obras?duracion_max=15&mood=Melancolico` retorna obras filtradas con status 200
- [ ] El resultado incluye: título, director, duración, vibe_mood, estado_acceso (tipo + codigo_color), plataforma_origen, lista de hitos
- [ ] Si no hay resultados, retorna array vacío `[]` con status 200 (nunca 404)
- [ ] Parámetros son opcionales; sin filtros devuelve todo el catálogo
- [ ] Contenido gratuito (`ESTADO_ACCESO = Abierto`) aparece primero en los resultados

**Tareas Técnicas**:
1. Crear `CuratedModule` con su servicio y controlador en `backend/src/modules/curated/`
2. Implementar query en TypeORM/Prisma con filtros opcionales y ORDER BY estado_acceso
3. Crear DTO de respuesta `ObraResponseDto` con todos los campos necesarios
4. Agregar validación de parámetros con `class-validator`

---

### ARF-004 — Endpoint POST /watchlist (autenticado)

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 2h |
| **Dependencias** | ARF-001, ARF-005 |

**Descripción**: Implementar en el Servicio de Usuario el endpoint para guardar una obra en la Watchlist, protegido por JWT.

**Criterios de Aceptación**:
- [ ] `POST /watchlist { id_obra: 42 }` con Bearer Token válido retorna 201 Created
- [ ] `POST /watchlist` sin token retorna 401 Unauthorized
- [ ] Intentar guardar una obra ya guardada retorna 200 (idempotente, no duplica)
- [ ] `GET /watchlist` con Bearer Token retorna la lista de obras guardadas por el usuario

**Tareas Técnicas**:
1. Crear `UserModule` con `WatchlistService` y controlador en `backend/src/modules/user/`
2. Aplicar Guard JWT (`@UseGuards(JwtAuthGuard)`) en ambos endpoints
3. Implementar lógica de upsert en `LISTA_DESEOS` (INSERT OR IGNORE)
4. Crear respuesta tipada con los datos de la obra guardada

---

### ARF-005 — Endpoint POST /auth/register y POST /auth/login

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 3h |
| **Dependencias** | ARF-001 |

**Descripción**: Implementar autenticación básica con JWT para habilitar la Watchlist personal.

**Criterios de Aceptación**:
- [ ] `POST /auth/register { email, password }` crea usuario y retorna JWT (expiración 7d)
- [ ] `POST /auth/login { email, password }` retorna JWT si las credenciales son correctas
- [ ] Password almacenado con bcrypt (nunca en texto plano)
- [ ] Email duplicado en registro retorna 409 Conflict con mensaje claro
- [ ] Credenciales incorrectas retornan 401 con mensaje genérico (sin revelar si el email existe)

**Tareas Técnicas**:
1. Crear `AuthModule` con `AuthService`, `JwtStrategy` y controlador en `backend/src/modules/auth/`
2. Configurar `JwtModule` con secret desde variables de entorno (nunca hardcodeado)
3. Crear tabla `USUARIO` (migración): `id_usuario`, `email` UNIQUE, `password_hash`
4. Implementar guards y decoradores reutilizables para proteger rutas

---

## 🎨 Frontend

### ARF-006 — Componente DialDeTiempo (slider de filtrado)

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 2h |
| **Dependencias** | Ninguna (puede desarrollarse en paralelo) |

**Descripción**: Crear el componente interactivo del Dial de Tiempo que permite seleccionar la duración máxima de contenido que el usuario quiere ver.

**Criterios de Aceptación**:
- [ ] El slider muestra minutos: 5, 10, 15, 30, 45, 60, 90, 120+
- [ ] Al mover el dial, el hook de búsqueda se actualiza (debounce de 300ms)
- [ ] El valor actual se muestra de forma legible ("15 min", "2 horas")
- [ ] El componente es accesible (ARIA labels)
- [ ] El estado seleccionado se refleja en la URL como query param `?duracion_max=15`

**Tareas Técnicas**:
1. Crear `components/DialDeTiempo/DialDeTiempo.tsx` con props `value` y `onChange`
2. Implementar manejo de estado con `useSearchParams` de Next.js para sincronizar URL
3. Crear `hooks/useObrasFiltradas.ts` que consume `GET /obras` con los filtros activos
4. Escribir test unitario con React Testing Library para la mecánica del dial

---

### ARF-007 — Componente MoodSelector (selector de estado de ánimo)

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 1.5h |
| **Dependencias** | Ninguna (paralelo con ARF-006) |

**Descripción**: Crear el selector de Mood que complementa el Dial de Tiempo en el filtrado de contenido.

**Criterios de Aceptación**:
- [ ] Muestra los moods disponibles como chips/tags seleccionables (ej: Melancólico, Inspirador, Enérgico, Contemplativo, Alegre)
- [ ] Solo se puede seleccionar 1 mood a la vez; un segundo clic deselecciona
- [ ] El mood seleccionado se refleja en la URL como query param `?mood=Melancolico`
- [ ] Integrado con `useObrasFiltradas` del ARF-006

**Tareas Técnicas**:
1. Crear `components/MoodSelector/MoodSelector.tsx`
2. Definir lista de moods como constante en `utils/moods.ts`
3. Sincronizar con URL params (reutilizar lógica de ARF-006)

---

### ARF-008 — Componente ObraCard (tarjeta de resultado)

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 2h |
| **Dependencias** | Ninguna (paralelo) |

**Descripción**: Crear la tarjeta visual que muestra cada obra en los resultados de búsqueda, con toda la información requerida y el indicador de acceso.

**Criterios de Aceptación**:
- [ ] Muestra: título, director/artista, duración, logo de plataforma origen, indicador de acceso (🟢🟡🔵 con tooltip)
- [ ] Si la obra tiene Hitos, muestra el primero como "sello de calidad" (ej. "🏆 Ganador Cannes")
- [ ] Botón "Guardar en mi lista" visible; si el usuario no ha iniciado sesión, redirige al login al hacer clic
- [ ] Hover animado y diseño premium acorde al tono cultural de la plataforma

**Tareas Técnicas**:
1. Crear `components/ObraCard/ObraCard.tsx` con las props tipadas desde `ObraResponseDto`
2. Crear mapa de colores/iconos para `ESTADO_ACCESO` en `utils/accessStatus.ts`
3. Crear `components/AccesoIndicator/AccesoIndicator.tsx` (reutilizable)
4. Conectar botón "Guardar" con el hook `useWatchlist` (ARF-009)

---

### ARF-009 — Hook useWatchlist + integración de Watchlist

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 2h |
| **Dependencias** | ARF-004, ARF-008 |

**Descripción**: Implementar la lógica cliente para guardar/eliminar obras de la Watchlist, incluyendo feedback visual inmediato.

**Criterios de Aceptación**:
- [ ] Al hacer clic en "Guardar", el ícono cambia a "Guardado" inmediatamente (optimistic update)
- [ ] Si el POST /watchlist falla, el ícono revierte al estado original y muestra error toast
- [ ] Si el usuario no está autenticado, se muestra modal de login en lugar de llamar a la API
- [ ] La Watchlist del usuario se carga al iniciar sesión y persiste en el estado de la app

**Tareas Técnicas**:
1. Crear `hooks/useWatchlist.ts` con métodos `addToWatchlist(id_obra)` y `getWatchlist()`
2. Crear `services/watchlistService.ts` para encapsular las llamadas HTTP con el Bearer Token
3. Implementar contexto de autenticación `AuthContext` si no existe
4. Agregar toast de confirmación/error usando librería ligera (ej. `react-hot-toast`)

---

### ARF-010 — Página principal con resultados y botón "Sorpréndeme"

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 2.5h |
| **Dependencias** | ARF-006, ARF-007, ARF-008 |

**Descripción**: Ensamblar la página principal de descubrimiento integrando el Dial de Tiempo, el MoodSelector y la galería de ObraCards.

**Criterios de Aceptación**:
- [ ] La página muestra el Dial de Tiempo y MoodSelector en la parte superior
- [ ] Los resultados se actualizan automáticamente al cambiar filtros (sin botón "Buscar")
- [ ] El botón "Sorpréndeme" muestra una obra aleatoria del conjunto de resultados filtrados
- [ ] Estado de carga (skeleton cards) mientras se espera la respuesta de la API
- [ ] Estado vacío con mensaje y CTA para ampliar filtros

**Tareas Técnicas**:
1. Crear/actualizar `pages/index.tsx` (Next.js) ensamblando todos los componentes
2. Implementar lógica de random en el cliente sobre los resultados ya cargados
3. Crear `components/SkeletonCard/SkeletonCard.tsx` para el estado de carga
4. Crear `components/EmptyState/EmptyState.tsx` para resultados vacíos

---

## 🔒 Seguridad

### ARF-011 — Variables de entorno y configuración segura

| Campo | Valor |
|-------|-------|
| **Tipo** | Seguridad |
| **Estimación** | 1h |
| **Dependencias** | Ninguna |

**Descripción**: Configurar el sistema de variables de entorno para que ninguna credencial quede en el código.

**Criterios de Aceptación**:
- [ ] Archivos `.env.example` creados en `frontend/` y `backend/` con todas las variables documentadas (sin valores reales)
- [ ] `.env` y `.env.local` en `.gitignore`
- [ ] El `JWT_SECRET` y las llaves de API externas se leen exclusivamente desde variables de entorno
- [ ] La app falla con mensaje claro si una variable requerida no está definida al iniciar

**Tareas Técnicas**:
1. Crear `backend/.env.example`: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`
2. Crear `frontend/.env.example`: `NEXT_PUBLIC_API_URL`
3. Agregar validación de env vars en `backend/src/config/env.validation.ts`

---

## 📊 Orden de ejecución

```
ARF-011 (Seguridad — paralelo desde el inicio)
ARF-001 (BD: migración OBRA) ──► ARF-002 (BD: seed datos)
ARF-001 ──────────────────────► ARF-005 (Auth login/register)
ARF-001 ──────────────────────► ARF-003 (GET /obras)
ARF-001 + ARF-005 ────────────► ARF-004 (POST /watchlist)

ARF-006 (FE: DialDeTiempo — paralelo)
ARF-007 (FE: MoodSelector — paralelo)
ARF-008 (FE: ObraCard — paralelo)
ARF-006 + ARF-007 + ARF-008 ──► ARF-010 (FE: Página principal)
ARF-004 + ARF-008 ────────────► ARF-009 (FE: useWatchlist)
```

## 📋 Resumen

| ID | Tipo | Descripción | Horas |
|----|------|-------------|-------|
| ARF-001 | BD | Migración tabla OBRA | 2h |
| ARF-002 | BD | Seed datos de prueba | 1h |
| ARF-003 | Backend | GET /obras con filtros | 3h |
| ARF-004 | Backend | POST /watchlist autenticado | 2h |
| ARF-005 | Backend | Auth register/login JWT | 3h |
| ARF-006 | Frontend | Componente DialDeTiempo | 2h |
| ARF-007 | Frontend | Componente MoodSelector | 1.5h |
| ARF-008 | Frontend | Componente ObraCard | 2h |
| ARF-009 | Frontend | Hook useWatchlist | 2h |
| ARF-010 | Frontend | Página principal | 2.5h |
| ARF-011 | Seguridad | Variables de entorno | 1h |
| **Total** | | | **22h** |
