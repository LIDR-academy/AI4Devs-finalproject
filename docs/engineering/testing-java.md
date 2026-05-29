# Convenciones y buenas prácticas — tests Java (`services/`)

Guía breve para alinear implementación, Maven e IDE. Comandos y perfiles generales: [services/README.md](../../services/README.md) (apartado 1). Estrategia de tests más amplia (Testcontainers, contrato, aceptación): [readme.md](../../readme.md) (apartado 2.6). **Reglas mínimas por capa:** §2. **E2E gateway + catálogo:** §2.1.

## 1. Estructura Maven

- **`src/test/java`**: tests que ejecuta **Surefire** en `mvn test`. Por convención del parent, Surefire **excluye** `**/*IT.java` (por si un IT quedara mezclado por error).
- **`src/testIT/java`**: fuentes de **integración**; el parent añade el directorio con **build-helper-maven-plugin**; **Failsafe** (`mvn verify`) ejecuta clases que coinciden con `**/*IT.java`.
- **`src/test/resources`**: recursos del **classpath de tests** (unitarios e integración): perfiles tipo `application-test-it-….properties`, scripts para `PostgreSQLContainer.withInitScript(…)`, fixtures, etc. Maven los copia a `target/test-classes`; ahí los buscan Spring y Testcontainers. **`src/testIT/resources`** no entra en el classpath salvo que el `pom.xml` del módulo declare explícitamente ese directorio como `testResource` (en este monorepo no es el patrón por defecto).
- Paquetes habituales: `…integration` para IT, `…integration.support` para utilidades y `@TestConfiguration` usados solo por IT (stubs, WireMock, tokens de prueba).

## 2. Qué testear por capa (reglas mínimas, MVP)

No hay **umbral de cobertura %** obligatorio en CI; sí estas reglas **baratas de cumplir** cuando el cambio toca la zona indicada. Paquetes alineados con [spring-boot-4-backend.mdc](../../.cursor/rules/spring-boot-4-backend.mdc) (`com.mtl.<contexto>.…`).

| Zona / paquete | Regla mínima |
|----------------|--------------|
| **`application`** — servicios con ramas, cálculos o reglas de negocio | Al menos un **`*Test`** (Surefire) que ejercite el comportamiento nuevo o las ramas relevantes; mocks de repositorios o clientes HTTP si simplifica. |
| **`util`** — helpers con lógica | **`*Test`** unitario directo sobre la clase. |
| **`controller`** — endpoint nuevo o cambio de parámetros / validación | **`WebMvcTest`** (o equivalente) **o** cobertura mediante **`*IT`** con MockMvc si el caso exige el stack OAuth2 completo. |
| **`web.error`** — `@RestControllerAdvice`, cuerpos Problem (OpenAPI / [api-contract.mdc](../../.cursor/rules/api-contract.mdc)) | Ampliar tests del advice existente **o** un slice o **`*IT`** que compruebe cuerpo y código HTTP si cambia el contrato de error. |
| **`config`** — seguridad, decoders JWT, beans no triviales | **`*Test`** con contexto mínimo o prueba aislada del bean (p. ej. decoder stub). |
| **`infrastructure.persistence…repository`** — SQL nativo, funciones del motor (`unaccent`, PostGIS, etc.) | **`*IT`** con **Testcontainers** y el mismo motor que en dev/prod. |
| **`domain`** — entidades JPA sin lógica | No exigir test solo por mapeo/campos; **sí** si hay lógica o invariantes en la entidad. |
| **`dto`** — records/DTO sin lógica | No exigir test dedicado; validación vía controller o IT. |
| **`api-gateway`** — rutas, filtros, relay hacia upstream | **`*IT`** con `WebTestClient` y/o WireMock cuando cambien rutas, seguridad o proxy. |

**Notas**

- Cambios **solo** de comentarios, constantes o imports sin impacto en comportamiento: no hace falta test nuevo.
- Un mismo PR puede tocar varias capas: aplicar la regla de **cada** capa afectada, sin duplicar el mismo escenario en muchos tests (preferir un IT que cubra el flujo si ya existe).

### 2.1. Pruebas E2E (gateway + microservicios reales)

- Módulo Maven **`services/system-e2e-tests`**: HTTP contra el **API Gateway** con **JWT real** de Keycloak; requiere gateway, catálogo (y demás infra según el caso) en marcha. Instrucciones y variables: [services/system-e2e-tests/README.md](../../services/system-e2e-tests/README.md).
- Sin `MTL_E2E_ACCESS_TOKEN`, los `*IT` E2E quedan **desactivados** (`@EnabledIfEnvironmentVariable`) para que `mvn verify` no falle en entornos sin stack ni token.
- Los casos actuales de maestros asumen **semilla Flyway** (`V2__…`) y comprueban **`content` no vacío**; incluyen búsqueda con **`q`** para ejercitar SQL con **`unaccent`** (PostgreSQL). Detalle de rutas: README del módulo.
- Complementan, no sustituyen, los IT del **api-gateway** con **WireMock** (autocontenidos).

## 3. Orientación antes de implementar

- **Spring Cloud / Gateway**: comprobar en la documentación del **train** que usamos (p. ej. 2025.1.x / Gateway 5.x) las claves reales de configuración (`spring.cloud.gateway.server.webflux.routes`, etc.) antes de escribir YAML o tests proxy; evita retrabajo por propiedades obsoletas.
- **Contrato y seguridad:** criterio de **un solo cambio lógico** (OpenAPI + tests mínimos, etc.) en [.cursor/rules/backend-generation-standard.mdc](../../.cursor/rules/backend-generation-standard.mdc). Referencias: [docs/api/openapi.yaml](../api/openapi.yaml); si afecta a JWT o rutas protegidas, [docs/security/jwt-gateway-strategy.md](../security/jwt-gateway-strategy.md); arranque y puertos: [services/README.md](../../services/README.md).

## 4. Efectividad y definición de hecho

- Tras tocar un módulo: al menos **`mvn -pl <módulo> verify`** (o el reactor completo desde `services/` cuando convenga).
- Evitar **IT redundantes** que solo hacen `contextLoads` si otros IT del mismo módulo ya arrancan el contexto con el mismo valor aportado.
  - **catalog-service (IT, referencia rápida):** `CatalogSecurityIT` — perfil `test`, H2, `@SpringBootTest`+`MockMvc`, stub `JwtDecoderConfigTest` (p. ej. `TOKEN_COLABORADOR` con `email` y rol para `POST /ejemplares`). `EspecieReadRepositoryNativeQueryIT` — perfil `test-pg`, `@DataJpaTest`, Postgres Testcontainers. `CatalogEjemplarPostKafkaIT` — perfil `test-it-pg-kafka`, app completa+`MockMvc`, Postgres+Kafka Testcontainers. Los dos últimos usan `@EnabledIf(com.mtl.catalog.integration.support.DockerConditions#dockerDisponible)` (sin Docker: **omitidos**, no fallan).
  - **api-gateway:** `GatewaySecurityWebIT` (y otros IT con `@SpringBootTest(RANDOM_PORT)` + stub JWT compartido) ya validan arranque y rutas; no mantener un `*ApplicationIT` vacío duplicado con la misma configuración.
- **Imports entre árboles**: un unitario en `src/test/java` *puede* importar clases de `src/testIT/java` (mismo `test-compile`), pero **oscurece el IDE** si no marca `testIT` como fuente de test; preferible que el unitario no dependa de `testIT` salvo excepción justificada.

## 5. IDE (Cursor / IntelliJ / Eclipse)

- Tras clonar o cambiar `pom.xml`: **reimportar el proyecto Maven** para que `src/testIT/java` se reconozca como fuente de tests.
- Si aparecen errores de compilación falsos en imports hacia `…integration.support`, revisar que la raíz `testIT` esté registrada como *Test Source* en el módulo.

## 6. Plantilla de módulo nuevo

Los módulos Spring bajo `services/` deben declarar en su `pom.xml` (heredan versiones del parent): **build-helper-maven-plugin**, **maven-surefire-plugin**, **maven-failsafe-plugin**, como en `api-gateway` o `catalog-service`. Copiar ese bloque al crear un servicio nuevo.

## 7. Ejecutar un solo test o una sola clase (Maven)

Trabajar **desde `services/`** (reactor). En **PowerShell**, las propiedades `-D…` conviene **entre comillas** para que no se partan (p. ej. `"-Dtest=…"`).

### Tests unitarios (Surefire, `src/test/java`)

- **Toda una clase:**

  ```bash
  mvn -pl catalog-service "-Dtest=SpeciesLabelFormatterTest" test
  ```

- **Un solo método** (`Clase#metodo`):

  ```bash
  mvn -pl catalog-service "-Dtest=SpeciesLabelFormatterTest#format_comunYCientifico_entreParentesis" test
  ```

- **Patrón** (varias clases que coincidan): `-Dtest=*Gateway*`.

### Tests de integración (Failsafe, `src/testIT/java`, sufijo `*IT.java`)

- **Solo una clase IT** dentro del `verify` (compila, empaqueta y ejecuta Failsafe):

  ```bash
  mvn -pl api-gateway "-Dit.test=GatewayCatalogProxyJwtIT" verify
  ```

- **Solo Failsafe** (sin fase `test` de Surefire del ciclo completo): invoca el plugin directamente:

  ```bash
  mvn -pl api-gateway failsafe:integration-test failsafe:verify "-Dit.test=GatewayCatalogProxyJwtIT"
  ```

- **Un método** en IT: `"-Dit.test=GatewayCatalogProxyJwtIT#protectedCatalogRoute_withoutBearer_returnsUnauthorized"`.

### Desde la raíz del monorepo

Prefijo: `-f services/pom.xml` (el resto igual), p. ej.:

```bash
mvn -f services/pom.xml -pl catalog-service "-Dtest=CatalogMastersControllerWebMvcTest" test
```

### Docker y IT

**Testcontainers = Docker.** Sin daemon, en **catalog-service** esos IT quedan **deshabilitados** (`@EnabledIf`); `mvn verify` puede pasar con ellos omitidos. Con Docker, se ejecutan (Postgres y/o Kafka según la clase). Ejecutar solo uno: §7 con `failsafe:integration-test` y `-Dit.test=…`. Si falla con Docker, revisar daemon y pull de imágenes.
