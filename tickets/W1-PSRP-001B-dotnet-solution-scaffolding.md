## PSRP-001B: chore(infra): dotnet-solution-scaffolding

**Type:** chore
**Priority:** P0 (Must)
**Estimated Effort:** S (1d)
**Sprint Week:** W1
**Dependencies:** PSRP-001A

## Resumen de Funcionalidad

Crear la solución .NET 10 con estructura Clean Architecture (Api, Core, Infrastructure), proyecto de tests con xUnit, y configuración mínima de la API (GET / → 200 "OK"). Una vez mergeado, el equipo backend puede empezar PSRP-002 (database schema).

## Requisitos

- [ ] Crear `backend/AuraPlanning.sln` con proyectos: Aura.Api, Aura.Core, Aura.Infrastructure, Aura.Core.Tests
- [ ] Configurar referencias: Api → Core + Infrastructure, Infrastructure → Core, Core sin referencias
- [ ] Todos los proyectos target `net10.0`, nullable enabled, implicit usings, file-scoped namespaces
- [ ] Crear `backend/src/Aura.Api/Program.cs` con minimal API: `app.MapGet("/", () => "OK")`
- [ ] Crear `appsettings.json` con secciones stub: ConnectionStrings, Jwt, MagicLink, WhatsApp, Smtp, Minio, Dragonfly, Stripe, GoogleMaps
- [ ] Crear `appsettings.Development.json` con overrides para desarrollo local
- [ ] Crear `backend/tests/Aura.Core.Tests/` con xUnit + NSubstitute + AwesomeAssertions y al menos 1 test pasando
- [ ] Añadir job `dotnet-build` al CI: setup .NET 10 SDK, `dotnet build`, `dotnet test`

## Notas Técnicas

- **Backend:** .NET 10 LTS, C# 14. 3 capas (no 4) — Core combina dominio + aplicación + interfaces.
- **API:** Minimal APIs (no controllers aún). Controllers se añaden en PSRP-003.
- **Tests:** xUnit como runner, NSubstitute para mocks, AwesomeAssertions para asserts.

## Criterios de Aceptación

- [ ] AC1: Dado el repositorio clonado, cuando se ejecuta `dotnet build backend/AuraPlanning.sln`, entonces todos los proyectos se construyen sin errores
- [ ] AC2: Dado que la API está corriendo (`dotnet run`), cuando se hace GET /, entonces se devuelve 200 con body "OK"
- [ ] AC3: Dado el proyecto de tests, cuando se ejecuta `dotnet test backend/tests/Aura.Core.Tests`, entonces al menos 1 test pasa
- [ ] AC4: Dado un push a main, cuando el CI corre, entonces el job `dotnet-build` completa con éxito

## Elementos Relacionados

- **Architecture:** 03-project-structure.md (Clean Architecture layers)
- **Conventions:** technical-conventions.md (C# code style)

## Bloqueadores

Bloqueado por: PSRP-001A

## Branch Name

`feature/PSRP-001B-dotnet-scaffolding`
