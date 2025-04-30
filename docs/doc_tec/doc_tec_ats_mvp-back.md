# Documentación Técnica Backend - TalentIA ATS MVP (Fase 1)

Este documento proporciona una guía técnica de referencia para el desarrollo backend del componente ATS MVP en la Fase 1 del proyecto TalentIA. Detalla la arquitectura, las tecnologías, los patrones de diseño y las mejores prácticas a seguir, incluyendo la elección específica del ORM.

## 1. Arquitectura Backend del ATS MVP

El backend del ATS MVP se implementará siguiendo un patrón arquitectónico de **Monolito o Monolito Modular**. Esta elección prioriza la agilidad y la velocidad de desarrollo para el MVP, manteniendo una estructura organizada mediante la división en **módulos lógicos/capas**.

El backend es el responsable de:
* Exponer la API HTTP/REST consumida por el frontend del ATS MVP.
* Implementar la lógica de negocio central del sistema de seguimiento de candidatos.
* Interactuar con la base de datos principal del ATS MVP.
* Gestionar la autenticación y autorización de los usuarios internos.
* Interactuar con la Plataforma TalentIA Core AI a través de su API interna para invocar funcionalidades de IA y sincronizar datos clave.

## 2. Tecnologías Clave del Backend

Se han seleccionado las siguientes tecnologías para el desarrollo backend del ATS MVP:

* **Lenguaje y Framework:** Node.js con el framework Express.
* **Base de Datos:** PostgreSQL.
* **ORM (Mapeador Objeto-Relacional):** Se utilizará **Prisma**.
* **Autenticación:** JSON Web Tokens (JWT) para la gestión de sesiones stateless.
* **Hashing de Contraseñas:** Librería bcrypt.
* **Cliente HTTP:** Axios (para las llamadas salientes a la API de Core AI).
* **Herramienta de Build/Bundling (si aplica):** Vite (generalmente más enfocado al frontend, pero puede usarse para backend con configuraciones específicas o si se usa TypeScript).
* **Calidad de Código:** ESLint y Prettier.
* **Testing:** Jest o Vitest (unitarias/integración) y Supertest (pruebas de API).

## 3. Módulos Lógicos y Responsabilidades

El código del backend debe organizarse lógicamente en las siguientes capas o módulos, siguiendo un patrón por capas:

* **Capa de API / Controladores (`/api/controllers`, `/api/routes`):**
    * Recibe las peticiones HTTP entrantes.
    * Realiza validación de entrada básica (formato de datos, campos obligatorios).
    * Invoca la lógica de negocio correspondiente en la capa de Servicios.
    * Da formato a la respuesta HTTP y establece los códigos de estado apropiados.
    * Define las rutas de la API.
    * Integra el middleware de autenticación y autorización.
* **Middleware (`/api/middlewares`):**
    * Intercepta las peticiones antes de que lleguen a los controladores.
    * Maneja la autenticación (verificación de token JWT) y adjunta la información del usuario a la petición.
    * Maneja la autorización (verificación de permisos/roles del usuario para acceder a rutas/recursos).
* **Capa de Lógica de Negocio / Servicios (`/services`):**
    * Contiene la lógica de negocio principal de la aplicación.
    * Implementa los casos de uso y los requisitos funcionales.
    * Coordina operaciones que pueden involucrar múltiples repositorios o interacciones con servicios externos (Core AI).
    * Aplica las reglas de negocio y validaciones complejas.
    * No interactúa directamente con la base de datos; delega en la capa de Repositorios (utilizando el cliente Prisma a través de los repositorios).
* **Capa de Acceso a Datos / Repositorios (`/repositories`):**
    * Encapsula toda la lógica de interacción directa con la base de datos (PostgreSQL).
    * **Utiliza el cliente Prisma** para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre las entidades del dominio.
    * Traduce las operaciones del servicio a consultas de base de datos utilizando la API de Prisma Client.
    * Maneja transacciones de base de datos utilizando las capacidades de transacciones de Prisma.
* **Módulo de Integración con Core AI (`/services/integration`):**
    * Encapsula la lógica para comunicarse con la API de TalentIA Core AI.
    * Utiliza el cliente HTTP (Axios) para realizar las llamadas salientes a los endpoints de Core AI.
    * Maneja la autenticación específica para la comunicación ATS -> Core AI.
    * Traduce/adapta los datos si es necesario entre el formato interno del ATS y el formato de la API de Core AI.
    * Maneja errores específicos de la comunicación con Core AI (timeouts, errores de API).
    * Considerar la gestión de retries o el uso de un message broker si las operaciones con Core AI son asíncronas o propensas a fallos temporales.
* **Configuración de Base de Datos (`/database`):**
    * Contiene la configuración de conexión a la base de datos.
    * Incluye el esquema de Prisma (`schema.prisma`) que define el modelo de datos y las conexiones.
    * Gestiona las migraciones de base de datos utilizando las herramientas de migración de Prisma.

## 4. Patrones y Mejores Prácticas de Desarrollo Backend

### 4.1. Diseño de API con Express

* **RESTful:** Diseñar la API siguiendo los principios RESTful, utilizando los métodos HTTP (GET, POST, PUT, PATCH, DELETE) de forma adecuada para las operaciones sobre recursos (usuarios, vacantes, candidaturas, etc.).
* **Versionado:** Incluir versionado en la URL de la API (ej. `/api/v1/`).
* **Validación de Entrada:** Implementar validación robusta de los datos recibidos en las peticiones (tanto básica en el controlador como de negocio en el servicio) para prevenir datos inválidos o maliciosos. Utilizar librerías de validación.
* **Formato de Respuesta:** Utilizar JSON como formato estándar para las peticiones y respuestas, siguiendo convenciones consistentes (ej. camelCase para claves).
* **Códigos de Estado HTTP:** Utilizar los códigos de estado HTTP de forma semántica para indicar el resultado de la operación (200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error).
* **Documentación:** Mantener la especificación OpenAPI (TK-001) actualizada como la fuente única de verdad para el contrato de la API.

### 4.2. Implementación de Lógica de Negocio (Capa de Servicios)

* **Servicios Limpios y Enfocados:** Cada servicio debe tener una responsabilidad clara y bien definida (ej. `UserService`, `VacancyService`).
* **Lógica de Negocio en Servicios:** Toda la lógica de negocio compleja, validaciones, reglas de negocio y orquestación de operaciones debe residir en la capa de servicios. Los controladores solo deben recibir la petición, validar input básico y llamar al servicio apropiado.
* **Interacción con Repositorios:** Los servicios interactúan con la base de datos únicamente a través de la capa de Repositorios. No deben contener lógica SQL ni usar directamente el cliente Prisma; delegan en los repositorios.
* **Interacción con Servicios Externos:** Los servicios que necesitan comunicarse con Core AI deben hacerlo a través del Módulo de Integración/Cliente API Core AI, no realizando llamadas HTTP directamente.

### 4.3. Acceso a Datos con Prisma (Capa de Repositorios)

* **Encapsulamiento:** Los repositorios encapsulan la lógica específica de base de datos para una entidad o agregado (ej. `UserRepository`, `VacancyRepository`).
* **Uso del Cliente Prisma:** Instanciar el cliente Prisma y utilizar su API fluent para realizar consultas y mutaciones.
* **Esquema de Prisma (`schema.prisma`):** Mantener el esquema actualizado para reflejar con precisión el modelo de datos de la base de datos (db-overview.md). Utilizar las características del esquema de Prisma para definir modelos, relaciones, tipos de datos nativos de PostgreSQL (UUID, JSONB, Arrays).
* **Migrations de Prisma:** Utilizar las herramientas de migración de Prisma (`prisma migrate`) para gestionar los cambios en el esquema de la base de datos de forma controlada y automatizada.
* **Transacciones:** Utilizar las capacidades transaccionales de Prisma Client (`$transaction`) para asegurar la atomicidad de las operaciones que implican múltiples escrituras.
* **Manejo de Relaciones:** Utilizar las funcionalidades de relaciones de Prisma para incluir datos relacionados en las consultas (ej. `include` en operaciones de lectura).
* **Consultas Eficientes:** Optimizar las consultas utilizando `select`, `where`, `orderBy`, `skip`, `take` y otros filtros de Prisma Client para recuperar solo los datos necesarios y aplicar paginación/ordenación eficientemente.
* **Manejo de Errores de DB:** Capturar y manejar los errores específicos de Prisma Client y de la base de datos.

### 4.4. Autenticación y Autorización (JWT)

* **Generación Segura de Tokens:** Al iniciar sesión, el servicio de autenticación debe generar un token JWT válido y firmado con una clave secreta segura (TK-004). El token debe contener los claims necesarios (userId, rol).
* **Middleware de Autenticación:** Implementar un middleware que verifique la validez del token JWT en cada petición a rutas protegidas (TK-005). Si el token es inválido, expirado o faltante, rechazar con 401 Unauthorized.
* **Middleware de Autorización:** Implementar un middleware (o lógica en controlador/servicio) que verifique si el usuario autenticado (basado en el rol del token) tiene permisos para realizar la acción o acceder al recurso solicitado (ej. solo ADMIN puede gestionar usuarios - TK-007). Rechazar con 403 Forbidden si no tiene permisos.
* **Gestión Segura de Clave Secreta:** La clave secreta para firmar/verificar JWT debe gestionarse de forma segura (variables de entorno, secret manager).
* **Hashing de Contraseñas:** Utilizar bcrypt (o algoritmo similar) para hashear las contraseñas de usuario antes de almacenarlas y para comparar contraseñas al iniciar sesión. NUNCA almacenar contraseñas en texto plano (TK-008).

### 4.5. Integración con Core AI (Módulo de Integración)

* **Cliente Centralizado (Axios):** Utilizar una instancia de Axios configurada específicamente para comunicarse con la API interna de Core AI. Configurar la URL base y la autenticación interna necesaria.
* **Encapsular Llamadas:** Las llamadas a los endpoints de Core AI deben encapsularse en funciones o métodos dentro del Módulo de Integración, no estar dispersas por otros servicios.
* **Manejo de Errores de Integración:** Implementar manejo de errores específico para las llamadas a Core AI (timeouts, errores de red, errores de la API de Core AI). Considerar estrategias de reintentos para errores transitorios si es necesario. Registrar errores para facilitar el diagnóstico.
* **Desacoplamiento (Opcional Asíncrono):** Si ciertas interacciones con Core AI son de larga duración (ej. evaluación de CV), considerar la implementación de un mecanismo asíncrono (colas de mensajes) para evitar bloquear la respuesta al frontend (aunque síncrono se definió para MVP en TK-045).

### 4.6. Seguridad General

* **Validación de Entrada Exhaustiva:** Validar y sanear SIEMPRE la entrada del usuario en el backend para prevenir ataques comunes (SQL injection, XSS, etc.). No confiar únicamente en la validación del frontend. Utilizar las capacidades de validación de Prisma (a nivel de esquema y runtime) y complementarlas con librerías de validación de entrada si es necesario.
* **Protección contra OWASP Top 10:** Ser conscientes de las vulnerabilidades comunes y aplicar prácticas para mitigarlas. El uso de Prisma ayuda a prevenir inyección SQL si se usa correctamente.
* **Gestión Segura de Secretos:** Las credenciales de base de datos, claves de API externas (LLM), claves JWT, etc., deben gestionarse de forma segura y no estar en el código fuente (RNF-11, RNF-13).
* **Registro de Auditoría:** Implementar registro de eventos de seguridad relevantes (intentos de login, cambios importantes) (RNF-14).

### 4.7. Manejo de Errores y Logging

* **Estrategia Consistente de Errores:** Definir una estrategia consistente para el manejo y la propagación de errores a través de las capas (ej. lanzar excepciones en servicios, capturarlas en controladores y dar formato a respuestas de error HTTP). Utilizar los tipos de error específicos de Prisma Client para manejar errores de base de datos de forma controlada.
* **Logging:** Implementar un sistema de logging adecuado para registrar información importante (eventos, errores, advertencias) con niveles de severidad apropiados. Configurar el logging en los diferentes entornos.

## 5. Base de Datos PostgreSQL y Uso de Prisma

* **Esquema de Prisma (`schema.prisma`):** Este archivo es central. Define los modelos (`model`) que representan las tablas de la base de datos, las relaciones entre ellas, y los tipos de datos. Debe mantenerse sincronizado con el esquema de la base de datos ([db-overview.md]). Utilizar los tipos nativos de PostgreSQL soportados por Prisma (UUID, JSONB, Arrays).
* **Prisma Migrate:** Utilizar `prisma migrate dev` durante el desarrollo para generar y aplicar scripts de migración automáticamente a medida que se modifica el esquema de Prisma. Utilizar `prisma migrate deploy` en producción. Seguir un flujo de trabajo de migraciones bien definido.
* **Prisma Client:** El cliente auto-generado de Prisma es la interfaz principal para interactuar con la base de datos. Se importará y utilizará en la capa de Repositorios.
* **Transacciones:** Para operaciones que requieren atomicidad (ej. crear una candidatura, su archivo CV y un registro en historial simultáneamente), utilizar `PrismaClient.$transaction()` para asegurar que todas las operaciones se completen o ninguna lo haga.
* **Indexación:** Aunque el esquema de Prisma permite definir índices (`@@index`, `@@unique`), es importante validar su efectividad y añadir índices adicionales en la base de datos directamente si es necesario para optimizar el rendimiento de consultas críticas, basándose en análisis con `EXPLAIN ANALYZE`.
* **Consultas con Prisma Client:** Aprender y aplicar las mejores prácticas para escribir consultas eficientes utilizando la API de Prisma, incluyendo:
    * Seleccionar solo los campos necesarios (`select`).
    * Filtrar datos (`where`).
    * Incluir datos relacionados (`include`).
    * Ordenar resultados (`orderBy`).
    * Implementar paginación (`skip`, `take`).
    * Utilizar operaciones de agregación (`_count`, `_sum`, etc.).
* **Conexión a Base de Datos:** Configurar la cadena de conexión a la base de datos en las variables de entorno (`.env`) y asegurar que Prisma Client se conecte correctamente.

## 6. Estrategia de Testing Backend

* **Pruebas Unitarias (Jest/Vitest):** Probar funciones puras y la lógica de negocio individual en la capa de Servicios. Mockear las dependencias de Repositorios (interacciones con Prisma Client) para probar la lógica de negocio de forma aislada.
* **Pruebas de Repositorios (Jest/Vitest):** Probar la capa de Repositorios de forma más integrada con Prisma Client, utilizando una base de datos de prueba o un enfoque de testing con contenedores para asegurar que las consultas a la base de datos funcionan como se espera. Mockear las interacciones con servicios externos.
* **Pruebas de Integración (Jest/Vitest):** Probar la interacción entre capas (ej. Controlador llamando a Servicio, Servicio llamando a Repositorio real o mockeado).
* **Pruebas de API (Supertest):** Probar los endpoints HTTP completos, verificando la integración de controladores, servicios y (potencialmente) la base de datos.

## 7. Calidad del Código

* **Guías de Estilo:** Adherirse a las guías de estilo configuradas en ESLint y Prettier. Configurar ganchos de pre-commit si es posible para automatizar el formato y linting.
* **Código Limpio y Legible:** Escribir código modular, fácil de entender, con nombres de variables y funciones descriptivos.
* **Comentarios y Documentación:** Añadir comentarios para explicar lógica compleja o decisiones de diseño. Mantener el README del backend actualizado. Documentar la API con OpenAPI (TK-001).

## 8. Proceso de Construcción e Implementación (CI/CD)

Integrar las pruebas backend (unitarias, de repositorios, de integración, de API) en el pipeline de CI para que se ejecuten automáticamente con cada cambio. Configurar el proceso de build (Vite si aplica, o un proceso de build específico de Node.js) para preparar la aplicación backend para el despliegue. Incluir los pasos para ejecutar las migraciones de Prisma durante el proceso de despliegue en los diferentes entornos.

---
Referencias:
* [Arquitectura de la Aplicación ATS MVP](../arq/ats_mvp_arq.md)
* [Implementacion detallada de BBDD](../db/db-overview.md)
* [TalentIA PRD](../prd/PRD%20TalentIA%20FInal.md)
* [Documentación de Prisma](https://www.prisma.io/docs/)
* [Documentación de Node.js](https://nodejs.org/en/docs/)
* [Documentación de Express](https://expressjs.com/)
* [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
* [Documentación de JWT](https://jwt.io/introduction)
* [Documentación de bcrypt](https://www.npmjs.com/package/bcrypt)
* [Documentación de Axios](https://axios-http.com/)
* [Documentación de Vite](https://vitejs.dev/)
* [Documentación de ESLint](https://eslint.org/)
* [Documentación de Prettier](https://prettier.io/)
* [Documentación de Jest](https://jestjs.io/) o [Vitest](https://vitest.dev/)
* [Documentación de Supertest](https://www.npmjs.com/package/supertest)