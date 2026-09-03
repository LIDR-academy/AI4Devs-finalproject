# 🔒 Reglas de Ciberseguridad y Sandboxing - Deducción de Especificaciones

Esta directiva rige la seguridad técnica, sanitización activa y ejecución segura en entornos aislados (Sandboxing).

---

## 🛠️ Pila Tecnológica Detectada
* **Cifrado de Credenciales:** Bcrypt (10 salt rounds)
* **Gestión de Sesión:** Tokens JWT (Bearer Token HTTP Header)
* **Sanitización Activa:** Zod Schema Validation
* **Ejecución en Entorno Aislado:** Sandboxed Execution (Docker / Restricciones de Sistema)
* **Defensa Anti-Prompt Injection:** Desinfección de inputs externos no confiables

---

## 🔑 1. Autenticación y Cifrado
* **PINs y Passwords:** Hashing obligatorio con `bcrypt`.
* **Tokens JWT:** Firma con secreta configurada en entorno, expiración máxima de 12 horas.

---

## 🛡️ 2. Protección de Datos y Sanitización
* **Sanitización Input:** Toda entrada debe ser validada con esquemas Zod. Prohibidas las SQL injection y raw queries inseguras.
* **Tokenización PII:** Toda información de identificación personal se someterá a de-identificación previa en logs y exportaciones.
* **Campos de Privilegio contra Conjunto Cerrado (C-SEC-2, AUDIT-SEC-001 F-2):** Todo campo de un payload externo que determine privilegio o autorización (`role`, `roleId`, `isAdmin`, `permissions`, `scopes`) DEBE validarse contra un conjunto cerrado en **alguna** capa antes de persistirse: o bien un `z.enum(...)` en el esquema de validación, o bien el catálogo persistido (`Role` en BD) — en cuyo caso el repositorio resuelve el nombre → id y **rechaza** con `EntityNotFoundException` los valores que no existen, en vez de persistir el string en crudo. `check_privilege_defaults.sh` **bloquea** los fallbacks de privilegio literales (`role || 'ADMIN'`) y **señala como informativo** todo campo de privilegio aún validado con `z.string()` libre — un recordatorio de verificar que la validación de conjunto cerrado existe en la capa de persistencia; no es un falso positivo a silenciar.

---

## 🔒 3. Gestión de Entornos y Secretos
* **Aislamiento `.env`:** Los archivos `.env` reales con secretos deben permanecer ignorados en `.gitignore`.
* **Plantillas `.env.example`:** Deben utilizar obligatoriamente la convención universal de placeholders `YOUR_..._HERE` (ej. `JWT_SECRET="YOUR_JWT_SECRET_KEY_HERE"`, `DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/YOUR_DB"`). Se prohíbe incrustar llaves o credenciales reales en las plantillas.
* **Prohibición de Fallback Secrets & Entropía Estricta (Guard 14 & SK-33):** Queda estrictamente prohibido incrustar cadenas clave por defecto en el código (ej. `env.JWT_SECRET || 'default_secret'`). Si falta una variable de entorno requerida en tiempo de ejecución, la aplicación DEBE fallar inmediatamente (Fail-Fast). En entornos de producción (`NODE_ENV=production`), `JWT_SECRET` debe exigir una entropía mínima de 32 caracteres (256 bits) y `CORS_ALLOWED_ORIGINS` prohíbe el uso del comodín `*`.

---

## 🛡️ 4. Control de Acceso y Protección de Endpoints
* **Middleware de Autenticación Obligatorio:** Todas las rutas HTTP que mutes estado, consulten datos del sistema o realicen operaciones de inventario/reportes DEBEN exigir un middleware de autenticación (ej. JWT Bearer token).
* **Protección Anti-Fuerza Bruta (Rate Limiting):** Todo endpoint de autenticación (login con PIN o contraseña) DEBE incluir un middleware de limitación de tasa de peticiones (*Rate Limiting*) para mitigar ataques de fuerza bruta.
* **Resolución de Rol/Permiso Fail-Safe — Mínimo Privilegio por Defecto (C-SEC-1, AUDIT-SEC-001 F-1b):** Un rol o permiso ausente, nulo o no resoluble SIEMPRE se resuelve al **mínimo privilegio** — denegar el acceso, o mapear a un rol centinela sin ninguna concesión (`UNASSIGNED`) —, **nunca al máximo**. Queda estrictamente prohibido cualquier fallback de privilegio literal del tipo `role || 'ADMIN'`, `role ?? 'ADMIN'`, `... : 'ADMIN'` en mappers, repositorios, middlewares o casos de uso. Verificado por `check_privilege_defaults.sh` (bloqueante, acotado al diff del ticket).
* **Declaración de Rol Explícita por Ruta — Default-Deny (C-SEC-3, AUDIT-SEC-001 F-3):** Cada ruta que muta estado o consulta datos sensibles DEBE declarar explícitamente sus roles/permisos permitidos **a nivel de ruta** (`requireRole(...)` / `authorizePermissions(...)`), no basta el `authMiddleware` heredado a nivel de *mount* del grupo de router. Una ruta de mutación que sólo está autenticada pero no declara rol es un defecto de auditoría (FASE 4 de `04_dev_audit_workflow.md`): el modelo debe ser "cada ruta declara a quién deja entrar", no "autenticado ⇒ permitido".

---

## 🧪 5. Sandboxing y Protección Anti-Prompt Injection
* **Sandboxed Command Execution:** Todas las ejecuciones de comandos en terminal local (tests, builds, migraciones) deben operar dentro del workspace del repositorio sin permisos de escritura fuera del proyecto.
* **Prevención de Injection Indirecta:** Los datos recuperados de fuentes externas no confiables (p. ej. issues, payloads de terceos, HTTP headers de clientes) no deben ser evaluados como código ejecutable ni introducidos directamente a los prompts del agente sin sanitización previa.

---

## 🔐 6. Modo Estricto de Rotación de Credenciales en Primer Login (Guard 36)
* **Rotación Obligatoria de PIN:** Todo usuario recién creado o sembrado en el arranque del sistema con un PIN provisional DEBE iniciar con la bandera `mustChangePin: true` activa en la base de datos.
* **Bloqueo de Interfaz UI (Strict UI Block Guard):** La interfaz táctil/web DEBE bloquear la visualización del tablero principal y denegar el acceso a operaciones de inventario mientras la bandera `mustChangePin` permanezca activa, forzando la rotación de PIN mediante `POST /api/v1/auth/change-pin`.

---

## ⏱️ 7. Control de Inactividad y Cierre Automático de Sesión (Guard 37)
* **Cierre por Inactividad Táctil:** El frontend rastrea eventos globales de interacción del operador (`touchstart`, `pointerdown`, `mousedown`, `keydown`, `scroll`). Tras 15 minutos continuos de inactividad (o el valor configurado en `SystemSettings.idleTimeoutMinutes`), la sesión del usuario se invalida automáticamente, cerrando la sesión y forzando el retorno al PIN Login.

---

## 🛡️ 8. Gobernanza de Documentación OpenAPI y Swagger UI en Producción

* **Restricción de Swagger UI por Entorno:** La interfaz gráfica interactiva de Swagger UI (`/docs` y `/api-docs`) está habilitada únicamente en entornos de desarrollo y staging (`NODE_ENV !== 'production'`). En producción, permanece deshabilitada por defecto para mitigar el riesgo de fuga de información y reconocimiento de arquitectura (*Information Disclosure*), salvo habilitación explícita mediante la variable `ENABLE_SWAGGER=true` o la opción `enableSwagger: true`.
* **Aislamiento de Content Security Policy (CSP):** El servidor Express aplica la política de seguridad estricta de `helmet()` en todas las rutas de la API (`/api/v1/*`). La relajación controlada de scripts y estilos (`'unsafe-inline'`) se aplica de manera aislada y exclusiva dentro del middleware montado en `/docs`, garantizando que la API global no debilite su armadura de seguridad.

---

## 🎫 9. Almacenamiento del Token de Sesión y Transporte (C-SEC-4, AUDIT-SEC-001 F-4)

* **Decisión documentada de almacenamiento:** el token de sesión de este proyecto es un **JWT Bearer en `localStorage`** (`restostock_jwt_token`). Trade-off aceptado: simplicidad de una SPA con backend stateless, a cambio de exposición a robo de token vía XSS (un script inyectado puede leer `localStorage`). Mitigación: `helmet()` + CSP estricta en la API, `expiresIn` acotado, y Guard 38 (sin `dangerouslySetInnerHTML` / render de HTML no saneado en el frontend).
* **Si se migra a cookie:** cualquier cambio a cookie de sesión OBLIGA a `Secure; HttpOnly; SameSite=Strict` y a protección CSRF explícita en las mutaciones.
* **Expiración:** `expiresIn` del JWT ≤ 12 h (ver §1). Un token de vida larga en `localStorage` amplía la ventana de un token robado; preferir el extremo bajo del rango y evaluar refresh tokens si el negocio lo permite.
* **Verificación de transporte activa, no presencial:** en la auditoría de seguridad no basta con confirmar que `helmet()` está montado — verificar que HSTS realmente se emite en las respuestas y que existe redirección HTTP→HTTPS en el edge (nginx / proxy) para el despliegue real.



