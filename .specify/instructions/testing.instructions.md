
# Testing Instructions — Proyecto Meditation Builder

## BDD
- Framework: Cucumber + JUnit 5.
- Runner: usar `cucumber-junit-platform-engine` con `@Suite`:
```java
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("tests/bdd")
@ConfigurationParameter(key = io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME, value = "pretty")
public class CucumberSuite {}
```
- Feature files: `tests/bdd/<context>/<feature>.feature` (lenguaje de negocio, sin detalles técnicos).

## Unit tests
- Dominio: TDD puro; sin mocks técnicos.
- Aplicación: mocks de puertos para orquestación.

## Integration tests
- Infraestructura: usar Testcontainers para DB/colas si aplica.
- IA adapters: simular respuestas; no dependencias externas reales.

## Contratos
- Validar implementación contra OpenAPI (`src/main/resources/openapi/*.yaml`).
- Lint obligatorio con Redocly CLI (`npx @redocly/cli lint`).

## CI/CD gates
- Orden: `bdd → api → unit → infra → contract → e2e`.
- Fast-fail: cualquier fallo bloquea merge.
