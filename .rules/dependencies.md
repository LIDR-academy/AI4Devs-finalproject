# Dependency Rules for latearte

Este documento define el stack tecnológico oficial y las reglas para la instalación de dependencias en el proyecto **latearte**, asegurando consistencia técnica y rendimiento óptimo.

## 1. Backend Core (Microservicios)
- **Framework**: **NestJS** es el único framework autorizado para el desarrollo del backend.
- **ORM**: **Prisma** es el único Object-Relational Mapper permitido para la gestión de la base de datos y esquemas.
- **Validación**: Se debe utilizar `class-validator` y `class-transformer` para la validación de DTOs.

## 2. Frontend Core (Interfaz de Usuario)
- **Framework**: **Next.js** (React) con arquitectura App Router.
- **Estilado**: **Tailwind CSS** es el estándar obligatorio para el diseño visual.
- **SEO & Rendimiento**: Queda estrictamente prohibida la sugerencia o instalación de librerías de "CSS-in-JS" (como Styled Components o Emotion) para no degradar el rendimiento del Server-Side Rendering (SSR) y el SEO.

## 3. Base de Datos e Infraestructura
- **Persistencia**: **PostgreSQL** (v16+) para el almacenamiento relacional de metadatos curados.
- **Caché**: **Redis** para la gestión de sesiones, estados de acceso y almacenamiento temporal de resultados de APIs externas.
- **Contenedores**: Toda dependencia de infraestructura debe ser compatible con Docker y estar reflejada en el `docker-compose.yml`.

## 4. Orquestación y Mensajería (EDA)
- **Sincronización**: Se autoriza el uso de **RabbitMQ** o **Kafka** para la comunicación asíncrona entre microservicios (especialmente para actualizaciones de catálogos externos en el Motor de Agregación).

## 5. Estrategia de Testing
- **Pruebas Unitarias**: **Jest** (integrado con NestJS) es el framework estándar.
- **Pruebas E2E**: Se debe utilizar **Playwright** o **Cypress** para validar los flujos críticos del usuario final (Curioso Cultural).

## 6. Gestión de Paquetes
- **Package Manager**: **npm** (según la configuración inicial del scaffolding).
- **Seguridad**: Antes de añadir una nueva dependencia, se debe verificar su impacto en el tamaño del bundle (frontend) y su mantenimiento activo.

---
**Fuente**: [Diseño de arquitectura Arteflujo_ Hub Cultural.md](file:///c:/Documentos/Cursos/Lidr/IA4Devs/AI4Devs-finalproject/documentacion/Dise%C3%B1o%20de%20arquitectura%20Arteflujo_%20Hub%20Cultural.md)
