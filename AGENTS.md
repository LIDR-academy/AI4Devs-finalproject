# AGENTS.md

## Proyecto
MyTreeLibrary es una aplicación web colaborativa para registrar, localizar y compartir árboles de tu ciudad.

## Objetivo funcional
Permitir a colaboradores identificados registrar árboles con:
- datos descriptivos
- fotografías
- ubicación geográfica
- identificación orientativa mediante IA
- chat asistido por IA

También debe permitir a usuario anónimos:
- consulta pública sin login
- suscripción a notificaciones

## Stack principal
- Backend: Spring Boot 4
- Frontend: Vue 3
- Arquitectura: microservicios
- API: REST
- Persistencia: base de datos relacional y Mongo

## Estructura del repositorio (monorepo)

Código y despliegue previstos bajo la raíz del proyecto: **`frontend/`** (Vue), **`services/`** (api-gateway y microservicios), **`platform/observability/`** (config de telemetría/trazas), **`infra/`** (Compose, K8s) y **`docs/`**. Detalle: [readme.md](readme.md) (apartado 2.3). Infra de apoyo con Docker: [infra/compose/README.md](infra/compose/README.md).

## Documentación normativa complementaria

- **Seguridad API** (JWT, roles, correlación, logs): reglas en `.cursor/rules/api-security.mdc`; resumen en [readme.md](readme.md) §2.5.
- **Contrato HTTP** (fuente de verdad para el cliente): [docs/api/openapi.yaml](docs/api/openapi.yaml); al cambiar endpoints, actualizar también `.cursor/rules/api-design.mdc` si afecta a convenciones.
- **Eventos Kafka**: [docs/events/kafka-events.md](docs/events/kafka-events.md).
- **Híbrido SQL + Mongo** en catálogo: [docs/data-model/mongo.md](docs/data-model/mongo.md) y `.cursor/rules/mongo-hybrid.mdc`.

## Prioridades del MVP
1. Registro y publicación de árboles
2. Consulta pública con mapa
3. Notificaciones a usuarios suscritos
4. IA para identificación orientativa

## Criterios generales
- No exponer entidades JPA directamente en la API.
- Priorizar claridad, mantenibilidad y separación de responsabilidades.
- Proponer código pequeño, modular y bien nombrado.
- Añadir validación, manejo de errores y pruebas básicas en código nuevo.
- Mantener el enfoque del producto: hobby, comunidad y memoria de árboles.

## Reglas de generación
- Antes de crear código nuevo, revisar si ya existe una pieza reutilizable.
- Si una clase o componente crece demasiado, proponer división.
- Si hay una decisión de diseño ambigua, escoger la opción más simple compatible con el MVP.

## Reglas de nomenclatura e idioma del proyecto
- El idioma del proyecto es el español, la documentación se generará en este idioma
- El nombre de los archivos de documentación generados será en INGLÉS, por coherencia con nomenclatura heredada (readme)
- El nombre de las columnas en Base de datos será en español
