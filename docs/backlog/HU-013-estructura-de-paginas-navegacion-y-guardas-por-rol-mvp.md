# HU-013 — Estructura de páginas, navegación y guardas por rol (MVP)

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | Correcto y alineado con backlog: *Estructura de páginas, navegación y guardas por rol (MVP)*. |
| **Formato “Como… quiero… para…”** | Correcto; define valor transversal para público, colaborador y rol **ADMIN**. |
| **Estimación (S/M/L)** | **M** coherente para un alcance de estructura base (rutas, placeholders, navegación y seguridad de acceso) sin completar funcionalidad de todas las vistas. |
| **Prioridad** | **Alta** coherente con MVP, al habilitar recorridos end-to-end y reducir incertidumbre de integración frontend/auth. |
| **Inconsistencias detectadas** | No hay contradicción directa entre backlog y readme tras alinear la consulta pública como **listado + detalle con mapa integrado**; se usa el término `ADMIN` alineado con la definición de roles en Keycloak. |
| **Tamaño / división** | Historia amplia pero acotable: incluye estructura y guardas; no incluye implementación funcional completa de páginas pendientes (solo placeholders con título). Si creciera el alcance de UI, convendría dividir navegación base vs administración. |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-013 |
| **Épica** | Acceso e identidad |
| **Título** | Estructura de páginas, navegación y guardas por rol (MVP) |
| **Estimación de complejidad** | M |
| **Prioridad** | Alta |

**Historia de usuario**

Como usuario público, colaborador o usuario con rol **ADMIN**, quiero disponer de una estructura base de páginas con navegación operativa y control de acceso por rol, incluyendo pantallas pendientes como placeholders con solo título, para poder recorrer el MVP con seguridad y coherencia funcional aunque algunas vistas aún no estén desarrolladas.

- **Entregable de la historia:** Mapa de navegación del frontend implementado con rutas base del MVP, menú global mínimo y guardas de acceso por rol para áreas protegidas; páginas no implementadas completamente disponibles como placeholders con título y control de acceso correcto, permitiendo recorrido funcional por perfil sin bloquear el avance del MVP.

### Alcance

#### Incluye

- Implementación de estructura de rutas base alineada con el readme: inicio, consulta pública (listado y detalle con mapa integrado), suscripción, alta/edición para colaborador y secciones administrativas para rol **ADMIN**, pudiendo dejar vistas pendientes como placeholders.
- Implementación de navegación mínima global coherente con la decisión de producto (Inicio, Árboles y entradas adicionales según rol).
- Aplicación de guardas de autenticación/autorización para rutas protegidas (colaborador y administración), manteniendo acceso público a las rutas abiertas.
- Tratamiento explícito de estados de acceso denegado/no autenticado conforme a la estrategia actual de autenticación del frontend.
- Coherencia de visibilidad por rol en home y navegación, de forma que cada perfil vea acciones acordes a su ámbito.
- Criterio operativo de implementación: cualquier página sin `HU-xxx-ticket-breakdown.md` en estado **Hecho** se implementa en esta HU solo como placeholder (título + navegación básica), sin integración de lógica funcional ni llamadas reales a backend.

#### Queda fuera de esta historia

- Desarrollo funcional completo de todas las páginas nuevas: las vistas pendientes pueden quedarse en placeholder con título.
- Cualquier integración de backend en páginas placeholder, que deberá abordarse en la HU funcional correspondiente con su propio breakdown.
- Implementación detallada de lógica de negocio de cada HU funcional (alta avanzada, administración completa, notificaciones, IA, etc.).
- Cambios de contrato backend/OpenAPI o de modelo de datos.
- Refactor profundo de diseño visual fuera de lo mínimo necesario para integrar la navegación y los placeholders.

### Dependencias

- **HU-001** (autenticación OIDC/JWT): necesaria para aplicar guardas en rutas de colaborador/`ADMIN`.
- Definición de jerarquía y home ya documentada en `readme.md` §1.3 (páginas por perfil, decisión de menú y reglas de visibilidad).
- Disponibilidad de enrutado frontend (Vue Router) y estado de sesión expuesto al frontend.
- Alineación con backlog actual en consulta pública (**HU-002**, **HU-003**, **HU-004**), catálogo colaborador (**HU-005**, **HU-008**) y administración (**HU-011**, **HU-012**).

### Riesgos

- Desalineación entre rutas frontend y estado real de implementación de backend para páginas pendientes (riesgo de enlaces a placeholders por más tiempo del deseado).
- Desalineación de autorización si el frontend no aplica de forma consistente el rol `ADMIN` en navegación y guardas de acceso.
- Posible expansión de alcance si se intenta completar funcionalidad completa de páginas que deben quedar solo como placeholder en esta historia.
- Riesgo de inconsistencias de UX si no se homogeneizan mensajes de acceso/restricción entre vistas.

### Aclaraciones pendientes (refinamiento)

- Convención final de nombres de rutas públicas y protegidas (incluyendo detalle de `/ejemplares/:id/edit` y rutas administrativas).
- Definición exacta de copy para placeholders (mensaje estándar y CTA de retorno).
- Criterio final para visibilidad del menú por perfil cuando la sesión está en transición (carga/refresh silencioso).
- Confirmación de mapeo único de roles en frontend para mostrar `ADMIN` de forma consistente en navegación, guardas y copy funcional.
- En el breakdown de HU-013 deberá existir un ticket explícito de **control de alcance** para verificar que las pantallas pendientes se quedan en placeholder y no incorporan lógica de backend en esta fase.

## 3. Criterios de aceptación (BDD)

### Referencias

Backlog `HU-013`; `readme.md` §1.2 (consulta pública), §1.3 (jerarquía de páginas, home y menú), §2.1.1 (autenticación en front y rutas protegidas); backlog §6 (aterrizaje frontend MVP); épica Acceso e identidad.

### Escenario 1 — Navegación pública disponible sin autenticación

- **Dado que** accedo a la aplicación sin sesión iniciada  
- **Cuando** navego desde la home mediante el menú o CTAs públicos  
- **Entonces** puedo abrir las páginas públicas del MVP (inicio, consulta y suscripción) sin bloqueo por autenticación.

### Escenario 2 — Acceso protegido por rol en rutas privadas

- **Dado que** intento abrir una ruta de colaborador o administración sin sesión válida o sin rol suficiente  
- **Cuando** el router evalúa la guarda de acceso  
- **Entonces** se deniega el acceso a la ruta protegida y se aplica el flujo previsto de autenticación/error sin exponer contenido privado.

### Escenario 3 — Páginas pendientes disponibles como placeholder con seguridad aplicada

- **Dado que** existe una página del mapa de rutas MVP todavía no implementada funcionalmente  
- **Cuando** accedo a esa ruta con el perfil permitido  
- **Entonces** se muestra un placeholder con título y navegación operativa, manteniendo las mismas reglas de acceso por rol que la versión final.

## 4. Evaluación INVEST (resumen)

| Criterio | Comentario |
|----------|------------|
| **Independiente** | Parcialmente: depende de HU-001 para autenticación y de la existencia mínima de rutas objetivo, pero puede avanzar con placeholders sin bloquear HUs funcionales. |
| **Negociable** | Sí: nombres de rutas, copy de placeholders y granularidad del menú son ajustables en refinamiento sin cambiar el objetivo. |
| **Valiosa** | Sí: habilita recorrido completo del MVP por perfil y reduce fricción de validación funcional temprana. |
| **Estimable** | Sí: alcance técnico claro y acotado a routing, guardas, navegación y scaffolding de vistas. |
| **Small** | Aceptable para M si se respeta límite de placeholders; deja de ser pequeña si se intenta completar lógica funcional de cada página. |
| **Testable** | Sí: verificable con pruebas de navegación y control de acceso por perfil (público, colaborador, `ADMIN`). |

## 5. Esfuerzo estimado de implementación

Orden de magnitud **medio (M)** para frontend: definición de rutas, guardas por rol, menú mínimo por perfil, home adaptada por tipo de usuario y creación de placeholders para páginas pendientes. El esfuerzo aumenta si se amplía alcance a implementación funcional completa de las vistas actualmente planificadas como placeholders.
