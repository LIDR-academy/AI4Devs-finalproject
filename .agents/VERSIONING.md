# 🔢 Política de Versionado — Skills y Workflows

`.agents/` versiona cada skill de forma independiente (`version` en su frontmatter) y el framework completo como un todo (`version` en el frontmatter de [README.md](README.md)). No existe hoy una matriz automática de compatibilidad — este documento fija la política hasta que exista tooling para verificarla.

---

## Reglas de versionado por Skill (SemVer)

- **MAJOR** — cambia el contrato de la skill de forma incompatible: se elimina o renombra un `input`/`output`, cambia el orden de las fases (`FASE 1`, `FASE 2`...) de forma que rompe cómo un workflow la invoca, o se elimina un `required_rules`.
- **MINOR** — se añade una fase, un checklist o un `output` nuevo sin romper lo existente (ej. SK-16 pasando de v3.6.0 a v3.7.0 al añadir CRUDs de entidades secundarias).
- **PATCH** — correcciones de redacción, ejemplos, o ajustes que no cambian el comportamiento exigido al agente.

## Reglas de versionado del Workflow

- Un workflow **no fija versión de las skills que invoca** — siempre referencia la versión vigente en disco. Esto es deliberado: mantiene el framework agnóstico y evita una matriz de combinaciones que nadie mantendría al día.
- **Consecuencia:** si vas a hacer un cambio MAJOR a una skill, audita primero qué workflows la invocan (`grep -rl "SK-NN" .agents/workflows/`) y confirma que la nueva versión sigue siendo compatible con el paso donde se invoca, antes de fusionar.
- Un cambio MAJOR en una skill ampliamente referenciada (ej. SK-16, SK-19, SK-27) es candidato a bump MINOR del framework completo en `README.md`.

## Qué hacer antes de un cambio MAJOR a una skill

1. `grep -rl "SK-NN" .agents/workflows/ .agents/skills/` para listar todos los que la referencian.
2. Releer cada uno y confirmar que la fase/output que consumen sigue existiendo con el mismo contrato.
3. Documentar el cambio en [CHANGELOG.md](CHANGELOG.md) bajo `[Unreleased]`.
4. Bump del `version` en el frontmatter de la skill modificada.

## Por qué no hay una matriz automática hoy

Generar automáticamente "workflow X requiere skill Y ≥ versión Z" exigiría que cada workflow declare rangos de compatibilidad explícitos — hoy no lo hace, y añadirlo sin que el equipo lo mantenga activamente generaría una matriz que miente por abandono, peor que no tener matriz. Se prefiere la disciplina manual descrita arriba hasta que haya evidencia de que el catálogo (34 skills) creció lo suficiente para justificar la inversión en tooling.
