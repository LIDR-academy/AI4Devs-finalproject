# 01 · Microservice Overview

## Propósito
MS-CONFI centraliza catálogos y configuraciones de referencia: geografía (provincias, cantones, parroquias), actividades económicas (CIIU) y otros parámetros operativos. Provee APIs REST y handlers NATS para servir datos consistentes al resto de dominios.

## Alcance funcional actual
- Catálogo geográfico (provincias, cantones, parroquias) con CRUD, búsqueda y soft delete.
- Catálogo CIIU con CRUD de secciones y actividades, búsqueda, obtención por código y árbol jerárquico completo.
- Base de datos con scripts para geo-catalog y soporte de códigos SEPS.
- Documentación Swagger completa para CIIU; guía de pruebas para GEO.

## Stack
- Framework: NestJS 11 (REST + microservices).
- Persistence: PostgreSQL (pg driver, TypeORM disponible).
- Mensajería: NATS (handler de contexto en módulos).
- Tooling: ESLint + Prettier, Jest, Swagger.

## Despliegue y entorno
- Puerto default observado: 8012 (GEO) y /doc para Swagger.
- Scripts npm: start, start:dev, lint, test, test:cov, e2e.
- Configuración via .env (no incluida aquí); usa DatabaseModule central.

## Estructura de módulos (src/module)
- parameter/: catálogos (ciiu, geo, color, icons, opcio, perfi, tofic).
- management/: gestión (submódulos empre, ofici).
- operation/: operaciones (a definir según proyecto).
- search/: búsquedas transversales.
- common/: database, health, log, config.

## Referencias clave
- Implementación GEO: IMPLEMENTACION-GEO-RESUMEN.md
- Swagger CIIU: SWAGGER-CIIU-VERIFICACION.md
- Tests CIIU: TEST-CIIU-RESUMEN.md
- Pruebas GEO: TEST-GEO-ENDPOINTS.md
