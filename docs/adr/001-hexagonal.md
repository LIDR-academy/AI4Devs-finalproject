# ADR-001: Arquitectura Hexagonal + DDD Táctico

**Fecha**: 2026-06-03

**Estado**: Aceptada

## Contexto

Realista necesita una arquitectura que permita:
- Testear la lógica de negocio de forma aislada (sin base de datos ni frameworks)
- Cambiar componentes externos (LLM, base de datos, API catastral) sin afectar las reglas de negocio
- Mantener un vocabulario ubicuo alineado con el dominio inmobiliario español
- Escalar de POC a producto sin reescrituras

## Decisión

Arquitectura Hexagonal (Puertos y Adaptadores) combinada con Domain-Driven Design táctico.

- **Dominio**: contiene agregados (`User`, `PurchaseProcess`, `AnalyzedListing`, `Checklist`), value objects (`TransparencyScore`, `FinancialProfile`, `RedFlags`, `BureaucraticMilestone`) y servicios de dominio (`AnalyzeListingUseCase`). Cero dependencias de frameworks.
- **Puertos**: interfaces que definen contratos (`ListingAnalyzerPort`, `CadastroPort`, `MortgageCalculatorPort`).
- **Adaptadores**: implementaciones concretas de los puertos (`OpenRouterAdapter`, `CheerioAdapter`, `CatastroAdapter`, `PrismaUserRepository`).

## Alternativas consideradas

### Arquitectura en capas tradicional (Controller → Service → Repository)
- **Ventaja**: más simple, menos boilerplate inicial
- **Desventaja**: acoplamiento a Express y Prisma, difícil testear lógica de negocio aislada, los cambios de infraestructura afectan al dominio
- **Rechazada porque**: para un proyecto educativo que quiere demostrar calidad de código, la inversión en hexagonal se justifica

### Clean Architecture
- **Ventaja**: similar a hexagonal, más explícita en capas
- **Desventaja**: más ceremoniosa, requiere más directorios y abstracciones
- **Rechazada porque**: hexagonal logra el mismo desacoplamiento con menos burocracia para un equipo de una persona

## Consecuencias

- **Positivas**: testabilidad total del dominio sin mocks de infraestructura. Cambiar de PostgreSQL a otra DB o de OpenRouter a OpenAI directo no toca el dominio. Alineación con el vocabulario del negocio inmobiliario.
- **Negativas**: más archivos y directorios que una arquitectura simple. Curva de aprendizaje para quien no conozca hexagonal. Overhead inicial en un MVP de 3 features.
- **Mitigación**: estructura de directorios clara y predecible. AGENTS.md documenta la arquitectura para quien trabaje en el proyecto.
