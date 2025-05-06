# Mejores Prácticas de Desarrollo - ATS MVP Backend

Este documento detalla las mejores prácticas específicas para el desarrollo del backend del ATS MVP, utilizando Node.js con Express y Prisma ORM para interactuar con PostgreSQL, basándose en la arquitectura y decisiones técnicas definidas.

## 1. Arquitectura y Organización del Código

- **Monolito Modular por Capas:** Organizar el código en capas claras (API/Controladores, Servicios/Lógica de Negocio, Repositorios/Acceso a Datos) y módulos lógicos (ej. usuarios, vacantes, candidaturas, pipeline, integración).
- **Capa de API/Controladores:** Responsable de recibir peticiones HTTP, validación básica, llamar a servicios y dar formato a la respuesta. Minimizar lógica de negocio aquí.
- **Capa de Servicios/Lógica de Negocio:** Contiene la lógica principal, casos de uso, reglas de negocio y orquestación de operaciones. No interactúa directamente con la base de datos; delega en Repositorios. Interactúa con servicios externos (Core AI) a través del Módulo de Integración.
- **Capa de Repositorios/Acceso a Datos:** Encapsula la lógica de interacción directa con la base de datos utilizando Prisma. Proporciona una interfaz limpia a la capa de Servicios.
- **Módulo de Integración con Core AI:** Servicio/módulo específico dentro del backend del ATS para encapsular la comunicación (llamadas API) con los servicios de TalentIA Core AI.

## 2. Desarrollo con Node.js y Express

- **RESTful API Design:** Diseñar endpoints RESTful, utilizando los métodos HTTP (GET, POST, PUT, PATCH, DELETE) de forma semántica sobre recursos (jobs, applications, users, stages).
- **Versionado de API:** Incluir versionado explícito en la URL (ej. `/api/v1/`).
- **Validación de Entrada:** Implementar validación robusta de los datos recibidos en el endpoint API (ej. con librerías de validación) para asegurar la integridad y prevenir datos maliciosos. Validaciones de negocio más complejas residen en la capa de Servicios.
- **Formato de Respuesta:** Utilizar JSON como formato estándar para peticiones y respuestas, siguiendo convenciones consistentes (ej. camelCase).
- **Códigos de Estado HTTP:** Utilizar los códigos de estado HTTP de forma semántica (200, 201, 204, 400, 401, 403, 404, 409, 500).

## 3. Acceso a Datos con Prisma y PostgreSQL

- **Prisma ORM:** Utilizar Prisma como ORM para interactuar con PostgreSQL. Aprovechar su API fluent para construir consultas.
- **`schema.prisma`:** Mantener el esquema de Prisma sincronizado con el modelo de base de datos . Utilizar tipos nativos de PostgreSQL como UUID, JSONB y Arrays donde aplique .
- **Prisma Migrate:** Utilizar las herramientas de migración de Prisma (`prisma migrate`) para gestionar los cambios en el esquema de la base de datos de forma controlada.
- **Repositorios con Prisma Client:** La capa de Repositorios debe utilizar el cliente Prisma para realizar todas las operaciones CRUD (Create, Read, Update, Delete).
- **Transacciones:** Utilizar `PrismaClient.$transaction()` para asegurar la atomicidad de las operaciones que involucran múltiples escrituras en la base de datos.
- **Consultas Eficientes:** Optimizar las consultas utilizando las capacidades de Prisma Client (`select`, `where`, `include`, `orderBy`, `skip`, `take`) para recuperar solo los datos necesarios y aplicar paginación/ordenación eficientemente.
- **Indexación:** Definir índices adecuados en el `schema.prisma` y validar su efectividad con `EXPLAIN ANALYZE` si es necesario para optimizar consultas críticas . Considerar índices GIN para campos JSONB y Arrays .

## 4. Autenticación y Autorización (JWT)

- **JSON Web Tokens (JWT):** Implementar autenticación utilizando JWT para sesiones stateless.
- **Generación Segura de Tokens:** Generar tokens firmados con una clave secreta segura. Incluir claims necesarios (userId, rol).
- **Middleware de Autenticación:** Implementar un middleware que verifique la validez del token JWT en rutas protegidas y adjunte la información del usuario a la petición (TK-005). Rechazar con 401 Unauthorized si el token es inválido/expirado.
- **Middleware/Lógica de Autorización:** Verificar permisos/roles del usuario autenticado para acceder a recursos o realizar acciones (TK-005, TK-007, TK-012). Rechazar con 403 Forbidden si no tiene permisos.
- **Hashing de Contraseñas:** Utilizar una librería segura como bcrypt para hashear contraseñas antes de almacenarlas. NUNCA almacenar contraseñas en texto plano (TK-008).
- **Gestión Segura de Clave Secreta JWT:** La clave secreta debe gestionarse de forma segura (variables de entorno, secret manager) (RNF-13).

## 5. Integración con TalentIA Core AI

- **API Interna Definida:** La comunicación con Core AI se rige por la especificación OpenAPI (TK-001).
- **Módulo de Integración:** Encapsular las llamadas salientes a la API de Core AI dentro de un módulo dedicado en el backend del ATS. Utilizar un cliente HTTP (Axios) configurado para la comunicación interna.
- **Autenticación Interna:** Implementar el mecanismo de autenticación definido para la comunicación ATS -> Core AI (API Key compartida, token interno).
- **Manejo de Errores de Integración:** Implementar manejo de errores específico para las llamadas a Core AI (timeouts, errores de red, códigos de error de la API de Core AI). Considerar reintentos si es necesario (RNF-21, RNF-23).

## 6. Seguridad

- **Validación de Entrada Exhaustiva:** Validar y sanear SIEMPRE la entrada del usuario en el backend para prevenir ataques comunes (SQL Injection, XSS) (RNF-12). Prisma ayuda a prevenir SQL Injection si se usa correctamente.
- **Protección contra OWASP Top 10:** Ser conscientes de las vulnerabilidades comunes y aplicar prácticas para mitigarlas (RNF-12).
- **Gestión Segura de Secretos:** Credenciales de base de datos, claves de API externas, claves JWT, etc., deben gestionarse de forma segura (RNF-11, RNF-13).
- **Registro de Auditoría:** Implementar logging de eventos de seguridad relevantes (RNF-14).

## 7. Manejo de Errores y Logging

- **Estrategia Consistente de Errores:** Definir cómo se manejan y propagan los errores entre capas y servicios. Utilizar tipos de error personalizados si es útil (RNF-21).
- **Logging:** Implementar logging adecuado con niveles de severidad (INFO, WARN, ERROR) para facilitar la depuración y monitorización (RNF-21). No loguear información sensible.

## 8. Testing

Implementar una estrategia de pruebas Backend:
- **Pruebas Unitarias:** Para funciones puras y lógica de negocio en la capa de Servicios. Mockear las dependencias (ej. Repositorios, cliente Core AI).
- **Pruebas de Repositorios:** Probar la interacción con la base de datos a través de Prisma. Utilizar una base de datos de prueba.
- **Pruebas de Integración:** Para verificar la comunicación entre capas (Controller -> Service -> Repository) y con servicios externos (Core AI).
- **Pruebas de API:** Utilizar Supertest u otra herramienta para probar directamente los endpoints HTTP.

## 9. Proceso de Construcción e Implementación (CI/CD)

Integrar pruebas backend en el pipeline de CI/CD. Incluir pasos para ejecutar migraciones de Prisma durante el despliegue.

Al adherirse a estas mejores prácticas, el equipo de Backend podrá construir un ATS MVP robusto, seguro y mantenible.