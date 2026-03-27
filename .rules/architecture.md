# Architecture Rules for latearte

Este documento define las reglas arquitectónicas estrictas para el proyecto **latearte**, basadas en la propuesta técnica de microservicios orientados a eventos.

## 1. Stack Tecnológico Mandatario
- **Frontend**: [Next.js](https://nextjs.org/) (React) utilizando App Router y Tailwind CSS.
- **Backend**: [NestJS](https://nestjs.com/) (Node.js) para la creación de microservicios.
- **Base de Datos**: PostgreSQL para persistencia relacional.
- **Caché/Mensajería**: Redis para sesiones y RabbitMQ/Kafka para comunicación asíncrona.

## 2. Jerarquía de Carpetas y Capas
El proyecto se organiza en cuatro capas principales según la especificación de diseño:

### A. Capa de Cliente y Edge (`/frontend`)
- Contiene la aplicación Next.js.
- Debe estar optimizada para SEO (Server-Side Rendering para fichas técnicas).
- Punto de entrada: CDN y Load Balancer/Reverse Proxy.

### B. Capa de Servicios (`/backend/src/modules`)
- Contiene la lógica de negocio distribuida en microservicios especializados:
    - `auth`: Gestión de seguridad y JWT.
    - `curated`: Lógica de "Dial de Tiempo", "Moods" e "Hitos".
    - `aggregator`: Orquestación de APIs externas (Smart Embedding).
    - `user`: Perfiles y Watchlists.

### C. Capa de Integración
- Responsable de la comunicación con APIs de terceros (YouTube, MUBI, Vimeo).
- Debe implementar una capa de **Redis Cache** para optimizar cuotas y tiempos de respuesta.
- Debe incluir mecanismos de **Resiliencia** (Circuit Breaker) para fallos en servicios externos.

### D. Capa de Datos
- **PostgreSQL**: Base de datos centralizada para integridad referencial.
- **Redis**: Almacenamiento de estados de acceso y resultados de búsqueda frecuentes.

## 3. Reglas de Desarrollo
1. **Punto de Entrada Único**: Todas las peticiones del frontend deben pasar obligatoriamente por el **API Gateway** antes de ser redirigidas a los microservicios internos.
2. **Patrón Orientado a Eventos**: Todo nuevo microservicio o funcionalidad extendida debe seguir el patrón de **Arquitectura Orientada a Eventos (EDA)** para asegurar el desacoplamiento y la escalabilidad independiente.
3. **Escalabilidad**: Los servicios deben ser "Container-based" (Docker) para permitir el auto-escalado (ej. AWS Fargate).
4. **Integridad**: No se permiten cruces directos entre bases de datos de distintos microservicios; la comunicación debe ser vía API o eventos.

---
**Fuente**: [Diseño de arquitectura Arteflujo_ Hub Cultural.md](file:///c:/Documentos/Cursos/Lidr/IA4Devs/AI4Devs-finalproject/documentacion/Dise%C3%B1o%20de%20arquitectura%20Arteflujo_%20Hub%20Cultural.md)
