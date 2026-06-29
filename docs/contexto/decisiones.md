# Decisiones tecnicas

## Versionado: de baseline+delta a git-like branches

**Decision:** Reemplazar el sistema de versionado "baseline + delta patch queue" por un modelo de "branches estilo git" (commit `877133d`, junio 2026).

**Por que:** El modelo baseline+delta resultaba insuficiente. Se necesitaba branching con nombres, herencia de archivos entre ramas, y merge con resolucion de conflictos.

**Descartado:** El sistema anterior (baseline + delta + toggle de version) que requeria hacer deep-copy manual de project_files y no soportaba branching real.

**Impacto:** Nuevo modelo `ProjectBranch` con campos `parent_branch_id`, `file_ids`, `diagram_ids`, `merged_into`. Indice unico MongoDB ampliado para soportar `branch_id`. Migracion automatica de proyectos existentes a rama "main".

## MongoDB como unica fuente de verdad

**Decision:** Usar MongoDB como base de datos primaria, sin SQL. Redis solo como cache L2 opcional.

**Por que:** Esquema flexible para datos BPMN (XML, JSON arbitrario). Motor async para no bloquear el event loop. Sin necesidad de migraciones de esquema rigidas.

**Descartado:** PostgreSQL u otra relacional — la naturaleza semi-estructurada de los diagramas BPMN y la flexibilidad de los archivos de proyecto lo hacian menos adecuado.

## Session tokens en vez de JWT

**Decision:** Usar tokens de sesion opacos (UUID v4) almacenados en MongoDB en vez de JWT.

**Por que:** Permite invalidacion inmediata de sesiones (borrar de BD), politica single-device (borra sesiones previas al hacer login), y no requiere manejo de refresh tokens. El frontend ya usa cookies + localStorage para el token.

**Descartado:** JWT con refresh tokens — mas complejo de invalidar y rotar. Con JWT, cerrar sesion en todos los dispositivos requiere blacklist.

**Riesgo:** Cada request requiere una consulta a MongoDB para validar la sesion (no stateless como JWT). Mitigado por el bajo trafico esperado.

## Google OAuth como auth primaria (sin password)

**Decision:** Solo Google OAuth 2.0 y SAML 2.0 enterprise. No existe login con email/password.

**Por que:** El producto esta orientado a empresas y profesionales que ya usan Google Workspace. SAML cubre el caso enterprise. Elimina la carga de gestionar passwords, resets, y seguridad de credenciales.

**Descartado:** Email/password tradicional — requiere bcrypt, reset flows, validacion de fortaleza, proteccion anti-brute-force. No justificado para el mercado objetivo.

**Excepcion:** `dev-login` solo para desarrollo/testing (usuario `test@bpmnmodeler.dev`).

## Sin ORM/ODM — consultas MongoDB directas

**Decision:** Escribir consultas MongoDB como diccionarios Python directamente, sin capa de abstraccion.

**Por que:** Maximo control sobre queries, proyecciones y aggregations. Evita la friccion de un ODM con esquemas flexibles. Menos dependencias.

**Descartado:** Beanie, MongoEngine u otros ODMs — anadirian complejidad sin beneficio claro dado que los modelos Pydantic ya proporcionan validacion en la capa API.

## Sin estado global en frontend — solo Context API

**Decision:** Usar React Context API para estado compartido (auth, i18n, upgrade modal). Sin Redux, Zustand, ni otras librerias de estado.

**Por que:** La app no tiene estado global complejo que requiera middlewares, devtools o selectores computados. Los datos se fetchean por pagina y se mantienen en estado local.

**Descartado:** Redux — demasiado boilerplate para el nivel de complejidad real. Zustand/Jotai — innecesario cuando Context API basta.

## fetch nativo sin wrapper HTTP

**Decision:** Usar `fetch` nativo del navegador para todas las llamadas API. No hay un cliente HTTP centralizado.

**Por que:** Simplicidad. No se necesita interceptores globales, transformacion de respuestas, o cancelacion automatica. Cada pagina define `authHeaders()` inline y maneja sus propios errores.

**Descartado:** Axios (aunque esta en dependencias, practicamente no se usa). Un wrapper centralizado — anadiria abstraccion sin eliminar la necesidad de manejar loading/error por pagina.

**Riesgo:** Duplicacion de codigo de headers y manejo de errores entre paginas. [PENDIENTE: evaluar si justifica crear un hook `useApi` compartido]

## Internationalizacion temprana con 6 idiomas

**Decision:** Internacionalizar toda la UI a 6 idiomas (es, en, fr, it, zh, ja) desde etapas tempranas. Sistema de overrides desde backend.

**Por que:** Mercado objetivo internacional (Europa + Asia). El backend permite a admins sobreescribir traducciones sin redeploy.

**Descartado:** i18n solo en frontend con archivos estaticos — no permite ajustes en caliente por admins.

## Migracion de MiniMax de OpenAI-compatible a Anthropic-compatible

**Decision:** Cambiar la API de MiniMax desde el formato OpenAI (`/v1/chat/completions`) al formato Anthropic (`/v1/messages`). Actualizar de modelo M2.7 a M3.

**Por que:** MiniMax depreco su endpoint OpenAI-compatible. El nuevo endpoint Anthropic-compatible ofrecia mejor calidad con el modelo M3.

**Impacto:** ~7 commits de migracion. Cambios en formato de request (system prompt, roles de mensaje, estructura de respuesta).

## Ramas sin feature branches — todo en dev

**Decision:** Todo el desarrollo ocurre en la rama `dev`. No se usan feature branches con nombre.

**Por que:** Equipo pequeno (2-3 personas), despliegue continuo al servidor desde `dev`. `update.sh` en el servidor siempre actualiza desde `dev`.

**Riesgo:** Sin isolation entre features en desarrollo. Si algo se rompe en `dev`, afecta a todos. Mitigado por el agente IA que genera y commitea incrementalmente.

## Migraciones de BD en startup (no versionadas)

**Decision:** Ejecutar migraciones de MongoDB en `@app.on_event("startup")` de FastAPI. Son idempotentes (verifican existencia antes de modificar). No hay sistema de versionado de migraciones.

**Por que:** Simplicidad operacional. MongoDB tolera bien la adicion de campos y la creacion de indices sin migraciones complejas. Las migraciones son principalmente backfills de campos nuevos.

**Riesgo:** Sin control de orden ni rollback. Si una migracion falla, el servidor no arranca. [PENDIENTE: evaluar si justifica un sistema de migraciones versionadas]

## Diseno visual: brutalismo suizo migrando a moderno

**Decision:** El diseno original (`design_guidelines.json`) define estilo brutalista suizo (Swiss & High-Contrast, Archetype 4): `rounded-none`, bordes gruesos, sombras solidas, tipografia Chivo+Work Sans+IBM Plex Mono.

**Cambio en curso:** Segun team memory "Modern UI design direction" (2026-06-26), el diseno esta migrando a `rounded-lg`, glass effects, ghost buttons y overflow menus.

**Por que del cambio:** [PENDIENTE: documentar la razon — probablemente para una apariencia mas moderna/amigable]
