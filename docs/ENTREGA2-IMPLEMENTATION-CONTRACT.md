# AI Business Presence Builder
# Contrato de implementación de la Entrega 2

Estado: contrato ejecutable del MVP acordado

Este documento reconcilia la documentación de la Entrega 1 con las decisiones explícitas de la Entrega 2. Define el contrato utilizado por la implementación y las pruebas.

## 1. Precedencia y reconciliación

El contrato ejecutable tiene la siguiente prioridad:

1. Requisitos y decisiones explícitas del MVP de la Entrega 2
2. `docs/AI_BPB-PRD.md`
3. `docs/AI_BPD-PB.md`
4. `README.md`
5. `docs/prompts.md`

La propuesta de FastAPI/SQLAlchemy del PRD se considera una propuesta arquitectónica anterior. El backend ejecutable utiliza únicamente NestJS, TypeScript, PostgreSQL y Prisma; no se introduce una segunda tecnología backend.

La alternativa de activos `website_copy` / `directory_card` del PRD queda sustituida para la Entrega 2 por los cinco tipos exactos definidos en este contrato.

Las entidades ampliadas del PRD quedan aplazadas. La Entrega 2 utiliza el modelo compacto de seis entidades descrito a continuación. La publicación, las integraciones externas, la colaboración, las notificaciones, la analítica, la búsqueda, las colas, los workers y los servicios externos de evaluación quedan aplazados.

## 2. Arquitectura final

La aplicación es un monolito modular compuesto por dos aplicaciones locales:

- `backend/`: API REST de NestJS, TypeScript, Prisma Client y persistencia en PostgreSQL.
- `frontend/`: aplicación SPA de React + TypeScript + Vite.
- `backend/src/ai-generation/`: orquestación de IA a nivel de aplicación mediante la interfaz `LLMGateway`.
- `backend/prisma/`: esquema y migraciones de Prisma.
- `docker-compose.yml`: únicamente PostgreSQL local.

Módulos del backend:

- `auth`: registro, login, autenticación JWT y hash de contraseñas.
- `business`: propiedad y consulta de negocios.
- `discovery`: envío validado del proceso de incorporación y persistencia.
- `business-profile`: normalización determinista y revisión del perfil.
- `ai-generation`: construcción de contexto y prompts, gateway LLM, validación de resultados e historial de generaciones.
- `assets`: acción de generación, listado, visualización, edición y regeneración controlada.
- `prisma`: límite de acceso a la base de datos.

La implementación LLM predeterminada es una simulación síncrona y determinista. La capa de dominio/aplicación depende de la abstracción `LLMGateway`, no de un SDK de proveedor. La conexión con un proveedor real queda aplazada.

## 3. Modelo compacto de seis entidades

Solo se utilizan estas seis entidades persistidas:

### User

- `id`: clave primaria UUID.
- `email`: obligatorio, único y normalizado a minúsculas.
- `name`: cadena obligatoria.
- `passwordHash`: obligatorio; las contraseñas en texto plano nunca se persisten.
- `createdAt`, `updatedAt`.

Un usuario puede ser propietario de uno o varios negocios. La autenticación se vincula al usuario autenticado.

### Business

- `id`: clave primaria UUID.
- `userId`: clave foránea obligatoria hacia `User`.
- `name`: cadena obligatoria.
- `createdAt`, `updatedAt`.

El acceso al negocio siempre se comprueba contra el propietario autenticado.

### DiscoveryResponses

- `id`: clave primaria UUID.
- `businessId`: clave foránea obligatoria y única hacia `Business`.
- `responses`: documento JSON obligatorio que cumple el contrato del proceso de incorporación.
- `submittedAt`, `createdAt`, `updatedAt`.

El registro almacena el envío validado del descubrimiento. Solo se utiliza como entrada de la normalización y nunca se envía directamente al LLM.

### BusinessProfile

- `id`: clave primaria UUID.
- `businessId`: clave foránea obligatoria y única hacia `Business`.
- `businessName`, `category`, `services`, `products`, `targetAudience`, `tone`, `style`, `location`, `phone`, `website`, `gdprConsent`.
- `status`: `DRAFT`, `NORMALIZED` o `APPROVED`.
- `createdAt`, `updatedAt`.

`services`, `products` y los campos de contexto canónico utilizan JSON estructurado cuando se requiere una lista. Esto mantiene compacto el modelo de seis entidades sin añadir tablas hijas.

Flujo de estados:

```text
Wizard submission -> persist DiscoveryResponses and normalized BusinessProfile as NORMALIZED
NORMALIZED -> APPROVED (explicit owner review action)
APPROVED -> generation allowed
```

`DRAFT` permanece disponible en el enum para un perfil incompleto, pero el envío de la Entrega 2 es atómico: los datos inválidos se rechazan y un envío completo válido alcanza inmediatamente el estado `NORMALIZED`.

El propietario debe revisar el perfil canónico antes de generar activos. `BusinessProfile` es la única fuente de verdad suministrada a la generación de IA.

### Asset

- `id`: clave primaria UUID.
- `businessProfileId`: clave foránea obligatoria hacia `BusinessProfile`.
- `assetType`: exactamente uno de los cinco tipos del contrato.
- `title`: cadena obligatoria.
- `content`: texto obligatorio.
- `status`: `READY_FOR_REVIEW` o `EDITED`.
- `createdAt`, `updatedAt`.

Existe un activo actual por cada combinación de `BusinessProfile` y `assetType`; la generación actualiza o crea los cinco activos. El historial de IA permanece disponible mediante `AIGeneration`. Las tablas de variaciones quedan aplazadas en este modelo compacto.

### AIGeneration

Cada intento de generación crea un registro histórico por tipo de activo solicitado, incluidos los intentos fallidos por validación o por el proveedor.

- `id`: clave primaria UUID.
- `businessProfileId`: clave foránea obligatoria hacia `BusinessProfile`.
- `assetId`: clave foránea opcional hacia `Asset`, informada después de persistir correctamente.
- `requestedById`: clave foránea obligatoria hacia `User`, para trazabilidad.
- `assetType`: enum exacto de los cinco tipos.
- `promptSnapshot`: prompt renderizado.
- `contextSnapshot`: contexto canónico serializado de `BusinessProfile`.
- `responseSnapshot`: respuesta serializada del gateway o carga de error/validación.
- `status`: `SUCCEEDED` o `FAILED`.
- `promptVersion`, `contextVersion`, `modelUsed`, `temperature`, `tokensUsed`.
- `createdAt`, `completedAt`.

En los snapshots no se almacenan claves de API, secretos ni el payload original de discovery.

## 4. Contrato inferido del proceso de incorporación

Este es el contrato validado más pequeño que cubre los conceptos documentados: identidad del negocio, oferta, audiencia, voz de marca, contacto/ubicación y consentimiento. Se omiten `industry`, los componentes de dirección separados y el campo de intención libre porque duplican o amplían el mínimo documentado sin ser necesarios para el flujo de la Entrega 2.

El frontend, los DTOs, la persistencia, el normalizador y las pruebas utilizan estas claves exactas.

| Clave del paso | Campo | Tipo | Obligatorio | Validación | Finalidad |
| --- | --- | --- | --- | --- | --- |
| `business_identity` | `businessName` | string | sí | longitud recortada 2-120 | Nombre canónico del negocio |
| `business_identity` | `category` | string | sí | longitud recortada 2-80 | Categoría principal del negocio |
| `offer` | `services` | string[] | sí | 1-20 elementos; cada uno con longitud recortada 2-120 | Servicios o productos ofrecidos |
| `offer` | `products` | string[] | no | máximo 20 elementos; cada uno con longitud recortada 2-120 | Lista de productos cuando se diferencian de los servicios |
| `target_audience` | `targetAudience` | string | sí | longitud recortada 10-500 | Público objetivo |
| `brand_voice` | `tone` | string | sí | longitud recortada 2-80 | Tono de marca preferido |
| `brand_voice` | `style` | string | no | longitud recortada 2-160 | Estilo de comunicación |
| `contact_location` | `location` | string | sí | longitud recortada 2-160 | Ubicación principal del negocio |
| `contact_location` | `phone` | string | no | máximo 40 caracteres; caracteres válidos para teléfono | Información de contacto |
| `contact_location` | `website` | string | no | URL válida `http`/`https` | Sitio web existente, si lo hubiera |
| `consent` | `gdprConsent` | boolean literal `true` | sí | debe ser `true` | Permiso necesario para el procesamiento posterior mediante IA |

Un envío del proceso de incorporación se rechaza de forma atómica si falta un campo obligatorio o alguno es inválido. Para el MVP, la API acepta un envío completo; un nuevo envío actualiza el registro actual de discovery y reconstruye el perfil canónico normalizado.

## 5. Contrato de API

Todas las rutas tienen el prefijo `/api/v1` y devuelven JSON. Las rutas protegidas requieren un Bearer JWT del usuario autenticado.

### Autenticación

- `POST /api/v1/auth/register`: crea un usuario y devuelve un token de acceso y los datos públicos del usuario.
- `POST /api/v1/auth/login`: autentica las credenciales y devuelve un token de acceso y los datos públicos del usuario.
- `GET /api/v1/auth/me`: devuelve el usuario autenticado.

### Business y Discovery

- `POST /api/v1/business`: crea un negocio propiedad del usuario autenticado.
- `GET /api/v1/business`: lista los negocios del usuario autenticado.
- `POST /api/v1/discovery/submit`: valida y persiste el contrato del proceso de incorporación para un negocio propio, normaliza un `BusinessProfile` y devuelve el perfil en estado `NORMALIZED`.
- `GET /api/v1/business-profile`: devuelve el perfil canónico de un negocio propio. Cuando el usuario tiene varios negocios, se selecciona mediante el parámetro de consulta `businessId`.
- `POST /api/v1/business-profile/review`: valida la revisión del perfil y mueve `NORMALIZED` a `APPROVED`.

### Assets

- `POST /api/v1/assets/generate-digital-presence`: para un perfil aprobado y propio, genera de forma síncrona exactamente los cinco tipos de activos y persiste un `Asset` y un registro histórico `AIGeneration` por tipo.
- `GET /api/v1/assets`: lista los activos actuales de un negocio/perfil propio.
- `GET /api/v1/assets/:id`: visualiza un activo propio.
- `PATCH /api/v1/assets/:id`: edita el título/contenido del activo actual y lo marca como `EDITED`.
- `POST /api/v1/assets/:id/regenerate`: regenera un activo actual desde el perfil canónico aprobado y conserva el historial de intentos de generación.

La API no expone rutas de publicación, integraciones, colaboración, notificaciones, analítica, búsqueda ni colas durante la Entrega 2.

## 6. Tipos de activos

La acción de generación produce exactamente una vez cada uno de estos tipos:

- `BUSINESS_SUMMARY`
- `WEBSITE_CONTENT`
- `GOOGLE_BUSINESS_DESCRIPTION`
- `SOCIAL_MEDIA_BIO`
- `FAQ`

Los títulos y las instrucciones del prompt varían por tipo, pero la orquestación, la construcción del contexto, la invocación del gateway, la validación, los snapshots y la persistencia son compartidos.

## 7. El pipeline de generación de IA

Para cada uno de los cinco tipos:

```text
Approved BusinessProfile
  -> ContextBuilder
  -> PromptBuilder (promptVersion=v1)
  -> LLMGateway (deterministic local mock by default)
  -> output validation
  -> Asset persistence
  -> AIGeneration persistence with snapshots and metadata
```

`ContextBuilder` transforma únicamente los campos canónicos de `BusinessProfile` en un contexto estable. Nunca acepta ni lee `DiscoveryResponses`.

`PromptBuilder` genera una instrucción versionada y fundamentada que prohíbe afirmaciones no respaldadas e indica al modelo que omita los hechos que no estén disponibles. El mock gateway recibe el prompt renderizado y el contexto canónico a través de la API del gateway, y devuelve contenido estructurado de forma determinista.

La validación rechaza contenido vacío, estructuras FAQ malformadas y respuestas que no cumplan la forma requerida. Un intento fallido se persiste en `AIGeneration` con estado `FAILED` y no crea un `Asset` a partir de la respuesta inválida.

Los metadatos predeterminados son `contextVersion=v1`, `promptVersion=v1`, `modelUsed=mock-deterministic-v1` y una temperatura fija documentada en la configuración. Las credenciales de un modelo real son opcionales y nunca se envían al frontend ni se registran en logs.

## 8. Criterios de aceptación del MVP

- Se puede iniciar una instancia local de PostgreSQL con el archivo Docker Compose suministrado.
- La validación del esquema y las migraciones de Prisma funcionan sobre una base de datos limpia.
- Un usuario puede registrarse e iniciar sesión; las contraseñas se almacenan con hash y las rutas protegidas rechazan peticiones no autenticadas.
- Un usuario autenticado puede crear y recuperar un negocio propio.
- El frontend presenta las seis áreas del proceso de incorporación y aplica las validaciones documentadas.
- Un envío válido del proceso de incorporación persiste `DiscoveryResponses` y crea un `BusinessProfile` canónico normalizado.
- El perfil puede recuperarse y aprobarse explícitamente desde la pantalla de revisión.
- La generación se rechaza hasta que el perfil esté aprobado y el consentimiento sea verdadero.
- `Generate Digital Presence` crea exactamente cinco activos actuales con los cinco valores enum acordados.
- Cada tipo de activo produce un registro `AIGeneration` con prompt, contexto, respuesta, versiones, modelo, temperatura, tokens, estado y timestamps.
- Las respuestas originales de discovery no aparecen en la entrada del gateway LLM ni en los snapshots de generación.
- El panel de activos lista y muestra los cinco activos y permite su edición básica.
- Las pruebas automatizadas cubren la normalización, la orquestación de IA, la validación de resultados, los flujos API de business/discovery/generation y la regla de fuente única `BusinessProfile`.
- La verificación de tipos, el análisis estático y la compilación de backend y frontend terminan correctamente; el flujo documentado de ejecución local es reproducible.

## 9. Orden de implementación

1. Base y base de datos: scripts del workspace, shells de NestJS/Vite, esquema Prisma, configuración de migraciones, Docker Compose, plantilla de entorno y configuración común.
2. Autenticación: registro, login, hash de contraseñas, guard JWT y contexto del usuario autenticado.
3. Business y discovery: creación/listado de negocios, validación del DTO del proceso de incorporación, persistencia de discovery y comprobaciones de propiedad.
4. BusinessProfile: normalización determinista, consulta del perfil, transición de revisión/aprobación y bloqueo por consentimiento.
5. Generación de IA: constructor de contexto, constructor de prompts, abstracción del gateway, simulación determinista, validación de respuestas, snapshots y persistencia.
6. Gestión de assets: listado/visualización/edición y regeneración controlada de un activo con historial de generación.
7. Flujo E2E frontend: pantallas de auth, negocio, proceso de incorporación, revisión del perfil, acción de generación y revisión/edición de activos.
8. Pruebas y refuerzo: pruebas unitarias/API, manejo de errores, comprobaciones de seguridad, Verificación de tipos, análisis estático y compilación.
9. Documentación: actualizar únicamente la configuración local, las variables de entorno, los endpoints implementados y el estado real del MVP.

## 10. Trazabilidad de Entrega 1 a Entrega 2

La implementación de Entrega 2 se relaciona con el backlog y las historias históricas de la siguiente forma:

- `PB-01` / Historia 1 / `BE-101` y `FE-102`: implementados de forma adaptada al modelo compacto. Incluyen autenticación, creación de `Business`, proceso de incorporación validado, persistencia de `DiscoveryResponses`, normalización y revisión de `BusinessProfile`.
- `PB-02` / Historia 2: implementados la normalización determinista y la aprobación humana del perfil. Las entidades `AIRecommendation` y el modelo de recomendaciones descritos históricamente quedan sustituidos por el estado de `BusinessProfile` y el pipeline controlado del MVP.
- `PB-03` / Historia 3: implementados como generación síncrona de los cinco tipos exactos de `Asset`. `AssetPackage`, `GeneratedAsset`, `QualityCheck` y el procesamiento asíncrono pertenecen a la propuesta anterior y no forman parte del modelo ejecutable.
- `PB-04` / Historia 4: implementados la edición básica y la regeneración del asset actual, conservando `AIGeneration`. `AssetVariation`, el versionado de variaciones y los conflictos de edición quedan fuera del modelo compacto acordado.
- `PB-05` / Historia 5: aplazados la publicación y `PublicationTask`, de acuerdo con la decisión explícita de excluir publicaciones e integraciones externas de Entrega 2.
- `PB-06`, `PB-07`, `PB-08`, `PB-09`, `PB-10`, `PB-11`, `PB-12` y `PB-13`: aplazados o fuera de alcance según la prioridad documentada del backlog.

Los identificadores históricos se conservan para mantener la trazabilidad académica. Cuando una historia o ticket entra en conflicto con el contrato explícito de Entrega 2, prevalece el modelo compacto y el alcance definido en este documento.
