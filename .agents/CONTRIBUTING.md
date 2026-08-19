# 🤝 Contribuir a `.agents/`

`.agents/` es agnóstico y portátil — estas reglas mantienen esa promesa cuando se añade o modifica una skill, workflow o regla.

---

## Añadir una nueva Skill

1. **ID secuencial sin huecos ni duplicados.** Las skills se numeran `SK-01` a `SK-34` (hoy) sin saltos. Antes de crear una nueva, corre `bash .agents/scripts/validate_agents.sh` para confirmar el siguiente ID libre — el script falla si detecta un ID duplicado y avisa (no bloqueante) si hay huecos.
2. **Ubicación por fase y rol**, no por conveniencia:
   - `skills/specs/<NN>_<fase>/` para skills de la Fase Documental (Product Owner / Architect).
   - `skills/development/<NN>_<fase>/` para skills de Codificación y Calidad (Developer / QA / DevSecOps).
3. **Frontmatter YAML obligatorio** con estos campos exactos (ver cualquier `SK-*.md` existente como referencia):
   ```yaml
   ---
   name: SK-NN_nombre_snake_case
   description: "Una línea, en español, describiendo qué hace y qué garantiza."
   version: "1.0.0"
   category: "specs/<NN>_<fase>" | "development/<NN>_<fase>"
   inputs:
     - campo: "descripción"
   required_rules:
     - "docs/04_governance_and_quality/rules/<archivo>.md"
   outputs:
     - "Artefacto concreto que produce"
   ---
   ```
   Cada ruta en `required_rules` DEBE existir en el repo — `check_links.py` lo valida en CI y falla si no.
4. **Registrar la skill en `README.md`** (sección 5, catálogo) con su enlace relativo.
5. **Versionado semántico independiente por skill.** Cambios de comportamiento incompatibles → MAJOR; nuevas fases/checklist → MINOR; correcciones de redacción → PATCH.

## Añadir o modificar un Workflow

1. Los workflows viven en `workflows/` numerados en orden de ejecución del ciclo VSDD, no por fecha de creación — con una excepción explícita: **`00` está reservado para documentos de una sola ejecución o meta-nivel** (`00_master_vsdd_workflow.md` es el mapa general; `00_greenfield_bootstrap_workflow.md` corre una única vez por proyecto, antes de que exista `docs/00_stack_manifest.md`). **`01`-`08` numeran el ciclo repetible** (spec → dev → auditoría → QA → producción → deploy) que se ejecuta una y otra vez por cada idea/ticket. Un nuevo workflow que se repita por cada idea/ticket se añade al final de `01`-`08`; un nuevo workflow de una sola vez/meta-nivel se añade con prefijo `00_<algo>_workflow.md`.
2. Todo workflow que invoque skills debe enlazarlas con su ruta relativa completa, por ejemplo:
   ```markdown
   [SK-16: Desarrollador de Tickets Backend](../skills/development/02_backend_development/SK-16_develop_backend_ticket.md)
   ```
   Enlaces rotos son detectados por `check_links.py`.
3. Si el workflow introduce una etapa nueva del ciclo de vida, actualiza el diagrama Mermaid en [00_master_vsdd_workflow.md](workflows/00_master_vsdd_workflow.md).

## Antes de proponer el cambio

Ejecuta siempre, desde la raíz del repo:
```bash
bash .agents/scripts/validate_agents.sh
```
Esto corre los tests unitarios de las propias herramientas de auditoría, verifica enlaces markdown, `required_rules` del frontmatter y unicidad de IDs. Un PR que lo rompe no se fusiona — está wireado en `ci.yml`.

## Qué NO hacer (Non-Goals)

Aplican las mismas guardas que rigen el código generado por las skills ([rules/README.md](rules/README.md)):
- No hardcodear rutas o convenciones de un proyecto específico dentro de una skill/script si se puede inferir de `AGENTS.md` o `docs/` del proyecto consumidor — eso rompe la portabilidad.
- No añadir una skill que duplique el alcance de otra existente; extiende la existente con una nueva fase antes de crear una paralela.
- No fusionar una skill sin `required_rules` verificables ni un `output` concreto y verificable.

## Git hook `commit-msg`

Todo commit debe referenciar un ticket `TK-XXX` en el mensaje (ej. `[TK-028]`) — lo exige `.husky/commit-msg`, instalado automáticamente vía `pnpm install` (script `prepare`). Excepciones: commits `Merge`/`Revert` automáticos de git, o un bypass explícito añadiendo `[skip-tk]` al mensaje para casos deliberados fuera del ciclo VSDD.

## Licencia

Toda contribución a `.agents/` se distribuye bajo los términos de [LICENSE](LICENSE) (MIT).
