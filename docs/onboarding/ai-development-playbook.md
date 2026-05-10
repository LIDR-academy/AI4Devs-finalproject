# Playbook IA (rápido)

Guía breve para trabajar con IA en este repo sin perder trazabilidad ni coherencia.

## Flujo recomendado

1. Definir HU en `docs/backlog/backlog.md` (sin tickets).
2. Refinar HU con `hu-refinement-mtl`.
3. Desglosar en tickets con `hu-breakdown-mtl`.
4. Implementar tickets por orden y dependencias.
5. Trazar en PR: HU -> TASK -> cambios.

## Skills de uso diario

- Refinamiento HU: `.cursor/skills/hu-refinement-mtl/SKILL.md`
- Breakdown HU: `.cursor/skills/hu-breakdown-mtl/SKILL.md`

## Reglas operativas

- `backlog.md`: solo historias de usuario.
- `HU-<id>-ticket-breakdown.md`: tickets técnicos.
- No inventar requisitos fuera de `readme.md` + `docs/backlog/backlog.md`.
- Usar roles de Keycloak: `COLABORADOR`, `ADMIN`.

## Checklist mínimo antes de cerrar una tarea

- Reglas aplicables por capa citadas en el breakdown.
- Checks mínimos ejecutados (`build/test` según capa).
- Alcance respetado (sin meter trabajo de otra HU).
- Copy y i18n coherentes si hay cambios frontend.
