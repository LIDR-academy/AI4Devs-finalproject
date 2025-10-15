# Project Brief

## Purpose
**bonÀreaGo** - Una plataforma de compartición de viajes corporativos que conecta empleados para compartir viajes diarios a sus lugares de trabajo, optimizando costos de transporte y reduciendo la huella de carbono de la empresa.

## Scope
- **In scope:**
  - Autenticación SSO corporativa (OIDC/Keycloak)
  - Gestión de perfiles de empleados con ubicación aproximada
  - Publicación de trayectos por conductores
  - Búsqueda y reserva de plazas por pasajeros
  - Sistema de matching inteligente basado en proximidad y horarios
  - Gestión de reservas y confirmaciones
  - API REST para todos los servicios
  - Base de datos PostgreSQL con esquemas separados por servicio
  - Tests de integración con Testcontainers

- **Out of scope:**
  - Pagos integrados (MVP sin transacciones monetarias)
  - App móvil nativa (solo web app)
  - Integración con sistemas de RRHH existentes
  - Geolocalización en tiempo real
  - Notificaciones push

## Success Criteria
- **Business outcomes:**
  - Reducción del 20% en costos de transporte de empleados
  - Disminución de la huella de carbono corporativa
  - Mejora de la satisfacción laboral mediante networking

- **User outcomes:**
  - Acceso simple y rápido a opciones de carpooling
  - Matching automático con compañeros cercanos
  - Gestión intuitiva de viajes y reservas

- **Technical outcomes:**
  - Arquitectura de microservicios escalable
  - Persistencia robusta con PostgreSQL + JPA
  - Cobertura de tests >80%
  - APIs REST bien documentadas
  - Entorno de desarrollo completo con Docker
  - Integración real entre microservicios
  - Frontend moderno con React + TypeScript + Tailwind CSS

## Stakeholders
- **Product:** Equipo de producto corporativo
- **Engineering:** Equipo de desarrollo backend/frontend
- **Others:** Empleados (usuarios finales), RRHH, Sostenibilidad

## Milestones
- **M1 (FASE 1):** Persistencia completa ✅
  - PostgreSQL + JPA + Flyway + Seeds implementados
- **M2 (FASE 2):** APIs REST con JPA ✅
  - Todos los servicios migrados de in-memory a JPA
  - AuthFilter estandarizado con ThreadLocal
  - Algoritmo de matching real implementado
- **M3 (FASE 3):** Tests de integración ✅
  - Testcontainers configurado para todos los servicios
  - Cobertura completa de funcionalidad CRUD
- **M4 (FASE 4):** Docker-compose para desarrollo ✅
  - Infraestructura completa (PostgreSQL, Redis, Keycloak, Mailhog)
  - Microservicios dockerizados con scripts de automatización
  - Documentación completa de setup local
- **M5 (FASE 5):** Integraciones entre servicios ✅
  - ServiceHttpClient para comunicación entre microservicios
  - DTOs compartidos para estandarización
  - Validaciones cross-service implementadas
- **M6 (FRONTEND):** Frontend moderno ✅
  - React + TypeScript + Tailwind CSS
  - Componentes UI reutilizables
  - Páginas principales implementadas

## Risks & Assumptions
- **Risks:**
  - Complejidad de integración con sistemas corporativos
  - Adopción limitada por parte de empleados
  - Problemas de escalabilidad en matching en tiempo real

- **Assumptions:**
  - Empleados están dispuestos a compartir información de ubicación aproximada
  - La empresa proporcionará infraestructura de autenticación (Keycloak)
  - Los horarios de trabajo son relativamente predecibles


