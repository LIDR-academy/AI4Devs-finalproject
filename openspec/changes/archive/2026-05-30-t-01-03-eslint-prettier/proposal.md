# Proposal — T-01-03 · Configurar ESLint y Prettier

**Ticket:** T-01-03  
**User Story:** US-01 — Configurar repositorio, herramientas de desarrollo y estructura del proyecto  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

Tras T-01-01 (monorepo) y T-01-02 (TypeScript estricto), el repositorio declara `npm run lint` en `package.json` pero **no tiene ESLint instalado ni configurado** — el script falla al ejecutarse. Sin linters, formateadores y `.editorconfig`, el equipo no puede detectar errores de sintaxis/estilo de forma automática ni mantener consistencia entre IDEs. Este ticket cierra el gap de calidad de código de US-01 (Scenario 3 — Linting funcional) y prepara el flujo de desarrollo antes de T-01-04.

## What Changes

- Instalar ESLint 9+ con flat config (`eslint.config.mjs`), plugins TypeScript (`typescript-eslint`) y React (`eslint-plugin-react`, `eslint-plugin-react-hooks`).
- Instalar Prettier y crear `.prettierrc` con opciones acordadas (`singleQuote: true`, `semi: false`, `tabWidth: 2`).
- Añadir `.editorconfig` para consistencia de indentación, charset y fin de línea entre editores.
- Configurar scripts npm `lint` y `format` en `package.json` raíz (el script `lint` ya existe pero debe apuntar a la config real).
- Añadir `.prettierignore` para excluir artefactos generados (`dist`, `node_modules`, etc.).
- Verificar que `npm run lint` pasa sobre el código scaffold actual y que un error TS sintáctico provoca exit code ≠ 0.

## Capabilities

### New Capabilities

- `eslint-prettier-config`: Configuración de ESLint (flat config TS + React), Prettier, EditorConfig y scripts npm `lint`/`format` para el monorepo ConRutina.

### Modified Capabilities

_(Ninguna — no se alteran requisitos de `monorepo-scaffold` ni `typescript-config`; se completa el ítem de linting referenciado en US-01 Scenario 3.)_

## Impact

- **Raíz:** nuevo `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `.editorconfig`; actualización de `package.json` (devDependencies + script `format`).
- **Frontend y backend:** sin cambios de lógica; posibles ajustes menores de formato si Prettier/ESLint revelan inconsistencias en el código existente.
- **CI futuro:** habilita gate de lint en pipelines (fuera del DoD explícito).
- **Dependencia:** T-01-02 completado (`typescript` y tsconfigs en su lugar).

## Non-goals

- `.env.example` y validación de variables de entorno (T-01-04).
- Husky, lint-staged o pre-commit hooks (no están en el DoD del ticket).
- Reglas ESLint personalizadas exhaustivas más allá de la base TS + React recomendada.
- Integración ESLint ↔ Prettier vía `eslint-config-prettier` (opcional; solo si hay conflictos reales).
- Configuración de ESLint/Prettier por subproyecto con configs separados (un solo flat config en raíz es suficiente para el monorepo actual).
- Tests unitarios de la configuración de lint (no requeridos por el ticket).

## Criterios de aceptación (US-01 — alcance T-01-03)

Este ticket cubre parcialmente la US-01. Escenarios Gherkin aplicables:

| Escenario US-01 | Aplicabilidad en T-01-03 |
|-----------------|---------------------------|
| Scenario 1 — Happy path: `npm install` + `npm run dev` | **Verificación indirecta** — no debe regresionar tras añadir ESLint/Prettier |
| Scenario 2 — Estructura: scripts `lint` en package.json | **In scope** — script `lint` funcional + nuevo script `format` |
| Scenario 3 — Linting funcional: error TS → exit ≠ 0 | **In scope** — objetivo principal |
| Scenario 4 — Edge case `.env` faltante | **Fuera de scope** — T-01-04 |
