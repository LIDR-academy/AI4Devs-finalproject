> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**

Eres un experto en marketing. Estoy pensando en desarrollar una app de covoturaje corporativo para la empresa bonÀrea. Revisa su web corporativa https://www.bonarea-agrupa.com/es/. Basate en ella y propón una lista de 10 nombres para mi aplicación

**Prompt 2:**

Revisa la documentación y redacta una descripción del proyecto. El estilo debe ser para presentar el proyecto a dirección para que lo aprueben

**Prompt 3:**

Eres un experto en producto, con experiencia en aplicaciones de Covoituraje.

Estoy pensando en desarrollar una aplicacion de Covituraje para los empleados de una compañía. La idea és dar servicio a los empleados que necesiten desplazarse para llegar al trabajo o volver a casa y también para desplazamientos puntuales.

 ¿Qué funcionalidades básicas tiene un Covituraje de este tipo? Descríbemelas en un listado, ordenado de mayor a menor prioridad.

**Prompt 4:**

Antes de preparar el roadmap, investiga que alternativas existen en el mercado e indica que ventajas podemos aportar con una aplicación propia

**Prompt 5:**

Antes de preparar el roadmap ¿Cómo es el customer journey normal de un usuario que usa un sistema de covoituraje? Descríbeme paso a paso todas las interacciones

**Prompt 6:**

Eres un analista de software experto. Enumera y describe brevemente los casos de uso más importantes a implementar para lograr una funcionalidad básica

**Prompt 7:**

¿Podriamos conseguir un MVP con funcionalidades más básicas?

**Prompt 8:**

Representa estos casos de uso en el tipo de diagrama más adecuado usando el formato plantUML. Diferencia entre tipo de usuarios. Acorde a la sintaxis y buenas prácticas UML, define y describe lo que sea necesario. 

**Prompt 9:**

Propon un diagrama lean canvas
---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

dame una arquitectura amplia del sistema!

**Prompt 2:**

Ahora, cambiando de rol al de un arquitecto de software experimentado, renderiza un diagrama entidad-relación en mermaid.

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

Implementa un AuthFilter estándar que use ThreadLocal para propagar el userId a través de todos los microservicios. Debe validar JWT con JWKS, extraer claims y establecer AuthContext para uso en servicios.

**Prompt 2:**

Crea un ServiceHttpClient compartido para comunicación entre microservicios con manejo de errores, timeouts configurables y retry logic. Debe soportar diferentes tipos de respuesta y logging estructurado.

**Prompt 3:**

Implementa un MessageService para internacionalización en backend que use ResourceBundle con 6 idiomas (ca, es, ro, uk, en, fr), parser de Accept-Language header y fallback a inglés.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

Diseña la estructura de directorios para un proyecto de microservicios con Backend/ (Java 17 + Jakarta) y Frontend/ (React + TypeScript). Incluye shared/ para librerías comunes, scripts/ para automatización y doc/ para documentación técnica.

**Prompt 2:**

Implementa un parent POM con dependencyManagement centralizado para versiones consistentes de Jakarta EE, JPA/Hibernate, PostgreSQL driver, Flyway, JUnit5, Mockito y Testcontainers en todos los microservicios.

**Prompt 3:**

Crea la estructura de schemas PostgreSQL separados por servicio (trips.trips, users.users, bookings.bookings, matches.matches, notifications.notification_subscriptions) con migraciones Flyway V1 (create table) y V2 (seed data).

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

Configura docker-compose.yml con profiles para infraestructura base (PostgreSQL:5433, Redis, Keycloak:8080, Mailhog) y microservicios opcionales. Incluye variables de entorno para CORS, OIDC, VAPID keys y URLs de servicios.

**Prompt 2:**

Crea scripts de automatización: setup-dev.sh (setup completo), dev-infra.sh (solo infraestructura), verify-infra.sh (verificación rápida), verify-all.sh (sistema completo), start-frontend-dev.sh (modo desarrollo con hot reload).

**Prompt 3:**

Implementa configuración dual para frontend: Docker + Nginx (producción-like) vs Local + Vite (desarrollo). Variables VITE_* para OIDC issuer/clientId y URLs de APIs de microservicios (localhost:8081-8085).

### **2.5. Seguridad**

**Prompt 1:**

Implementa validación JWT robusta con Nimbus JOSE JWT: valida issuer (OIDC_ISSUER_URI), firma via JWKS, exp/nbf/sub presentes, audiencia debe incluir 'backend-api'. Usa DefaultJWTProcessor con JWSVerificationKeySelector RS256.

**Prompt 2:**

Configura política CORS segura: CorsFilter que refleja Origin permitido (ALLOWED_ORIGINS), añade Vary: Origin, Access-Control-Allow-Credentials: true, headers de seguridad (CSP, X-Frame-Options, X-Content-Type-Options).

**Prompt 3:**

Realiza auditoría OWASP Top 10 2021: Broken Access Control (JWT + roles), Cryptographic Failures (RS256 + JWKS), Injection (JPA parámetros preparados), Insecure Design (microservicios + menor privilegio), Security Misconfiguration (headers + CORS específico).

### **2.6. Tests**

**Prompt 1:**

Implementa tests de integración con Testcontainers: PostgreSQL real para cada servicio, configuración JPA con schemas separados, tests de repositorios y recursos JAX-RS con datos de prueba. Usa @Testcontainers y @Container para setup automático.

**Prompt 2:**

Configura suite E2E con Cypress 15.4.0: organiza por features (smoke → auth → trips → matches → bookings), usa cy.session() para cachear autenticación, cy.origin() para Keycloak, custom commands (loginViaKeycloak, ensureAuthenticated), fixtures JSON.

**Prompt 3:**

Establece estrategia TDD completa: tests unitarios con JUnit5 + Mockito para lógica de negocio, tests de integración con Testcontainers para persistencia, tests E2E con Cypress para flujos de usuario, cobertura >80% en todos los servicios.

---

### 3. Modelo de Datos

**Prompt 1:**

Vamos a trabajar en el modelo de datos. Propon un esquem ER en mermaid

**Prompt 2:**

quiero un modelo de datos completo segun las funcionalidades descritas en la documentación

**Prompt 3:**

para poder localizar el origen y el destino vas a necesitar las coordenadas?

**Prompt 4:**

reflejalo en el modelo de datos


---

### 4. Especificación de la API

**Prompt 1:**

Diseña APIs REST con JAX-RS usando @ApplicationPath("/api") en todos los microservicios. Endpoints principales: POST /trips (crear viaje), GET /matches (buscar coincidencias), POST /bookings (reservar plaza), GET /ratings (sistema de confianza). Usa Jakarta Bean Validation para validación de entrada.

**Prompt 2:**

Implementa documentación OpenAPI completa para cada servicio: trips-service.yaml, users-service.yaml, booking-service.yaml, matching-service.yaml, notification-service.yaml. Incluye esquemas de DTOs, parámetros de query, códigos de respuesta, ejemplos de request/response.

**Prompt 3:**

Configura comunicación entre microservicios: ServiceHttpClient para llamadas HTTP con manejo de errores, DTOs compartidos para estandarización, validaciones cross-service (ej: verificar reservas activas antes de eliminar viaje), health checks en /api/health.

---

### 5. Historias de Usuario

**Prompt 1:**

Como empleado conductor, quiero publicar un viaje con origen, destino, fecha/hora y número de plazas disponibles, para que otros empleados puedan reservar una plaza y compartir el coste del desplazamiento.

**Prompt 2:**

Como empleado pasajero, quiero buscar viajes disponibles filtrados por dirección (hacia sede/desde sede), fecha y número de plazas, para encontrar la mejor opción de covoituraje que se ajuste a mis necesidades.

**Prompt 3:**

Como empleado, quiero reservar una plaza en un viaje disponible y recibir confirmación automática, para asegurar mi plaza y coordinar con el conductor los detalles del encuentro.

---

### 6. Tickets de Trabajo

**Prompt 1:**

Crea ticket técnico para FASE 1 - Persistencia: Implementar PostgreSQL + JPA + Flyway con schemas separados por servicio. Criterios: migraciones V1 (create table), V2 (seed data), entidades JPA con @Table(schema), transacciones RESOURCE_LOCAL, tests con Testcontainers.

**Prompt 2:**

Define ticket para FASE 2 - APIs REST: Migrar recursos de in-memory a JPA real. Criterios: AuthFilter estandarizado con ThreadLocal, ServiceHttpClient para comunicación, validaciones Jakarta Bean Validation, algoritmo de matching real con scoring, tests de integración completos.

**Prompt 3:**

Especifica ticket para FASE 3 - Tests E2E: Configurar Cypress con suite completa. Criterios: tests por features (smoke, auth, trips, matches, bookings), custom commands (loginViaKeycloak, ensureAuthenticated), fixtures JSON, cobertura >85% de flujos críticos, CI/CD ready.

---

### 7. Pull Requests

**Prompt 1:**

Crea PR para Feature #6 - Notificaciones Push: Implementa PushNotificationService con VAPID, EmailWorker con templates HTML i18n, NotificationEvents (BookingConfirmed, TripCancelled, MatchFound), integración booking/matching → notification-service, frontend con Service Worker y NotificationSettings UI.

**Prompt 2:**

Genera PR para Feature #4 - Matching Avanzado: Implementa arquitectura SOLID con Strategy Pattern (6 estrategias filtrado/ordenación), Factory Pattern, Repository Pattern para persistencia localStorage, componentes ScoreBadge, MatchCard, MatchFilters, tests TDD completos (73 unitarios + E2E).

**Prompt 3:**

Prepara PR para Multi-idioma Completo: Backend MessageService con ResourceBundle (6 idiomas), Frontend react-i18next con LanguageSwitcher, 48 archivos traducción frontend + 42 backend, tests E2E language-switching.cy.ts, integración completa en todos los componentes.
