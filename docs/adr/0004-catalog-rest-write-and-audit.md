# ADR-0004: Alta REST de árbol, `usuario_app` desde JWT y auditoría R3 en catalog-service

## Estado

Aceptada

## Contexto

La HU-005 exige que un colaborador autenticado pueda dar de alta una ficha de árbol (`POST /api/catalog/trees`), con validaciones R1/R2, actor identificable en base de datos y traza en `AUDITORIA_CATALOGO` (R3). El **TASK-HU-005-04** ya implementó la persistencia del árbol y la resolución de `usuario_app` en capa de aplicación.

Se necesita:

- Contrato HTTP claro (DTO en `dto`, no entidades JPA en la API).
- **Duplicación consciente** entre identidad OIDC (Keycloak) y la tabla `usuario_app` para **FKs**, listados y auditoría **sin** consultar Keycloak en cada lectura SQL.
- **Roles de negocio** solo en el **JWT** (`realm_access.roles`); **no** se persiste `rol` en `usuario_app` para evitar desfase cuando cambian roles en el IdP.
- Perfil mostrable: columna **`nombre`** (nullable), rellenada desde claims firmados del access token; **solo se actualiza** en BD si el valor normalizado **cambia** respecto al almacenado (misma regla recomendable para `email`).

## Alternativas consideradas

1. **Exigir fila `usuario_app` preexistente (403 si falta)**  
   Trazabilidad estricta pero fricción operativa en el primer uso hasta un provisionamiento externo.

2. **Creación perezosa (elegida)**  
   Si existe `usuario_app` por `subject_oidc` → se reutiliza la PK y se **sincronizan** `email`/`nombre` si difieren. Si no existe → **INSERT** con datos mínimos del token. Colisiones concurrentes: reintento tras `DataIntegrityViolationException` y `merge` de perfil.

3. **`@EnableJpaAuditing` en `Arbol` (TASK-HU-005-11)**  
   En una iteración posterior al MVP inicial de esta ADR se activó Spring Data JPA Auditing en la entidad **`Arbol`**: `creado_en` / `modificado_en` / `creado_por` / `modificado_por` rellenados por `@EntityListeners(AuditingEntityListener.class)` y un `AuditorAware<Long>` que resuelve `usuario_app_id` desde el JWT (subject → `usuario_app`). La orquestación de alta sigue materializando `usuario_app` en `TreeCreationService` **antes** del `save` del árbol para que el auditor resuelva en la misma transacción. Detalle: [HU-005-ticket-breakdown.md](../backlog/HU-005-ticket-breakdown.md) (TASK-HU-005-11).

## Decisión

- **REST:** `CatalogTreesController` expone `POST /api/catalog/trees` con cuerpo **`CreateTreeRequest`** (nombres en inglés, validación Jakarta en borde) y respuesta **201** + `Location` + **`CreatedTreeResponse`** (`treeId`).
- **Orquestación:** `TreeRegistrationService` (`@Transactional`) llama a `TreeCreationService.create` y después a `CatalogAuditService.recordTreeCreated` en la **misma transacción** que el insert de `arbol` y la fila de `usuario_app` si aplica, de modo que un fallo en auditoría **revierte** el alta.
- **JWT — claims mínimos para alta de `usuario_app`:** el access token debe incluir **`email`** (scope `email` en el cliente OIDC). Para **`nombre`**: claim estándar **`name`**, o composición de **`given_name`** + **`family_name`** si `name` no está presente (véase [OidcUserProfileExtractor](../../services/catalog-service/src/main/java/com/mtl/catalog/util/OidcUserProfileExtractor.java)). Si falta `email` cuando hace falta materializar usuario → **400** Problem, mensaje seguro (sin listar claims internos).
- **Seguridad HTTP:** `POST /api/catalog/trees` exige roles de realm **`COLABORADOR`** o **`ADMIN`** además de Bearer válido (`CatalogSecurityConfig`).
- **Auditoría:** `operacion` = `ARBOL_CREADO`; `datos_nuevos_resumen` solo con **ids técnicos** (`arbol_id`, `especie_id`, `provincia_id`), sin PII ni texto libre de usuario.
- **Esquema SQL:** migración Flyway que elimina columna `rol` de `usuario_app` y añade `nombre` (nullable).

## Consecuencias

- **JPA Auditing (TASK-HU-005-11):** la entidad `Arbol` usa `@CreatedDate` / `@LastModifiedDate` / `@CreatedBy` / `@LastModifiedBy`; el auditor devuelve el `usuario_app_id` del subject OIDC actual. `Usuario_app` y maestros taxonómicos siguen sin listeners de auditoría JPA en este corte.
- **Cliente SPA / herramientas:** al obtener el token deben solicitar scopes que incluyan **`profile`** y **`email`** para que el access token lleve los claims necesarios (en dev, el realm importado `mtl` con `mtl-spa` y `fullScopeAllowed: true` hereda los *default client scopes* de Keycloak; conviene fijar `scope=openid profile email` en el flujo OIDC).
- **Kafka (`ARBOL_CREADO` en topic)** queda fuera de este ADR (TASK-HU-005-05).
- **Tests:** `mvn test` con H2 y Flyway desactivado siguen validando capas con mocks; IT con Postgres requieren Docker donde aplique.

## Referencias

- [HU-005-ticket-breakdown.md](../backlog/HU-005-ticket-breakdown.md)
- [jwt-gateway-strategy.md](../security/jwt-gateway-strategy.md)
- [openapi.yaml](../api/openapi.yaml)
- [V1__baseline.sql](../../services/catalog-service/src/main/resources/db/migration/V1__baseline.sql), [V4__usuario_app_nombre_drop_rol.sql](../../services/catalog-service/src/main/resources/db/migration/V4__usuario_app_nombre_drop_rol.sql)
